'use strict';

import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { SchemaChain } from '../fields/SchemaChain.ts';
import { Path } from '../Path.ts';
import { PubSub, PubSubContext } from '../pub-sub/PubSub.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ChainProcessorConstructorParams } from './ChainProcessor.ts';
import { ObjectProcessor } from './ObjectProcessor.ts';
import { Processor, ProcessorCompilationContext, State } from './Processor.ts';
import { SchemaConditionalProcessor } from './SchemaConditionalProcessor.ts';
import { SchemaReferenceProcessor } from './SchemaReferenceProcessor.ts';

export type CompiledSchema<P = Processor> = Map<string, P>;

export type SchemaProcessorConstructorParams = ChainProcessorConstructorParams<SchemaChain>;

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
    parentValue: Record<string, any>
];

export type ReferenceResolverContext = PubSubContext & {
    deferredReferences: DeferredProcessorContext[];
    rootTracker: ValueTracker;
    failOnFirstError?: boolean;
};

class SchemaProcessor extends ObjectProcessor<SchemaChain> {

    protected _localBasicProcessors: CompiledSchema;
    protected _localConditionalProcessors: CompiledSchema<SchemaConditionalProcessor>;
    protected _localNestProcessors: CompiledSchema<SchemaReferenceProcessor>;
    protected _localReferenceProcessors: CompiledSchema;
    protected _referenceResolver: PubSub | null;

    constructor(args: SchemaProcessorConstructorParams) {
        super(args);

        const {
            field,
            processorMapper = new FieldProcessorFactory(),
        } = args;

        this._localBasicProcessors = new Map();
        this._localConditionalProcessors = new Map();
        this._localNestProcessors = new Map();
        this._localReferenceProcessors = new Map();
        this._referenceResolver = null;

        // Create the entire tree before compilation (to establish full path structure)
        for (let [key, childField] of field.extendedProps.schemaMap) {
            this._localBasicProcessors.set(key, processorMapper.createProcessor(childField));
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
            _localReferenceProcessors,
            _localBasicProcessors,
        } = this;

        const localBasicProcessors: CompiledSchema = new Map();
        for (let [key, childProcessor] of _localBasicProcessors) {
            const absoluteSubPath = absolutePath.move(key);

            const resolvedChildProcessor = childProcessor.compile({
                absolutePath: absoluteSubPath,
                ancestors: [...ancestors!, this],
                parent: this,
                referenceResolver
            });

            if (resolvedChildProcessor instanceof SchemaConditionalProcessor) {
                _localConditionalProcessors.set(key, resolvedChildProcessor);
            }
            else if (resolvedChildProcessor instanceof SchemaReferenceProcessor) {
                _localNestProcessors.set(key, resolvedChildProcessor); // guaranteed nest
            }
            else if (resolvedChildProcessor.hasReferences()) {
                _localReferenceProcessors.set(key, resolvedChildProcessor);

                const subNode = referenceResolver.getOrCreateNode(
                    absoluteSubPath.string,
                    (context): boolean => {

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




                    }
                );

                for (const reference of resolvedChildProcessor.getReferences()) {
                    const absolutePublisherPath = absoluteSubPath.parent().move(reference.extendedProps.path);
                    const pubNode = referenceResolver.getOrCreateNode(absolutePublisherPath.string);
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
            _localReferenceProcessors,
            _referenceResolver,
        } = this;

        const {
            chainHandler: { renameKeys, stripKeys }, renameKeysArgs, stripUnknownKeys, failOnFirstError
        } = _field.extendedProps;

        // Do any required key renaming
        if (renameKeysArgs) {
            tracker.setValue(renameKeys(...renameKeysArgs).value);
        }

        // Strip unknown keys if needed
        if (stripUnknownKeys) {
            tracker.setValue(stripKeys(
                tracker.getValue(),
                Array.from(_field.extendedProps.schemaMap.keys())
            ).value);
        }

        this.executePipeline(tracker);
        //todo: check if error and exit here?

        const value = tracker.getValue() as Record<string, any>;

        for (let [key, processor] of _localBasicProcessors) {
            processor.process(tracker.insertChild(processor.field, key, value[key]), state);
        }

        if (_localConditionalProcessors.size > 0) {
            for (const [key, processor] of _localConditionalProcessors) {
                deferredConditionals.push([key, processor, tracker, value]);
            }
        }

        if (_localNestProcessors.size > 0) {
            for (const [key, processor] of _localNestProcessors) {
                deferredNests.push([key, processor, tracker, value]);
            }
        }

        if (_localReferenceProcessors.size > 0) {
            for (const [key, processor] of _localReferenceProcessors) {
                tracker.insertChild(processor.field, key);
            }
        }

        if (_referenceResolver) {
            // We are in the root of the schema

            _referenceResolver.execute({ deferredReferences, rootTracker: tracker, failOnFirstError });

            if (deferredNests.length > 0) {
                for (const [key, processor, tracker, value] of deferredNests) {
                    processor.process(tracker.insertChild(processor.field, key));
                }
            }

            if (deferredConditionals.length > 0) {
                for (const [key, processor, tracker, value] of deferredConditionals) {
                    processor.process(tracker.insertChild(processor.field, key));
                }
            }
        }
    }

    public resolveNodePath(path: Path, ancestors: SchemaProcessor[] = []): null | Processor {
        if (typeof path === 'string') {
            path = Path.create(path);
        }
        if (path.isSelf) {
            return this;
        }

        let processor: Processor | null;
        if (path.isAbsolute) {
            processor = ancestors[0];
        }
        else {
            ancestors = [...ancestors];
            processor = this;
            let { upCount } = path;
            while (upCount > 0 && ancestors.length >= 1) {
                processor = ancestors.pop() as Processor;
                upCount--;
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

