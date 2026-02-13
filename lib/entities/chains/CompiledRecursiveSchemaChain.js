'use strict';

import ObjectUtils  from '../../utils/ObjectUtils.js';
import PathReference  from '../reference/PathReference.js';
import CompiledSchemaChain  from './CompiledSchemaChain.js';


class CompiledRecursiveSchemaChain {

    constructor(reference) {
        this.reference = reference;
    }

    compile() {
        // No compiling, this would be infinitely recursive
    }

    process(tracker, state) {

        let { minDepth = 0, maxDepth = 1, referencePath } = this.reference;

        if(!this.cachedReference ) {
            this.cachedReference = state.parent.resolvePath(referencePath);
        }

        minDepth = minDepth instanceof PathReference ? tracker.getByPath(minDepth) : minDepth;
        maxDepth = maxDepth instanceof PathReference ? tracker.getByPath(maxDepth) : maxDepth;

        const localRootValueNode = tracker;
        let currentValueNode = tracker;

        // let parentValueNode = tracker;
        let { value } = localRootValueNode;

        currentValueNode.depth = 1;

        while(true) {
            if (value === undefined) {
                if (currentValueNode.depth < minDepth) {
                    localRootValueNode.addError('object/recursion/tooShallow', {});
                }
                return localRootValueNode;
            }

            if (!ObjectUtils.isPlainObject(value)) {
                currentValueNode.addError('object/base');
                return currentValueNode;
            }

            ++currentValueNode.depth;
            if (currentValueNode.depth > maxDepth) {
                localRootValueNode.addError('object/recursion/tooDeep', {});
                return tracker;
            }

            this.cachedReference.process(currentValueNode); //todo: send state?

            // const nextNestedValue = currentValueNode.getNodeByPath(path.toRelative());
            console.log()

        }

        
    }

}

export default  CompiledRecursiveSchemaChain;










// 'use strict';

// import ObjectUtils  from '../../utils/ObjectUtils.js';
// import PathReference  from '../reference/PathReference.js';
// import CompiledSchemaChain  from './CompiledSchemaChain.js';


// class CompiledRecursiveSchemaChain {

//     constructor(props = {}) {
//         this.props = props;
//         this.cachedReference = null;
//     }

//     compile() {
//         // No compiling, this would be infinitely recursive
//     }

//     process(tracker, state) {

//         let { compiledSchema, minDepth = 0, maxDepth = 1, referencePath } = this.props;

//         if(!this.cachedReference ) {
//             this.cachedReference = state.parent.resolvePath(referencePath);
//         }

//         minDepth = minDepth instanceof PathReference ? tracker.getByPath(minDepth) : minDepth;
//         maxDepth = maxDepth instanceof PathReference ? tracker.getByPath(maxDepth) : maxDepth;

//         const localRootValueNode = tracker;
//         let currentValueNode = tracker;

//         // let parentValueNode = tracker;
//         let { value } = localRootValueNode;

//         if (!state.nestDepth) {
//             state.nestDepth = 1;
//         }

//         if(!state.nestValueNode) {
//             state.nestValueNode = new Map();
//         }
//         if(!state.nestValueNode.has(this)) {
//             state.nestValueNode.set(this, 1);
//         }

//         const depth = state.nestValueNode.get(this);

//         // do {
//             if (value === undefined) {
//                 if (currentValueNode.depth < minDepth) {
//                     currentValueNode.addError('object/recursion/tooShallow', {});
//                 }
//                 return currentValueNode;
//             }

//             if (!ObjectUtils.isPlainObject(value)) {
//                 currentValueNode.addError('object.base');
//                 return currentValueNode;
//             }

//             ++currentValueNode.depth;
//             if (currentValueNode.depth > maxDepth) {
//                 localRootValueNode.addError('object/recursion/tooDeep', {});
//                 return tracker;
//             }

//             this.cachedReference.process(currentValueNode, state); //todo: send state?

//             // const nextNestedValue = currentValueNode.getNodeByPath(path.toRelative());
//             console.log()

//         // } while(true);

        
//     }

// }

// export default  CompiledRecursiveSchemaChain;

