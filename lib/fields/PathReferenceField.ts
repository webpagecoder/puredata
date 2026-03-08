// @ts-nocheck
'use strict';

import Path from '../Path.ts';
import Field from './Field.ts';

// import Meta from '../meta/Meta.ts';

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
