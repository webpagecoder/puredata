'use strict';

import { ArgumentCollection, ErrorCollection } from '../types/types.ts';

class HandlerResult {

    value: unknown;
    pass: boolean;
    fail: boolean;
    errors: ErrorCollection;

    constructor(props: {
        value?: unknown;
        pass?: boolean;
        errorKey?: string;
        args?: ArgumentCollection;
    } = {}) {
        this.value = props.value;
        this.pass = props.pass ?? false;
        this.fail = !this.pass;
        this.errors = {}
        if (!this.pass) {
            if (props.errorKey) {
                this.addError(props.errorKey, props.args || {});
            }
        }
    }

    public addError(errorKey: string, args: ArgumentCollection): void {
        if (this.pass) {
            throw new Error('Errors cannot be added to a Result that passed');
        }
        this.errors[errorKey] = args;
    }

    public static pass(value: unknown): HandlerResult {
        return new HandlerResult({ value, pass: true });
    }

    public static fail(value: unknown, errorKey: string, args: ArgumentCollection = {}): HandlerResult {
        return new HandlerResult({ value, pass: false, errorKey, args });
    }

}

export { HandlerResult };