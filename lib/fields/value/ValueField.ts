'use strict';

import { Field, FieldConfig, FieldCtorParams } from '../Field.ts';
import { ValueProcessor } from './ValueProcessor.ts';

export type ValueFieldConfig = FieldConfig & {
    mutable: boolean;
    value: unknown;
};

export type ValueFieldCtorParams = FieldCtorParams<ValueFieldConfig>;

class ValueField extends Field<ValueFieldCtorParams> {

    public constructor(args: Partial<ValueFieldCtorParams> = {}) {
        super(args);
        const {
            mutable = false,
            value = null,
        } = args;

        const { _config } = this;
        _config.mutable = mutable;
        _config.value = value;
    }

    public override createProcessor(): ValueProcessor {
        return new ValueProcessor({
            field: this,
        });
    }

}

export { ValueField };

