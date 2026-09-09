'use strict';

import { Path } from '../../../Path.ts';
import { Field, FieldCtorParams, FieldConfig } from '../../Field.ts';
import { FieldPointerProcessor } from './FieldPointerProcessor.ts';

export type FieldPointerFieldProps = FieldConfig & {
    fieldPath: Path;
    minDepth: number;
    maxDepth: number;
};

export type FieldPointerFieldCtorParams = FieldCtorParams
    & Partial<FieldPointerFieldProps>

class FieldPointerField extends Field<FieldPointerFieldProps> {

    constructor(args: FieldPointerFieldCtorParams) {
        super(args);
        const {
            fieldPath = new Path(),
            minDepth = -1,
            maxDepth = -1,
        } = args;

        const { _config } = this;
        _config.fieldPath = fieldPath;
        _config.minDepth = minDepth;
        _config.maxDepth = maxDepth;
    }

    public override createProcessor(): FieldPointerProcessor {
        return new FieldPointerProcessor({
            field: this,
        });
    }

}

export { FieldPointerField };
