// @ts-nocheck
'use strict';

import Field from './Field.ts';

class EnumField extends Field {

    constructor(props = {}) {
        super(props);
        this.props.structure = props.structure || [];
        this.props.isArray = Array.isArray(props.structure);
    }

}

export default EnumField;