'use strict';

import { ArgumentCollection, ErrorCollection } from '../types.ts';

class ChainHandlerResult {

    value: unknown;
    pass: boolean;
    fail: boolean;
    errors: ErrorCollection;

    constructor(args: {
        value?: unknown;
        pass?: boolean;
        errorKey?: string;
        args?: ArgumentCollection;
    } = {}) {
        this.value = args.value;
        this.pass = args.pass || false;
        this.fail = !this.pass;
        this.errors = {}
        if (!this.pass) {
            if (args.errorKey) {
                this.addError(args.errorKey, args.args || {});
            }
        }
    }

    public addError(errorKey: string, args: ArgumentCollection): void {
        if (this.pass) {
            throw new Error('Errors cannot be added to a Result that passed');
        }
        this.errors[errorKey] = args;
    }

    public static pass(value: unknown): ChainHandlerResult {
        return new ChainHandlerResult({ value, pass: true });
    }

    public static fail(value: unknown, errorKey: string, args: ArgumentCollection = {}): ChainHandlerResult {
        return new ChainHandlerResult({ value, pass: false, errorKey, args });
    }

}

export { ChainHandlerResult };