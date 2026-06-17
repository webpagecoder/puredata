'use strict';

// Base Field and Processor

import { Field } from './types/Field.ts';
import { Processor } from './types/Processor.ts';

// Chains & processors

import { ArrayChain } from './types/array/ArrayChain.ts';
import { ArrayProcessor } from './types/array/ArrayProcessor.ts';

import { BooleanChain } from './types/boolean/BooleanChain.ts';
import { BooleanProcessor } from './types/boolean/BooleanProcessor.ts';

import { DateChain } from './types/date/DateChain.ts';
import { DateProcessor } from './types/date/DateProcessor.ts';

import { NumberChain } from './types/number/NumberChain.ts';
import { NumberProcessor } from './types/number/NumberProcessor.ts';

import { ObjectChain } from './types/object/ObjectChain.ts';
import { ObjectProcessor } from './types/object/ObjectProcessor.ts';

import { SchemaChain } from './types/schema/SchemaChain.ts';
import { SchemaProcessor } from './types/schema/SchemaProcessor.ts';

import { StringChain } from './types/string/StringChain.ts';
import { StringChainProcessor } from './types/string/StringChainProcessor.ts';

// Others & processors

import { ReferenceField } from './types/schema/ReferenceField.ts';
import { ReferenceProcessor } from './types/schema/ReferenceProcessor.ts';

import { EnumField } from './types/enum/EnumField.ts';
import { EnumProcessor } from './types/enum/EnumProcessor.ts';

import { PathField } from './types/schema/PathField.ts';
import { PathProcessor } from './types/schema/PathProcessor.ts';

import { ConditionalField } from './types/schema/ConditionalField.ts';
import { ConditionalProcessor } from './types/schema/ConditionalProcessor.ts';

import { ValueField } from './types/value/ValueField.ts';
import { ValueFieldProcessor } from './types/value/ValueFieldProcessor.ts';
import { ProcessorCtorParams } from './types/Processor.ts';

type FieldCtor = abstract new (...args: any[]) => Field;
type ProcessorCtor = new (args: ProcessorCtorParams) => Processor;

const MAPPINGS = new Map<FieldCtor, Processor>();

// Chains
MAPPINGS.set(ArrayChain, ArrayProcessor);
MAPPINGS.set(BooleanChain, BooleanProcessor);
MAPPINGS.set(DateChain, DateProcessor);
MAPPINGS.set(NumberChain, NumberProcessor);
MAPPINGS.set(ObjectChain, ObjectProcessor);
MAPPINGS.set(SchemaChain, SchemaProcessor);
MAPPINGS.set(StringChain, StringChainProcessor);

// Other types
MAPPINGS.set(ReferenceField, ReferenceProcessor);
MAPPINGS.set(EnumField, EnumProcessor);
MAPPINGS.set(PathField, PathProcessor);
MAPPINGS.set(ConditionalField, ConditionalProcessor);
MAPPINGS.set(ValueField, ValueFieldProcessor);


class ProcessorFactory {

    createProcessor(field: Field, context: Record<string, any> = {}): Processor {
        const ProcessorCtor = MAPPINGS.get(field.constructor as FieldCtor);
        if (!ProcessorCtor) {
            throw new Error(`No processor found for field of type ${field.constructor.name}`);
        }
        return new ProcessorCtor(Object.assign(
            {
                field,
                processorMapper: this,
            },
            context
        ));
    }

}

export { ProcessorFactory };
