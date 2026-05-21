'use strict';

import { ArrayHandler } from '../handlers/ArrayHandler.ts';
import { ObjectHandler } from '../handlers/ObjectHandler.ts';
import { Overwrite } from '../types.ts';
import { Utils } from '../Utils.ts';
import { ArrayChain } from './ArrayChain.ts';
import { ChainCloneParams, ChainConfig } from './Chain.ts';
import { Field } from './Field.ts';
import { ObjectChain, ObjectChainConfig, ObjectChainConstructorParams } from './ObjectChain.ts';
import { ValueField } from './ValueField.ts';

export type Schema = {
    [key: string]: Schema | unknown;
};

export type SchemaChainConfig = Overwrite<ObjectChainConfig, {
    arrayChain?: ArrayChain;
    renameKeysArgs?: Parameters<ObjectHandler['renameKeys']>;
    schema?: Schema;
    stripUnknownKeys?: boolean;
}>;

export type SchemaChainConstructorParams = ObjectChainConstructorParams<SchemaChainConfig>;

class SchemaChain extends ObjectChain {


    constructor(args: SchemaChainConstructorParams) {
        super(args);

        const {
            arrayChain = new ArrayChain({
                chainHandler: new ArrayHandler(),
                locale: this._locale,
                processorMapper: this._processorMapper,
            }),
            renameKeysArgs = null,
            schema = {},
            stripUnknownKeys = true,
        } = args;

        const config = this._config;
        config.arrayChain = arrayChain;
        config.cloneObject = true;
        config.ensurePlain = true;
        config.stripUnknownKeys = stripUnknownKeys;
        config.renameKeysArgs = renameKeysArgs;
        config.schema = this._createSchemaMap(schema);
    }

    protected _createSchemaMap(schema: Schema): Map<string, Field> {
        const schemaMap = new Map<string, Field>();
        for (const key of Object.keys(schema)) {
            let value = schema[key];
            let field: Field;

            if (value instanceof Field) {
                field = value;
            }
            else if (Utils.isPlainObject(value)) {
                field = this.clone({
                    schema: value as Schema
                });
            }
            else if (Array.isArray(value)) {
                field = this._arrayChain.tuple(value) as Field;
            }
            else {
                field = new ValueField({
                    locale: this._locale,
                    processorMapper: this._processorMapper,
                    value
                });
            }
            schemaMap.set(key, field);
        }
        return schemaMap;
    }

    public get schema(): Map<string, Field> {
        return this._schema;
    }

    // Configurators

    public configStripUnknownKeys(stripUnknownKeys: boolean = true): this {
        return this.clone({ stripUnknownKeys });
    }

    public configRenameKeys(renameKeysArgs: Parameters<ObjectHandler['renameKeys']>): this {
        return this.clone({ renameKeysArgs });
    }

    public get stripUnknownKeys(): boolean {
        return this._stripUnknownKeys;
    }

    public get renameKeysArgs(): Parameters<ObjectHandler['renameKeys']> | null {
        return this._renameKeysArgs;
    }

}

export { SchemaChain };

