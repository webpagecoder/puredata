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

export type CompiledSchema = Map<string, Processor>;

export type SchemaProcessorConstructorParams = ChainProcessorConstructorParams<SchemaChain>;

export type SchemaCompilationContext = ProcessorCompilationContext & {
    ancestors?: SchemaProcessor[] | null;
    conditionals?: SchemaConditionalProcessor[];
    nests?: SchemaReferenceProcessor[];
    parent?: SchemaProcessor;
    absolutePath?: Path;
    pubSub?: PubSub;
};

class SchemaProcessor extends ObjectProcessor<SchemaChain> {

    protected _conditionals: SchemaConditionalProcessor[] | null;
    protected _nests: SchemaReferenceProcessor[] | null;
    protected _schema: CompiledSchema;
    protected _pubSub: PubSub | null;

    constructor(args: SchemaProcessorConstructorParams) {
        super(args);

        const {
            field,
            processorMapper = new FieldProcessorFactory(),
        } = args;

        this._conditionals = null;
        this._nests = null;
        this._pubSub = null;
        this._schema = new Map();

        // Create the entire tree before compilation (to establish full path structure)
        for (let [key, childField] of field.extendedProps.schemaMap) {
            this._schema.set(key, processorMapper.createProcessor(childField));
        }
    }

    public override compile(context: SchemaCompilationContext = {}): this {

        super.compile(context);

        let {
            ancestors = [],
            conditionals,
            nests,
            absolutePath = new Path('/'),
            pubSub,
        } = context;

        if (!pubSub) {
            this._pubSub = pubSub = new PubSub();
            this._conditionals = conditionals = [];
            this._nests = nests = [];
        }

        const {
            _schema
        } = this;

        for (let [key, childProcessor] of _schema) {
            const absoluteChildPath = absolutePath.move(key);

            let resolvedChildProcessor = childProcessor.compile({
                conditionals,
                ancestors: [...ancestors!, this],
                parent: this,
                absolutePath: absoluteChildPath,
                pubSub,
            });

            _schema.set(key, resolvedChildProcessor);

            if (resolvedChildProcessor instanceof SchemaConditionalProcessor) {
                conditionals!.push(resolvedChildProcessor);
            }
            else if (resolvedChildProcessor instanceof SchemaReferenceProcessor) {
                nests!.push(resolvedChildProcessor); // guaranteed nest
            }
            else if (resolvedChildProcessor.hasReferences()) {

                const subNode = pubSub.getOrCreateNode(
                    absoluteChildPath.string,
                    (context: PubSubContext): boolean => {
                        const { tracker, failOnFirstError } = context;
                        const rel = absoluteChildPath.toRelative();
                        const activeValueTracker = (tracker as ValueTracker).resolvePath(rel);
                        if (activeValueTracker) {
                            resolvedChildProcessor.process(activeValueTracker);
                        }
                        return true;
                    }
                );

                for (const reference of resolvedChildProcessor.getReferences()) {
                    const absolutePublisherPath = absoluteChildPath.parent().move(reference.extendedProps.path);
                    const pubNode = pubSub.getOrCreateNode(absolutePublisherPath.string);
                    pubSub.linkNodes(pubNode, subNode);
                }
            }
        }

        return this;
    }

    public override process(tracker: ValueTracker, state: State = {}): void {

        let conditionalTrackers = state.conditionalTrackers as Map<SchemaConditionalProcessor, ValueTracker>;
        if (!conditionalTrackers) {
            conditionalTrackers = new Map();
            state.conditionalTrackers = conditionalTrackers;
        }

        let nestTrackers = state.nestTrackers as Map<SchemaReferenceProcessor, ValueTracker>;
        if (!nestTrackers) {
            nestTrackers = new Map();
            state.nestTrackers = nestTrackers;
        }

        this.preProcess(tracker);
        if (tracker.hasErrors()) {
            return;
        }

        const { _field, _pubSub, _schema } = this;

        const {
            chainHandler: { renameKeys, stripKeys }, renameKeysArgs, stripUnknownKeys, failOnFirstError
        } = _field.extendedProps;

        // Do any required key renaming
        if (renameKeysArgs) {
            tracker.setValue(renameKeys(...renameKeysArgs).value);
        }

        // Strip unknown keys if needed
        const schemaKeys = Array.from(_schema.keys());
        if (stripUnknownKeys) {
            tracker.setValue(stripKeys(tracker.getValue(), schemaKeys).value);
        }

        this.executePipeline(tracker);
        //todo: check if error and exit here?

        const value = tracker.getValue() as Record<string, any>;
        for (let [key, childProcessor] of _schema) {
            let childValueTracker = new ValueTracker(
                childProcessor.field,
                value[key]
            );

            tracker.setChild(key, childValueTracker);

            if (childProcessor instanceof SchemaConditionalProcessor) {
                conditionalTrackers.set(childProcessor, childValueTracker);
            }
            else if (childProcessor instanceof SchemaReferenceProcessor) {
                nestTrackers.set(childProcessor, childValueTracker);
            }
            else if (!childProcessor.hasReferences()) {
                childProcessor.process(childValueTracker, state);
            }

        }

        if (this._pubSub) {
            this._pubSub.execute({ tracker });
            for (const processor of this._nests!) {
                processor.process(nestTrackers.get(processor)!);
            }
            for (const processor of this._conditionals!) {
                processor.process(conditionalTrackers.get(processor)!);
            }
        }

    }

    public get schema(): CompiledSchema {
        return this._schema;
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

