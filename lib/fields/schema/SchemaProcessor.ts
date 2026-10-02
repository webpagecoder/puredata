'use strict';

import { Path } from '../../Path.ts';
import { PathTreeNodeMixin } from '../../PathTreeNodeMixin.ts';
import { PubSub, PubSubContext } from '../../pub-sub/PubSub.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Utils } from '../../Utils.ts';
import { AnyChain } from '../any/AnyChain.ts';
import { AnyProcessor, AnyProcessorCtorParams } from '../any/AnyProcessor.ts';
import { ObjectProcessor } from '../object/ObjectProcessor.ts';
import { Processor, ProcessorCompilationContext, State } from '../Processor.ts';
import { ConditionalProcessor } from './conditional/ConditionalProcessor.ts';
import { FieldPointerProcessor } from './fieldPointer/FieldPointerProcessor.ts';
import { ReferenceField } from './reference/ReferenceField.ts';
import { SchemaChain } from './SchemaChain.ts';

export type CompiledSchema<P = Processor> = Record<string, P>;

export type SchemaProcessorCtorParams = AnyProcessorCtorParams<SchemaChain>;

export type SchemaCompilationContext = ProcessorCompilationContext & {
    parent?: SchemaProcessor;
    absolutePath?: Path;
    referenceResolver?: PubSub;
};

export type DeferredProcessorContext = [
    childKey: string,
    processor: Processor,
    parentTracker: ValueTracker,
];

export type ReferenceResolverContext = PubSubContext & {
    deferredReferences: DeferredProcessorContext[];
    rootTracker: ValueTracker;
    failOnFirstError?: boolean;
};

class BoundObjectProcessor extends ObjectProcessor<SchemaChain> { }

class SchemaProcessor extends PathTreeNodeMixin<typeof BoundObjectProcessor>(BoundObjectProcessor) {

    declare public children: Record<string, Processor>;

    private _conditionals: CompiledSchema<ConditionalProcessor>;
    private _nests: CompiledSchema<FieldPointerProcessor>;
    private _references: CompiledSchema;
    private _referenceResolver: PubSub | null;

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
        for (let [key, childField] of field.config.schemaMap) {
            this.addChild(key, childField.createProcessor());
        }
    }

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

        const finalChildren = {} as Record<string, Processor>;
        for (const key of Object.keys(children)) {
            const childProcessor = this.children[key];
            const absoluteSubPath = absolutePath.addSegment(key);

            const resolvedChildProcessor = childProcessor.compile({
                absolutePath: absoluteSubPath,
                parent: this,
                referenceResolver
            });

            let references = this.getReferencesWithinProcessor(resolvedChildProcessor);
            if (resolvedChildProcessor instanceof ConditionalProcessor) {
                _conditionals[key] = resolvedChildProcessor;
            }
            else if (resolvedChildProcessor instanceof FieldPointerProcessor) {
                _nests[key] = resolvedChildProcessor; // guaranteed nest
            }
            else if (references.size > 0) {
                _references[key] = resolvedChildProcessor;

                const subNodeId = absoluteSubPath.toString();
                const subNode = referenceResolver.getNode(subNodeId) ||
                    referenceResolver.createNode(subNodeId);

                subNode.setCallback((context): boolean => {
                    const {
                        failOnFirstError,
                        rootTracker
                    } = context as ReferenceResolverContext;

                    const subTracker = rootTracker.resolvePath<ValueTracker>(absoluteSubPath.toRelative());

                    if (subTracker) {
                        resolvedChildProcessor.process(subTracker);
                    }
                    return true;
                });

                for (const reference of references) {
                    const absolutePublisherPathStr = absoluteSubPath.parent().move(reference.config.path).toString();
                    const pubNode = referenceResolver.getNode(absolutePublisherPathStr) ||
                        referenceResolver.createNode(absolutePublisherPathStr);
                    referenceResolver.linkNodes(pubNode, subNode);
                }
            }
            else {
                finalChildren[key] = resolvedChildProcessor;
            }
        }

        this.setChildren(finalChildren);
        return this;
    }

    public getReferencesWithinProcessor(processor: Processor): Set<ReferenceField> {
        const { field } = processor;
        if (field instanceof ReferenceField) {
            return new Set([field]);
        }
        const references = new Set<ReferenceField>();
        const { defaultValue } = field.config;
        if (defaultValue instanceof ReferenceField) {
            references.add(defaultValue);
        }

        if (processor instanceof AnyProcessor) {
            for (const step of (field as AnyChain).pipeline || []) {
                for (const arg of (processor as AnyProcessor).resolveStepArgs(step.argsOrCallback)) {
                    if (arg instanceof ReferenceField) {
                        references.add(arg);
                    }
                }
            }
        }
        return references;
    }

    public override process(tracker: ValueTracker, state: State = {}): void {

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

        this.preProcess(tracker);
        if (tracker.hasErrors()) {
            return;
        }

        const {
            _field,
            children,
            _conditionals,
            _nests,
            _references,
            _referenceResolver,
        } = this;

        const {
            chainHandler,
            config: {
                renameKeysArgs, stripExtraKeys, failOnFirstError
            }
        } = _field;

        // Do any required key renaming
        if (renameKeysArgs) {
            tracker.setValue(chainHandler.renameKeys(...renameKeysArgs).value);
        }

        // Strip unknown keys if needed
        if (stripExtraKeys) {
            tracker.setValue(chainHandler.stripKeys(
                tracker.getValue() as object,
                Array.from(_field.config.schemaMap.keys())
            ).value);
        }

        this.executePipeline(tracker);
        //todo: check if error and exit here?

        const value = tracker.getValue() as Record<string, any>;

        for (const key of Object.keys(children)) {
            const processor = children[key];
            const childTracker = tracker.createChild(processor.field, key, value[key]);
            processor.process(childTracker, state);
        }


        for (const key of Object.keys(_conditionals)) {
            deferredConditionals.push([key, _conditionals[key], tracker]);
        }

        for (const key of Object.keys(_nests)) {
            deferredNests.push([key, _nests[key], tracker]);
        }

        for (const key of Object.keys(_references)) {
            tracker.createChild(_references[key].field, key, value[key]);
        }

        if (_referenceResolver) {
            // We are in the root of the schema

            _referenceResolver.execute({ deferredReferences, rootTracker: tracker, failOnFirstError });

            if (deferredConditionals.length > 0) {
                for (const [key, processor, conditionalTracker] of deferredConditionals) {
                    const childTracker = conditionalTracker.createChild(processor.field, key);
                    const rawValue = conditionalTracker.rawValue;
                    const value = Utils.isPlainObject(rawValue)
                        ? (rawValue as Record<PropertyKey, unknown>)[key]
                        : undefined;
                    childTracker.setValue(value);
                    processor.process(childTracker);
                }
            }

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
    }

}

export { SchemaProcessor };

