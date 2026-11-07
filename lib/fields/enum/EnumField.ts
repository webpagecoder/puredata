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

    /**
     * Creates an enum field from an allowed-value structure.
     *
     * @param args Initial configuration overrides for the enum field.
     */
    constructor(args: Partial<EnumFieldCtorParams> = {}) {
        super(args);
        const {
            structure = [],
        } = args;

        const { config } = this;
        config.structure = structure;
    }

    // ========================================
    // Cloning
    // ========================================

    /**
     * Clones the field with optional configuration overrides.
     *
     * @param args Configuration values to override on the cloned field.
     * @returns Cloned enum field.
     */
    public override clone(args: Partial<EnumFieldCtorParams> = {}): this {
        return super.clone(args);
    }

    // ========================================
    // Processor wiring
    // ========================================

    /**
     * Creates the processor that validates enum values.
     *
     * @returns Processor configured for this enum field.
     */
    public override createProcessor(): EnumProcessor {
        return new EnumProcessor({
            field: this,
        });
    }

}

export { EnumField };