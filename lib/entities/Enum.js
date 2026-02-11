'use strict';

const Entity = require("./Entity");

class Enum extends Entity {

    constructor(props = {}) {
        super(props);
        this.props.structure = props.structure || [];
        this.props.isArray = Array.isArray(props.structure);
    }


    get languageKey() {
        return 'enum';
    }

}

module.exports = Enum;