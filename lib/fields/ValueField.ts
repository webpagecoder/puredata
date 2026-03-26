'use strict';

import { Field } from './Field.ts';

class ValueField extends Field {
    constructor(props = {}) {
        super(props);
        const { mutable = false, value } = props;
        this.props.mutable = mutable;
        this.props.value = value;
    }
}

export { ValueField };

