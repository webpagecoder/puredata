'use strict';

import { Field, FieldCloneParams, FieldConfig, FieldCtorParams } from '../Field.ts';
import { EnumProcessor } from './EnumProcessor.ts';

export type EnumStructure = unknown[] | Record<string, unknown>;

export type EnumFieldProps = FieldConfig & {
    structure: EnumStructure;
    isArray: boolean;
};

export type EnumFieldCtorParams = FieldCtorParams
    & Partial<Omit<EnumFieldProps, 'isArray'>>;

export type EnumFieldCloneParams =
    FieldCloneParams<Omit<EnumFieldProps, 'isArray'>>;

class EnumField extends Field<EnumFieldProps> {

    constructor(args: EnumFieldCtorParams) {
        super(args);
        const {
            structure = [],
        } = args;

        const { props } = this;
        props.structure = structure;
        props.isArray = Array.isArray(structure);
    }

    public override clone(args: EnumFieldCloneParams = {}): this {
        const clone = super.clone(args);
        clone.props.isArray = Array.isArray(clone.props.structure);
        return clone;
    }

    public override createProcessor(): EnumProcessor {
        return new EnumProcessor({
            field: this,
        });
    }
}

export { EnumField };