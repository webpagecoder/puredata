
'use strict';

import { Path } from '../../../Path.ts';
import { Field, FieldConfig, FieldCtorParams } from '../../Field.ts';
import { FieldFactory } from '../../FieldFactory.ts';
import { SchemaChain } from '../SchemaChain.ts';
import { ConditionalProcessor } from './ConditionalProcessor.ts';

/** A conditional field joined to the preceding condition with a boolean operator. */
export type ConditionalChainEntry = ['and' | 'or', ConditionalField];

/** Configuration for a conditional field and its result branches. */
export type ConditionalFieldProps = FieldConfig & {
    fieldFactory: FieldFactory;
    schemaChain: SchemaChain;
    buildStage: number;
    comparisonMode: 'equals' | 'notEquals';
    comparisonField: Field;
    conditionalChain: ConditionalChainEntry[];
    otherwiseField: null | Field;
    thenField: null | Field;
} & ({
    targetPath: Path;
    targetPathStr: never,
} | {
    targetPath: never;
    targetPathStr: string,
});

/** Constructor options for a conditional field. */
export type ConditionalFieldCtorParams = FieldCtorParams & Partial<ConditionalFieldProps>;

/** Field whose result depends on comparing values at a target path. */
class ConditionalField extends Field<ConditionalFieldProps> {
    /**
     * Creates a conditional field from a target path and comparison field.
     *
     * @param args Target, comparison, result-branch, and factory settings.
     * @throws {@link Error} If required conditional settings are missing.
     */
    public constructor(args: Partial<ConditionalFieldCtorParams> = {}) {
        super(args);

        const {
            fieldFactory,
            buildStage = 0,
            comparisonMode = 'equals',
            comparisonField,
            thenField = null,
            otherwiseField = null,
            conditionalChain = [],
            targetPath,
            targetPathStr,
        } = args;

        if (!fieldFactory || !(fieldFactory instanceof FieldFactory)) {
            throw new Error('ConditionalField requires a fieldFactory to be provided in the constructor arguments');
        }
        if (!comparisonField || !(comparisonField instanceof Field)) {
            throw new Error('comparisonField value required');
        }
        if (!targetPath && !targetPathStr) {
            throw new Error('Must supply either targetPath or targetPathStr');
        }

        const { config } = this;
        config.fieldFactory = fieldFactory;
        config.buildStage = buildStage;
        config.comparisonMode = comparisonMode;
        config.comparisonField = fieldFactory.coerce(comparisonField);
        config.thenField = thenField
            ? fieldFactory.coerce(thenField)
            : null;
        config.otherwiseField = otherwiseField
            ? fieldFactory.coerce(otherwiseField)
            : null;
        config.conditionalChain = [...conditionalChain];
        config.targetPath = new Path(targetPathStr || targetPath || '');

        this.config.presence = 'optional';
    }

    /** Clones the field and reparses a supplied target path. */
    public override clone(args: Partial<ConditionalFieldCtorParams> = {}): this {
        const clone = super.clone(args);
        if (args.targetPathStr !== undefined) {
            clone.config.targetPath = new Path(args.targetPathStr);
        }
        return clone;
    }

    /** Creates the processor that evaluates the condition and its result branches. */
    public override createProcessor(): ConditionalProcessor {
        return new ConditionalProcessor({
            field: this,
        });
    }

    /**
     * Adds an OR condition to this conditional chain.
     *
     * @param targetPathStr Path to compare, or a conditional field to append.
     * @param comparisonField Field used when a target path is supplied.
     * @returns A cloned conditional field with the condition appended.
     */
    public or(targetPathStr: string, comparisonField: Field): this;
    public or(conditionalField: ConditionalField): this;
    public or(conditionalFieldOrTargetPathStr: ConditionalField | string, comparisonField: Field | null = null) {
        return this._addToConditionalChain('or', conditionalFieldOrTargetPathStr, comparisonField);
    }

    /**
     * Adds an AND condition to this conditional chain.
     *
     * @param targetPathStr Path to compare, or a conditional field to append.
     * @param comparisonField Field used when a target path is supplied.
     * @returns A cloned conditional field with the condition appended.
     */
    public and(targetPathStr: string, comparisonField: Field): this;
    public and(conditionalField: ConditionalField): this;
    public and(conditionalFieldOrTargetPathStr: ConditionalField | string, comparisonField: Field | null = null) {
        return this._addToConditionalChain('and', conditionalFieldOrTargetPathStr, comparisonField);
    }

    private _addToConditionalChain(
        type: 'and' | 'or',
        conditionalFieldOrTargetPathStr: ConditionalField | string,
        comparisonField: Field | null = null
    ) {
        const { buildStage, comparisonMode, conditionalChain, fieldFactory } = this.config;
        if (buildStage !== 0) {
            throw new Error(`Illegal placement of "${type}" in condition chain`);
        }
        const isConditionalField = conditionalFieldOrTargetPathStr instanceof ConditionalField;
        if (!isConditionalField && !(comparisonField instanceof Field)) {
            throw new Error('Must supply a comparison field along with the path string');
        }

        const newEntry = isConditionalField
            ? conditionalFieldOrTargetPathStr
            : new ConditionalField({
                fieldFactory,
                comparisonField: comparisonField!,
                comparisonMode,
                targetPathStr: conditionalFieldOrTargetPathStr,
            });

        return this.clone({
            conditionalChain: conditionalChain.concat([[type, newEntry]])
        });
    }

    /**
     * Configures the field to use when the condition passes.
     *
     * @param thenResult Result value or field for the passing condition.
     * @returns A cloned conditional field with the passing branch configured.
     */
    public then(thenResult: unknown | Field) {
        const { buildStage, fieldFactory } = this.config;
        if (buildStage !== 0) {
            throw new Error('Illegal placement of "then" in condition chain');
        }
        return this.clone({
            thenField: fieldFactory.coerce(thenResult),
            buildStage: 1
        });
    }

    /**
     * Configures the field to use when the condition fails.
     *
     * @param otherwiseResult Result value or field for the failing condition.
     * @returns A cloned conditional field with the failing branch configured.
     */
    public otherwise(otherwiseResult: unknown | Field) {
        const { buildStage, fieldFactory } = this.config;
        if (buildStage !== 1) {
            throw new Error('Illegal placement of "otherwise" in condition chain');
        }
        return this.clone({
            otherwiseField: fieldFactory.coerce(otherwiseResult),
            buildStage: 2
        });
    }

}

export { ConditionalField };
