// @ts-nocheck
'use strict';

import RecursiveValueNode from '../tracker/RecursiveValueNode.ts';
import Processor from './Processor.ts';
import PathReferenceField from '../fields/PathReferenceField.ts';

class ReferenceProcessor extends Processor {

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
        if (compiledReference instanceof ReferenceProcessor) {
            throw new Error('At key ' + path + ' - cannot point to another reference: ' + referencePath);
        }

        //todo: fix this..no more delims
        const separator = path.chars.separator;
        const refPathStr = compiledReference.props.path.string;
        const thisPathStr = this.props.path.string;

        const isNest = refPathStr === separator || (thisPathStr + separator).startsWith(refPathStr + separator);

        let compiledField;

        if (!isNest) {
            compiledField = compilationMapper.createProcessor({
                parent,
                path,
                root,
                entity: compiledReference.props.entity,
                isLocalRoot: true,
            });
            compiledField.compile(Object.assign({}, context));
        }
        else {
            compiledField = this;
        }

        return compiledField;
    }

    process(tracker, state) {
        let { 
            entity: { props: { minDepth = 0, maxDepth = 1, path } }, 
            parent
         } = this.props;

        minDepth = minDepth instanceof PathReferenceField ? tracker.getByPath(minDepth) : minDepth;
        maxDepth = maxDepth instanceof PathReferenceField ? tracker.getByPath(maxDepth) : maxDepth;

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

export default ReferenceProcessor;