'use strict';

import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { SchemaChain } from '../fields/SchemaChain.ts';
import { SchemaConditionalField } from '../fields/SchemaConditionalField.ts';
import { Path } from '../Path.ts';
import { PubSub } from '../pub-sub/PubSub.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ObjectProcessor, ObjectProcessorProps } from './ObjectProcessor.ts';
import { Processor, State } from './Processor.ts';
import { SchemaNodeProcessor } from './SchemaNodeProcessor.ts';
import { SchemaNodePosition } from './SchemaNodePosition.ts';

export type SchemaProcessorProps = ObjectProcessorProps<SchemaChain> & {
    field: SchemaChain;
    depth?: number;
    parent?: SchemaProcessor;
    path?: Path;
    pubSub?: PubSub;
    root?: SchemaProcessor;
};

export type CompiledSchemaMap = Map<string, SchemaNodeProcessor>;

export type CompilationContext = {
    parentPubSubs?: {
        pubSub: PubSub;
        depth: number;
    }[];
};

class SchemaProcessor extends ObjectProcessor<SchemaChain> implements SchemaNodePosition {

    protected _parent: SchemaProcessor;
    protected _path: Path
    protected _root: SchemaProcessor;

    protected _compiledSchemaMap: CompiledSchemaMap;
    protected _depth: number;
    protected _pubSub: PubSub;

    constructor(args: SchemaProcessorProps) {
        const {
            field,
            processorMapper = new FieldProcessorFactory(),
            depth = 0,
            path = Path.create('/'),
            parent,
            pubSub = new PubSub(),
            root
        } = args;

        super(args);

        this._parent = parent || this;
        this._path = path;
        this._root = root || this;

        this._compiledSchemaMap = new Map();
        this._depth = depth;
        this._pubSub = pubSub;

        const compiledSchemaMap: CompiledSchemaMap = new Map();

        for (let [key, childField] of field.extendedProps.schemaMap) {
            let compiledChild = processorMapper.createProcessor(childField, {
                depth: depth + 1,
            });

            if (!(compiledChild instanceof SchemaProcessor)) {
                compiledChild = new SchemaNodeProcessor({
                    processor: compiledChild,
                    parent: this,
                    path: path.move(key),
                    root: this._root
                });
            }

            compiledSchemaMap.set(key, compiledChild);
        }

        this._compiledSchemaMap = compiledSchemaMap;
    }

    public override compile(context: CompilationContext = {}): this {
        super.compile();

        const {
            _depth,
            _path,
            _compiledSchemaMap
        } = this;

        let {
            parentPubSubs = [],
        }: CompilationContext = context;

        const allPubSubs = [
            {
                pubSub: this._pubSub,
                depth: _depth
            },
            ...parentPubSubs
        ];


        for (let [key, childProcessor] of _compiledSchemaMap) {
            const childPath = _path.move(key);

            childProcessor = childProcessor.compile({
                parentPubSubs: allPubSubs,
            });

            _compiledSchemaMap.set(key, childProcessor);

            if (childProcessor.hasReferences()) {
                for (const { pubSub, depth } of allPubSubs) {

                    const adjustedRelativeSubPath = childPath.shiftKeys(depth).toRelative();

                    const subNode = pubSub.getOrCreateNode(
                        childPath.string,
                        function ({ tracker, failOnFirstError, prependRootPath }) {
                            const activeValueTracker = tracker.getNodeByPath(adjustedRelativeSubPath);
                            if (activeValueTracker) {
                                childProcessor.actualProcess(activeValueTracker);
                            }
                            return true;
                        }
                    );

                    for (const reference of childProcessor.getReferences()) {
                        const publisherPath = childPath.parent().move(reference.path);
                        const pubNode = pubSub.getOrCreateNode(publisherPath.string);
                        pubSub.linkNodes(pubNode, subNode);
                    }
                }
            }
        }

        return this;
    }

    public override actualProcess(tracker: ValueTracker, state: State = {}): ValueTracker {

        this.preProcess(tracker, state);
        if (tracker.hasErrors()) {
            return tracker;
        }

        const { _field, _pubSub, _compiledSchemaMap } = this;

        if (!state.localRoot) {
            state.localRoot = this;
            state.conditionals = [];
        }

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

        const value = tracker.getValue();
        for (let [key, childProcessor] of _compiledSchemaMap) {

            let childValueTracker = new ValueTracker(undefined, childProcessor);


            childValueTracker.setValue(value[key]);
            // childValueTracker.path = tracker.path.move(key);

            const childField = childProcessor.field;
            if (childField instanceof SchemaConditionalField) {
                state.conditionals.push([childProcessor, childValueTracker]);
            }
            else if (!childProcessor.hasReferences()) {
                tracker.setChild(key, childProcessor.actualProcess(childValueTracker, state));
            }
            else {
                tracker.setChild(key, childValueTracker);
            }
        }

        if (state.localRoot === this) {
            _pubSub.execute({ tracker });

            for (const [conditionalField, tracker] of state.conditionals) {
                conditionalField.actualProcess(tracker); // fresh state
            }
            // console.log(this.state.conditionals);
            state.conditionals = [];

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

    public get parent(): SchemaProcessor {
        return this._parent;
    }
    public get path(): Path {
        return this._path;
    }
    public get root(): SchemaProcessor {
        return this._root;
    }

}

export { SchemaProcessor };

