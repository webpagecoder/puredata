'use strict';

import { Path } from '../Path.ts';
import { Field, FieldProps } from './Field.ts';

export type PathReferenceFieldProps = FieldProps & {
    pathStr: string;
    defaultOrCallback?: unknown | ((...args: unknown[]) => unknown);
};

class PathReferenceField extends Field {
    protected _path: Path;
    protected _defaultOrCallback?: null | Function;

    constructor(props: PathReferenceFieldProps) {
        super(props);

        const {
            pathStr,
            defaultOrCallback
        } = props;

        this._path = Path.create(pathStr);
        this._defaultOrCallback = typeof defaultOrCallback === 'function'
            ? defaultOrCallback
            : null;
    }

    public override clone(props: Partial<PathReferenceFieldProps> = {}): this {
        const clone = super.clone(props);
        const {
            pathStr,
            defaultOrCallback = this._defaultOrCallback,
        } = props;

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
