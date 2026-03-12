'use strict';

import { Field, FieldProps } from './Field.ts';

class EnumField extends Field {

    constructor(props: FieldProps = {}) {
        super(props);
        this.props.structure = props.structure || [];
        this.props.isArray = Array.isArray(props.structure);
    }

}

export { EnumField };