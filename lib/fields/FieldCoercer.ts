'use strict';

import { Utils } from "../Utils.ts";
import { AnyChain } from "./any/AnyChain.ts";
import { ArrayChain } from "./array/ArrayChain.ts";
import { Field } from "./Field.ts";
import { Schema, SchemaChain } from "./schema/SchemaChain.ts";

export type FieldCoercerCtorParams = {
    value: unknown;
    anyChain: AnyChain;
    arrayChain: ArrayChain;
    schemaChain: SchemaChain;
}

class FieldCoercer {

    public static coerce({
        value,
        anyChain,
        arrayChain,
        schemaChain,
    }: FieldCoercerCtorParams
    ): Field {
        if (value instanceof Field) {
            return value;
        }
        else if (Utils.isPlainObject(value)) {
            return schemaChain.clearChain().clone({
                schema: value as Schema
            });
        }
        else if (Array.isArray(value)) {
            return arrayChain.clearChain().tuple(value);
        }
        else {
            return anyChain.clearChain().default(value);
        }
    }
}

export { FieldCoercer };