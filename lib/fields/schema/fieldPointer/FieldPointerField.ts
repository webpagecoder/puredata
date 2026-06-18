'use strict';

import { Path } from '../../../Path.ts';
import { Field, FieldCtorParams, FieldProps } from '../../Field.ts';

export type FieldPointerFieldProps = FieldProps & {
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

        const { extendedProps } = this;
        extendedProps.fieldPath = fieldPath;
        extendedProps.minDepth = minDepth;
        extendedProps.maxDepth = maxDepth;
    }

}

export { FieldPointerField };
