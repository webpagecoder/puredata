'use strict';

import ValueNode  from './ValueNode.js';

class RecursiveValueNode extends ValueNode {
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
            if (parent instanceof RecursiveValueNode) {
                if (parent.compiledEntity === this.compiledEntity) {
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


export default  RecursiveValueNode;



