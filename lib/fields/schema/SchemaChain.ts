'use strict';

import { FieldFactory } from '../FieldFactory.ts';
import { AnyChain } from '../any/AnyChain.ts';
import { ArrayChain } from '../array/ArrayChain.ts';
import { Field } from '../Field.ts';
import { ObjectChain, ObjectChainConfig, ObjectChainCtorParams } from '../object/ObjectChain.ts';
import { ObjectHandler } from '../object/ObjectHandler.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';
import { Utils } from '../../Utils.ts';
import { GlobalConfig } from '../../GlobalConfig.ts';

/** Object describing fields in a schema. */
export type Schema = {
    [key: string]: unknown;
};

/** Schema keys mapped to their compiled field definitions. */
export type SchemaFields = {
    [key: string]: Field;
};

/** Configuration for a schema chain. */
export type SchemaChainConfig = ObjectChainConfig & {
    anyChain: AnyChain,
    arrayChain: ArrayChain,
    failFast: boolean;
    fieldFactory: FieldFactory;
    renameKeysArgs: Parameters<ObjectHandler['renameKeys']> | null;
    schemaFields: SchemaFields;
    stripExtraKeys: boolean;
};

/** Constructor options for a schema chain. */
export type SchemaChainCtorParams = ObjectChainCtorParams<SchemaChainConfig> & {
    schema?: Schema;
};

/** Field chain that validates an object against a nested schema. */
class SchemaChain extends ObjectChain<SchemaChainCtorParams> {

    /**
     * Creates a schema chain and converts schema entries to fields.
     *
     * @param args Schema and chain configuration.
     * @throws {@link Error} If no field factory is supplied.
     */
    public constructor(args: Partial<SchemaChainCtorParams> = {}) {
        const finalArgs = Object.assign(
            {},
            GlobalConfig.general,
            GlobalConfig.fields.schema,
            args
        ) as SchemaChainCtorParams;

        super(finalArgs);

        const {
            fieldFactory,
            failFast,
            renameKeysArgs,
            schema = {},
            stripExtraKeys,
        } = finalArgs;

        if (!fieldFactory) {
            throw new Error('SchemaChain requires a fieldFactory to be provided in the constructor arguments');
        }

        const { config } = this;
        config.clone = true;
        config.plainOnly = true;
        config.failFast = failFast;
        config.fieldFactory = fieldFactory;
        config.renameKeysArgs = renameKeysArgs;
        config.stripExtraKeys = stripExtraKeys;
        config.schemaFields = this._processSchema(schema) || {};
    }

    /** Clones this chain and optionally replaces its schema. */
    public override clone(args: Partial<SchemaChainCtorParams> = {}): this {
        const clone = super.clone(args);
        const { schema = null } = args;
        if (schema) {
            clone.config.schemaFields = this._processSchema(schema);
        }
        return clone;
    }

    /** Creates the processor that compiles and validates this schema. */
    public override createProcessor(): SchemaProcessor {
        return new SchemaProcessor({
            field: this,
        });
    }

    /** Converts each schema entry into a field or nested schema chain. */
    private _processSchema(schema: Schema): SchemaFields {
        const schemaFields: SchemaFields = {};
        for (const key of Object.keys(schema)) {
            const value = schema[key];
            if (Utils.isPlainObject(value)) {
                schemaFields[key] = this.clone({
                    schema: value as Schema,
                });
            }
            else {
                schemaFields[key] = this.config.fieldFactory.coerce(value);
            }
        }
        return schemaFields;
    }

    // Configurators

    /**
     * Configures whether validation stops after the first error.
     *
     * @param failFast Whether to stop processing after the first error.
     * @returns A cloned schema chain with the updated setting.
     */
    public failFast(failFast = true) {
        return this.clone({ failFast });
    }

    /**
     * Configures whether keys not declared in the schema are removed.
     *
     * @param stripExtraKeys Whether to remove undeclared keys.
     * @returns A cloned schema chain with the updated setting.
     */
    public stripExtraKeys(stripExtraKeys = true) {
        return this.clone({ stripExtraKeys });
    }
}

export { SchemaChain };
