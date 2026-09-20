'use strict';

import { Path } from '../../../Path.ts';
import { Field, FieldConfig, FieldCtorParams } from '../../Field.ts';
import { PathValueProcessor } from './PathValueProcessor.ts';

export type PathValueFieldConfig = FieldConfig & {
    path: Path;
    defaultOrCallback: unknown | ((...args: unknown[]) => unknown);
};

export type PathValueFieldCtorParams =
    FieldCtorParams
    & Partial<Omit<PathValueFieldConfig, 'path'>>
    & {
        pathStr: string;
    };

class PathValueField extends Field<PathValueFieldConfig> {

    constructor(args: Partial<PathValueFieldCtorParams> = {}) {
        super(args);

        const {
            pathStr = '.',
            defaultOrCallback = undefined
        } = args;

        const { _config } = this;
        _config.path = new Path(pathStr, _config.pathDelims);
        _config.defaultOrCallback = defaultOrCallback;
    }

    public override clone(args: Partial<PathValueFieldCtorParams> = {}): this {
        const clone = super.clone(args);

        if (args.pathStr !== undefined) {
            clone._config.path = new Path(args.pathStr, this._config.pathDelims);
        }
        return clone;
    }

    public override createProcessor(): PathValueProcessor {
        return new PathValueProcessor({
            field: this,
        });
    }

}

export { PathValueField };

