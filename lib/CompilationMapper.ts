// @ts-nocheck
'use strict';

import Processor from './processors/Processor.ts';

// Chains

import ArrayChain from './fields/ArrayChain.ts';
import ArrayProcessor from './processors/ArrayProcessor.ts';

import BooleanChain from './fields/BooleanChain.ts';
import BooleanProcessor from './processors/BooleanProcessor.ts';

import DateProcessor from './processors/DateProcessor.ts';
import DateChain from './fields/DateChain.ts';

import NumberProcessor from './processors/NumberProcessor.ts';
import NumberChain from './fields/NumberChain.ts';

import ObjectProcessor from './processors/ObjectProcessor.ts';
import ObjectChain from './fields/ObjectChain.ts';

import SchemaProcessor from './processors/SchemaProcessor.ts';
import SchemaChain from './fields/SchemaChain.ts';

import StringProcessor from './processors/StringProcessor.ts';
import StringChain from './fields/StringChain.ts';

// Other

import ReferenceProcessor from './processors/ReferenceProcessor.ts';
import ReferenceField from './fields/ReferenceField.ts';

import EnumProcessor from './processors/EnumProcessor.ts';
import EnumField from './fields/EnumField.ts';

import PathReferenceProcessor from './processors/PathReferenceProcessor.ts';
import PathReferenceField from './fields/PathReferenceField.ts';

import SchemaConditionalProcessor from './processors/SchemaConditionalProcessor.ts';
import SchemaConditionalField from './fields/SchemaConditionalField.ts';

import ValueProcessor from './processors/ValueProcessor.ts';
import ValueField from './fields/ValueField.ts';
// import { compilationMapper } from '../pd.ts';

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

    createProcessor(field, context = {}) {
        const fieldCompiler = COMPILATION_MAPPINGS.get(field.constructor) || Processor;
        return new fieldCompiler(Object.assign(
            {
                field,
                compilationMapper: this
            },
            context
        ));
    }

}

export default CompilationMapper;
