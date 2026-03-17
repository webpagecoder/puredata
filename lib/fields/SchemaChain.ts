'use strict';

import { Utils } from '../utils/Utils.ts';
import { Field } from './Field.ts';
import { ValueField } from './ValueField.ts';
import { ArrayChain } from './ArrayChain.ts';
import { ObjectChain, ObjectChainProps, ResolvedObjectChainProps } from './ObjectChain.ts';

type SchemaChainProps = ObjectChainProps & {
    structure?: Record<string, unknown>;
};
type ResolvedSchemaChainProps = ResolvedObjectChainProps & {
    structure: Record<string, unknown>;
};
type DescriptionBuilder = {
    setChild(key: string, child: unknown): void;
};

class SchemaChain extends ObjectChain {

    declare props: ResolvedSchemaChainProps & {
        clone: boolean;
        ensurePlain: boolean;
        schema: Map<string, Field>;
        stripUnknownKeys?: boolean;
    };

    constructor(props: SchemaChainProps = {}) {
        super(props);

        let {
            compilationMapper,
            locale,
            structure = {},
        } = props;

        const schema = new Map<string, Field>();
        for (const key of Object.keys(structure)) {
            let value = structure[key];
            let field: Field;

            if (value instanceof Field) {
                field = value;
            }
            else if (Utils.isPlainObject(value)) {
                field = new SchemaChain({
                    compilationMapper,
                    locale,
                    structure: value as Record<string, unknown>
                });
            }
            else if (Array.isArray(value)) {
                field = new ArrayChain({
                    compilationMapper,
                    locale
                }).tuple(value) as Field;
            }
            else {
                field = new ValueField({
                    compilationMapper,
                    locale,
                    value
                });
            }
            schema.set(key, field);
        }

        this.props.clone = true;
        this.props.ensurePlain = true;
        this.props.schema = schema;
    }

    get schema(): Map<string, Field> {
        return this.props.schema;
    }

    // Configurators

    configStripUnknownKeys(stripUnknownKeys: boolean = true): this {
        return this.setProps({ stripUnknownKeys });
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

