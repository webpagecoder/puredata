'use strict';

import Entity  from '../Entity.js';

class StaticValue extends Entity {
    constructor(props = {}) {
        super(props);
        const { mutable = false, value } = props;
        this.props.mutable = mutable;
        this.props.value = value;
    }
}

export default  StaticValue;

