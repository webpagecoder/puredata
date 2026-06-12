'use strict';

import { Path } from '../Path.ts';

class Node {

    protected _children: Record<string, this>;
    protected _key: string;
    protected _parent: this;
    protected _root: this;
    protected _path: Path;

    public constructor() {
        this._children = {};
        this._key = '';
        this._parent = this;
        this._root = this;
        this._path = Path.create('/');
    }

    public cloneWithoutErrors(): this {
        const clone = new (this.constructor as new () => this)();
        clone._key = this._key;
        clone._parent = this._parent;
        clone._path = this._path;
        clone._root = this._root;
        for (const key of Object.keys(this._children)) {
            clone._children[key] = this._children[key].cloneWithoutErrors();
        }
        return clone;
    }

    public createChild(key: string): this {
        const child = new (this.constructor as new () => this)();
        this._children[key] = child;
        child._key = key;
        child._parent = this;
        child._root = this._root;
        child._path = this._path.move(key);
        return child;
    }

    public hasChildren(): boolean {
        return Object.keys(this._children).length > 0;
    }

    public resolvePath(path: string | Path): this | null {
        const resolvedPath = Path.create(path);

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

    public get key(): string {
        return this._key;
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