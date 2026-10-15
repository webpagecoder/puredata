'use strict';

import { Path } from '../Path.ts';
import { NodeMixin } from './NodeMixin.ts';
import { Constructor, SYM_NAMED_CHILDREN, SYM_IS_NODE, SYM_PARENT } from './shared.ts';

export const NamedNodeMixin = <TBase extends Constructor = Constructor>(BaseClass: TBase) => {

    return class extends NodeMixin(BaseClass) {
        public constructor(...args: any[]) {
            super(...args);
            (this as any)[SYM_NAMED_CHILDREN] = {};
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
                const child = (node as any)[SYM_IS_NODE] && (node as any)[SYM_NAMED_CHILDREN][key];
                if (child === undefined) {
                    return null;
                }
                node = child;
            }
            return node;
        }

        public get namedChildren(): Record<string, unknown> {
            return (this as any)[SYM_NAMED_CHILDREN];
        }

        public addNamedChild(key: string, value: unknown = undefined) {
            if ((value as any)[SYM_IS_NODE]) {
                (value as any)[SYM_PARENT] = this;
            }
            (this as any)[SYM_NAMED_CHILDREN][key] = value;
        }

        public clearNamedChildren() {
            const children = (this as any)[SYM_NAMED_CHILDREN];
            for (const key of Object.keys(children)) {
                if (children[key][SYM_IS_NODE]) {
                    children[key][SYM_PARENT] = null;
                }
            }
            (this as any)[SYM_NAMED_CHILDREN] = {};
        }

    }
};

