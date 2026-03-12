'use strict';

import { Path } from '../Path.ts';

export type NodeData = Record<string, unknown>;

class Node {

    children: Map<string, Node>;
    data: NodeData;
    parent: Node;
    root: Node;
    path: Path;

    constructor() {
        this.children = new Map();
        this.parent = this.root = this;
        this.path = Path.create('/');
        this.data = {};
    }

    removeChild(key: string): void {
        this.children.delete(key);
    }

    setChild(key: string, child: Node): void {
        this.children.set(key, child);
        child.parent = this;
        child.root = this.root;
    }

    createChild(key: string, data: NodeData = {}): Node {
        const child = new Node();
        child.data = data;
        child.path = this.path.move(key);
        this.setChild(key, child);
        return child;
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
        let tracker = this;
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

// class NodeFormatter {
//     visit(message) {
//         let str = `<span class="pd-message">`;
//         str += message.data.join(', ');
//         if (message.children.length) {
//             str += '\t<ul>\n';
//             for (const child of message.children) {
//                 str += '\t<li>' + this.visit(child) + '</li>\n';
//             }
//             str += '\t\n</ul>\n';
//         }
//         return str + '</span>\n';
//     }
// }

export { Node };