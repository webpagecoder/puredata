'use strict';

import { Path } from "./Path.ts";

type Constructor = new (...args: any[]) => any;

function PathTreeNodeMixin<CType = unknown, TBase extends Constructor = Constructor>(BaseClass: TBase) {
    const SYM_IS_NODE = Symbol('isNode');
    const SYM_CHILDREN = Symbol('children');
    const SYM_PARENT = Symbol('parent');

    return class extends BaseClass {

        constructor(...args: any[]) {
            super(...args);
            (this as any)[SYM_IS_NODE] = true;
            (this as any)[SYM_CHILDREN] = {} as Record<string, CType>;
            (this as any)[SYM_PARENT] = this;
        }

        public resolvePath(path: Path): CType | null {
            if (path.isSelf) {
                return this as unknown as CType;
            }

            let node: CType;

            // Determine starting point based on abs/relative positioning
            if (path.isAbsolute) {
                node = this.root;
            }
            else {
                node = this as unknown as CType;
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
                const child = (node as any)[SYM_CHILDREN][key];
                if (!(child && (child as any)[SYM_IS_NODE])) {
                    return null;
                }
                node = child;
            }
            return node as CType;
        }

        public get children(): Record<string, CType> {
            return (this as any)[SYM_CHILDREN];
        }

        public get parent(): CType {
            return (this as any)[SYM_PARENT];
        }

        public get root(): CType {
            let node = this;
            while ((node as any)[SYM_PARENT] !== node) {
                node = (node as any)[SYM_PARENT];
            }
            return node as unknown as CType;
        }

        public addChild(key: string, value: unknown) {
            if (value && (value as any)[SYM_IS_NODE]) {
                (value as any)[SYM_PARENT] = this;
            }
            (this as any)[SYM_CHILDREN][key] = value;
        }

        public setChildren(children: Record<string, CType>) {
            (this as any)[SYM_CHILDREN] = children;
        }

    }
};

export { PathTreeNodeMixin };