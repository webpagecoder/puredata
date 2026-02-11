'use strict';

const CompiledEntity = require("./CompiledEntity");

// Chains

const ArrayChain = require("./chains/ArrayChain");
const CompiledArrayChain = require("./chains/CompiledArrayChain");

const BooleanChain = require("./chains/BooleanChain");
const CompiledBooleanChain = require("./chains/CompiledBooleanChain");

const DateChain = require("./chains/DateChain");
const CompiledDateChain = require("./chains/CompiledDateChain");

const NumberChain = require("./chains/NumberChain");
const CompiledNumberChain = require("./chains/CompiledNumberChain");

const ObjectChain = require("./chains/ObjectChain");
const CompiledObjectChain = require("./chains/CompiledObjectChain");

const SchemaChain = require("./chains/SchemaChain");
const CompiledSchemaChain = require("./chains/CompiledSchemaChain");

const StringChain = require("./chains/StringChain");
const CompiledStringChain = require("./chains/CompiledStringChain");

// Other

const EntityReference = require("./EntityReference");
const CompiledEntityReference = require("./CompiledEntityReference");

const Enum = require("./Enum");
const CompiledEnum = require("./CompiledEnum");

const PathReference = require('./reference/PathReference');
const CompiledPathReference = require('./reference/CompiledPathReference')

const SchemaConditionalEntity = require("./SchemaConditionalEntity");
const CompiledSchemaConditionalEntity = require("./CompiledSchemaConditionalEntity");

const StaticValue = require("./values/StaticValue");
const CompiledStaticValue = require("./values/CompiledStaticValue");
// const { compilationMapper } = require("../pd");

const COMPILATION_MAPPINGS = new Map();

// Chains
COMPILATION_MAPPINGS.set(ArrayChain, CompiledArrayChain);
COMPILATION_MAPPINGS.set(BooleanChain, CompiledBooleanChain);
COMPILATION_MAPPINGS.set(DateChain, CompiledDateChain);
COMPILATION_MAPPINGS.set(NumberChain, CompiledNumberChain);
COMPILATION_MAPPINGS.set(ObjectChain, CompiledObjectChain);
COMPILATION_MAPPINGS.set(SchemaChain, CompiledSchemaChain);
COMPILATION_MAPPINGS.set(StringChain, CompiledStringChain);

// Other types
COMPILATION_MAPPINGS.set(EntityReference, CompiledEntityReference);
COMPILATION_MAPPINGS.set(Enum, CompiledEnum);
COMPILATION_MAPPINGS.set(PathReference, CompiledPathReference);
COMPILATION_MAPPINGS.set(SchemaConditionalEntity, CompiledSchemaConditionalEntity);
COMPILATION_MAPPINGS.set(StaticValue, CompiledStaticValue);


class CompilationMapper {

    createCompiledEntity(entity, context = {}) {
        const entityCompiler = COMPILATION_MAPPINGS.get(entity.constructor) || CompiledEntity;
        return new entityCompiler(Object.assign(
            {
                entity,
                compilationMapper: this
            },
            context
        ));
    }

}

module.exports = CompilationMapper;
