'use strict';

// Base Field and Processor

import { Field } from './fields/Field.ts';
import { Processor } from './processors/Processor.ts';

// Chains & processors

import { ArrayChain } from './fields/ArrayChain.ts';
import { ArrayProcessor } from './processors/ArrayProcessor.ts';

import { BooleanChain } from './fields/BooleanChain.ts';
import { BooleanProcessor } from './processors/BooleanProcessor.ts';

import { DateChain } from './fields/DateChain.ts';
import { DateProcessor } from './processors/DateProcessor.ts';

import { NumberChain } from './fields/NumberChain.ts';
import { NumberProcessor } from './processors/NumberProcessor.ts';

import { ObjectChain } from './fields/ObjectChain.ts';
import { ObjectProcessor } from './processors/ObjectProcessor.ts';

import { SchemaChain } from './fields/SchemaChain.ts';
import { SchemaProcessor } from './processors/SchemaProcessor.ts';

import { StringChain } from './fields/StringChain.ts';
import { StringProcessor } from './processors/StringProcessor.ts';

// Others & processors

import { ReferenceField } from './fields/ReferenceField.ts';
import { ReferenceProcessor } from './processors/ReferenceProcessor.ts';

import { EnumField } from './fields/EnumField.ts';
import { EnumProcessor } from './processors/EnumProcessor.ts';

import { PathReferenceField } from './fields/PathReferenceField.ts';
import { PathReferenceProcessor } from './processors/PathReferenceProcessor.ts';

import { SchemaConditionalField } from './fields/SchemaConditionalField.ts';
import { SchemaConditionalProcessor } from './processors/SchemaConditionalProcessor.ts';

import { ValueField } from './fields/ValueField.ts';
import { ValueProcessor } from './processors/ValueProcessor.ts';

const COMPILATION_MAPPINGS = new Map<typeof Field, typeof Processor>();

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

    createProcessor(field: Field, context = {}) {
        const processorConstructor: typeof Processor = COMPILATION_MAPPINGS.get(field.constructor as typeof Field);
        if (!processorConstructor) {
            throw new Error(`No processor found for field of type ${field.constructor.name}`);
        }
        return new processorConstructor(Object.assign(
            {
                field,
                compilationMapper: this
            },
            context
        ));
    }

}

export { CompilationMapper };
