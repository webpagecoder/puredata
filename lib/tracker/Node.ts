'use strict';

import { Path } from '../Path.ts';

class Node {

    protected _children: Record<string, this>;
    protected _parent: this | null;
    protected _root: this;
    protected _path: Path;

    // public constructor(path: Path = new Path('/')) {
    //     this._children = {};
    //     this._parent = null;
    //     this._root = this;
    //     this._path = path;
    // }

    // public cloneWithoutErrors(): this {
    //     const clone = new (this.constructor as new () => this)();
    //     clone._parent = this._parent;
    //     clone._path = this._path;
    //     clone._root = this._root;
    //     for (const key of Object.keys(this._children)) {
    //         clone._children[key] = this._children[key].cloneWithoutErrors();
    //     }
    //     return clone;
    // }

    // public createChild(key: string): this {
    //     const child = new (this.constructor as new () => this)();
    //     this._children[key] = child;
    //     child._parent = this;
    //     child._root = this._root;
    //     child._path = this._path.addSegment(key);
    //     return child;
    // }

    // public hasChildren(): boolean {
    //     return Object.keys(this._children).length > 0;
    // }

    // public resolvePath(path: Path): this | null {
    //     if (path.isSelf) {
    //         return this;
    //     }

    //     let tracker: this | null = this;

    //     // Determine starting point based on abs/relative positioning
    //     if (path.isAbsolute) {
    //         tracker = this._root;
    //     }
    //     else {
    //         let i = path.upCount;
    //         while (tracker._parent && i > 0) {
    //             tracker = tracker._parent;
    //             --i;
    //         }
    //         if (!tracker) {
    //             return null;
    //         }
    //     }

    //     // Dive into path keys
    //     for (const key of path.keys) {
    //         const child: this | undefined = tracker._children[key];
    //         if (!child) {
    //             return null;
    //         }
    //         tracker = child;
    //     }
    //     return tracker;
    // }

    // public get parent(): this | null {
    //     return this._parent;
    // }

    // public get path(): Path {
    //     return this._path;
    // }

    // public get root(): this {
    //     return this._root;
    // }

}

export { Node };