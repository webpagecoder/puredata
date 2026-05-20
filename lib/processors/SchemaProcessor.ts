'use strict';

import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { ObjectChain } from '../fields/ObjectChain.ts';
import { SchemaChain } from '../fields/SchemaChain.ts';
import { SchemaConditionalField } from '../fields/SchemaConditionalField.ts';
import { Path } from '../Path.ts';
import { PubSub } from '../pub-sub/PubSub.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ObjectProcessor, ObjectProcessorProps } from './ObjectProcessor.ts';
import { Processor, State } from './Processor.ts';

export type SchemaProcessorProps = ObjectProcessorProps<SchemaChain> & {
    field: SchemaChain;
    depth?: number;
    path?: Path;
    parent?: SchemaProcessor;
    pubSub?: PubSub;
    root?: SchemaProcessor;
};

export type CompilationContext = {
    parentPubSubs?: {
        pubSub: PubSub;
        depth: number;
    }[];
};

class SchemaProcessor extends ObjectProcessor<SchemaChain> {

    protected _depth: number;
    protected _path: Path
    protected _parent: SchemaProcessor;
    protected _pubSub: PubSub;
    protected _root: SchemaProcessor
    protected _schema: Map<string, Processor>;

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

        this._depth = depth;
        this._path = path;
        this._parent = parent || this;
        this._pubSub = pubSub;
        this._root = root || this;
        this._schema = new Map();

        const { schema = new Map() } = field;

        const compiledSchema = new Map();
        this._schema = compiledSchema;

        for (let [key, childField] of schema) {
            const compiledChild = processorMapper.createProcessor(childField, {
                depth: depth + 1,
                path: path.move(key),
                parent: this,
                root: this._root,
            });
            if (!(compiledChild instanceof SchemaProcessor)) {
                // Set proper path/parent/root for non-schema chains
                (compiledChild as SchemaProcessor)._path = path.move(key);
                (compiledChild as SchemaProcessor)._parent = this;
                (compiledChild as SchemaProcessor)._root = this._root;
            }
            compiledSchema.set(key, compiledChild);
        }
    }

    public override compile(context: CompilationContext = {}): this {
        super.compile();

        const {
            _depth,
            _path,
            _schema
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


        for (let [key, childProcessor] of _schema) {
            const childPath = _path.move(key);

            childProcessor = childProcessor.compile({
                parentPubSubs: allPubSubs,
            });

            _schema.set(key, childProcessor);

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

        const { _field, _pubSub } = this;

        if (!state.localRoot) {
            state.localRoot = this;
            state.conditionals = [];
        }

        const {
            chainHandler: { renameKeys: renameKeysFn, stripKeys: stripUnknownKeysFn },
            renameKeysArgs, stripUnknownKeys, schema, failOnFirstError
        } = _field;

        // Do any required key renaming
        if (renameKeysArgs) {
            tracker.setValue(renameKeysFn(...renameKeysArgs).value);
        }

        // Strip unknown keys if needed
        const schemaKeys = Array.from(schema.keys());
        if (stripUnknownKeysFn) {
            tracker.setValue(stripUnknownKeysFn(tracker.getValue(), schemaKeys).value);
        }
        else {
            tracker.untrackedEntries = tracker.getValue();
        }

        this.executePipeline(tracker);
        //todo: check if error and exit here?

        const value = tracker!.value;
        for (let [key, childProcessor] of this._schema) {

            let childValueTracker = new ValueTracker(undefined, childProcessor);
            tracker.setChild(key, childValueTracker);

            childValueTracker.setValue(value[key]);
            // childValueTracker.path = tracker.path.move(key);

            const childField = childProcessor.field;
            if (childField instanceof SchemaConditionalField) {
                state.conditionals.push([childProcessor, childValueTracker]);
            }
            else if (!childProcessor.hasReferences()) {
                childProcessor.actualProcess(childValueTracker, state);
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
            const child = target._schema.get(key);
            if (!child) {
                return null;
            }
            target = child;
        }
        return target;
    }

}

export { SchemaProcessor };

