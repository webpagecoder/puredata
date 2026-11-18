'use strict';

import { Path } from './Path.ts';

const SYM_NODE_TREE = Symbol('NodeTree');

/**
 * Adds parent and child relationships and path-based lookup to a class.
 *
 * @typeParam T Type of values stored as children.
 * @typeParam TBase Base class extended by the returned class.
 * @param BaseClass Base class to extend.
 * @returns A class that stores a tree of nodes.
 */
class NodeTree<T = unknown> {
    /** Parent node; a root node refers to itself. */
    public parent: NodeTree<T>;

    /** Child nodes and values indexed by key. */
    public children: Record<string, T | NodeTree<T>>;

    public constructor() {
        this.parent = this;
        this.children = {};
        (this as any)[SYM_NODE_TREE] = true;
    }

    /**
     * Adds or replaces a child at the given key.
     *
     * Node children are linked back to this parent.
     *
     * @param key Key under which to store the child.
     * @param value Child node or value to store.
     */
    public setChild(key: string, value: NodeTree<T> | T): void {
        if (value instanceof NodeTree) {
            value.parent = this;
        }
        this.children[key] = value;
    }

    /**
     * Removes a child and resets its parent link when it is a node.
     *
     * @param key Key of the child to remove.
     */
    public removeChild(key: string) {
        const child = this.children[key];
        if (child instanceof NodeTree) {
            child.parent = child;
        }
        delete this.children[key];
    }

    /**
     * Resolves an absolute or relative path from this node.
     *
     * @param path Path string or parsed path to resolve.
     * @returns The resolved node or value, or `null` if the path cannot be resolved.
     */
    public resolvePath(path: Path | string): NodeTree<T> | T | null {
        path = new Path(path);
        if (path.isSelf) {
            return this;
        }

        let node: NodeTree<T> | T;

        // Determine starting point based on abs/relative positioning
        if (path.isAbsolute) {
            node = this.root;
        }
        else {
            node = this;
            let i = path.upCount;
            while (i > 0) {
                node = node.parent;
                --i;
            }
        }

        const { keys } = path;
        if (!node || keys.length === 0) {
            return null;
        }

        // Dive into path keys
        for (let i = 0, max = keys.length - 1; i < max; ++i) {
            node = (node as NodeTree<T>).children[keys[i]];
            if (!node || !(node as any)[SYM_NODE_TREE]) {
                return null;
            }
        }

        return (node as NodeTree<T>).children[keys[keys.length - 1]] || null;
    }

    /** Gets the root node of this tree. */
    public get root(): NodeTree<T> {
        let node: NodeTree<T> = this;
        do {
            node = node.parent;
        }
        while (node && node.parent !== node);
        return node;
    }

    public get isANodeTree(): boolean {
        return (this as any)[SYM_NODE_TREE] === true;
    }
}

export { NodeTree };