'use strict';

const Reference = require('../../Reference.js');

class ChainReference extends Reference {
    constructor(path, minNestDepth = 0, maxNestDepth = 10) {
        super(path);
        this.minNestDepth = minNestDepth;
        this.maxNestDepth = maxNestDepth;
    }

    clone() {
        return new ChainReference(
            this.path,
            this.minNestDepth,
            this.maxNestDepth
        );
    }
}

module.exports = ChainReference;
