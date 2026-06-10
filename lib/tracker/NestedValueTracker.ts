// 'use strict';

// import { Field } from '../fields/Field.ts';
// import { ErrorTree, ValueTracker } from './ValueTracker.ts';

// export type NestedErrorTree = ErrorTree & {
//     nestTracker?: NestedErrorTree;
//     Depth?: number;
// };

// class NestedValueTracker extends ValueTracker {
//     protected _nestDepth: number;
//     protected _nestParent: null | NestedValueTracker;
//     protected _nestRoot: NestedValueTracker;
//     protected _nestValueTracker: null | NestedValueTracker;

//     public constructor(field: Field, value?: unknown) {
//         super(field, value);
//         this._nestDepth = 0;
//         this._nestParent = null;
//         this._nestRoot = this;
//         this._nestValueTracker = null;
//     }

//     public get nestDepth() {
//         return this._nestDepth;
//     }

//     public get nestParent() {
//         return this._nestParent;
//     }

//     public get nestRoot() {
//         return this._nestRoot;
//     }

//     public get nestValueTracker() {
//         return this._nestValueTracker;
//     }

//     public override getValue() {
//         return this._nestValueTracker?.getValue();
//     }

//     public setValue(value: unknown = undefined): void {
//         return
//     }

//     public createNestedTracker(value?: unknown) {
//         const { _field, _nestDepth, _nestRoot } = this;
//         const nestTracker = new NestedValueTracker(_field, value);
//         nestTracker._nestDepth = _nestDepth + 1;
//         nestTracker._nestParent = this;
//         nestTracker._nestRoot = _nestRoot;
//         this._nestValueTracker = nestTracker;
//         return nestTracker;
//     }

//     public override getErrors(): NestedErrorTree {
//         const { _errorCollection, _children, _nestDepth, _nestValueTracker } = this;

//         const obj: NestedErrorTree = {
//             errors: _errorCollection,
//             children: {},
//             Depth: _nestDepth
//         };

//         for (const key of Object.keys(_children)) {
//             obj.children[key] = _children[key].getErrors();
//         }

//         if (_nestValueTracker) {
//             obj.nestTracker = _nestValueTracker.getErrors();
//         }

//         return obj;
//     }


// }


// export { NestedValueTracker };



