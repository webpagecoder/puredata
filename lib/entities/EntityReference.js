'use strict';

import Entity  from './Entity.js';

class EntityReference extends Entity {

    constructor(props = {}) {
        super(props);
        this.props.path = props.path;
        this.props.minDepth = props.minDepth;
        this.props.maxDepth = props.maxDepth;
    }

}

export default  EntityReference;