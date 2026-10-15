'use strict';

import { Path } from "./Path.ts";
export const SYM_IS_NODE = Symbol('isNode');
export const NAMED_CHILDREN = Symbol('namedChildren');
export const INDEXED_CHILDREN = Symbol('indexedChildren');
export const SYM_PARENT = Symbol('parent');
export const SYM_SKIP_LEVEL = Symbol('skipLevel');

export type Constructor = new (...args: any[]) => any;

export type NodeMixinLike = {
    children: Record<string, unknown>;
    root: NodeMixinLike;
    addIndexedChild(value: unknown): void;
    addNamedChild: (key: string, value: unknown) => void;
    clearIndexedChildren(): void;
    clearNamedChildren(): void;
    overrideParent(parent: NodeMixinLike): void;
    resolvePath(path: Path): unknown;
};

export const NodeMixin = <TBase extends Constructor = Constructor>(BaseClass: TBase) => {

    return class extends BaseClass {
        public constructor(...args: any[]) {
            super(...args);
            Object.assign(this as any, {
                SYM_IS_NODE: true,
                NAMED_CHILDREN: {} as Record<string, unknown>,
                INDEXED_CHILDREN: [] as unknown[],
                SYM_PARENT: this,
            });
        }

        public resolvePath(path: Path): unknown {
            if (path.isSelf) {
                return this;
            }

            let node: this;

            // Determine starting point based on abs/relative positioning
            if (path.isAbsolute) {
                node = this.root;
            }
            else {
                node = this;
                let i = path.upCount;
                while (i > 0) {
                    node = (node as any)[SYM_PARENT];
                    --i;
                }
            }

            if (!node) {
                return null;
            }

            // Dive into path keys
            for (const key of path.keys) {
                const child = (node as any)[SYM_IS_NODE] && (node as any)[NAMED_CHILDREN][key];
                if (child === undefined) {
                    return null;
                }
                node = child;
            }
            return node;
        }

        public get namedChildren(): Record<string, unknown> {
            return (this as any)[NAMED_CHILDREN];
        }

        public get parent(): this {
            return (this as any)[SYM_PARENT];
        }

        public get root(): this {
            let node = this;
            while ((node as any)[SYM_PARENT] !== node) {
                node = (node as any)[SYM_PARENT];
            }
            return node;
        }

        public addIndexedChild(value: unknown) {
            if ((value as any)[SYM_IS_NODE]) {
                (value as any)[SYM_PARENT] = this;
            }
            (this as any)[INDEXED_CHILDREN].push(value);
        }

        public addNamedChild(key: string, value: unknown = undefined) {
            if ((value as any)[SYM_IS_NODE]) {
                (value as any)[SYM_PARENT] = this;
            }
            (this as any)[NAMED_CHILDREN][key] = value;
        }

        public clearIndexedChildren() {
            const children = (this as any)[INDEXED_CHILDREN];
            for (const child of children) {
                if (child[SYM_IS_NODE]) {
                    child[SYM_PARENT] = null;
                }
            }
            (this as any)[INDEXED_CHILDREN] = [];
        }

        public clearNamedChildren() {
            const children = (this as any)[NAMED_CHILDREN];
            for (const key of Object.keys(children)) {
                if (children[key][SYM_IS_NODE]) {
                    children[key][SYM_PARENT] = null;
                }
            }
            (this as any)[NAMED_CHILDREN] = {};
        }

    }
};

export function isNode(value: unknown): value is NodeMixinLike {
    return value != null && Object.prototype.hasOwnProperty.call(value, SYM_IS_NODE);
}
