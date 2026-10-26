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

/** Abstract factory interface for creating field definitions and chains. */
export abstract class FieldFactory {
    /** Creates a chain for values of any type. */
    public abstract any(): AnyChain;
    /** Creates a chain for array values. */
    public abstract array(): ArrayChain;
    /** Creates a chain for boolean values. */
    public abstract boolean(): BooleanChain;
    /** Creates a chain for date values. */
    public abstract date(): DateChain;
    /** Creates a chain for numeric values. */
    public abstract number(): NumberChain;
    /** Creates a chain for object values. */
    public abstract object(): ObjectChain;
    /** Creates a schema chain from a field schema. */
    public abstract schema(schema: Schema): SchemaChain;
    /** Creates a chain for string values. */
    public abstract string(): StringChain;

    /** Creates an enumeration field from an allowed-value structure. */
    public abstract enum(structure: Record<string, unknown>): EnumField;
    /** Creates a field that rejects user changes to its default value. */
    public abstract immutable(value: unknown): AnyChain;
    /** Creates a field with a default value that remains user-editable. */
    public abstract mutable(value: unknown): AnyChain;

    //todo: add all other methods?

    /**
     * Infers a field definition from a supplied value.
     *
     * Existing fields are returned unchanged, objects become schema fields,
     * arrays become tuple fields, and other values become immutable fields.
     *
     * @param value Value from which to infer a field.
     * @returns The inferred field definition.
     */
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