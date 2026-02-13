'use strict';

import CompiledEntity  from './CompiledEntity.js';

// Chains

import ArrayChain  from './chains/ArrayChain.js';
import CompiledArrayChain  from './chains/CompiledArrayChain.js';

import BooleanChain  from './chains/BooleanChain.js';
import CompiledBooleanChain  from './chains/CompiledBooleanChain.js';

import DateChain  from './chains/DateChain.js';
import CompiledDateChain  from './chains/CompiledDateChain.js';

import NumberChain  from './chains/NumberChain.js';
import CompiledNumberChain  from './chains/CompiledNumberChain.js';

import ObjectChain  from './chains/ObjectChain.js';
import CompiledObjectChain  from './chains/CompiledObjectChain.js';

import SchemaChain  from './chains/SchemaChain.js';
import CompiledSchemaChain  from './chains/CompiledSchemaChain.js';

import StringChain  from './chains/StringChain.js';
import CompiledStringChain  from './chains/CompiledStringChain.js';

// Other

import EntityReference  from './EntityReference.js';
import CompiledEntityReference  from './CompiledEntityReference.js';

import Enum  from './Enum.js';
import CompiledEnum  from './CompiledEnum.js';

import PathReference  from './reference/PathReference.js';
const CompiledPathReference = require('./reference/CompiledPathReference')

import SchemaConditionalEntity  from './SchemaConditionalEntity.js';
import CompiledSchemaConditionalEntity  from './CompiledSchemaConditionalEntity.js';

import StaticValue  from './values/StaticValue.js';
import CompiledStaticValue  from './values/CompiledStaticValue.js';
// import { compilationMapper }  from '../pd.js';

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

export default  CompilationMapper;
