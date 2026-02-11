'use strict';

const Path = require('../../path/Path.js');
const Entity = require('../Entity.js');

// const Meta = require('../meta/Meta.js');

class PathReference extends Entity {

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

    get languageKey() {
        return 'reference';
    }

    get path() {
        return this.props.path;
    }

    set path(pathStr) {
        return this.clone({ pathStr });
    }

}

module.exports = PathReference;
