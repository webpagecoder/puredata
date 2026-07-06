'use strict';

import { Utils } from '../../Utils.ts';
import { ArrayChain } from '../array/ArrayChain.ts';
import { ArrayHandler } from '../array/ArrayHandler.ts';
import { Field } from '../Field.ts';
import { ObjectChain, ObjectChainCtorParams, ObjectChainProps } from '../object/ObjectChain.ts';
import { ObjectHandler } from '../object/ObjectHandler.ts';
import { ValueField } from '../value/ValueField.ts';

export type SchemaObject = {
    [key: string]: SchemaObject | unknown;
};

export type SchemaMap = Map<string, Field>;

export type SchemaChainProps = ObjectChainProps & {
    arrayChain: ArrayChain;
    failOnFirstError: boolean;
    renameKeysArgs: Parameters<ObjectHandler['renameKeys']> | null;
    schemaMap: SchemaMap;
    stripUnknownKeys: boolean;
};

export type SchemaChainCtorParams = ObjectChainCtorParams<SchemaChainProps> & {
    schema?: SchemaObject;
};

export type SchemaChainCloneParams = Partial<SchemaChainCtorParams>;

class SchemaChain extends ObjectChain<SchemaChainProps> {

    constructor(args: SchemaChainCtorParams) {
        super(args);

        const {
            arrayChain = new ArrayChain({
                chainHandlerCtor: ArrayHandler,
                errorMessages: this._errorMessages,
                fieldProcessorMap: this._fieldProcessorMap,
                pathDelims: this._pathDelims,
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

    public override clone(args: SchemaChainCloneParams = {}): this {
        const clone = super.clone(args);
        const {
            schema = null
        } = args;
        if (schema) {
            clone.props.schemaMap = this._createSchemaMap(schema);
        }
        return clone;
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
                field = this.props.arrayChain.tuple(value);
            }
            else {
                field = new ValueField({
                    errorMessages: this._errorMessages,
                    fieldProcessorMap: this._fieldProcessorMap,
                    pathDelims: this._pathDelims,
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

