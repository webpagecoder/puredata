'use strict';

import { Field, FieldProps } from './Field.ts';

export type ValueFieldProps = FieldProps & {
    mutable?: boolean;
    value?: unknown;
};

class ValueField extends Field {
    protected _mutable: boolean;
    protected _value: unknown;

    constructor(props: ValueFieldProps = {}) {
        super(props);
        const {
            mutable = false,
            value = null,
        } = props;

        this._mutable = mutable;
        this._value = value;
    }

    public override clone(props: Partial<ValueFieldProps> = {}): this {
        const clone = super.clone(props);
        const {
            mutable = this._mutable,
            value = this._value,
        } = props;

        clone._mutable = mutable;
        clone._value = value;
        return clone;
    }
}

export { ValueField };

