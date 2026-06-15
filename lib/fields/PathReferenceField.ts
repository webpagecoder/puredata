'use strict';

import { Path } from '../path/Path.ts';
import { Field, FieldCloneParams, FieldProps, FieldConstructorParams } from './Field.ts';

export type PathReferenceFieldProps = FieldProps & {
    path: Path;
    defaultOrCallback: unknown | ((...args: unknown[]) => unknown);
};

export type PathReferenceFieldConstructorParams = 
    FieldConstructorParams
    & Partial<Omit<PathReferenceFieldProps, 'path'>>
    & {
        pathStr: string;
    };

export type PathReferenceFieldCloneParams =
    FieldCloneParams<PathReferenceFieldProps> & {
        pathStr?: string;
    };

class PathReferenceField extends Field<PathReferenceFieldProps> {

    constructor(args: PathReferenceFieldConstructorParams) {
        super(args);

        const {
            pathStr = '.',
            defaultOrCallback = undefined
        } = args;

        const { extendedProps } = this;
        extendedProps.path =  Path.create(pathStr);
        extendedProps.defaultOrCallback = defaultOrCallback;
    }

    public override clone(args:PathReferenceFieldCloneParams = {}): this {
        const clone = super.clone(args);

        if (args.pathStr !== undefined) {
            clone.extendedProps.path =  Path.create(args.pathStr);
        }
        return clone;
    }

}

export { PathReferenceField };

