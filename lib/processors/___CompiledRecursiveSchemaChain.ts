
// 'use strict';

// import { Utils } from '../../utils/Utils.ts';
// import { PathReferenceField } from '../reference/PathReferenceField.ts';


// class RecursiveSchemaProcessor {

//     constructor(reference) {
//         this.reference = reference;
//     }

//     compile() {
//         // No compiling, this would be infinitely recursive
//     }

//     process(tracker, state) {

//         let { minDepth = 0, maxDepth = 1, referencePath } = this.reference;

//         if(!this.cachedReference ) {
//             this.cachedReference = state.parent.resolvePath(referencePath);
//         }

//         minDepth = minDepth instanceof PathReferenceField ? tracker.getByPath(minDepth) : minDepth;
//         maxDepth = maxDepth instanceof PathReferenceField ? tracker.getByPath(maxDepth) : maxDepth;

//         const localRootValueTracker = tracker;
//         let currentValueTracker = tracker;

//         // let parentValueTracker = tracker;
//         let { value } = localRootValueTracker;

//         currentValueTracker.depth = 1;

//         while(true) {
//             if (value === undefined) {
//                 if (currentValueTracker.depth < minDepth) {
//                     localRootValueTracker.addError('object/recursion/tooShallow', {});
//                 }
//                 return localRootValueTracker;
//             }

//             if (!Utils.isPlainObject(value)) {
//                 currentValueTracker.addError('object/base');
//                 return currentValueTracker;
//             }

//             ++currentValueTracker.depth;
//             if (currentValueTracker.depth > maxDepth) {
//                 localRootValueTracker.addError('object/recursion/tooDeep', {});
//                 return tracker;
//             }

//             this.cachedReference.process(currentValueTracker); //todo: send state?

//             // const nextNestedValue = currentValueTracker.getNodeByPath(path.toRelative());
//             console.log()

//         }

        
//     }

// }

// export { RecursiveSchemaProcessor };










// // 'use strict';

// // import { Utils } from '../../utils/Utils.ts';
// // import { PathReferenceField } from '../reference/PathReferenceField.ts';
// // import { SchemaProcessor } from './SchemaProcessor.ts';


// // class RecursiveSchemaProcessor {

// //     constructor(props = {}) {
// //         this.props = props;
// //         this.cachedReference = null;
// //     }

// //     compile() {
// //         // No compiling, this would be infinitely recursive
// //     }

// //     process(tracker, state) {

// //         let { compiledSchema, minDepth = 0, maxDepth = 1, referencePath } = this.props;

// //         if(!this.cachedReference ) {
// //             this.cachedReference = state.parent.resolvePath(referencePath);
// //         }

// //         minDepth = minDepth instanceof PathReferenceField ? tracker.getByPath(minDepth) : minDepth;
// //         maxDepth = maxDepth instanceof PathReferenceField ? tracker.getByPath(maxDepth) : maxDepth;

// //         const localRootValueTracker = tracker;
// //         let currentValueTracker = tracker;

// //         // let parentValueTracker = tracker;
// //         let { value } = localRootValueTracker;

// //         if (!state.nestDepth) {
// //             state.nestDepth = 1;
// //         }

// //         if(!state.nestValueTracker) {
// //             state.nestValueTracker = new Map();
// //         }
// //         if(!state.nestValueTracker.has(this)) {
// //             state.nestValueTracker.set(this, 1);
// //         }

// //         const depth = state.nestValueTracker.get(this);

// //         // do {
// //             if (value === undefined) {
// //                 if (currentValueTracker.depth < minDepth) {
// //                     currentValueTracker.addError('object/recursion/tooShallow', {});
// //                 }
// //                 return currentValueTracker;
// //             }

// //             if (!Utils.isPlainObject(value)) {
// //                 currentValueTracker.addError('object.base');
// //                 return currentValueTracker;
// //             }

// //             ++currentValueTracker.depth;
// //             if (currentValueTracker.depth > maxDepth) {
// //                 localRootValueTracker.addError('object/recursion/tooDeep', {});
// //                 return tracker;
// //             }

// //             this.cachedReference.process(currentValueTracker, state); //todo: send state?

// //             // const nextNestedValue = currentValueTracker.getNodeByPath(path.toRelative());
// //             console.log()

// //         // } while(true);

        
// //     }

// // }

// // export { RecursiveSchemaProcessor };

