'use strict';

class ObjectWrapper {
    constructor(value) {
        this.value = value;
    }

    static wrap(value) {
        return new this(value);
    }

    static unwrap(value) {
        return value instanceof ObjectWrapper ? value.value : value;
    }
}

export default  ObjectWrapper;


