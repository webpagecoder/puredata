'use strict';

import { Utils } from '../utils/Utils.ts';
import { Field } from './Field.ts';
import { ValueField } from './ValueField.ts';
import { ArrayChain } from './ArrayChain.ts';
import { ObjectChain, ObjectChainProps, ResolvedObjectChainProps } from './ObjectChain.ts';
import { ChainProps } from './Chain copy.ts';
import { ObjectHandler } from '../handlers/ObjectHandler.ts';
import { ArrayHandler } from '../handlers/ArrayHandler.ts';

// type SchemaChainProps = ObjectChainProps & {
//     schema?: Record<string, unknown>;
// };
type ResolvedSchemaChainProps = ResolvedObjectChainProps & {
    schema: Record<string, unknown>;
};
type DescriptionBuilder = {
    setChild(key: string, child: unknown): void;
};

export type Schema = {
    [key: string]: Schema | unknown;
};


export type SchemaChainProps = ObjectChainProps & {
    schema?: Schema;
    stripUnknownKeys?: boolean;
    renameKeysArgs?: Parameters<typeof ObjectHandler['renameKeys']>;
};

class SchemaChain extends ObjectChain<SchemaChainProps> {
    protected _schema: Map<string, Field>;
    protected _stripUnknownKeys: boolean;
    protected _renameKeysArgs: Parameters<typeof ObjectHandler['renameKeys']> | null;

    constructor(props: SchemaChainProps) {
        super(props);

        const {
            schema = {},
            stripUnknownKeys = true,
            renameKeysArgs = null,
        } = props;

        this._cloneObject = true;
        this._ensurePlain = true;
        this._stripUnknownKeys = stripUnknownKeys;
        this._renameKeysArgs = renameKeysArgs;
        this._schema = this._createSchemaMap(schema);
    }

    public override clone(props: Partial<SchemaChainProps> = {}): this {
        const clone = super.clone(props);
        const {
            schema,
            stripUnknownKeys = this._stripUnknownKeys,
            renameKeysArgs = this._renameKeysArgs,
        } = props;

        clone._schema = schema ? this._createSchemaMap(schema) : this._schema;
        clone._stripUnknownKeys = stripUnknownKeys;
        clone._renameKeysArgs = renameKeysArgs;
        return clone;
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
                field = new ArrayChain({
                    chainHandler: ArrayHandler, //todo - this is a bit hacky, we should probably have a way to specify the chain handler to use for nested schemas instead of hardcoding ArrayChain here
                    locale: this._locale,
                    processorMapper: this._processorMapper,
                }).tuple(value) as Field;
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

    public configRenameKeys(renameKeysArgs: Parameters<typeof ObjectHandler['renameKeys']>): this {
        return this.clone({ renameKeysArgs });
    }

    public get stripUnknownKeys(): boolean {
        return this._stripUnknownKeys;
    }

    public get renameKeysArgs(): Parameters<typeof ObjectHandler['renameKeys']> | null {
        return this._renameKeysArgs;
    }

}

export { SchemaChain };

