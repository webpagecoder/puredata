'use strict';

import { Constructor, SYM_IS_NODE, SYM_PARENT } from './shared.ts';

export const NodeMixin = <TBase extends Constructor = Constructor>(BaseClass: TBase) => {

    return class extends BaseClass {
        public constructor(...args: any[]) {
            super(...args);
            Object.assign(this as any, {
                [SYM_IS_NODE]: true,
                [SYM_PARENT]: this,
            });
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
    }
};

