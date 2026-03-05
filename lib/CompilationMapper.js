'use strict';

import Processor from './processors/Processor.js';

// Chains

import ArrayChain from './fields/ArrayChain.js';
import ArrayProcessor from './processors/ArrayProcessor.js';

import BooleanChain from './fields/BooleanChain.js';
import BooleanProcessor from './processors/BooleanProcessor.js';

import DateProcessor from './processors/DateProcessor.js';
import DateChain from './fields/DateChain.js';

import NumberProcessor from './processors/NumberProcessor.js';
import NumberChain from './fields/NumberChain.js';

import ObjectProcessor from './processors/ObjectProcessor.js';
import ObjectChain from './fields/ObjectChain.js';

import SchemaProcessor from './processors/SchemaProcessor.js';
import SchemaChain from './fields/SchemaChain.js';

import StringProcessor from './processors/StringProcessor.js';
import StringChain from './fields/StringChain.js';

// Other

import ReferenceProcessor from './processors/ReferenceProcessor.js';
import ReferenceField from './fields/ReferenceField.js';

import EnumProcessor from './processors/EnumProcessor.js';
import EnumField from './fields/EnumField.js';

import PathReferenceProcessor from './processors/PathReferenceProcessor.js';
import PathReferenceField from './fields/PathReferenceField.js';

import SchemaConditionalProcessor from './processors/SchemaConditionalProcessor.js';
import SchemaConditionalField from './fields/SchemaConditionalField.js';

import ValueProcessor from './processors/ValueProcessor.js';
import ValueField from './fields/ValueField.js';
// import { compilationMapper } from '../pd.js';

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

export default CompilationMapper;
