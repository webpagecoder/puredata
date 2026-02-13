'use strict';

import Utils  from '../_misc/Utils.js';

class FlatSchema {
    constructor(schema, utils = Utils) {
        this.schema = schema;
        this.utils = utils;
    }

    unflatten(separator) {
        return this.utils.unflatten(this.schema, { separator });
    }

}

export default  FlatSchema;


