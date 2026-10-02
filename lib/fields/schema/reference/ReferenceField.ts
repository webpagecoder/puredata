'use strict';

import { Path } from '../../../Path.ts';
import { Field, FieldConfig, FieldCtorParams } from '../../Field.ts';
import { ReferenceProcessor } from './ReferenceProcessor.ts';

export type ReferenceFieldConfig = FieldConfig & {
    path: Path;
    defaultOrCallback: unknown | ((...args: unknown[]) => unknown);
};

export type ReferenceFieldCtorParams =
    FieldCtorParams
    & Partial<Omit<ReferenceFieldConfig, 'path'>>
    & {
        pathStr: string;
    };

class ReferenceField extends Field<ReferenceFieldConfig> {

    constructor(args: Partial<ReferenceFieldCtorParams> = {}) {
        super(args);

        const {
            pathStr = '.',
            defaultOrCallback = undefined
        } = args;

        const { config } = this;
        config.path = new Path(pathStr, config.pathDelims);
        config.defaultOrCallback = defaultOrCallback;
    }

    public override clone(args: Partial<ReferenceFieldCtorParams> = {}): this {
        const clone = super.clone(args);

        if (args.pathStr !== undefined) {
            clone.config.path = new Path(args.pathStr, this.config.pathDelims);
        }
        return clone;
    }

    public override createProcessor(): ReferenceProcessor {
        return new ReferenceProcessor({
            field: this,
        });
    }

}

export { ReferenceField };

