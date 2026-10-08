'use strict';

import { Path } from "./Path.ts";

type Constructor = new (...args: any[]) => any;

function PathTreeNodeMixin<TBase extends Constructor = Constructor>(BaseClass: TBase) {
    const SYM_IS_NODE = Symbol('isNode');
    const SYM_CHILDREN = Symbol('children');
    const SYM_PARENT = Symbol('parent');

    return class extends BaseClass {

        public constructor(...args: any[]) {
            super(...args);
            (this as any)[SYM_IS_NODE] = true;
            (this as any)[SYM_CHILDREN] = {} as Record<string, unknown>;
            (this as any)[SYM_PARENT] = this;
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
                const child = (node as any)[SYM_IS_NODE] && (node as any)[SYM_CHILDREN][key];
                if (child === undefined) {
                    return null;
                }
                node = child;
            }
            return node;
        }

        public get children(): Record<string, unknown> {
            return (this as any)[SYM_CHILDREN];
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

        public addChild(key: string, value: unknown = undefined) {
            if ((value as any)[SYM_IS_NODE]) {
                (value as any)[SYM_PARENT] = this;
            }
            (this as any)[SYM_CHILDREN][key] = value;
        }

        public clearChildren() {
            const children = (this as any)[SYM_CHILDREN];
            for(const key of Object.keys(children)) {
                if(children[key][SYM_IS_NODE]) {
                    children[key][SYM_PARENT] = null;
                }
            }
            (this as any)[SYM_CHILDREN] = {};
        }

        public setParent(parent: this) {
            (this as any)[SYM_PARENT] = parent;
        }

    }
};

export { PathTreeNodeMixin };