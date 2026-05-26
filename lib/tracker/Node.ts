'use strict';

import { Path } from '../Path.ts';

class Node {

    protected _children: Record<string, this>;
    protected _parent: this | null;
    protected _root: this;
    protected _path: Path;

    constructor() {
        this._children = {};
        this._parent = this._root = this;
        this._path = Path.create('/');
    }

    public removeChild(key: string): void {
        delete this._children[key];
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

    public getNodeByPath(path: string | Path, _context?: unknown): this | null {
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
                if (!tracker._parent) {
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
}

export { Node };