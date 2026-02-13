'use strict';

class Result {

    constructor({
        value,
        pass = false,
        errorKey = '',
        args = [],
    } = {}) {
        this.value = value;
        this.pass = pass;
        this.fail = !pass;
        if (!pass) {
            this._errors = new Map();
            if (errorKey) {
                this.addError(errorKey, args);
            }
        }
    }

    addError(errorKey, args) {
        if(this.pass) {
            throw new Error('Errors cannot be added to a Result that passed');
        }
        this._errors.set(errorKey, args);
    }

    static pass(value) {
        return new Result({ value, pass: true });
    }

    static fail(value, errorKey, args = {}) {
        return new Result({ value, pass: false, errorKey, args });
    }

    *yieldErrors() {
        for (const [key, args] of this._errors) {
            yield { key, args };
        }
    }

    // Getters

    get errors() {
        return this.yieldErrors();
    }

}

export default  Result;