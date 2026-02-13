'use strict';
import AdvancedPath  from './path/AdvancedPath.js';

class Reference {
    constructor(path, ...args) {
        this.path = AdvancedPath.create(path);
        this.args = args;
    }
}

export default  Reference;
