'use strict';

import Path from '../Path.js';
import Field from './Field.js';

// import Meta from '../meta/Meta.js';

class PathReferenceField extends Field {

    constructor(props = {}) {
        super(props);

        const {
            pathStr,
            defaultOrCallback,
        } = props;

        const isCallback = typeof defaultOrCallback === 'function';

        Object.assign(this.props, {
            path: Path.create(pathStr),
            callback: isCallback ? defaultOrCallback : undefined,
            // defaultValue: !isCallback ? defaultOrCallback : undefined,
        });
    }

    get path() {
        return this.props.path;
    }

    set path(pathStr) {
        return this.clone({ pathStr });
    }

}

export default PathReferenceField;
