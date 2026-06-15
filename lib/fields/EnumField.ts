'use strict';

import { Field, FieldCloneParams, FieldProps, FieldConstructorParams } from './Field.ts';

export type EnumStructure = unknown[] | Record<string, unknown>;

export type EnumFieldProps = FieldProps & {
    structure: EnumStructure;
    isArray: boolean;
};

export type EnumFieldConstructorParams = FieldConstructorParams
    & Partial<Omit<EnumFieldProps, 'isArray'>>;

export type EnumFieldCloneParams =
    FieldCloneParams<Omit<EnumFieldProps, 'isArray'>>;

class EnumField extends Field<EnumFieldProps> {

    constructor(args: EnumFieldConstructorParams) {
        super(args);
        const {
            structure = [],
        } = args;

        const { extendedProps: props } = this;
        props.structure = structure;
        props.isArray = Array.isArray(structure);
    }

    public override clone(args: EnumFieldCloneParams = {}): this {
        const clone = super.clone(args);
        clone.extendedProps.isArray = Array.isArray(clone.extendedProps.structure);
        return clone;
    }
}

export { EnumField };