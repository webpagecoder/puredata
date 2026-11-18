'use strict';

import { Utils } from '../../Utils.ts';
import { FieldFactory } from '../FieldFactory.ts';
import { ObjectChain, ObjectChainConfig, ObjectChainCtorParams } from '../object/ObjectChain.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';
import { FieldNode } from '../FieldNode.ts';
import { NodeTree } from '../../NodeTree.ts';
import { Field } from '../Field.ts';

/** Object describing fields in a schema. */
export type Schema = {
    [key: string]: Schema | Field | unknown;
};

/** Configuration for a schema chain. */
export type SchemaChainConfig = ObjectChainConfig & {
    failFast: boolean;
    fieldFactory: FieldFactory;
    fieldTree: NodeTree<Field>;
    stripExtraKeys: boolean;
};

/** Constructor options for a schema chain. */
export type SchemaChainCtorParams = ObjectChainCtorParams<SchemaChainConfig> & {
    schema?: Schema;
};


/** Field chain that validates an object against a nested schema. */
class SchemaChain extends ObjectChain<SchemaChainCtorParams> {

    /**
     * Creates a schema chain and converts schema entries to fields.
     *
     * @param args Schema and chain configuration.
     * @throws {@link Error} If no field factory is supplied.
     */
    public constructor(args: Partial<SchemaChainCtorParams> = {}) {
        super(args);

        const {
            fieldFactory,
            failFast = false,
            schema = {},
            stripExtraKeys = true,
        } = args;

        if (!fieldFactory) {
            throw new Error('SchemaChain requires a fieldFactory to be provided in the constructor arguments');
        }

        const { config } = this;
        config.cloneValue = true;
        config.plainOnly = true;
        config.failFast = failFast;
        config.fieldFactory = fieldFactory;
        config.stripExtraKeys = stripExtraKeys;
        config.fieldTree = new NodeTree<Field>();
        this._constructSchemaFields(config.fieldTree, schema);
    }

    // ========================================
    // Cloning
    // ========================================

    /**
     * Clones this chain and optionally replaces its schema.
     *
     * @param args Configuration overrides for the cloned schema chain.
     * @returns Cloned schema chain with preserved or replaced schema fields.
     */
    public override clone(args: Partial<SchemaChainCtorParams> = {}): this {
        const clone = super.clone(args);
        const { schema } = args;
        if (schema) {
            this._constructSchemaFields(clone.config.fieldTree, schema);
        }
        else {
            clone.config.fieldTree = Object.assign({}, this.config.fieldTree);//todo: get rid of this 
        }
        return clone;
    }

    // ========================================
    // Processor wiring
    // ========================================

    /**
     * Creates the processor that compiles and validates this schema.
     *
     * @returns Processor configured for this schema chain.
     */
    public override createProcessor(): SchemaProcessor {
        return new SchemaProcessor({
            field: this,
        });
    }

    // ========================================
    // Schema processing
    // ========================================

    /**
     * Converts each schema entry into a field or nested schema chain.
     *
     * @param fieldTree The parent schema to add the processed fields to.
     * @param schema Raw schema object to transform into chain fields.
     */
    private _constructSchemaFields(fieldTree: NodeTree<Field>, schema: Schema): void {
        for (const key of Object.keys(schema)) {
            const field = schema[key];
            if (Utils.isPlainObject(field)) {
                const nestedFields = new NodeTree<Field>();
                fieldTree.setChild(key, nestedFields);
                this._constructSchemaFields(nestedFields, field as Schema);
            }
            else {
                const coercedField = this.config.fieldFactory.coerce(field);

                fieldTree.setChild(key, coercedField);
            }
        }
    }

    // ========================================
    // Configurators
    // ========================================

    /**
     * Configures whether validation stops after the first error.
     *
     * @param failFast Whether to stop processing after the first error.
     * @returns A cloned schema chain with the updated setting.
     */
    public failFast(failFast = true) {
        return this.clone({ failFast });
    }

    /**
     * Configures whether keys not declared in the schema are removed.
     *
     * @param stripExtraKeys Whether to remove undeclared keys.
     * @returns A cloned schema chain with the updated setting.
     */
    public stripExtraKeys(stripExtraKeys = true) {
        return this.clone({ stripExtraKeys });
    }
}

export { SchemaChain };

