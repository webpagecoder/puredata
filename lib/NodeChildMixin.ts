'use strict';

/** A constructible class accepted as the base of a mixin. */
export type Constructor = new (...args: any[]) => any;

export const NodeChildMixin = <T extends Constructor = Constructor>(BaseClass: T) => {

    return class extends BaseClass {

        public parent: unknown;

        public constructor(...args: any[]) {
            super(...args);
            this.parent = this;
        }

    }

};
