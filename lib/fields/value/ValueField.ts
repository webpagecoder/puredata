'use strict';

import { Field, FieldProps, FieldCtorParams } from '../Field.ts';

export type ValueFieldProps = FieldProps & {
    mutable: boolean;
    value: unknown;
};

export type ValueFieldCtorParams = FieldCtorParams
    & Partial<ValueFieldProps>;

class ValueField extends Field<ValueFieldProps> {

    public constructor(args: ValueFieldCtorParams) {
        super(args);
        const {
            mutable = false,
            value = null,
        } = args;

        const { props } = this;
        props.mutable = mutable;
        props.value = value;
    }

}

export { ValueField };

