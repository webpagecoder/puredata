'use strict';

import { Path } from '../../../Path.ts';
import { Field, FieldCtorParams, FieldConfig } from '../../Field.ts';
import { PointerProcessor } from './PointerProcessor.ts';

export type PointerFieldProps = FieldConfig & {
    fieldPath: Path;
    nestMinDepth: number | null;
    nestMaxDepth: number | null;
};

export type PointerFieldCtorParams = FieldCtorParams & Partial<PointerFieldProps>

class PointerField extends Field<PointerFieldProps> {

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

    public override createProcessor(): PointerProcessor {
        return new PointerProcessor({
            field: this,
        });
    }

}

export { PointerField };
