'use strict';


//todo: pathdelim and upchar make global chars...cant do it by object too much craziness

const GlobalConfig = require('../../GlobalConfig.js');
const ObjectChain = require('./ObjectChain.js');

const FlatSchema = require('../../FlatSchema.js');
const ObjectWrapper = require('../../ObjectWrapper.js');

const ValueNode = require('../../tracker/ValueNode.js');
// const ReferenceValueNode = require('../../tracker/ReferenceValueNode.js');


// const Meta = require('../Meta.js');
const Entity = require('../Entity.js');
const MetaCache = require('../../cache/MetaCache.js');

// const SchemaChainMeta = require('../meta/SchemaChainMeta.js');
// const PathReference = require('../reference/PathReference.js');
const ArrayChain = require('./ArrayChain.js');
const ObjectUtils = require('../../utils/ObjectUtils.js');

const StaticValue = require('../values/StaticValue.js');
const MessageNode = require('../../tracker/MessageNode.js');

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

module.exports = SchemaChain;

