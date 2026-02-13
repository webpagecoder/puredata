'use strict';

import Reference  from '../../Reference.js';

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

export default  ChainReference;
