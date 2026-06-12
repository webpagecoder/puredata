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

export type CompiledSchema<P = Processor> = Map<P, string>;

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
    value: Record<string, any>
];

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
            this._localBasicProcessors.set(processorMapper.createProcessor(childField), key);
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
        for (let [childProcessor, key] of _localBasicProcessors) {
            const absoluteSubPath = absolutePath.move(key);

            const resolvedChildProcessor = childProcessor.compile({
                absolutePath: absoluteSubPath,
                ancestors: [...ancestors!, this],
                parent: this,
                referenceResolver
            });

            if (resolvedChildProcessor instanceof SchemaConditionalProcessor) {
                _localConditionalProcessors.set(resolvedChildProcessor, key);
            }
            else if (resolvedChildProcessor instanceof SchemaReferenceProcessor) {
                _localNestProcessors.set(resolvedChildProcessor, key); // guaranteed nest
            }
            else if (resolvedChildProcessor.hasReferences()) {
                _localReferenceProcessors.set(resolvedChildProcessor, key);

                const subNode = referenceResolver.getOrCreateNode(
                    absoluteSubPath.string,
                    (context: PubSubContext): boolean => {

                        const { deferredReferences } = context;

                        // const { tracker, failOnFirstError } = context;
                        // const subTracker = (tracker as ValueTracker).resolvePath(absoluteSubPath.toRelative());
                        // if (subTracker) {
                        //     subTracker.parent.setChild(
                        //         subTracker.key,
                        //         resolvedChildProcessor.process(subTracker)
                        //     );
                        // }
                        // return true;




                    }
                );

                for (const reference of resolvedChildProcessor.getReferences()) {
                    const absolutePublisherPath = absoluteSubPath.parent().move(reference.extendedProps.path);
                    const pubNode = referenceResolver.getOrCreateNode(absolutePublisherPath.string);
                    referenceResolver.linkNodes(pubNode, subNode);
                }
            }
            else {
                localBasicProcessors.set(resolvedChildProcessor, key);
            }
        }

        this._localBasicProcessors = localBasicProcessors;
        return this;
    }

    public override process(tracker: ValueTracker, state: State = {}): ValueTracker {

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
            return tracker;
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
        const schemaKeys = Array.from(_localBasicProcessors.keys());
        if (stripUnknownKeys) {
            tracker.setValue(stripKeys(tracker.getValue(), schemaKeys).value);
        }

        this.executePipeline(tracker);
        //todo: check if error and exit here?

        const value = tracker.getValue() as Record<string, any>;

        for (let [childProcessor, key] of _localBasicProcessors) {
            tracker.setChild(key, childProcessor.process(
                new ValueTracker(childProcessor.field, value[key]),
                state
            ));
        }

        if (_localNestProcessors.size > 0) {
            for (const [processor, key] of _localNestProcessors) {
                deferredNests.push([key, processor, tracker, value]);
            }
        }

        if (_localConditionalProcessors.size > 0) {
            for (const [processor, key] of _localConditionalProcessors) {
                deferredConditionals.push([key, processor, tracker, value]);
            }
        }

        if (_localReferenceProcessors.size > 0) {
            for (const [processor, key] of _localReferenceProcessors) {
                deferredReferences.push([key, processor, tracker, value]);
            }
        }

        if (_referenceResolver) {
            // We are in the root of the schema

            if (deferredReferences.length > 0) {
                _referenceResolver.execute({ deferredReferences });
            }

            if (deferredNests.length > 0) {
                for (const [key, processor, tracker, value] of deferredNests) {
                    tracker.setChild(key, processor.process(
                        new ValueTracker(processor.field, value[key])
                    ));
                }
            }

            if (deferredConditionals.length > 0) {
                for (const [key, processor, tracker, value] of deferredConditionals) {
                    tracker.setChild(key, processor.process(
                        new ValueTracker(processor.field, value[key])
                    ));
                }
            }
        }
        return tracker;
    }

    public get schema(): CompiledSchema {
        return this._localBasicProcessors;
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
            processor = processor.schema.get(key) || null;
        }
        return processor;
    }


}

export { SchemaProcessor };

