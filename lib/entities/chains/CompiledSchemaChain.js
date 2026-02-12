'use strict';


//todo: pathdelim and upchar make global chars...cant do it by object too much craziness

const GlobalConfig = require('../../GlobalConfig.js');
const ObjectChain = require('./ObjectChain.js');

const FlatSchema = require('../../FlatSchema.js');
const ObjectWrapper = require('../../ObjectWrapper.js');

const ValueNode = require('../../tracker/ValueNode.js');
// const ReferenceValueNode = require('../../tracker/ReferenceValueNode.js');

// const Meta = require('../Meta.js');
const Entity = require('../Entity.js');
const MetaCache = require('../../cache/MetaCache.js');

// const SchemaChainMeta = require('../meta/SchemaChainMeta.js');
// const PathReference = require('../reference/PathReference.js');
const ArrayChain = require('./ArrayChain.js');
const ObjectUtils = require('../../utils/ObjectUtils.js');
const StringUtils = require('../../utils/StringUtils.js');
const Path = require('../../path/Path.js');
const PubSub = require('../../pub-sub/PubSub.js');

const { COMPILE_REQUIRED } = require('../../Traits.js');

const SchemaConditionalEntity = require('../SchemaConditionalEntity.js');
const SchemaChain = require('./SchemaChain.js');
const CompiledMixin = require('../CompiledMixin.js');
const CompiledObjectChain = require('./CompiledObjectChain.js');


class CompiledSchemaChain extends CompiledObjectChain {

    constructor(props = {}) {
        const {
            entity,
            compilationMapper,
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

        const { schema = new Map() } = entity.props;

        const compiledSchema = new Map();
        this.props.schema = compiledSchema;
        for (let [key, childEntity] of schema) {
            const compiledChild = compilationMapper.createCompiledEntity(childEntity, {
                depth: depth + 1,
                path: path.move(key),
                parent: this,
                root: this.props.root,
            });
            if (!(compiledChild instanceof CompiledSchemaChain)) {
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


        for (let [key, childCompiledEntity] of schema) {
            const childPath = path.move(key);

            childCompiledEntity = childCompiledEntity.compile({
                parentResolvers: allResolvers,
            });

            schema.set(key, childCompiledEntity);

            if (childCompiledEntity.hasReferences()) {
                for (const { resolver, depth } of allResolvers) {

                    const adjustedRelativeSubPath = childPath.shiftKeys(depth).toRelative();

                    const subNode = resolver.getOrCreateNode(
                        childPath.string,
                        function ({ tracker, failOnFirstError, prependRootPath }) {
                            const activeValueNode = tracker.getNodeByPath(adjustedRelativeSubPath);
                            if (activeValueNode) {
                                childCompiledEntity.process(activeValueNode);
                            }
                            return true;
                        }
                    );

                    for (const reference of childCompiledEntity.getReferences()) {
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

        const { entity, referenceResolver } = this.props;

        if (!state.localRoot) {
            state.localRoot = this;
            state.conditionals = [];
        }


        const { processors: { renameKeysArgs, stripUnknownKeys }, schema, failOnFirstError } = entity.props;
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

        for (let [key, childCompiledEntity] of this.props.schema) {
            const childEntity = childCompiledEntity.props.entity;
            let childValueNode = tracker.createChild(key, childCompiledEntity);
            childValueNode.setValue(value[key]);
            // childValueNode.path = tracker.path.move(key);

            if (childEntity instanceof SchemaConditionalEntity) {
                state.conditionals.push([childCompiledEntity, childValueNode]);
            }
            else if (!childCompiledEntity.hasReferences()) {
                childCompiledEntity.process(childValueNode, state);
            }
        }

        if (state.localRoot === this) {
            referenceResolver.execute({ tracker });

            for (const [conditionalEntity, tracker] of state.conditionals) {
                conditionalEntity.process(tracker); // fresh state
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

module.exports = CompiledSchemaChain;

