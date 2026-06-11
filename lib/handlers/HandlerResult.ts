'use strict';

import { ArgumentCollection, ErrorCollection } from '../types.ts';

class HandlerResult {

    value: unknown;
    pass: boolean;
    fail: boolean;
    errors: ErrorCollection;

    constructor(args: {
        value?: unknown;
        pass?: boolean;
        errorSlug?: string;
        args?: ArgumentCollection;
    } = {}) {
        this.value = args.value;
        this.pass = args.pass || false;
        this.fail = !this.pass;
        this.errors = {}
        if (!this.pass) {
            if (args.errorSlug) {
                this.addError(args.errorSlug, args.args || {});
            }
        }
    }

    public addError(errorSlug: string, args: ArgumentCollection): void {
        if (this.pass) {
            throw new Error('Errors cannot be added to a Result that passed');
        }
        this.errors[errorSlug] = args;
    }

    public static pass(value: unknown): HandlerResult {
        return new HandlerResult({ value, pass: true });
    }

    public static fail(value: unknown, errorSlug: string, args: ArgumentCollection = {}): HandlerResult {
        return new HandlerResult({ value, pass: false, errorSlug, args });
    }

}

export { HandlerResult };