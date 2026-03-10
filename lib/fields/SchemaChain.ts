// @ts-nocheck
'use strict';

import { Utils } from '../utils/Utils.ts';
import { Field } from './Field.ts';
import { ValueField } from './ValueField.ts';
import { ArrayChain } from './ArrayChain.ts';
import { ObjectChain } from './ObjectChain.ts';

class SchemaChain extends ObjectChain {

    constructor(props = {}) {
        super(props);


        let {
            compilationMapper,
            locale,
            structure = {},
        } = props;

        const schema = new Map();
        for (const key of Object.keys(structure)) {
            let value = structure[key];
            let field;

            if (value instanceof Field) {
                field = value;
            }
            else if (Utils.isPlainObject(value)) {
                field = new SchemaChain({
                    compilationMapper,
                    locale,
                    structure: value
                });
            }
            else if (Array.isArray(value)) {
                field = new ArrayChain({
                    compilationMapper,
                    locale
                }).tuple(value);
            }
            else {
                field = new ValueField({
                    compilationMapper,
                    locale,
                    value
                });
            }
            schema.set(key, field);
        }

        Object.assign(this.props, {
            clone: true,
            ensurePlain: true,
            // renameKeysArgs: null,
            schema,
        });
    }

    get schema() {
        return this.props.schema;
    }

    // Configurators

    configStripUnknownKeys(stripUnknownKeys = true) {
        return this.setProps({ stripUnknownKeys });
    }

    getRawDescription() {
        const builder = super.getRawDescription();

        for (const [key, field] of this.props.schema) {
            builder.setChild(key, field.getRawDescription());
        }

        return builder;
    }

}

export { SchemaChain };

