'use strict';

import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { SchemaChain } from '../fields/SchemaChain.ts';
import { SchemaConditionalField } from '../fields/SchemaConditionalField.ts';
import { Path } from '../Path.ts';
import { PubSub } from '../pub-sub/PubSub.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ChainProcessorConstructorParams } from './ChainProcessor.ts';
import { ObjectProcessor } from './ObjectProcessor.ts';
import { CompilationContext, Processor, State } from './Processor.ts';
import { SchemaConditionalProcessor } from './SchemaConditionalProcessor.ts';
import { SchemaNodePosition } from './SchemaNodePosition.ts';
import { SchemaNode } from './SchemaNode.ts';

export type CompiledSchemaMap = Map<string, Processor>;

export type SchemaProcessorConstructorParams = ChainProcessorConstructorParams<SchemaChain> & {
    depth?: number;
    parent?: SchemaProcessor;
    path?: Path;
    root?: SchemaProcessor;
};

export type SchemaCompilationContext = CompilationContext & {
    pubSub?: PubSub;
    conditionals?: SchemaConditionalProcessor[];
};

class SchemaProcessor extends ObjectProcessor<SchemaChain> implements SchemaNodePosition {

    protected _compiledSchemaMap: CompiledSchemaMap;
    protected _conditionals: SchemaConditionalProcessor[] | null;
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

        this._compiledSchemaMap = new Map();
        this._depth = depth;
        this._parent = parent;
        this._path = path;
        this._root = root;

        // To be populated during compilation, local roots only
        this._conditionals = null;
        this._pubSub = null;

        const compiledSchemaMap: CompiledSchemaMap = new Map();

        for (let [key, childField] of field.extendedProps.schemaMap) {
            const parent = this;
            const path = this._path.move(key);
            const root = this._root;

            let compiledChild = processorMapper.createProcessor(childField, {
                depth: depth + 1,
                parent,
                path,
                root
            });

            if (!(compiledChild instanceof SchemaProcessor)) {
                compiledChild = new SchemaNode({
                    innerProcessor: compiledChild,
                    parent,
                    path,
                    root
                });
            }

            compiledSchemaMap.set(key, compiledChild);
        }


        //todo: go through compiled child processors and if any have substitution references,
        // get those ready.

        this._compiledSchemaMap = compiledSchemaMap;
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
            conditionals
        } = context;

        if (!pubSub) {
            this._pubSub = pubSub = new PubSub();
            this._conditionals = conditionals = [];
        }

        const {
            _depth,
            _path,
            _compiledSchemaMap
        } = this;

        for (let [key, childProcessor] of _compiledSchemaMap) {
            const childPath = _path.move(key);

            childProcessor.compile({
                pubSub,
                conditionals
            }); //conditionals should make a new pubsub

            _compiledSchemaMap.set(key, childProcessor);

            if (childProcessor.field instanceof SchemaConditionalField) {
                conditionals!.push(childProcessor);
            }
            else if (childProcessor.hasReferences()) {
                // for (const { pubSub, depth } of allPubSubs) {

                const adjustedRelativeSubPath = childPath.shiftKeys(_depth - 1).toRelative();

                const subNode = pubSub.getOrCreateNode(
                    childPath.string,
                    function ({ tracker, failOnFirstError }) {

                        console.log(adjustedRelativeSubPath.string, childPath.string);
                        const activeValueTracker = tracker.getNodeByPath(childPath);
                        if (activeValueTracker) {
                            childProcessor.process(activeValueTracker);
                        }
                        return true;
                    }
                );

                for (const reference of childProcessor.getReferences()) {
                    const publisherPath = childPath.parent().move(reference.extendedProps.path);
                    const pubNode = pubSub.getOrCreateNode(publisherPath.string);
                    pubSub.linkNodes(pubNode, subNode);
                }
                // }


            }
        }

        return this;
    }

    public override process(tracker: ValueTracker, state: State = {}): ValueTracker {

        let conditionalTrackersMap = state.conditionalTrackersMap as Map<SchemaConditionalProcessor, ValueTracker>;
        if (!conditionalTrackersMap) {
            conditionalTrackersMap = new Map<SchemaConditionalProcessor, ValueTracker>();
            state.conditionalTrackersMap = conditionalTrackersMap;
        }


        this.preProcess(tracker, state);
        if (tracker.hasErrors()) {
            return tracker;
        }

        const { _field, _pubSub, _compiledSchemaMap } = this;


        const {
            chainHandler: { renameKeys, stripKeys }, renameKeysArgs, stripUnknownKeys, failOnFirstError
        } = _field.extendedProps;

        // Do any required key renaming
        if (renameKeysArgs) {
            tracker.setValue(renameKeys(...renameKeysArgs).value);
        }

        // Strip unknown keys if needed
        const schemaKeys = Array.from(_compiledSchemaMap.keys());
        if (stripUnknownKeys) {
            tracker.setValue(stripKeys(tracker.getValue(), schemaKeys).value);
        }

        this.executePipeline(tracker);
        //todo: check if error and exit here?





        const value = tracker.getValue() as Record<string, any>;
        for (let [key, childProcessor] of _compiledSchemaMap) {
            const {field} = childProcessor;
            let childValueTracker = new ValueTracker(field);

            if (field instanceof SchemaConditionalField) {
                conditionalTrackersMap.set(childProcessor, tracker);
                continue;
            }

            


            childValueTracker.setValue(value[key]);
            // childValueTracker.path = tracker.path.move(key);

            if (!childProcessor.hasReferences()) {
                tracker.setChild(key, childProcessor.process(childValueTracker, state));
            }
            else {
                tracker.setChild(key, childValueTracker);
            }
        }

        if (this._pubSub) {
            this._pubSub.execute({ tracker });
            for (const conditional of this._conditionals!) {
                conditional.process(conditionalTrackersMap.get(conditional)!, state);
            }
        }

        return tracker;
    }

    public resolvePath(path: Path): Processor | null {
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
            const child = target._compiledSchemaMap.get(key);
            if (!child) {
                return null;
            }
            target = child;
        }
        return target;
    }


}

export { SchemaProcessor };

