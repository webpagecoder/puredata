'use strict';

import { Path } from '../../../Path.ts';
import { Field, FieldConfig, FieldCtorParams } from '../../Field.ts';
import { ReferenceProcessor } from './ReferenceProcessor.ts';

/** Configuration for a field that reads another value by path. */
export type ReferenceFieldConfig = FieldConfig & {
    path: Path;
    defaultOrCallback: unknown | ((...args: unknown[]) => unknown);
};

/** Constructor options for a reference field. */
export type ReferenceFieldCtorParams =
    FieldCtorParams
    & Partial<Omit<ReferenceFieldConfig, 'path'>>
    & {
        pathStr: string;
    };

/** Field that resolves a value from another path with an optional fallback. */
class ReferenceField extends Field<ReferenceFieldConfig> {

    /** Creates a reference field from a path and optional fallback. */
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

    /** Clones this field and reparses a supplied path string. */
    public override clone(args: Partial<ReferenceFieldCtorParams> = {}): this {
        const clone = super.clone(args);

        if (args.pathStr !== undefined) {
            clone.config.path = new Path(args.pathStr, this.config.pathDelims);
        }
        return clone;
    }

    /** Creates the processor that resolves this field's referenced value. */
    public override createProcessor(): ReferenceProcessor {
        return new ReferenceProcessor({
            field: this,
        });
    }

}

export { ReferenceField };
