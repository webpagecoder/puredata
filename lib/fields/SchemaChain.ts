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
};

class SchemaChain extends ObjectChain {
    protected _schema: Map<string, Field>;
    protected _stripUnknownKeys: boolean;

    constructor(props: SchemaChainProps) {
        super(props);

        const {
            schema = {},
            stripUnknownKeys = true,
        } = props;

        this._cloneObject = true;
        this._ensurePlain = true;
        this._stripUnknownKeys = stripUnknownKeys;
        this._schema = this._createSchemaMap(schema);
    }

    public override clone(props: Partial<SchemaChainProps> = {}): this {
        const clone = super.clone(props);
        const {
            schema,
            stripUnknownKeys = this._stripUnknownKeys,
        } = props;

        clone._schema = schema ? this._createSchemaMap(schema) : this._schema;
        clone._stripUnknownKeys = stripUnknownKeys;
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

    // getRawDescription(): DescriptionBuilder {
    //     // @ts-ignore - getRawDescription will be defined on parent when fully typed
    //     const builder: DescriptionBuilder = super.getRawDescription();

    //     for (const [key, field] of this.props.schema) {
    //         // @ts-ignore - getRawDescription will be defined on Field when fully typed
    //         builder.setChild(key, field.getRawDescription());
    //     }

    //     return builder;
    // }

}

export { SchemaChain };

