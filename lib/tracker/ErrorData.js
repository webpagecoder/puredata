'use strict';

class ErrorData {
    constructor(key, args = {}, message = '') {
        this.key = key;
        this.args = args;
        this.message = message;
    }
}

module.exports = ErrorData;