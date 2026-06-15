'use strict';

import { Path } from '../path/Path.ts';
import { Field, FieldConstructorParams, FieldProps } from './Field.ts';

export type SchemaReferenceFieldProps = FieldProps & {
    fieldPath: Path;
    minDepth: number;
    maxDepth: number;
};

export type SchemaReferenceFieldConstructorParams = FieldConstructorParams
    & Partial<SchemaReferenceFieldProps>

class SchemaReferenceField extends Field<SchemaReferenceFieldProps> {

    constructor(args: SchemaReferenceFieldConstructorParams) {
        super(args);
        const {
            fieldPath = this._pathFactory.create('/'),
            minDepth = -1,
            maxDepth = -1,
        } = args;

        const { extendedProps } = this;
        extendedProps.fieldPath = fieldPath;
        extendedProps.minDepth = minDepth;
        extendedProps.maxDepth = maxDepth;
    }

}

export { SchemaReferenceField };
