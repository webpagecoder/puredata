'use strict';

import { Path } from '../Path.ts';
import { Constructor, SYM_IS_NODE, SYM_NAMED_CHILDREN, SYM_PARENT } from './shared.ts';

export const NodeMixin = <TBase extends Constructor = Constructor>(BaseClass: TBase) => {

    return class extends BaseClass {
        public constructor(...args: any[]) {
            super(...args);
            Object.assign(this as any, {
                [SYM_IS_NODE]: true,
                [SYM_PARENT]: this,
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
                const child = (node as any)[SYM_IS_NODE] && (node as any)[SYM_NAMED_CHILDREN][key];
                if (child === undefined) {
                    return null;
                }
                node = child;
            }
            return node;
        }

        public pointToParent(parent: this): void {
            (this as any)[SYM_PARENT] = parent;
        }

        public get parent(): this {
            return (this as any)[SYM_PARENT];
        }

        public get root(): this {
            let node = this;
            while (node && (node as any)[SYM_PARENT] !== node) {
                node = (node as any)[SYM_PARENT];
            }
            return node;
        }
    }
};

