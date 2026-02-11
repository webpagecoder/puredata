'use strict';

const Entity = require("./Entity");

class EntityReference extends Entity {

    constructor(props = {}) {
        super(props);
        this.props.path = props.path;
        this.props.minDepth = props.minDepth;
        this.props.maxDepth = props.maxDepth;
    }

}

module.exports = EntityReference;