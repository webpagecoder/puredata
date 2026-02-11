'use strict';
const AdvancedPath = require('./path/AdvancedPath');

class Reference {
    constructor(path, ...args) {
        this.path = AdvancedPath.create(path);
        this.args = args;
    }
}

module.exports = Reference;
