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

        public get namedChildren(): Record<string, unknown> {
            return (this as any)[SYM_NAMED_CHILDREN];
        }

        public addNamedChild(key: string, value: unknown = undefined) {
            if ((value as any)[SYM_IS_NODE]) {
                (value as any)[SYM_PARENT] = this;
            }
            (this as any)[SYM_NAMED_CHILDREN][key] = value;
        }

        public removeNamedChild(key: string) {
            const child = (this as any)[SYM_NAMED_CHILDREN][key];
            if (child && (child as any)[SYM_IS_NODE]) {
                (child as any)[SYM_PARENT] = null;
            }
            delete (this as any)[SYM_NAMED_CHILDREN][key];
        }

    }
};

