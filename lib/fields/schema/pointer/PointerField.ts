'use strict';

import { Path } from '../../../Path.ts';
import { Field, FieldCtorParams, FieldConfig } from '../../Field.ts';
import { PointerProcessor } from './PointerProcessor.ts';

/** Configuration for a pointer to another field in a schema. */
export type PointerFieldProps = FieldConfig & {
    fieldPath: Path;
    nestMinDepth: number | null;
    nestMaxDepth: number | null;
};

/** Constructor options for a pointer field. */
export type PointerFieldCtorParams = FieldCtorParams & Partial<PointerFieldProps>

/** Field that reuses another field, optionally within a recursive schema. */
class PointerField extends Field<PointerFieldProps> {

    /** Creates a pointer field with its target path and nesting limits. */
    public constructor(args: PointerFieldCtorParams = {}) {
        super(args);
        const {
            fieldPath = new Path(),
            nestMinDepth = null,
            nestMaxDepth = null,
        } = args;

        const { config } = this;
        config.fieldPath = fieldPath;
        config.nestMinDepth = nestMinDepth;
        config.nestMaxDepth = nestMaxDepth;
    }

    /** Creates the processor that resolves this field pointer. */
    public override createProcessor(): PointerProcessor {
        return new PointerProcessor({
            field: this,
        });
    }

}

export { PointerField };
