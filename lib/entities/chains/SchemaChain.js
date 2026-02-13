'use strict';


//todo: pathdelim and upchar make global chars...cant do it by object too much craziness

import GlobalConfig  from '../../GlobalConfig.js';
import ObjectChain  from './ObjectChain.js';

import FlatSchema  from '../../FlatSchema.js';
import ObjectWrapper  from '../../ObjectWrapper.js';

import ValueNode  from '../../tracker/ValueNode.js';
// import ReferenceValueNode  from '../../tracker/ReferenceValueNode.js';


// import Meta  from '../Meta.js';
import Entity  from '../Entity.js';
import MetaCache  from '../../cache/MetaCache.js';

// import SchemaChainMeta  from '../meta/SchemaChainMeta.js';
// import PathReference  from '../reference/PathReference.js';
import ArrayChain  from './ArrayChain.js';
import ObjectUtils  from '../../utils/ObjectUtils.js';

import StaticValue  from '../values/StaticValue.js';
import MessageNode  from '../../tracker/MessageNode.js';

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

            if (value instanceof Entity) {
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
                entity = new StaticValue({
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

    get languageKey() {
        return 'schema';
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

