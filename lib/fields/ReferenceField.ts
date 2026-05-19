'use strict';

import { Path } from '../Path.ts';
import { Field, FieldConstructorProps } from './Field.ts';

export type ReferenceFieldProps = FieldConstructorProps & {
    path?: Path | string;
    minDepth?: number;
    maxDepth?: number;
};

class ReferenceField extends Field {
    protected _path?: Path | string;
    protected _minDepth?: number
    protected _maxDepth?: number;

    constructor(props: ReferenceFieldProps = {}) {
        super(props);
        const {
            path = '',
            minDepth = -1,
            maxDepth = -1,
        } = props;

        this._path = path;
        this._minDepth = minDepth;
        this._maxDepth = maxDepth;
    }

    public override clone(props: Partial<ReferenceFieldProps> = {}): this {
        const clone = super.clone(props);
        const {
            path = this._path,
            minDepth = this._minDepth,
            maxDepth = this._maxDepth,
        } = props;

        clone._path = path;
        clone._minDepth = minDepth;
        clone._maxDepth = maxDepth;
        return clone;
    }
}

export { ReferenceField };