'use strict';

import { Utils } from '../../Utils.ts';
import { ArrayChain } from '../array/ArrayChain.ts';
import { ArrayHandler } from '../array/ArrayHandler.ts';
import { Field } from '../Field.ts';
import { ObjectChain, ObjectChainCtorParams, ObjectChainConfig } from '../object/ObjectChain.ts';
import { ObjectHandler } from '../object/ObjectHandler.ts';
import { ValueField } from '../value/ValueField.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';

export type SchemaObject = {
    [key: string]: SchemaObject | unknown;
};

export type SchemaMap = Map<string, Field>;

export type SchemaChainConfig = ObjectChainConfig & {
    arrayChain: ArrayChain;
    failOnFirstError: boolean;
    renameKeysArgs: Parameters<ObjectHandler['renameKeys']> | null;
    schemaMap: SchemaMap;
    stripUnknownKeys: boolean;
};

export type SchemaChainCtorParams = ObjectChainCtorParams<SchemaChainConfig> & {
    schema?: SchemaObject;
};

class SchemaChain extends ObjectChain<SchemaChainCtorParams> {

    constructor(args: Partial<SchemaChainCtorParams> = {}) {
        super(args);

        const {
            arrayChain = new ArrayChain({
                chainHandlerCtor: ArrayHandler,
                errorMessages: this._config.errorMessages,
                pathDelims: this._config.pathDelims,
            }),
            failOnFirstError = false,
            renameKeysArgs = null,
            schema = {},
            stripUnknownKeys = true,
        } = args;

        const { props } = this;
        props.arrayChain = arrayChain;
        props.cloneObject = true;
        props.ensurePlain = true;
        props.failOnFirstError = failOnFirstError;
        props.stripUnknownKeys = stripUnknownKeys;
        props.renameKeysArgs = renameKeysArgs;
        props.schemaMap = this._createSchemaMap(schema) || new Map() as SchemaMap;
    }

    public override clone(args: Partial<SchemaChainCtorParams> = {}): this {
        const clone = super.clone(args);
        const {
            schema = null
        } = args;
        if (schema) {
            clone.props.schemaMap = this._createSchemaMap(schema);
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
                field = new ValueField({
                    errorMessages: this._config.errorMessages,
                    pathDelims: this._config.pathDelims,
                    value
                });
            }
            schemaMap.set(key, field);
        }
        return schemaMap;
    }

    // Configurators

    public configStripUnknownKeys(stripUnknownKeys: boolean = true): this {
        return this.clone({ stripUnknownKeys });
    }

    public configRenameKeys(renameKeysArgs: Parameters<ObjectHandler['renameKeys']>): this {
        return this.clone({ renameKeysArgs });
    }

}

export { SchemaChain };

