'use strict';

import { Field, FieldConfig, FieldCtorParams } from '../Field.ts';
import { EnumProcessor } from './EnumProcessor.ts';

/** Allowed enum values, as a list or as a key-to-value mapping. */
export type EnumStructure = unknown[] | Record<string, unknown>;

/** Configuration for an enumeration field. */
export type EnumFieldConfig = FieldConfig & {
    structure: EnumStructure;
};

/** Constructor options for an enumeration field. */
export type EnumFieldCtorParams = FieldCtorParams<EnumFieldConfig>;

/** A field that restricts values to a configured enumeration. */
class EnumField extends Field<EnumFieldConfig> {

    /** Creates an enum field from an allowed-value structure. */
    constructor(args: Partial<EnumFieldCtorParams> = {}) {
        super(args);
        const {
            structure = [],
        } = args;

        const { config } = this;
        config.structure = structure;
    }

    /** Clones the field and recalculates whether the structure is a list. */
    public override clone(args: Partial<EnumFieldCtorParams> = {}): this {
        return super.clone(args);
    }

    /** Creates the processor that validates enum values. */
    public override createProcessor(): EnumProcessor {
        return new EnumProcessor({
            field: this,
        });
    }

}

export { EnumField };