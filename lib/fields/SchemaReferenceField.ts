'use strict';

import { Path } from '../Path.ts';
import { Field, FieldProps, FieldConstructorParams } from './Field.ts';

export type SchemaReferenceFieldProps = FieldProps & {
    path: Path | string;
    minDepth: number;
    maxDepth: number;
};

export type SchemaReferenceFieldConstructorParams = FieldConstructorParams
    & Partial<SchemaReferenceFieldProps>

class SchemaReferenceField extends Field<SchemaReferenceFieldProps> {

    constructor(args: SchemaReferenceFieldConstructorParams) {
        super(args);
        const {
            path = '',
            minDepth = -1,
            maxDepth = -1,
        } = args;

        const { extendedProps: props } = this;
        props.path = path;
        props.minDepth = minDepth;
        props.maxDepth = maxDepth;
    }

}

export { SchemaReferenceField };