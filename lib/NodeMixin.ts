'use strict';

import { Path } from './Path.ts';

/** A constructible class accepted as the base of a mixin. */
export type Constructor = new (...args: any[]) => any;

const SYM_IS_NODE = Symbol('isNode');

/**
 * Adds parent and child relationships and path-based lookup to a class.
 *
 * @typeParam T Type of values stored as children.
 * @typeParam TBase Base class extended by the returned class.
 * @param BaseClass Base class to extend.
 * @returns A class that stores a tree of nodes.
 */
export const NodeMixin = <T = unknown, TBase extends Constructor = Constructor>(BaseClass: TBase) => {

    return class NodeMixinClass extends BaseClass {
        /** Parent node; a root node refers to itself. */
        public parent: NodeMixinClass;

        /** Child nodes and values indexed by key. */
        public children: Record<string, T | NodeMixinClass>;

        /** Initializes the parent link and an empty child collection. */
        public constructor(...args: any[]) {
            super(...args);
            this.parent = this;
            this.children = {};
            (this as any)[SYM_IS_NODE] = true;
        }

        /**
         * Adds or replaces a child at the given key.
         *
         * Node children are linked back to this parent.
         *
         * @param key Key under which to store the child.
         * @param value Child node or value to store.
         */
        public addChild(key: string, value: T) {
            if ((value as any)[SYM_IS_NODE]) {
                (value as NodeMixinClass).parent = this;
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
            if (child && (child as any)[SYM_IS_NODE]) {
                const childNode = child as unknown as NodeMixinClass;
                (child as unknown as NodeMixinClass).parent = childNode;
            }
            delete this.children[key];
        }

        /**
         * Resolves an absolute or relative path from this node.
         *
         * @param path Path string or parsed path to resolve.
         * @returns The resolved node or value, or `null` if the path cannot be resolved.
         */
        public resolvePath(path: Path | string): unknown {
            path = new Path(path);
            if (path.isSelf) {
                return this;
            }

            let node: NodeMixinClass;

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

            if (!node) {
                return null;
            }

            // Dive into path keys
            for (const key of path.keys) {
                const child = (node as any)[SYM_IS_NODE] && node.children[key];
                if (child === undefined) {
                    return null;
                }
                node = child;
            }
            return node;
        }

        /** Gets the root node of this tree. */
        public get root(): NodeMixinClass {
            let node: NodeMixinClass = this;
            do {
                node = node.parent;
            }
            while (node && (node as any)[SYM_IS_NODE] && node.parent !== node);
            return node;
        }
    }
};
