'use strict';

import { Field } from './Field.ts';
import { Processor } from './Processor.ts';
import { AnyChain } from './any/AnyChain.ts';
import { AnyProcessor } from './any/AnyProcessor.ts';
import { ArrayChain } from './array/ArrayChain.ts';
import { ArrayProcessor } from './array/ArrayProcessor.ts';
import { BooleanChain } from './boolean/BooleanChain.ts';
import { BooleanProcessor } from './boolean/BooleanProcessor.ts';
import { DateChain } from './date/DateChain.ts';
import { DateProcessor } from './date/DateProcessor.ts';
import { EnumField } from './enum/EnumField.ts';
import { EnumProcessor } from './enum/EnumProcessor.ts';
import { NumberChain } from './number/NumberChain.ts';
import { NumberProcessor } from './number/NumberProcessor.ts';
import { ObjectChain } from './object/ObjectChain.ts';
import { ObjectProcessor } from './object/ObjectProcessor.ts';
import { SchemaChain } from './schema/SchemaChain.ts';
import { SchemaProcessor } from './schema/SchemaProcessor.ts';
import { ConditionalField } from './schema/conditional/ConditionalField.ts';
import { ConditionalProcessor } from './schema/conditional/ConditionalProcessor.ts';
import { PathValueField } from './schema/pathValue/PathValueField.ts';
import { PathValueProcessor } from './schema/pathValue/PathValueProcessor.ts';
import { FieldPointerField } from './schema/fieldPointer/FieldPointerField.ts';
import { FieldPointerProcessor } from './schema/fieldPointer/FieldPointerProcessor.ts';
import { StringChain } from './string/StringChain.ts';
import { StringChainProcessor } from './string/StringChainProcessor.ts';
import { ValueField } from './value/ValueField.ts';
import { ValueFieldProcessor } from './value/ValueFieldProcessor.ts';

type FieldCtor = new (...args: any[]) => Field;
type ProcessorCtor = new (...args: any[]) => Processor;

const MAPPINGS = new Map<FieldCtor, ProcessorCtor>();
MAPPINGS.set(AnyChain, AnyProcessor);
MAPPINGS.set(ArrayChain, ArrayProcessor);
MAPPINGS.set(BooleanChain, BooleanProcessor);
MAPPINGS.set(DateChain, DateProcessor);
MAPPINGS.set(EnumField, EnumProcessor);
MAPPINGS.set(NumberChain, NumberProcessor);
MAPPINGS.set(ObjectChain, ObjectProcessor);
MAPPINGS.set(SchemaChain, SchemaProcessor);
MAPPINGS.set(ConditionalField, ConditionalProcessor);
MAPPINGS.set(PathValueField, PathValueProcessor);
MAPPINGS.set(FieldPointerField, FieldPointerProcessor);
MAPPINGS.set(StringChain, StringChainProcessor);
MAPPINGS.set(ValueField, ValueFieldProcessor);

class FieldProcessorMap {
    public resolve(field: Field, context: Record<string, any> = {}): Processor {
        const ProcessorCtor = MAPPINGS.get(field.constructor as FieldCtor);
        if (!ProcessorCtor) {
            throw new Error(`No processor found for field of type ${field.constructor.name}`);
        }
        return new ProcessorCtor(Object.assign({ field, processorMapper: this, }, context));
    }
}

export { FieldProcessorMap };
