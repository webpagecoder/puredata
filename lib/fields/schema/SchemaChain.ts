'use strict';

import { Utils } from '../../Utils.ts';
import { AnyChain } from '../any/AnyChain.ts';
import { ArrayChain } from '../array/ArrayChain.ts';
import { Field } from '../Field.ts';
import { ObjectChain, ObjectChainConfig, ObjectChainCtorParams } from '../object/ObjectChain.ts';
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
            anyChain,
            arrayChain,
            failOnFirstError = false,
            renameKeysArgs = null,
            schema = {},
            stripExtraKeys = true,
        } = args;

        if(!anyChain || !(anyChain instanceof AnyChain)) {
            throw new Error('anyChain value required');
        }
        if(!arrayChain || !(arrayChain instanceof ArrayChain)) {
            throw new Error('arrayChain value required');
        }

        const { config } = this;
        config.anyChain = anyChain.clearChain();
        config.arrayChain = arrayChain.clearChain();
        config.cloneObject = true;
        config.ensurePlain = true;
        config.failOnFirstError = failOnFirstError;
        config.stripExtraKeys = stripExtraKeys;
        config.renameKeysArgs = renameKeysArgs;
        config.schemaMap = this._createSchemaMap(schema) || new Map() as SchemaMap;
    }

    public override clone(args: Partial<SchemaChainCtorParams> = {}): this {
        const clone = super.clone(args);
        const { schema = null } = args;
        if (schema) {
            clone.config.schemaMap = this._createSchemaMap(schema);
        }
        return clone;
    }

    // public override createProcessor() {
    //     return new SchemaProcessor({
    //         field: this,
    //     });
    // }

    public override createProcessor(): SchemaProcessor {
        return new SchemaProcessor({
            field: this,
        });
    }

    private _createSchemaMap(schema: SchemaObject): SchemaMap {
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
                field = this.config.arrayChain.tuple(value);
            }
            else {
                field = this.config.anyChain.clone().default(value);
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

