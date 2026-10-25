'use strict';

import { FieldFactory } from '../FieldFactory.ts';
import { AnyChain } from '../any/AnyChain.ts';
import { ArrayChain } from '../array/ArrayChain.ts';
import { Field } from '../Field.ts';
import { ObjectChain, ObjectChainConfig, ObjectChainCtorParams } from '../object/ObjectChain.ts';
import { ObjectHandler } from '../object/ObjectHandler.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';
import { Utils } from '../../Utils.ts';

export type Schema = {
    [key: string]: unknown;
};

export type SchemaFields = {
    [key: string]: Field;
};

export type SchemaChainConfig = ObjectChainConfig & {
    anyChain: AnyChain,
    arrayChain: ArrayChain,
    failOnFirstError: boolean;
    fieldFactory: FieldFactory;
    renameKeysArgs: Parameters<ObjectHandler['renameKeys']> | null;
    schemaFields: SchemaFields;
    stripExtraKeys: boolean;
};

export type SchemaChainCtorParams = ObjectChainCtorParams<SchemaChainConfig> & {
    schema?: Schema;
};

class SchemaChain extends ObjectChain<SchemaChainCtorParams> {

    public constructor(args: Partial<SchemaChainCtorParams> = {}) {
        super(args);

        const {
            fieldFactory,
            failOnFirstError = false,
            renameKeysArgs = null,
            schema = {},
            stripExtraKeys = true,
        } = args;

        if (!fieldFactory) {
            throw new Error('SchemaChain requires a fieldFactory to be provided in the constructor arguments');
        }

        const { config } = this;
        config.cloneObject = true;
        config.ensurePlain = true;
        config.failOnFirstError = failOnFirstError;
        config.fieldFactory = fieldFactory;
        config.renameKeysArgs = renameKeysArgs;
        config.stripExtraKeys = stripExtraKeys;
        config.schemaFields = this._processSchema(schema) || {};
    }

    public override clone(args: Partial<SchemaChainCtorParams> = {}): this {
        const clone = super.clone(args);
        const { schema = null } = args;
        if (schema) {
            clone.config.schemaFields = this._processSchema(schema);
        }
        return clone;
    }

    public override createProcessor(): SchemaProcessor {
        return new SchemaProcessor({
            field: this,
        });
    }

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

}

export { SchemaChain };

