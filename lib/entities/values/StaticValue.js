'use strict';

const Entity = require("../Entity");

class StaticValue extends Entity {
    constructor(props = {}) {
        super(props);
        const { mutable = false, value } = props;
        this.props.mutable = mutable;
        this.props.value = value;
    }
}

module.exports = StaticValue;

