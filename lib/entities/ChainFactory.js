'use strict';

const ArrayChain = require('./chains/ArrayChain.js');
const BooleanChain = require('./chains/BooleanChain.js');
const DateChain = require('./chains/DateChain.js');
const GenericChain = require('./chains/GenericChain.js');
const NumberChain = require('./chains/NumberChain.js');
const ObjectChain = require('./chains/ObjectChain.js');
const SchemaChain = require('./chains/SchemaChain.js');
const StringChain = require('./chains/StringChain.js');

const ChainFactory = {
    array: args => ArrayChain.create(args),
    boolean: args => BooleanChain.create(args),
    date: args => DateChain.create(args),
    generic: args => GenericChain.create(args),
    number: args => NumberChain.create(args),
    object: args => ObjectChain.create(args),
    schema: args => SchemaChain.create(args),
    string: args => StringChain.create(args)
}

module.exports = ChainFactory;
