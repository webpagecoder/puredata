'use strict';

import { Field, FieldProps, FieldConstructorParams } from './Field.ts';

export type ValueFieldProps = FieldProps & {
    mutable: boolean;
    value: unknown;
};

export type ValueFieldConstructorParams = FieldConstructorParams
    & Partial<ValueFieldProps>;

class ValueField extends Field<ValueFieldProps> {

    public constructor(args: ValueFieldConstructorParams) {
        super(args);
        const {
            mutable = false,
            value = null,
        } = args;

        const { extendedProps: props } = this;
        props.mutable = mutable;
        props.value = value;
    }

}

export { ValueField };

