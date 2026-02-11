'use strict';

const RecursiveValueNode = require("../tracker/RecursiveValueNode");
const ValueNode = require("../tracker/ValueNode");
const ObjectUtils = require("../utils/ObjectUtils");
const CompiledEntity = require("./CompiledEntity");
const CompiledPathReference = require("./reference/CompiledPathReference");
const PathReference = require("./reference/PathReference");

class CompiledEntityReference extends CompiledEntity {

    get valueNodeConstructor() {
        return RecursiveValueNode;
    }

    compile(context = {}) {
        const { compilationMapper, entity, parent, path, root } = this.props;
        const { path: referencePath } = entity.props;

        const compiledReference = parent.resolvePath(referencePath);

        if (!compiledReference) {
            throw new Error('At key ' + path + ' - unable to resolve referenced path: ' + referencePath);
        }
        if (compiledReference instanceof CompiledEntityReference) {
            throw new Error('At key ' + path + ' - cannot point to another reference: ' + referencePath);
        }

        //todo: fix this..no more delims
        const separator = path.chars.separator;
        const refPathStr = compiledReference.props.path.string;
        const thisPathStr = this.props.path.string;

        const isNest = refPathStr === separator || (thisPathStr + separator).startsWith(refPathStr + separator);

        let compiledEntity;

        if (!isNest) {
            compiledEntity = compilationMapper.createCompiledEntity({
                parent,
                path,
                root,
                entity: compiledReference.props.entity,
                isLocalRoot: true,
            });
            compiledEntity.compile(Object.assign({}, context));
        }
        else {
            compiledEntity = this;
        }

        return compiledEntity;
    }

    process(tracker, state) {
        let { 
            entity: { props: { minDepth = 0, maxDepth = 1, path } }, 
            parent
         } = this.props;

        minDepth = minDepth instanceof PathReference ? tracker.getByPath(minDepth) : minDepth;
        maxDepth = maxDepth instanceof PathReference ? tracker.getByPath(maxDepth) : maxDepth;

        let { value } = tracker;

        if (value === undefined && tracker.depth < minDepth) {
            tracker.nestRoot.addError('object/recursion/tooShallow', {});
            return tracker;
        }
        else if (value !== undefined && tracker.depth > maxDepth) {
            tracker.nestRoot.addError('object/recursion/tooDeep', {});
            return tracker;
        }

        if (!this.cachedReference) {
            this.cachedReference = parent.resolvePath(path);
        }

        this.cachedReference.process(tracker, state);

        return tracker;
    }

}

module.exports = CompiledEntityReference;