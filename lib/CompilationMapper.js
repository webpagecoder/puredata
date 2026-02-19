'use strict';

import Processor from './fields/processors/Processor.js';

// Chains

import ArrayChain from './fields/chains/ArrayChain.js';
import ArrayProcessor from './fields/chains/processors/ArrayProcessor.js';

import BooleanChain from './fields/chains/BooleanChain.js';
import BooleanProcessor from './fields/chains/processors/BooleanProcessor.js';

import DateProcessor from './fields/chains/processors/DateProcessor.js';
import DateChain from './fields/chains/DateChain.js';

import NumberProcessor from './fields/chains/processors/NumberProcessor.js';
import NumberChain from './fields/chains/NumberChain.js';

import ObjectProcessor from './fields/chains/processors/ObjectProcessor.js';
import ObjectChain from './fields/chains/ObjectChain.js';

import SchemaProcessor from './fields/chains/processors/SchemaProcessor.js';
import SchemaChain from './fields/chains/SchemaChain.js';

import StringProcessor from './fields/chains/processors/StringProcessor.js';
import StringChain from './fields/chains/StringChain.js';

// Other

import ReferenceProcessor from './fields/processors/ReferenceProcessor.js';
import ReferenceField from './fields/ReferenceField.js';

import EnumProcessor from './fields/processors/EnumProcessor.js';
import EnumField from './fields/EnumField.js';

import PathReferenceProcessor from './fields/processors/PathReferenceProcessor.js';
import PathReferenceField from './fields/PathReferenceField.js';

import SchemaConditionalProcessor from './fields/processors/SchemaConditionalProcessor.js';
import SchemaConditionalField from './fields/SchemaConditionalField.js';

import ValueProcessor from './fields/processors/ValueProcessor.js';
import ValueField from './fields/ValueField.js';
// import { compilationMapper }  from '../pd.js';

const COMPILATION_MAPPINGS = new Map();

// Chains
COMPILATION_MAPPINGS.set(ArrayChain, ArrayProcessor);
COMPILATION_MAPPINGS.set(BooleanChain, BooleanProcessor);
COMPILATION_MAPPINGS.set(DateChain, DateProcessor);
COMPILATION_MAPPINGS.set(NumberChain, NumberProcessor);
COMPILATION_MAPPINGS.set(ObjectChain, ObjectProcessor);
COMPILATION_MAPPINGS.set(SchemaChain, SchemaProcessor);
COMPILATION_MAPPINGS.set(StringChain, StringProcessor);

// Other types
COMPILATION_MAPPINGS.set(ReferenceField, ReferenceProcessor);
COMPILATION_MAPPINGS.set(EnumField, EnumProcessor);
COMPILATION_MAPPINGS.set(PathReferenceField, PathReferenceProcessor);
COMPILATION_MAPPINGS.set(SchemaConditionalField, SchemaConditionalProcessor);
COMPILATION_MAPPINGS.set(ValueField, ValueProcessor);


class CompilationMapper {

    createProcessor(entity, context = {}) {
        const entityCompiler = COMPILATION_MAPPINGS.get(entity.constructor) || Processor;
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
