'use strict';

import { Path } from '../Path.ts';
import { Field, FieldConstructorParams } from './Field.ts';

export type PathReferenceFieldProps = FieldConstructorParams & {
    pathStr: string;
    defaultOrCallback?: unknown | ((...args: unknown[]) => unknown);
};

class PathReferenceField extends Field {
    protected _path: Path;
    protected _defaultOrCallback: unknown

    constructor(args: PathReferenceFieldProps) {
        super(args);

        const {
            pathStr,
            defaultOrCallback
        } = args;

        this._path = Path.create(pathStr);
        this._defaultOrCallback = defaultOrCallback;
    }

    public override clone(args: Partial<PathReferenceFieldProps> = {}): this {
        const clone = super.clone(args);
        const {
            pathStr,
            defaultOrCallback = this._defaultOrCallback,
        } = args;

        clone._path = pathStr ? Path.create(pathStr) : this._path;
        clone._defaultOrCallback = defaultOrCallback;
        return clone;
    }

    public get path() {
        return this._path;
    }
    
    public get defaultOrCallback() {
        return this._defaultOrCallback;
    }

    // public set path(pathStr) {
    //     return this.clone({ pathStr });
    // }

}

export { PathReferenceField };
