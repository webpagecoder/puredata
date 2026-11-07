'use strict';

import { Utils } from '../../Utils.ts';
import { Field } from '../Field.ts';
import { FieldFactory } from '../FieldFactory.ts';
import { ObjectChain, ObjectChainConfig, ObjectChainCtorParams } from '../object/ObjectChain.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';

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
    failFast: boolean;
    fieldFactory: FieldFactory;
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
        super(args);

        const {
            fieldFactory,
            failFast = false,
            schema = {},
            stripExtraKeys = true,
        } = args;

        if (!fieldFactory) {
            throw new Error('SchemaChain requires a fieldFactory to be provided in the constructor arguments');
        }

        const { config } = this;
        config.clone = true;
        config.plainOnly = true;
        config.failFast = failFast;
        config.fieldFactory = fieldFactory;
        config.stripExtraKeys = stripExtraKeys;
        config.schemaFields = this._processSchema(schema) || {};
    }

    // ========================================
    // Cloning
    // ========================================

    /**
     * Clones this chain and optionally replaces its schema.
     *
     * @param args Configuration overrides for the cloned schema chain.
     * @returns Cloned schema chain with preserved or replaced schema fields.
     */
    public override clone(args: Partial<SchemaChainCtorParams> = {}): this {
        const clone = super.clone(args);
        const { schema } = args;
        if (schema) {
            clone.config.schemaFields = this._processSchema(schema || {});
        }
        else {
            clone.config.schemaFields = Object.assign({}, this.config.schemaFields);
        }
        return clone;
    }

    // ========================================
    // Processor wiring
    // ========================================

    /**
     * Creates the processor that compiles and validates this schema.
     *
     * @returns Processor configured for this schema chain.
     */
    public override createProcessor(): SchemaProcessor {
        return new SchemaProcessor({
            field: this,
        });
    }

    // ========================================
    // Schema processing
    // ========================================

    /**
     * Converts each schema entry into a field or nested schema chain.
     *
     * @param schema Raw schema object to transform into chain fields.
     * @returns Processed schema-field map used by the chain processor.
     */
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

    // ========================================
    // Configurators
    // ========================================

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

