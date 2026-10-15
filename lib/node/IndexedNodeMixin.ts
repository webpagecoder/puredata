'use strict';

import { NodeMixin } from './NodeMixin.ts';
import { Constructor, SYM_INDEXED_CHILDREN, SYM_IS_NODE, SYM_PARENT } from './shared.ts';

export const IndexedNodeMixin = <TBase extends Constructor = Constructor>(BaseClass: TBase) => {

    return class extends NodeMixin(BaseClass) {
        public constructor(...args: any[]) {
            super(...args);
            (this as any)[SYM_INDEXED_CHILDREN] = [];
        }

        public get indexedChildren(): Record<string, unknown> {
            return (this as any)[SYM_INDEXED_CHILDREN];
        }

        public addIndexedChild(value: unknown) {
            if ((value as any)[SYM_IS_NODE]) {
                (value as any)[SYM_PARENT] = this;
            }
            (this as any)[SYM_INDEXED_CHILDREN].push(value);
        }

        public clearIndexedChildren() {
            const children = (this as any)[SYM_INDEXED_CHILDREN];
            for (const child of children) {
                if (child[SYM_IS_NODE]) {
                    child[SYM_PARENT] = null;
                }
            }
            (this as any)[SYM_INDEXED_CHILDREN] = [];
        }

    }
};

