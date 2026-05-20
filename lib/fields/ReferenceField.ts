'use strict';

import { Path } from '../Path.ts';
import { Field, FieldConstructorParams } from './Field.ts';

export type ReferenceFieldProps = FieldConstructorParams & {
    path?: Path | string;
    minDepth?: number;
    maxDepth?: number;
};

class ReferenceField extends Field {
    protected _path?: Path | string;
    protected _minDepth?: number
    protected _maxDepth?: number;

    constructor(args: ReferenceFieldProps = {}) {
        super(args);
        const {
            path = '',
            minDepth = -1,
            maxDepth = -1,
        } = args;

        this._path = path;
        this._minDepth = minDepth;
        this._maxDepth = maxDepth;
    }

    public override clone(args: Partial<ReferenceFieldProps> = {}): this {
        const clone = super.clone(args);
        const {
            path = this._path,
            minDepth = this._minDepth,
            maxDepth = this._maxDepth,
        } = args;

        clone._path = path;
        clone._minDepth = minDepth;
        clone._maxDepth = maxDepth;
        return clone;
    }
}

export { ReferenceField };