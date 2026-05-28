'use strict';

import { Path } from '../Path.ts';
import { Field, FieldProps, FieldConstructorParams } from './Field.ts';

export type ReferenceFieldProps = FieldProps & {
    path: Path | string;
    minDepth: number;
    maxDepth: number;
};

export type ReferenceFieldConstructorParams = FieldConstructorParams
    & Partial<ReferenceFieldProps>

class ReferenceField extends Field<ReferenceFieldProps> {

    constructor(args: ReferenceFieldConstructorParams = {}) {
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

export { ReferenceField };