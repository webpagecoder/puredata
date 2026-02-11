'use strict';

const Mixin = (Base) => class extends Base {  

    constructor(entity) {
        super(Object.assign({}, entity.props));   
    }

};

module.exports = Mixin;