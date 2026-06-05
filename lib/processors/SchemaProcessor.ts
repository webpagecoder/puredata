'use strict';

import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { SchemaChain } from '../fields/SchemaChain.ts';
import { SchemaConditionalField } from '../fields/SchemaConditionalField.ts';
import { Path } from '../Path.ts';
import { PubSub } from '../pub-sub/PubSub.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ChainProcessorConstructorParams } from './ChainProcessor.ts';
import { ObjectProcessor } from './ObjectProcessor.ts';
import { ProcessorCompilationContext, Processor, State } from './Processor.ts';
import { SchemaConditionalProcessor } from './SchemaConditionalProcessor.ts';
import { SchemaNode } from './SchemaNode.ts';
import { SchemaNodePosition } from './SchemaNodePosition.ts';

export type CompiledSchema = Map<string, SchemaNode | SchemaProcessor>;

export type SchemaProcessorConstructorParams = ChainProcessorConstructorParams<SchemaChain> & {
    depth?: number;
    parent?: SchemaProcessor;
    path?: Path;
    root?: SchemaProcessor;
};

export type SchemaCompilationContext = ProcessorCompilationContext & {
    pubSub?: PubSub;
    conditionals?: SchemaNode[];
};

class SchemaProcessor extends ObjectProcessor<SchemaChain> implements SchemaNodePosition {

    protected _compiledSchema: CompiledSchema;
    protected _conditionals: SchemaNode[] | null;
    protected _depth: number;
    protected _parent: SchemaProcessor;
    protected _path: Path;
    protected _pubSub: PubSub | null;
    protected _root: SchemaProcessor;

    constructor(args: SchemaProcessorConstructorParams) {
        super(args);

        const {
            depth = 0,
            field,
            parent = this,
            path = new Path('/'),
            processorMapper = new FieldProcessorFactory(),
            root = this
        } = args;

        this._compiledSchema = new Map();
        this._depth = depth;
        this._parent = parent;
        this._path = path;
        this._root = root;

        // To be populated during compilation, local roots only
        this._conditionals = null;
        this._pubSub = null;

        const compiledSchema: CompiledSchema = new Map();

        for (let [key, childField] of field.extendedProps.schemaMap) {
            const childPath = path.move(key);
            const compiledChild = processorMapper.createProcessor(childField, {
                depth: depth + 1,
                parent,
                path: childPath,
                root
            });

            compiledSchema.set(key,
                compiledChild instanceof SchemaProcessor
                    ? compiledChild
                    : new SchemaNode({
                        innerProcessor: compiledChild,
                        parent: this,
                        path: childPath,
                        root
                    })
            );
        }

        //todo: go through compiled child processors and if any have substitution references,
        // get those ready.

        this._compiledSchema = compiledSchema;
    }

    public get parent(): SchemaProcessor {
        return this._parent;
    }
    public get path(): Path {
        return this._path;
    }
    public get root(): SchemaProcessor {
        return this._root;
    }

    public override compile(context: SchemaCompilationContext = {}): this {

        super.compile(context);

        let {
            pubSub,
            conditionals, path
        } = context;

        if (!pubSub) {
            this._pubSub = pubSub = new PubSub();
            this._conditionals = conditionals = [];
        }

        const {
            _depth,
            _compiledSchema
        } = this;

        for (let [key, childProcessor] of _compiledSchema) {
            const { field, path } = childProcessor;

            childProcessor = childProcessor.compile({
                pubSub,
                conditionals
            });
            _compiledSchema.set(key, childProcessor);

            if (field instanceof SchemaConditionalField) {
                conditionals!.push(childProcessor);
            }
            else if (childProcessor.hasReferences()) {
                // for (const { pubSub, depth } of allPubSubs) {

                const adjustedRelativeSubPath = path.shiftKeys(_depth - 1).toRelative();

                const subNode = pubSub.getOrCreateNode(
                    path.string,
                    function ({ tracker, failOnFirstError }) {

                        console.log(adjustedRelativeSubPath.string, path.string);
                        const activeValueTracker = tracker.getNodeByPath(path);
                        if (activeValueTracker) {
                            childProcessor.process(activeValueTracker);
                        }
                        return true;
                    }
                );

                for (const reference of childProcessor.getReferences()) {
                    const publisherPath = path.parent().move(reference.extendedProps.path);
                    const pubNode = pubSub.getOrCreateNode(publisherPath.string);
                    pubSub.linkNodes(pubNode, subNode);
                }
                // }


            }
        }

        return this;
    }

    public override process(tracker: ValueTracker, state: State = {}): ValueTracker {

        let conditionalTrackers = state.conditionalTrackers as Map<SchemaConditionalProcessor, ValueTracker>;
        if (!conditionalTrackers) {
            conditionalTrackers = new Map<SchemaConditionalProcessor, ValueTracker>();
            state.conditionalTrackers = conditionalTrackers;
        }


        this.preProcess(tracker, state);
        if (tracker.hasErrors()) {
            return tracker;
        }

        const { _field, _pubSub, _compiledSchema } = this;


        const {
            chainHandler: { renameKeys, stripKeys }, renameKeysArgs, stripUnknownKeys, failOnFirstError
        } = _field.extendedProps;

        // Do any required key renaming
        if (renameKeysArgs) {
            tracker.setValue(renameKeys(...renameKeysArgs).value);
        }

        // Strip unknown keys if needed
        const schemaKeys = Array.from(_compiledSchema.keys());
        if (stripUnknownKeys) {
            tracker.setValue(stripKeys(tracker.getValue(), schemaKeys).value);
        }

        this.executePipeline(tracker);
        //todo: check if error and exit here?

        const value = tracker.getValue() as Record<string, any>;
        for (let [key, childProcessor] of _compiledSchema) {
            const { field } = childProcessor;
            let childValueTracker = new ValueTracker(field, value[key]);

            if (field instanceof SchemaConditionalField) {
                tracker.setChild(key, childValueTracker);
                conditionalTrackers.set(childProcessor, childValueTracker);
            }
            else if (!childProcessor.hasReferences()) {
                tracker.setChild(key, childProcessor.process(childValueTracker, state));
            }
            else {
                tracker.setChild(key, childValueTracker);
            }
        }

        if (this._pubSub) {
            this._pubSub.execute({ tracker });
            for (const schemaNode of this._conditionals!) {
                schemaNode.process(conditionalTrackers.get(schemaNode)!);
            }
        }

        return tracker;
    }

    public resolvePath(path: Path) {
        if (typeof path === 'string') {
            path = Path.create(path);
        }
        if (path.isSelf) {
            return this;
        }

        let schemaProcessor: SchemaProcessor = this;
        if (path.isAbsolute) {
            schemaProcessor = this._root;
        }
        else {
            for (let i = 0; i < path.upCount; ++i) {
                schemaProcessor = schemaProcessor._parent;
            }
        }

        let target: Processor = schemaProcessor;
        for (const key of path.keys) {
            if (!(target instanceof SchemaProcessor)) {
                return null;
            }
            const child = target._compiledSchema.get(key);
            if (!child) {
                return null;
            }
            target = child;
        }
        return target;
    }

}

export { SchemaProcessor };

