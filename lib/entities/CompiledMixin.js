'use strict';

const CompiledMixin = (Base) => class extends Base {  

    constructor(entity) {
        super(Object.assign({}, entity.props));   
    }

};

module.exports = CompiledMixin;