'use strict';

import { Field, FieldConfig, FieldCtorParams } from '../Field.ts';
import { EnumProcessor } from './EnumProcessor.ts';

export type EnumStructure = unknown[] | Record<string, unknown>;

export type EnumFieldConfig = FieldConfig & {
    structure: EnumStructure;
};

export type EnumFieldCtorParams = FieldCtorParams<EnumFieldConfig>;

class EnumField extends Field<EnumFieldConfig> {

    protected _isArray: boolean;

    constructor(args: EnumFieldCtorParams) {
        super(args);
        const {
            structure = [],
        } = args;

        this._isArray = Array.isArray(structure);

        const { props } = this;
        props.structure = structure;
    }

    public override clone(args: Partial<EnumFieldCtorParams> = {}): this {
        const clone = super.clone(args);
        clone._isArray = Array.isArray(clone.props.structure);
        return clone;
    }

    public override createProcessor(): EnumProcessor {
        return new EnumProcessor({
            field: this,
        });
    }
}

export { EnumField };