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
import { ProcessorConstructorParams } from './processors/Processor.ts';

type FieldConstructor = abstract new (...args: any[]) => Field;
type ProcessorConstructor = new (args: ProcessorConstructorParams) => Processor;

const MAPPINGS = new Map<FieldConstructor, ProcessorConstructor>();

// Chains
MAPPINGS.set(ArrayChain, ArrayProcessor);
MAPPINGS.set(BooleanChain, BooleanProcessor);
MAPPINGS.set(DateChain, DateProcessor);
MAPPINGS.set(NumberChain, NumberProcessor);
MAPPINGS.set(ObjectChain, ObjectProcessor);
MAPPINGS.set(SchemaChain, SchemaProcessor);
MAPPINGS.set(StringChain, StringProcessor);

// Other types
MAPPINGS.set(ReferenceField, ReferenceProcessor);
MAPPINGS.set(EnumField, EnumProcessor);
MAPPINGS.set(PathReferenceField, PathReferenceProcessor);
MAPPINGS.set(SchemaConditionalField, SchemaConditionalProcessor);
MAPPINGS.set(ValueField, ValueProcessor);


class FieldProcessorFactory {

    createProcessor(field: Field, context: Record<string, any> = {}): Processor {
        const ProcessorConstructor = MAPPINGS.get(field.constructor as FieldConstructor);
        if (!ProcessorConstructor) {
            throw new Error(`No processor found for field of type ${field.constructor.name}`);
        }
        return new ProcessorConstructor(Object.assign(
            {
                field,
                processorMapper: this,
            },
            context
        ));
    }

}

export { FieldProcessorFactory };
