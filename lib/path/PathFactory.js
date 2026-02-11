'use strict';

const Path = require('./Path.js');

class PathFactory {

    constructor(delim = '/', up = '..', self = '.') {
        this.chars = {
            delim,
            up,
            self
        };
    }

    create(pathStr) {
        return Path.create(pathStr, this.chars);
    }

}

module.exports = PathFactory;