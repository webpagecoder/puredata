'use strict';

import { Path } from '../../Path.ts';
import { NodeMixin } from '../../NodeMixin.ts';
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

/** Schema entries mapped to their compiled processors. */
export type CompiledSchema<P = Processor> = Record<string, P>;

/** Constructor options for a schema processor. */
export type SchemaProcessorCtorParams = AnyProcessorCtorParams<SchemaChain>;

/** Context used while compiling schema processors. */
export type SchemaCompilationContext = ProcessorCompilationContext & {
    // parent?: SchemaProcessor;
    absolutePath?: Path;
    referenceResolver?: PubSub;
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

class BoundObjectProcessor extends ObjectProcessor<SchemaChain> { }

/** Compiles and runs processors for a nested schema, references, and conditions. */
class SchemaProcessor extends NodeMixin(BoundObjectProcessor) {

    /** Conditional processors deferred until schema values are available. */
    private _conditionals: CompiledSchema<ConditionalProcessor>;

    /** Nested-schema processors deferred until their parent values are processed. */
    private _nests: CompiledSchema<PointerProcessor>;

    /** Processors containing references deferred to the reference resolver. */
    private _references: CompiledSchema;

    /** Resolver used to execute referenced fields in dependency order. */
    private _referenceResolver: PubSub | null;

    /** Creates a schema processor and builds its child processor tree. */
    constructor(args: SchemaProcessorCtorParams) {
        super(args);

        const {
            field,
        } = args;

        this._conditionals = {};
        this._nests = {};
        this._references = {};
        this._referenceResolver = null;

        // Create the entire tree before compilation (to establish full path structure)
        const { schemaFields } = field.config;
        for (let key of Object.keys(schemaFields)) {
            this.addChild(key, schemaFields[key].createProcessor());
        }
    }

    /**
     * Compiles child processors and registers deferred conditions and references.
     *
     * @param context Absolute-path and reference-resolution context.
     * @returns This compiled processor.
     */
    public override compile(context: SchemaCompilationContext = {}): this {

        super.compile(context);

        let {
            absolutePath = new Path('/'),
            referenceResolver,
        } = context;

        if (!referenceResolver) {
            this._referenceResolver = referenceResolver = new PubSub();
        }

        const {
            _conditionals,
            _nests,
            _references,
            children,
        } = this;

        for (const key of Object.keys(children)) {
            const childProcessor = children[key] as Processor;
            const childAbsolutePath = absolutePath.addSegment(key);

            const resolvedChildProcessor = childProcessor.compile({
                absolutePath: childAbsolutePath,
                referenceResolver
            });

            let references = this._getReferencesWithinProcessor(resolvedChildProcessor);
            if (resolvedChildProcessor instanceof ConditionalProcessor) {
                _conditionals[key] = resolvedChildProcessor;
                this.removeChild(key);
            }
            else if (resolvedChildProcessor instanceof PointerProcessor) {
                _nests[key] = resolvedChildProcessor; // guaranteed nest
                this.removeChild(key);
            }
            else if (references.size > 0) {
                _references[key] = resolvedChildProcessor;
                this.removeChild(key);

                const subNodeId = childAbsolutePath.toString();
                const subNode = referenceResolver.getOrCreateNode(subNodeId);

                subNode.setCallback((context): boolean => {
                    const {
                        failFast,
                        rootTracker
                    } = context as ReferenceResolverContext;

                    const subTracker = rootTracker.resolvePath<ValueTracker>(childAbsolutePath.toRelative());

                    if (!subTracker) {
                        rootTracker.addError('schema/referenceNotFound', { //todo: add these error message checks throughout schema processor for missing refs
                            path: childAbsolutePath.toRelative()
                        });
                        return false;
                    }

                    resolvedChildProcessor.process(subTracker);

                    // Fail fast if needed
                    if (subTracker.fail && failFast) {
                        return false;
                    }
                    return true;

                });

                for (const reference of references) {
                    const absolutePublisherPathStr = childAbsolutePath.parent().move(reference.config.path).toString();
                    const pubNode = referenceResolver.getOrCreateNode(absolutePublisherPathStr);
                    referenceResolver.linkNodes(pubNode, subNode);
                }
            }
        }

        return this;
    }

    /** Finds reference fields used by a processor and its pipeline. */
    private _getReferencesWithinProcessor(processor: Processor): Set<ReferenceField> {
        const { field } = processor;

        if (field instanceof ReferenceField) {
            // If the field itself is a reference, we don't need to check its pipeline, just return it
            return new Set([field]);
        }

        const references = new Set<ReferenceField>();

        const { defaultValue } = field.config;
        if (defaultValue instanceof ReferenceField) {
            // If the default value is a reference, we need to include it in the references set
            references.add(defaultValue);
        }

        if (processor instanceof AnyProcessor) {
            // We have a chained processor, so we need to check its pipeline for references
            for (const { argsOrCallback } of (field as AnyChain).pipeline) {
                if (argsOrCallback) {
                    for (const arg of (processor as AnyProcessor).resolveStepArgs(argsOrCallback)) {
                        if (arg instanceof ReferenceField) {
                            // If the argument is a reference, we need to include it in the references set
                            references.add(arg);
                        }
                    }
                }
            }
        }
        return references;
    }

    public override preProcess(tracker: ValueTracker): void {
        const {
            field: {
                chainHandler,
                config: {
                    schemaFields,
                    stripExtraKeys
                }
            },
        } = this;
        if (stripExtraKeys && Utils.isPlainObject(tracker.value)) {
            tracker.setValue(chainHandler.stripKeys(
                tracker.value as object,
                Object.keys(schemaFields)
            ).value);
        }

        super.preProcess(tracker);
    }

    /** Processes schema fields and then resolves deferred work at the root. */
    public override process(tracker: ValueTracker, state: State = {}): void {
        const { defaultValue, mutable } = this.field.config;
        if (!mutable) {
            tracker.setValue(defaultValue);
            return;
        }

        // Preprocess 
        this.preProcess(tracker);
        if (tracker.fail) {
            return;
        }

        let deferredConditionals = state.deferredConditionals as DeferredProcessorContext[] | null;
        if (!deferredConditionals) {
            deferredConditionals = [];
            state.deferredConditionals = deferredConditionals;
        }

        let deferredNests = state.deferredNests as DeferredProcessorContext[] | null;
        if (!deferredNests) {
            deferredNests = [];
            state.deferredNests = deferredNests;
        }

        let deferredReferences = state.deferredReferences as DeferredProcessorContext[] | null;
        if (!deferredReferences) {
            deferredReferences = [];
            state.deferredReferences = deferredReferences;
        }

        const {
            field: {
                config: {
                    failFast
                }
            },
            children,
            _conditionals,
            _nests,
            _references,
            _referenceResolver,
        } = this;

        const value = tracker.value as Record<string, any>;

        // Defer conditional processing
        for (const key of Object.keys(_conditionals)) {
            deferredConditionals.push([key, _conditionals[key], tracker]);
        }

        // Defer nested schema processing
        for (const key of Object.keys(_nests)) {
            deferredNests.push([key, _nests[key], tracker]);
        }

        // Defer reference processing, but create ValueTrackers ahead of time
        for (const key of Object.keys(_references)) {
            tracker.createChild(_references[key].field, key, value[key]);
        }

        // Process the regular schema first 
        for (const key of Object.keys(children)) {
            const processor = children[key] as Processor;
            const childTracker = tracker.createChild(processor.field, key, value[key]);
            processor.process(childTracker, state);

            // Fail fast if needed
            if (childTracker.fail && failFast) {
                return;
            }
        }

        if (_referenceResolver) {
            // We are in the root of the schema, execute reference processors
            _referenceResolver.execute({
                deferredReferences,
                rootTracker: tracker,
                failFast
            });

            // Execute conditional processors
            if (deferredConditionals.length > 0) {
                for (const [key, processor, parentTracker] of deferredConditionals) {
                    const childTracker = parentTracker.createChild(processor.field, key);
                    const rawValue = parentTracker.rawValue;
                    const value = Utils.isPlainObject(rawValue)
                        ? (rawValue as Record<PropertyKey, unknown>)[key]
                        : undefined;
                    childTracker.setValue(value);
                    processor.process(childTracker);
                }
            }

            // Execute nest processors
            if (deferredNests.length > 0) {
                if (tracker.nestDepth == null) {
                    // The tracker that contains nests is at level 0
                    tracker.nestDepth = 0;
                }

                for (const [key, processor, nestTracker] of deferredNests) {
                    const rawValue = nestTracker.rawValue;
                    const value = Utils.isPlainObject(rawValue)
                        ? (rawValue as Record<PropertyKey, unknown>)[key]
                        : undefined;

                    const childTracker = nestTracker.createChild(processor.field, key);
                    childTracker.setValue(value);
                    childTracker.nestDepth = tracker.nestDepth + 1;

                    if (childTracker.nestDepth === 1) {
                        // The first nest level is the root of the nest, so we set the nest root to itself
                        childTracker.nestRoot = childTracker;
                    }
                    else {
                        childTracker.nestRoot = tracker.nestRoot;
                    }

                    processor.process(childTracker);
                }
            }

        }

        // Execute schema pipeline
        this.executePipeline(tracker);

        // No post-processing is needed for schema processors.
    }

}

export { SchemaProcessor };
