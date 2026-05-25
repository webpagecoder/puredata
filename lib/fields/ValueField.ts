'use strict';

import { Field, FieldConstructorParams } from './Field.ts';

export type ValueFieldProps = FieldConstructorParams & {
    mutable?: boolean;
    value?: unknown;
};

class ValueField extends Field {
    protected _mutable: boolean;
    protected _value: unknown;

    public constructor(args: ValueFieldProps = {}) {
        super(args);
        const {
            mutable = false,
            value = null,
        } = args;

        this._mutable = mutable;
        this._value = value;
    }

    public override clone(args: Partial<ValueFieldProps> = {}): this {
        const clone = super.clone(args);
        const {
            mutable = this._mutable,
            value = this._value,
        } = args;

        clone._mutable = mutable;
        clone._value = value;
        return clone;
    }

    //todo: come back to this...should mutable/immutable be allowed to be req/forb/opt?
    // public override forbidden(): this {
    //     return this.clone({ presence: 'forbidden' });
    // }

    // public override optional(): this {
    //     return this.clone({ presence: 'optional' });
    // }

    // public override required(): this {
    //     return this.clone({ presence: 'required' });
    // }

    get mutable(): boolean {
        return this._mutable;
    }

    get value(): unknown {
        return this._value;
    }
}

export { ValueField };

