'use strict';

/** Result returned by a validation or transformation handler. */
class HandlerResult<T = unknown> {

    /** Value produced by the handler. */
    private _value: T;

    /** Whether the handler succeeded. */
    private _pass: boolean;

    /** Whether the handler failed. */
    private _fail: boolean;

    /** Errors recorded by the handler, keyed by error identifier. */
    private _errors: Record<string, Record<string, unknown>>;

    /** Creates a successful result containing the supplied value. */
    public static pass<T = unknown>(value: T): HandlerResult<T> {
        return new HandlerResult({ value, pass: true });
    }

    /** Creates a failed result with an error and its formatting arguments. */
    public static fail<T = unknown>(value: T, errorKey: string, args: Record<string, unknown> = {}): HandlerResult<T> {
        return new HandlerResult({ value, pass: false, errorKey, args });
    }

    /**
     * Creates a result from a value and pass/fail status.
     *
     * @param args Result value, status, and optional error details.
     */
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

    /**
     * Adds an error to this failed result.
     *
     * @param errorKey Error identifier.
     * @param args Arguments used to format the error message.
     * @throws {@link Error} If this result represents success.
     */
    public addError(errorKey: string, args: Record<string, unknown>): void {
        if (this._pass) {
            throw new Error('Errors cannot be added to a Result that passed');
        }
        this._errors[errorKey] = args;
    }

    /** Gets the value produced by the handler. */
    public get value(): T {
        return this._value;
    }

    /** Whether the handler succeeded. */
    public get pass(): boolean {
        return this._pass;
    }

    /** Whether the handler failed. */
    public get fail(): boolean {
        return this._fail;
    }

    /** Gets errors recorded by the handler. */
    public get errors(): Record<string, Record<string, unknown>> {
        return this._errors;
    }

}

export { HandlerResult };