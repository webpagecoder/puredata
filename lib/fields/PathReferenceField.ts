'use strict';

import { Path } from '../Path.ts';
import { Field, FieldConstructorParams } from './Field.ts';

export type PathReferenceFieldProps = FieldConstructorParams & {
    pathStr: string;
    defaultOrCallback?: unknown | ((...args: unknown[]) => unknown);
};

class PathReferenceField extends Field {
    protected _path: Path;
    protected _defaultOrCallback?: null | Function;

    constructor(args: PathReferenceFieldProps) {
        super(args);

        const {
            pathStr,
            defaultOrCallback
        } = args;

        this._path = Path.create(pathStr);
        this._defaultOrCallback = typeof defaultOrCallback === 'function'
            ? defaultOrCallback
            : null;
    }

    public override clone(args: Partial<PathReferenceFieldProps> = {}): this {
        const clone = super.clone(args);
        const {
            pathStr,
            defaultOrCallback = this._defaultOrCallback,
        } = args;

        clone._path = pathStr ? Path.create(pathStr) : this._path;
        clone._defaultOrCallback = typeof defaultOrCallback === 'function'
            ? defaultOrCallback
            : null;
        return clone;
    }

    public get path() {
        return this._path;
    }

    // public set path(pathStr) {
    //     return this.clone({ pathStr });
    // }

}

export { PathReferenceField };
