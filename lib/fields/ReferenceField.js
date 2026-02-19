'use strict';

import Field from './Field.js';

class ReferenceField extends Field {

    constructor(props = {}) {
        super(props);
        this.props.path = props.path;
        this.props.minDepth = props.minDepth;
        this.props.maxDepth = props.maxDepth;
    }

}

export default ReferenceField;