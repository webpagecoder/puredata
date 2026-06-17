'use strict';

import { Path } from '../../../Path.ts';
import { Field, FieldCloneParams, FieldProps, FieldCtorParams } from '../../Field.ts';

export type PathValueFieldProps = FieldProps & {
    path: Path;
    defaultOrCallback: unknown | ((...args: unknown[]) => unknown);
};

export type PathValueFieldCtorParams =
    FieldCtorParams
    & Partial<Omit<PathValueFieldProps, 'path'>>
    & {
        pathStr: string;
    };

export type PathValueFieldCloneParams =
    FieldCloneParams<PathValueFieldProps> & {
        pathStr?: string;
    };

class PathValueField extends Field<PathValueFieldProps> {

    constructor(args: PathValueFieldCtorParams) {
        super(args);

        const {
            pathStr = '.',
            defaultOrCallback = undefined
        } = args;

        const { extendedProps } = this;
        extendedProps.path = new Path(pathStr, this._pathDelims);
        extendedProps.defaultOrCallback = defaultOrCallback;
    }

    public override clone(args: PathValueFieldCloneParams = {}): this {
        const clone = super.clone(args);

        if (args.pathStr !== undefined) {
            clone.extendedProps.path = new Path(args.pathStr, this._pathDelims);
        }
        return clone;
    }

}

export { PathValueField };

