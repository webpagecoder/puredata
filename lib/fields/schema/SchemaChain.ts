'use strict';

import { Utils } from '../../Utils.ts';
import { AnyChain } from '../any/AnyChain.ts';
import { ArrayChain } from '../array/ArrayChain.ts';
import { Field } from '../Field.ts';
import { FieldCoercer } from '../FieldCoercer.ts';
import { ObjectChain, ObjectChainConfig, ObjectChainCtorParams } from '../object/ObjectChain.ts';
import { ObjectHandler } from '../object/ObjectHandler.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';

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
    fieldCoercer: FieldCoercer;
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
            anyChain = new AnyChain(),
            arrayChain = new ArrayChain(),
            failOnFirstError = false,
            renameKeysArgs = null,
            schema = {},
            stripExtraKeys = true,
        } = args;

        const { config } = this;
        config.cloneObject = true;
        config.ensurePlain = true;

        config.anyChain = anyChain;
        config.arrayChain = arrayChain;

        config.failOnFirstError = failOnFirstError;
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
        const { anyChain, arrayChain } = this.config;
        for (const key of Object.keys(schema)) {
            schemaFields[key] = FieldCoercer.coerce({
                value: schema[key],
                anyChain,
                arrayChain,
                schemaChain: this,
            });
        }
        return schemaFields;
    }

    // Configurators

    // public configStripUnknownKeys(stripExtraKeys: boolean = true): this {
    //     return this.clone({ stripExtraKeys });
    // }

    // public configRenameKeys(renameKeysArgs: Parameters<ObjectHandler['renameKeys']>): this {
    //     return this.clone({ renameKeysArgs });
    // }

}

export { SchemaChain };

