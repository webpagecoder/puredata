'use strict';

import { Path } from '../../Path.ts';
import { PubSub, PubSubContext } from '../../pub-sub/PubSub.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Utils } from '../../Utils.ts';
import { AnyChain } from '../any/AnyChain.ts';
import { AnyProcessor, AnyProcessorCtorParams } from '../any/AnyProcessor.ts';
import { ObjectProcessor } from '../object/ObjectProcessor.ts';
import { Processor, ProcessorCompilationContext, State } from '../Processor.ts';
import { ConditionalProcessor } from './conditional/ConditionalProcessor.ts';
import { PointerProcessor } from './pointer/PointerProcessor.ts';
import { ReferenceField } from './reference/ReferenceField.ts';
import { SchemaChain } from './SchemaChain.ts';
import { Field } from '../Field.ts';
import { NodeTree } from '../../NodeTree.ts';

/** Schema entries mapped to their compiled processors. */
export type CompiledSchema<P = Processor> = Record<string, P>;

/** Constructor options for a schema processor. */
export type SchemaProcessorCtorParams = AnyProcessorCtorParams<SchemaChain>;

/** Context used while compiling schema processors. */
export type SchemaCompilationContext = ProcessorCompilationContext & {
    // parent?: SchemaProcessor;
    absolutePath?: Path;
};

/** Deferred processing entry for a child processor. */
export type DeferredProcessorContext = [
    childKey: string,
    processor: Processor,
    parentTracker: ValueTracker,
];

/** Data shared by callbacks that resolve schema references. */
export type ReferenceResolverContext = PubSubContext & {
    deferredReferences: DeferredProcessorContext[];
    rootTracker: ValueTracker;
    failFast: boolean;
};

export type DeferredProcessorCollection = {
    references: Processor[],
    subSchemas: SchemaProcessor[],
    conditionals: ConditionalProcessor[],
    nests: PointerProcessor[]
}

class BoundObjectProcessor extends ObjectProcessor<SchemaChain> { }

/** Compiles and runs processors for a nested schema, references, and conditions. */
class SchemaProcessor extends BoundObjectProcessor {


    /** Resolver used to execute referenced fields in dependency order. */
    private _referenceResolver: PubSub;
    private _fullTree: NodeTree<Processor>;
    private _deferredProcessors: Processor[];

    /** Creates a schema processor and builds its child processor tree. */
    constructor(args: SchemaProcessorCtorParams) {
        super(args);

        const {
            field,
        } = args;

        this._fullTree = new NodeTree<Processor>();
        this._deferredProcessors = [];
        this._referenceResolver = new PubSub();
        this._constructSchemaProcessors(this._fullTree, field.config.fieldTree);
    }

    private _constructSchemaProcessors(processorTree: NodeTree<Processor>, fieldTree: NodeTree<Field>): void {
        for (const key of Object.keys(fieldTree.children)) {
            const field = fieldTree.children[key];
            if (field instanceof NodeTree) {
                const nestedSchema = new NodeTree<Processor>();
                processorTree.setChild(key, nestedSchema);
                this._constructSchemaProcessors(nestedSchema, field);
            }
            else {
                processorTree.setChild(key, field.createProcessor({
                    field,
                    parent: this,
                }));
            }
        }
    }

    /**
     * Compiles child processors and registers deferred conditions and references.
     *
     * @param context Absolute-path and reference-resolution context.
     * @returns This compiled processor.
     */
    public override compile(context: SchemaCompilationContext = {}): this {

        super.compile();

        const deferredProcessors: DeferredProcessorCollection = {
            references: [],
            subSchemas: [],
            conditionals: [],
            nests: []
        };

        // Sort and compile all diff types of processors in tree
        this._compileChildProcessors(this._fullTree, context, deferredProcessors);

        //Register all the deferred processors in order
        this._deferredProcessors = [
            ...deferredProcessors.references,
            ...deferredProcessors.subSchemas,
            ...deferredProcessors.conditionals,
            ...deferredProcessors.nests,
        ]

        return this;
    }

    private _compileChildProcessors(
        processorTree: NodeTree<Processor>,
        context: SchemaCompilationContext,
        deferredProcessors: DeferredProcessorCollection
    ): void {
        const { absolutePath = new Path('/') } = context;
        const {
            references,
            subSchemas,
            conditionals,
            nests
        } = deferredProcessors;

        for (const key of Object.keys(processorTree.children)) {
            const processor = processorTree.children[key];
            const childAbsolutePath = absolutePath.addSegment(key);
            const newContext = Object.assign({}, context, {
                absolutePath: childAbsolutePath,
            });

            if (processor instanceof NodeTree) {
                this._compileChildProcessors(processor, newContext, deferredProcessors);
            }
            else {
                const finalProcessor = processor.compile(newContext);

                if (finalProcessor instanceof ConditionalProcessor) {
                    conditionals.push(finalProcessor);
                    finalProcessor.defer();
                }
                else if (finalProcessor instanceof PointerProcessor) {
                    nests.push(finalProcessor);
                    finalProcessor.defer();
                }
                else if (finalProcessor instanceof SchemaProcessor) {
                    subSchemas.push(finalProcessor);
                    finalProcessor.defer();
                }
                else {
                    const referenceSet = this._getReferencesWithinProcessor(processor);

                    if (referenceSet.size > 0) {
                        references.push(finalProcessor);
                        finalProcessor.defer();

                        const { _referenceResolver } = this;
                        const subNodeId = childAbsolutePath.toString();
                        const subNode = _referenceResolver.getOrCreateNode(subNodeId);

                        subNode.setCallback((context): boolean => {
                            const {
                                failFast,
                                rootTracker
                            } = context as ReferenceResolverContext;

                            const subscriberTracker = rootTracker.resolvePath(childAbsolutePath.toRelative()) as ValueTracker | null;

                            if (!subscriberTracker) {
                                rootTracker.addError('schema/referenceNotFound', { //todo: add these error message checks throughout schema processor for missing refs
                                    path: childAbsolutePath.toRelative()
                                });
                                return false;
                            }

                            finalProcessor.process(subscriberTracker);

                            // Fail fast if needed
                            if (subscriberTracker.fail && failFast) {
                                return false;
                            }
                            return true;

                        });

                        for (const reference of referenceSet) {
                            const absolutePublisherPathStr = childAbsolutePath.parent().move(reference.config.path).toString();
                            const pubNode = _referenceResolver.getOrCreateNode(absolutePublisherPathStr);
                            _referenceResolver.linkNodes(pubNode, subNode);
                        }
                    }
                }
            }
        }
    }

    /** Finds reference fields used by a processor and its pipeline. */
    private _getReferencesWithinProcessor(processor: Processor): Set<ReferenceField> {
        const { field } = processor;

        if (field instanceof ReferenceField) {
            // If the field itself is a reference, we don't need to check its pipeline, just return it
            return new Set([field]);
        }

        const referenceSet = new Set<ReferenceField>();

        const { defaultValue } = field.config;
        if (defaultValue instanceof ReferenceField) {
            // If the default value is a reference, we need to include it in the references set
            referenceSet.add(defaultValue);
        }

        if (processor instanceof AnyProcessor) {
            // We have a chained processor, so we need to check its pipeline for references
            for (const { argsOrCallback } of (field as AnyChain).pipeline) {
                if (argsOrCallback) {
                    for (const arg of (processor as AnyProcessor).resolveStepArgs(argsOrCallback)) {
                        if (arg instanceof ReferenceField) {
                            // If the argument is a reference, we need to include it in the references set
                            referenceSet.add(arg);
                        }
                    }
                }
            }
        }
        return referenceSet;
    }

    private _stripExtraKeys(processorTree: NodeTree<Processor>, value: unknown): unknown {
        if (!Utils.isPlainObject(value)) {
            return value;
        }

        let strippedObject = this.field.chainHandler.stripKeys(
            value as object,
            Object.keys(processorTree.children)
        ).value as Record<string, unknown>;

        const { children } = processorTree;
        for (const key of Object.keys(children)) {
            const processor = children[key];
            if (processor instanceof NodeTree) {
                strippedObject[key] = this._stripExtraKeys(processor, (value as Record<string, unknown>)[key]);
            }
        }

        return strippedObject;
    }

    public override preProcess(tracker: ValueTracker): void {

        super.preProcess(tracker);
        if (this.field.config.stripExtraKeys) {
            const strippedValue = this._stripExtraKeys(this._fullTree, tracker.value);
            tracker.setValue(strippedValue);
        }

    }

    private _processTree(
        processorTree: NodeTree<Processor>,
        tracker: ValueTracker,
        deferredTrackers: Map<Processor, ValueTracker>
    ) {
        const {
            field: {
                config: {
                    failFast
                }
            },
        } = this;

        const { value } = tracker;

        const { children } = processorTree;
        for (const key of Object.keys(children)) {
            const processor = children[key] as Processor;
            const childTracker = tracker.createChild(processor.field, key, (value as Record<string, unknown>)[key]);

            if (processor instanceof NodeTree) {
                this._processTree(processor, childTracker, deferredTrackers);
            }
            else if (!processor.deferred) {
                processor.process(childTracker);
                if (childTracker.fail && failFast) {
                    // Fail fast if needed
                    return;
                }
            }
            else {
                deferredTrackers.set(processor, childTracker);
            }
        }

    }

    /** Processes schema fields and then resolves deferred work at the root. */
    //todo is state needed anymore?
    public override process(tracker: ValueTracker, state: State = {}): void {

        // If immutable, handle that and exit
        const { defaultValue, mutable, failFast } = this.field.config;
        if (!mutable) {
            tracker.setValue(defaultValue);
            return;
        }

        // Preprocess 
        this.preProcess(tracker);
        if (tracker.fail) {
            return;
        }

        // Execute schema pipeline before diving inside
        this.executePipeline(tracker);
        if (tracker.fail) {
            return;
        }

        // Process the tree and capture any deferred processors and their trackers
        const deferredTrackers = new Map<Processor, ValueTracker>();
        this._processTree(this._fullTree, tracker, deferredTrackers);

        this._referenceResolver.execute({
            // deferredReferences,
            rootTracker: tracker,
            failFast
        });

        for (const [processor, tracker] of deferredTrackers) {
            processor.process(tracker);
            if (tracker.fail && failFast) {
                return;
            }
        }



        //     // Execute nest processors
        //     if (deferredNests.length > 0) {
        //         if (tracker.nestDepth == null) {
        //             // The tracker that contains nests is at level 0
        //             tracker.nestDepth = 0;
        //         }

        //         for (const [key, processor, nestTracker] of deferredNests) {
        //             const rawValue = nestTracker.rawValue;
        //             const value = Utils.isPlainObject(rawValue)
        //                 ? (rawValue as Record<PropertyKey, unknown>)[key]
        //                 : undefined;

        //             const childTracker = nestTracker.createChild(processor.field, key);
        //             childTracker.setValue(value);
        //             childTracker.nestDepth = tracker.nestDepth + 1;

        //             if (childTracker.nestDepth === 1) {
        //                 // The first nest level is the root of the nest, so we set the nest root to itself
        //                 childTracker.nestRoot = childTracker;
        //             }
        //             else {
        //                 childTracker.nestRoot = tracker.nestRoot;
        //             }

        //             processor.process(childTracker);
        //         }
        //     }

        


    }

}

export { SchemaProcessor };
