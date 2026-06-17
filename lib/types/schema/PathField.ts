'use strict';

import { Path } from '../../Path.ts';
import { Field, FieldCloneParams, FieldProps, FieldCtorParams } from '../Field.ts';

export type PathFieldProps = FieldProps & {
    path: Path;
    defaultOrCallback: unknown | ((...args: unknown[]) => unknown);
};

export type PathFieldCtorParams = 
    FieldCtorParams
    & Partial<Omit<PathFieldProps, 'path'>>
    & {
        pathStr: string;
    };

export type PathFieldCloneParams =
    FieldCloneParams<PathFieldProps> & {
        pathStr?: string;
    };

class PathField extends Field<PathFieldProps> {

    constructor(args: PathFieldCtorParams) {
        super(args);

        const {
            pathStr = '.',
            defaultOrCallback = undefined
        } = args;

        const { extendedProps } = this;
        extendedProps.path =  Path.create(pathStr);
        extendedProps.defaultOrCallback = defaultOrCallback;
    }

    public override clone(args:PathFieldCloneParams = {}): this {
        const clone = super.clone(args);

        if (args.pathStr !== undefined) {
            clone.extendedProps.path =  Path.create(args.pathStr);
        }
        return clone;
    }

}

export { PathField };

