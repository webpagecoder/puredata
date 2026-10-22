'use strict';

import { AnyChain } from "./any/AnyChain.ts";
import { ArrayChain } from "./array/ArrayChain.ts";
import { BooleanChain } from "./boolean/BooleanChain.ts";
import { DateChain } from "./date/DateChain.ts";
import { Field } from "./Field.ts";
import { NumberChain } from "./number/NumberChain.ts";
import { ObjectChain } from "./object/ObjectChain.ts";
import { Schema, SchemaChain } from "./schema/SchemaChain.ts";
import { StringChain } from "./string/StringChain.ts";
import { Utils } from "../Utils.ts";
import { EnumField } from "./enum/EnumField.ts";

export abstract class FieldFactory {
    public abstract any(): AnyChain;
    public abstract array(): ArrayChain;
    public abstract boolean(): BooleanChain;
    public abstract date(): DateChain;
    public abstract number(): NumberChain;
    public abstract object(): ObjectChain;
    public abstract schema(schema: Schema): SchemaChain;
    public abstract string(): StringChain;

    public abstract enum(structure: Record<string, unknown>): EnumField;
    public abstract immutable(value: unknown): AnyChain;
    public abstract mutable(value: unknown): AnyChain;

    //todo: add all other methods?

    public coerce(value: unknown): Field {
        if (value instanceof Field) {
            return value;
        }
        else if (Utils.isPlainObject(value)) {
            return this.schema(value as Schema);
        }
        else if (Array.isArray(value)) {
            return this.array().tuple(value);
        }
        else {
            return this.immutable(value);
        }
    }
}