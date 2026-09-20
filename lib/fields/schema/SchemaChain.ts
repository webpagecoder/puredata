'use strict';

import { Utils } from '../../Utils.ts';
import { AnyChain, AnyChainCtorParams } from '../any/AnyChain.ts';
import { AnyHandler } from '../any/AnyHandler.ts';
import { ArrayChain, ArrayChainCtorParams } from '../array/ArrayChain.ts';
import { ArrayHandler } from '../array/ArrayHandler.ts';
import { Field } from '../Field.ts';
import { ObjectChain, ObjectChainCtorParams, ObjectChainConfig } from '../object/ObjectChain.ts';
import { ObjectHandler } from '../object/ObjectHandler.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';

export type SchemaObject = {
    [key: string]: SchemaObject | unknown;
};

export type SchemaMap = Map<string, Field>;

export type SchemaChainConfig = ObjectChainConfig & {
    anyChain: AnyChain;
    arrayChain: ArrayChain;
    failOnFirstError: boolean;
    renameKeysArgs: Parameters<ObjectHandler['renameKeys']> | null;
    schemaMap: SchemaMap;
    stripExtraKeys: boolean;
};

export type SchemaChainCtorParams = ObjectChainCtorParams<SchemaChainConfig> & {
    schema?: SchemaObject;
};

class SchemaChain extends ObjectChain<SchemaChainCtorParams> {

    constructor(args: Partial<SchemaChainCtorParams> = {}) {
        super(args);

        const {
            anyChain = new AnyChain(),
            arrayChain,
            failOnFirstError = false,
            renameKeysArgs = null,
            schema = {},
            stripExtraKeys = true,
        } = args;

        if(!anyChain || !(anyChain instanceof AnyChain)) {
            throw new Error('SchemaChain requires a valid AnyChain instance');
        }
        if(!arrayChain || !(arrayChain instanceof ArrayChain)) {
            throw new Error('SchemaChain requires a valid ArrayChain instance');
        }

        const { _config } = this;
        _config.anyChain = anyChain.clearChain();
        _config.arrayChain = arrayChain.clearChain();
        _config.cloneObject = true;
        _config.ensurePlain = true;
        _config.failOnFirstError = failOnFirstError;
        _config.stripExtraKeys = stripExtraKeys;
        _config.renameKeysArgs = renameKeysArgs;
        _config.schemaMap = this._createSchemaMap(schema) || new Map() as SchemaMap;
    }

    public override clone(args: Partial<SchemaChainCtorParams> = {}): this {
        const clone = super.clone(args);
        const { schema = null } = args;
        if (schema) {
            clone._config.schemaMap = this._createSchemaMap(schema);
        }
        return clone;
    }

    public override createProcessor(): SchemaProcessor {
        return new SchemaProcessor({
            field: this,
        });
    }

    protected _createSchemaMap(schema: SchemaObject): SchemaMap {
        const schemaMap = new Map<string, Field>();
        for (const key of Object.keys(schema)) {
            let value = schema[key];
            let field: Field;

            if (value instanceof Field) {
                field = value;
            }
            else if (Utils.isPlainObject(value)) {
                field = this.clone({
                    schema: value as SchemaObject
                });
            }
            else if (Array.isArray(value)) {
                field = this._config.arrayChain.tuple(value);
            }
            else {
                field = this._config.anyChain.clone().default(value);
            }
            schemaMap.set(key, field);
        }
        return schemaMap;
    }

    // Configurators

    public configStripUnknownKeys(stripExtraKeys: boolean = true): this {
        return this.clone({ stripExtraKeys });
    }

    public configRenameKeys(renameKeysArgs: Parameters<ObjectHandler['renameKeys']>): this {
        return this.clone({ renameKeysArgs });
    }

}

export { SchemaChain };

