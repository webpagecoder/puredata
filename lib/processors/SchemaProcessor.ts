'use strict';

import { SchemaConditionalField } from '../fields/SchemaConditionalField.ts';
import { Path } from '../Path.ts';
import { PubSub } from '../pub-sub/PubSub.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ObjectProcessor } from './ObjectProcessor.ts';


class SchemaProcessor extends ObjectProcessor {

    constructor(props = {}) {
        const {
            field,
            processorMapper,
            depth = 0,
            path = Path.create('/'),
            parent,
            referenceResolver = new PubSub(),
            root
        } = props;

        super(props);

        this.props.depth = depth;
        this.props.path = path;
        this.props.parent = parent || this;
        this.props.referenceResolver = referenceResolver;
        this.props.root = root || this;

        const { schema = new Map() } = field.props;

        const compiledSchema = new Map();
        this.props.schema = compiledSchema;
        for (let [key, childField] of schema) {
            const compiledChild = processorMapper.createProcessor(childField, {
                depth: depth + 1,
                path: path.move(key),
                parent: this,
                root: this.props.root,
            });
            if (!(compiledChild instanceof SchemaProcessor)) {
                // Set proper path/parent/root for non-schema chains
                compiledChild.props.path = path.move(key);
                compiledChild.props.parent = this;
                compiledChild.props.root = this.props.root;
            }
            compiledSchema.set(key, compiledChild);
        }
    }



    compile(context = {}) {
        super.compile(context);

        const {
            depth,
            path,
            schema
        } = this.props;

        let {
            parentResolvers = [],

        } = context;

        const allResolvers = [
            {
                resolver: this.props.referenceResolver,
                depth
            },
            ...parentResolvers
        ];


        for (let [key, childProcessor] of schema) {
            const childPath = path.move(key);

            childProcessor = childProcessor.compile({
                parentResolvers: allResolvers,
            });

            schema.set(key, childProcessor);

            if (childProcessor.hasReferences()) {
                for (const { resolver, depth } of allResolvers) {

                    const adjustedRelativeSubPath = childPath.shiftKeys(depth).toRelative();

                    const subNode = resolver.getOrCreateNode(
                        childPath.string,
                        function ({ tracker, failOnFirstError, prependRootPath }) {
                            const activeValueTracker = tracker.getNodeByPath(adjustedRelativeSubPath);
                            if (activeValueTracker) {
                                childProcessor.process(activeValueTracker);
                            }
                            return true;
                        }
                    );

                    for (const reference of childProcessor.getReferences()) {
                        const publisherPath = childPath.parent().move(reference.path);
                        const pubNode = resolver.getOrCreateNode(publisherPath.string);
                        resolver.linkNodes(pubNode, subNode);
                    }
                }
            }


        }

        return this;
    }

    _process(tracker, state) {

        this.preProcess(tracker);
        if (tracker.hasErrors()) {
            return tracker;
        }

        const { field, referenceResolver } = this.props;

        if (!state.localRoot) {
            state.localRoot = this;
            state.conditionals = [];
        }


        const { chainHandler: { renameKeysArgs, stripUnknownKeys }, schema, failOnFirstError } = field.props;
        const { value } = tracker;


        // Do any required key renaming
        if (renameKeysArgs) {
            const { from, to, options = {} } = renameKeysArgs;
            tracker.setValue(renameKeys(value, from, to, options).value);
        }

        // Strip unknown keys if needed
        const schemaKeys = Array.from(schema.keys());
        if (stripUnknownKeys) {
            tracker.setValue(stripUnknownKeys(tracker.getValue(), schemaKeys).value);
        }
        else {
            tracker.untrackedEntries = tracker.getValue();
        }

        this.executePipeline(tracker);
        //todo: check if error and exit here?

        for (let [key, childProcessor] of this.props.schema) {
            
            let childValueTracker = new ValueTracker(undefined, childProcessor);
            tracker.setChild(key, childValueTracker);

            childValueTracker.setValue(value[key]);
            // childValueTracker.path = tracker.path.move(key);

            const childField = childProcessor.props.field;
            if (childField instanceof SchemaConditionalField) {
                state.conditionals.push([childProcessor, childValueTracker]);
            }
            else if (!childProcessor.hasReferences()) {
                childProcessor.process(childValueTracker, state);
            }
        }

        if (state.localRoot === this) {
            referenceResolver.execute({ tracker });

            for (const [conditionalField, tracker] of state.conditionals) {
                conditionalField.process(tracker); // fresh state
            }
            // console.log(this.state.conditionals);
            state.conditionals = [];

        }

        return tracker;
    }

    parent() {
        return this.parent;
    }

    resolvePath(path) {
        if (typeof path === 'string') {
            path = Path.create(path);
        }
        if (path.isSelf) {
            return this;
        }

        let pointer = this;
        if (path.isAbsolute) {
            pointer = this.props.root;
        }
        else {
            for (let i = 0; i < path.upCount; ++i) {
                pointer = pointer.props.parent;
            }
        }

        for (const key of path.keys) {
            const child = pointer.props.schema.get(key);
            if (!child) {
                return null;
            }
            pointer = child;
        }
        return pointer;
    }

}

export { SchemaProcessor };

