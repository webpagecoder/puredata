'use strict';

import { Path } from '../../Path.ts';
import { Field, FieldCtorParams, FieldProps } from '../Field.ts';

export type ReferenceFieldProps = FieldProps & {
    fieldPath: Path;
    minDepth: number;
    maxDepth: number;
};

export type ReferenceFieldCtorParams = FieldCtorParams
    & Partial<ReferenceFieldProps>

class ReferenceField extends Field<ReferenceFieldProps> {

    constructor(args: ReferenceFieldCtorParams) {
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

export { ReferenceField };
