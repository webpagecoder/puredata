'use strict';

import { ArrayHandler } from '../handlers/ArrayHandler.ts';
import { ObjectHandler } from '../handlers/ObjectHandler.ts';
import { Overwrite } from '../types.ts';
import { Utils } from '../Utils.ts';
import { ArrayChain } from './ArrayChain.ts';
import { Field } from './Field.ts';
import { ObjectChain, ObjectChainProps, ObjectChainConstructorParams } from './ObjectChain.ts';
import { ValueField } from './ValueField.ts';

export type SchemaObject = {
    [key: string]: SchemaObject | unknown;
};

export type SchemaMap = Map<string, Field>;

export type SchemaChainProps = Overwrite<ObjectChainProps, {
    arrayChain: ArrayChain;
    failOnFirstError: boolean;
    renameKeysArgs: Parameters<ObjectHandler['renameKeys']> | null;
    schemaMap: SchemaMap;
    stripUnknownKeys: boolean;
}>;

export type SchemaChainConstructorParams = ObjectChainConstructorParams<SchemaChainProps> & {
    schema?: SchemaObject;
};

export type SchemaChainCloneParams = Partial<SchemaChainConstructorParams>;
    
class SchemaChain extends ObjectChain<SchemaChainProps> {

    constructor(args: SchemaChainConstructorParams) {
        super(args);

        const {
            arrayChain = new ArrayChain({
                chainHandler: new ArrayHandler(),
                locale: this._locale,
                pathFactory: this._pathFactory,
                processorMapper: this._processorMapper,
            }),
            failOnFirstError = false,
            renameKeysArgs = null,
            schema = {},
            stripUnknownKeys = true,
        } = args;

        const { extendedProps: props } = this;
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
            clone.extendedProps.schemaMap = this._createSchemaMap(schema);
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
                field = this.extendedProps.arrayChain.tuple(value);
            }
            else {
                field = new ValueField({
                    locale: this._locale,
                    pathFactory: this._pathFactory,
                    processorMapper: this._processorMapper,
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

