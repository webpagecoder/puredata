'use strict';

// Base Field and Processor

import { Field } from './types/Field.ts';
import { Processor } from './types/Processor.ts';

// Chains & processors

import { ArrayChain } from './fields/ArrayChain.ts';
import { ArrayChainProcessor } from './types/array/ArrayChainProcessor.ts';

import { BooleanChain } from './fields/BooleanChain.ts';
import { BooleanChainProcessor } from './types/boolean/BooleanChainProcessor.ts';

import { DateChain } from './fields/DateChain.ts';
import { DateChainProcessor } from './types/date/DateChainProcessor.ts';

import { NumberChain } from './fields/NumberChain.ts';
import { NumberChainProcessor } from './types/number/NumberChainProcessor.ts';

import { ObjectChain } from './fields/ObjectChain.ts';
import { ObjectChainProcessor } from './types/object/ObjectChainProcessor.ts';

import { SchemaChain } from './fields/SchemaChain.ts';
import { SchemaChainProcessor } from './types/schema/SchemaChainProcessor.ts';

import { StringChain } from './fields/StringChain.ts';
import { StringChainProcessor } from './types/string/StringChainProcessor.ts';

// Others & processors

import { SchemaReferenceField } from './fields/SchemaReferenceField.ts';
import { SchemaReferenceFieldProcessor } from './types/schema/SchemaReferenceFieldProcessor.ts';

import { EnumField } from './fields/EnumField.ts';
import { EnumFieldProcessor } from './types/enum/EnumFieldProcessor.ts';

import { PathReferenceField } from './types/PathReferenceField.ts';
import { PathReferenceFieldProcessor } from './types/PathReferenceFieldProcessor.ts';

import { SchemaConditionalField } from './fields/SchemaConditionalField.ts';
import { SchemaConditionalFieldProcessor } from './types/schema/SchemaConditionalFieldProcessor.ts';

import { ValueField } from './types/value/ValueField.ts';
import { ValueFieldProcessor } from './types/value/ValueFieldProcessor.ts';
import { ProcessorConstructorParams } from './types/Processor.ts';

type FieldConstructor = abstract new (...args: any[]) => Field;
type ProcessorConstructor = new (args: ProcessorConstructorParams) => Processor;

const MAPPINGS = new Map<FieldConstructor, Processor>();

// Chains
MAPPINGS.set(ArrayChain, ArrayChainProcessor);
MAPPINGS.set(BooleanChain, BooleanChainProcessor);
MAPPINGS.set(DateChain, DateChainProcessor);
MAPPINGS.set(NumberChain, NumberChainProcessor);
MAPPINGS.set(ObjectChain, ObjectChainProcessor);
MAPPINGS.set(SchemaChain, SchemaChainProcessor);
MAPPINGS.set(StringChain, StringChainProcessor);

// Other types
MAPPINGS.set(SchemaReferenceField, SchemaReferenceFieldProcessor);
MAPPINGS.set(EnumField, EnumFieldProcessor);
MAPPINGS.set(PathReferenceField, PathReferenceFieldProcessor);
MAPPINGS.set(SchemaConditionalField, SchemaConditionalFieldProcessor);
MAPPINGS.set(ValueField, ValueFieldProcessor);


class ProcessorFactory {

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

export { ProcessorFactory };
