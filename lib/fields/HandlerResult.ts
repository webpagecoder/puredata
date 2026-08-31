'use strict';

class HandlerResult<T = unknown> {

    protected _value: T;
    protected _pass: boolean;
    protected _fail: boolean;
    protected _errors: Record<string, Record<string, unknown>>;

    public static pass<T = unknown>(value: T): HandlerResult<T> {
        return new HandlerResult({ value, pass: true });
    }

    public static fail<T = unknown>(value: T, errorKey: string, args: Record<string, unknown> = {}): HandlerResult<T> {
        return new HandlerResult({ value, pass: false, errorKey, args });
    }

    public constructor(args: {
        value: T;
        pass: boolean;
        errorKey?: string;
        args?: Record<string, unknown>;
    }) {
        this._value = args.value;
        this._pass = args.pass || false;
        this._fail = !this._pass;
        this._errors = {}
        if (!this._pass) {
            if (args.errorKey) {
                this.addError(args.errorKey, args.args || {});
            }
        }
    }

    public addError(errorKey: string, args: Record<string, unknown>): void {
        if (this._pass) {
            throw new Error('Errors cannot be added to a Result that passed');
        }
        this._errors[errorKey] = args;
    }

    public get value(): T {
        return this._value;
    }

    public get pass(): boolean {
        return this._pass;
    }

    public get fail(): boolean {
        return this._fail;
    }

    public get errors(): Record<string, Record<string, unknown>> {
        return this._errors;
    }

}

export { HandlerResult };