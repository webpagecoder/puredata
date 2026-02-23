'use strict';

import Field from './Field.js';

class ValueField extends Field {
    constructor(props = {}) {
        super(props);
        const { mutable = false, value } = props;
        this.props.mutable = mutable;
        this.props.value = value;
    }
}

export default ValueField;

