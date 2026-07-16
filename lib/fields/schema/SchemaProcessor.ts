'use strict';

import { SchemaChain } from './SchemaChain.ts';
import { Path } from '../../Path.ts';
import { PubSub, PubSubContext } from '../../pub-sub/PubSub.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor, AnyProcessorCtorParams } from '../any/AnyProcessor.ts';
import { ObjectProcessor } from '../object/ObjectProcessor.ts';
import { Processor, ProcessorCompilationContext, State } from '../Processor.ts';
import { ConditionalProcessor } from './conditional/ConditionalProcessor.ts';
import { FieldPointerProcessor } from './fieldPointer/FieldPointerProcessor.ts';
import { Utils } from '../../Utils.ts';
import { PathValueField } from './pathValue/PathValueField.ts';
import { Field } from '../Field.ts';
import { AnyChainProps } from '../any/AnyChain.ts';

export type CompiledSchema<P = Processor> = Map<string, P>;

export type SchemaProcessorCtorParams = AnyProcessorCtorParams<SchemaChain>;

export type SchemaCompilationContext = ProcessorCompilationContext & {
    ancestors?: SchemaProcessor[] | null;
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

class SchemaProcessor extends ObjectProcessor<SchemaChain> {

    protected _localBasicProcessors: CompiledSchema;
    protected _localConditionalProcessors: CompiledSchema<ConditionalProcessor>;
    protected _localNestProcessors: CompiledSchema<FieldPointerProcessor>;
    protected _localFieldPointerProcessors: CompiledSchema;
    protected _referenceResolver: PubSub | null;

    constructor(args: SchemaProcessorCtorParams) {
        super(args);

        const {
            field,
        } = args;

        this._localBasicProcessors = new Map();
        this._localConditionalProcessors = new Map();
        this._localNestProcessors = new Map();
        this._localFieldPointerProcessors = new Map();
        this._referenceResolver = null;

        // Create the entire tree before compilation (to establish full path structure)
        for (let [key, childField] of field.props.schemaMap) {
            this._localBasicProcessors.set(key, childField.createProcessor());
        }
    }

    public override compile(context: SchemaCompilationContext = {}): this {

        super.compile(context);

        let {
            absolutePath = new Path('/'),
            ancestors = [],
            referenceResolver,
        } = context;

        if (!referenceResolver) {
            this._referenceResolver = referenceResolver = new PubSub();
        }

        const {
            _localConditionalProcessors,
            _localNestProcessors,
            _localFieldPointerProcessors,
            _localBasicProcessors,
        } = this;

        const localBasicProcessors: CompiledSchema = new Map();
        for (let [key, childProcessor] of _localBasicProcessors) {
            const absoluteSubPath = absolutePath.addSegment(key);

            const resolvedChildProcessor = childProcessor.compile({
                absolutePath: absoluteSubPath,
                ancestors: [...ancestors!, this],
                parent: this,
                referenceResolver
            });

            let references = this.getReferencesWithinProcessor(resolvedChildProcessor);
            if (resolvedChildProcessor instanceof ConditionalProcessor) {
                _localConditionalProcessors.set(key, resolvedChildProcessor);
            }
            else if (resolvedChildProcessor instanceof FieldPointerProcessor) {
                _localNestProcessors.set(key, resolvedChildProcessor); // guaranteed nest
            }
            else if (references.size > 0) {
                _localFieldPointerProcessors.set(key, resolvedChildProcessor);

                const subNodeId = absoluteSubPath.toString();
                const subNode = referenceResolver.getNode(subNodeId) ||
                    referenceResolver.createNode(subNodeId);

                subNode.setCallback((context): boolean => {
                    const {
                        failOnFirstError,
                        rootTracker
                    } = context as ReferenceResolverContext;

                    const subTracker = rootTracker.resolvePath(absoluteSubPath.toRelative());

                    // const { tracker, failOnFirstError } = context;
                    // const subTracker = (tracker as ValueTracker).resolvePath(absoluteSubPath.toRelative());
                    if (subTracker) {
                        resolvedChildProcessor.process(subTracker);
                    }
                    return true;
                });

                for (const reference of references) {
                    const absolutePublisherPathStr = absoluteSubPath.parent().move(reference.props.path).toString();
                    const pubNode = referenceResolver.getNode(absolutePublisherPathStr) ||
                        referenceResolver.createNode(absolutePublisherPathStr);
                    referenceResolver.linkNodes(pubNode, subNode);
                }
            }
            else {
                localBasicProcessors.set(key, resolvedChildProcessor);
            }
        }

        this._localBasicProcessors = localBasicProcessors;
        return this;
    }

    public getReferencesWithinProcessor(processor: Processor): Set<PathValueField> {
        const { field } = processor;
        if (field instanceof PathValueField) {
            return new Set([field]);
        }
        const references = new Set<PathValueField>();
        const { defaultValue } = field;
        if (defaultValue instanceof PathValueField) {
            references.add(defaultValue);
        }

        if(processor instanceof AnyProcessor) {
            for (const step of (field.props as AnyChainProps).pipeline || []) {
                for (const arg of (processor as AnyProcessor).resolveStepArgs(step.argsOrCallback)) {
                    if (arg instanceof PathValueField) {
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
            _localBasicProcessors,
            _localConditionalProcessors,
            _localNestProcessors,
            _localFieldPointerProcessors,
            _referenceResolver,
        } = this;

        const {
            chainHandler: { renameKeys, stripKeys }, renameKeysArgs, stripUnknownKeys, failOnFirstError
        } = _field.props;

        // Do any required key renaming
        if (renameKeysArgs) {
            tracker.setValue(renameKeys(...renameKeysArgs).value);
        }

        // Strip unknown keys if needed
        if (stripUnknownKeys) {
            tracker.setValue(stripKeys(
                tracker.getValue(),
                Array.from(_field.props.schemaMap.keys())
            ).value);
        }

        this.executePipeline(tracker);
        //todo: check if error and exit here?

        const value = tracker.getValue() as Record<string, any>;

        for (let [key, processor] of _localBasicProcessors) {
            processor.process(tracker.createChild(processor.field, key, value[key]), state);
        }

        if (_localConditionalProcessors.size > 0) {
            for (const [key, processor] of _localConditionalProcessors) {
                deferredConditionals.push([key, processor, tracker]);
            }
        }

        if (_localNestProcessors.size > 0) {
            for (const [key, processor] of _localNestProcessors) {
                deferredNests.push([key, processor, tracker]);
            }
        }

        if (_localFieldPointerProcessors.size > 0) {
            for (const [key, processor] of _localFieldPointerProcessors) {
                tracker.createChild(processor.field, key, value[key]);
            }
        }

        if (_referenceResolver) {
            // We are in the root of the schema

            _referenceResolver.execute({ deferredReferences, rootTracker: tracker, failOnFirstError });

            if (deferredConditionals.length > 0) {
                for (const [key, processor, tracker] of deferredConditionals) {
                    const childTracker = tracker.createChild(processor.field, key);
                    const rawValue = tracker.rawValue;
                    const value = Utils.isPlainObject(rawValue)
                        ? (rawValue as Record<PropertyKey, unknown>)[key]
                        : undefined;
                    childTracker.setValue(value);
                    processor.process(childTracker);
                }
            }

            if (deferredNests.length > 0) {
                for (const [key, processor, tracker] of deferredNests) {
                    const childTracker = tracker.createChild(processor.field, key);
                    const rawValue = tracker.rawValue;
                    const value = Utils.isPlainObject(rawValue)
                        ? (rawValue as Record<PropertyKey, unknown>)[key]
                        : undefined;
                    childTracker.setValue(value);
                    processor.process(childTracker);
                }
            }

        }
    }

    public resolvePath(path: Path, self: Processor, ancestors: SchemaProcessor[] = []): null | Processor {
        if (path.isSelf) {
            return self;
        }

        let processor: Processor | null;
        if (path.isAbsolute) {
            processor = ancestors[0];
        }
        else {
            ancestors = ancestors.slice(0, -1);
            processor = this;
            let upCount = path.upCount - 1; // -1 because we are already on the parent processor
            while (upCount > 0) {
                if (ancestors.length === 0) {
                    return null;
                }
                processor = ancestors.pop() as Processor;
                --upCount;
            }
        }

        for (const key of path.keys) {
            if (!processor || !(processor instanceof SchemaProcessor)) {
                return null;
            }
            processor = processor._localBasicProcessors.get(key) || null;
        }
        return processor;
    }
}

export { SchemaProcessor };

