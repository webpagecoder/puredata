'use strict';

import { Path } from '../Path.ts';

export type NodeData = Record<string, unknown>;

class Node {

    children: Map<string, Node>;
    parent: Node;
    root: Node;
    path: Path;

    constructor() {
        this.children = new Map();
        this.parent = this.root = this;
        this.path = Path.create('/');
    }

    removeChild(key: string): void {
        this.children.delete(key);
    }

    setChild(key: string, child: Node): void {
        this.children.set(key, child);
        child.parent = this;
        child.root = this.root;
        child.path = this.path.move(key);
    }

    // getFormatted(formatter = new NodeFormatter()) {
    //     return formatter.visit(this);
    // }

    hasChildren(): boolean {
        return this.children.size > 0;
    }

    getNodeByPath(path: string | Path, _context?: unknown): Node | null {
        const resolvedPath = typeof path === 'string' ? Path.create(path) : path as Path;

        if (resolvedPath.isSelf) {
            return this;
        }
        let tracker: Node = this;
        if (resolvedPath.isAbsolute) {
            tracker = this.root;
        }
        else {
            tracker = this;
            for (let i = 0; i < resolvedPath.upCount; ++i) {
                if (!tracker.parent) {
                    break;
                }
                tracker = tracker.parent;
            }
        }

        for (const key of resolvedPath.keys) {
            const child = tracker.children.get(key);
            if (!child) {
                return null;
            }
            tracker = child;
        }
        return tracker;
    }
}


export { Node };