'use strict';

import { ValueTracker } from './ValueTracker.ts';

class RecursiveValueTracker extends ValueTracker {
    constructor(value, props) {
        super(value, props);
        this.depth = 1;
        this.nestRoot = this;
        this.nestParent = null;
        this.nestChild = null;

        const { root } = this;

        if (this === root) {
            return this;
        }

        // Wiring up parent/child/root relationships
        let { parent } = this;

        do {
            if (parent instanceof RecursiveValueTracker) {
                if (parent._processor === this._processor) {
                    this.depth = parent.depth + 1;
                    this.nestParent = parent;
                    this.nestRoot = parent.nestRoot;
                    parent.nestChild = this;
                }
                break;
            }
            parent = parent.parent;
        } while (parent !== root);

    }

}


export { RecursiveValueTracker };



