'use strict';

import { Path } from '../Path.ts';
import { Field, FieldProps, FieldConstructorParams } from './Field.ts';
import { PathReferenceField } from './PathReferenceField.ts';

export type SchemaReferenceFieldProps = FieldProps & {
    absolutePath: Path;
    minDepth: number | PathReferenceField;
    maxDepth: number | PathReferenceField;
};

export type SchemaReferenceFieldConstructorParams = FieldConstructorParams
    & Partial<SchemaReferenceFieldProps>

class SchemaReferenceField extends Field<SchemaReferenceFieldProps> {

    constructor(args: SchemaReferenceFieldConstructorParams) {
        super(args);
        const {
            absolutePath = Path.create('/'),
            minDepth = -1,
            maxDepth = -1,
        } = args;

        const { extendedProps } = this;
        extendedProps.absolutePath = absolutePath;
        extendedProps.minDepth = minDepth;
        extendedProps.maxDepth = maxDepth;
    }

}

export { SchemaReferenceField };