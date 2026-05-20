'use strict';

import { Field, FieldConstructorParams } from './Field.ts';

export type ValueFieldProps = FieldConstructorParams & {
    mutable?: boolean;
    value?: unknown;
};

class ValueField extends Field {
    protected _mutable: boolean;
    protected _value: unknown;

    constructor(args: ValueFieldProps = {}) {
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
}

export { ValueField };

