'use strict';

import { Path } from '../Path.ts';

class Node {

    protected _children: Record<string, this>;
    protected _parent: this;
    protected _root: this;
    protected _path: Path;

    public constructor() {
        this._children = {};
        this._parent = this;
        this._root = this;
        this._path = Path.create('/');
    }

    public clone(): this {
        const clone = new (this.constructor as new () => this)();
        clone._parent = this._parent;
        clone._path = this._path;
        clone._root = this._root;
        for (const key of Object.keys(this._children)) {
            clone._children[key] = this._children[key].clone();
        }
        return clone;
    }

    public setChild(key: string, child: this): void {
        this._children[key] = child;
        child._parent = this;
        child._root = this._root;
        child._path = this._path.move(key);
    }

    public hasChildren(): boolean {
        return Object.keys(this._children).length > 0;
    }

    public getNodeByPath(path: string | Path): this | null {
        const resolvedPath = typeof path === 'string' ? Path.create(path) : path as Path;

        if (resolvedPath.isSelf) {
            return this;
        }
        let tracker: this = this;
        if (resolvedPath.isAbsolute) {
            tracker = this._root;
        }
        else {
            tracker = this;
            for (let i = 0; i < resolvedPath.upCount; ++i) {
                if (tracker._parent === tracker) {
                    break;
                }
                tracker = tracker._parent;
            }
        }

        for (const key of resolvedPath.keys) {
            const child = tracker._children[key];
            if (!child) {
                return null;
            }
            tracker = child;
        }
        return tracker;
    }

    public get parent(): this {
        return this._parent;
    }

    public get path(): Path {
        return this._path;
    }

    public get root(): this {
        return this._root;
    }

}

export { Node };