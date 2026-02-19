'use strict';

import ObjectUtils from '../../utils/ObjectUtils.js';
import Field from '../Field.js';
import ValueField from '../ValueField.js';
import ArrayChain from './ArrayChain.js';
import ObjectChain from './ObjectChain.js';

class SchemaChain extends ObjectChain {

    constructor(props = {}) {
        super(props);


        let {
            compilationMapper,
            language,
            structure = {},
        } = props;

        const schema = new Map();
        for (const key of Object.keys(structure)) {
            let value = structure[key];
            let entity;

            if (value instanceof Field) {
                entity = value;
            }
            else if (ObjectUtils.isPlainObject(value)) {
                entity = new SchemaChain({
                    compilationMapper,
                    language,
                    structure: value
                });
            }
            else if (Array.isArray(value)) {
                entity = new ArrayChain({
                    compilationMapper,
                    language
                }).tuple(value);
            }
            else {
                entity = new ValueField({
                    compilationMapper,
                    language,
                    value
                });
            }
            schema.set(key, entity);
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

        for (const [key, entity] of this.props.schema) {
            builder.setChild(key, entity.getRawDescription());
        }

        return builder;
    }

}

export default  SchemaChain;

