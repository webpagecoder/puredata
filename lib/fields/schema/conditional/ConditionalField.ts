
'use strict';

import { Path } from '../../../Path.ts';
import { AnyChain } from '../../any/AnyChain.ts';
import { ArrayChain } from '../../array/ArrayChain.ts';
import { Field, FieldCtorParams, FieldConfig } from '../../Field.ts';
import { FieldCoercer } from '../../FieldCoercer.ts';
import { SchemaChain } from '../SchemaChain.ts';
import { ConditionalProcessor } from './ConditionalProcessor.ts';

export type ConditionalChainEntry = ['and' | 'or', ConditionalField];

export type ConditionalFieldProps = FieldConfig & {
    anyChain: AnyChain;
    arrayChain: ArrayChain;
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

export type ConditionalFieldCtorParams = FieldCtorParams & Partial<ConditionalFieldProps>;

class ConditionalField extends Field<ConditionalFieldProps> {
    public constructor(args: Partial<ConditionalFieldCtorParams> = {}) {
        super(args);

        const {
            anyChain = new AnyChain(),
            arrayChain = new ArrayChain(),
            schemaChain = new SchemaChain(),
            buildStage = 0,
            comparisonMode = 'equals',
            comparisonField,
            thenField = null,
            otherwiseField = null,
            conditionalChain = [],
            targetPath,
            targetPathStr,
        } = args;

        if (!comparisonField || !(comparisonField instanceof Field)) {
            throw new Error('comparisonField value required');
        }
        if (!targetPath && !targetPathStr) {
            throw new Error('Must supply either targetPath or targetPathStr');
        }

        const { config } = this;
        config.anyChain = anyChain;
        config.arrayChain = arrayChain;
        config.schemaChain = schemaChain;
        config.buildStage = buildStage;
        config.comparisonMode = comparisonMode;
        config.comparisonField = FieldCoercer.coerce({
            value: comparisonField,
            anyChain,
            arrayChain,
            schemaChain,
        });
        config.thenField = thenField
            ? FieldCoercer.coerce({
                value: thenField,
                anyChain,
                arrayChain,
                schemaChain,
            })
            : null;
        config.otherwiseField = otherwiseField
            ? FieldCoercer.coerce({
                value: otherwiseField,
                anyChain,
                arrayChain,
                schemaChain,
            })
            : null;
        config.conditionalChain = [...conditionalChain];
        config.targetPath = new Path(targetPathStr || targetPath || '');
    }

    public override clone(args: Partial<ConditionalFieldCtorParams> = {}): this {
        const clone = super.clone(args);
        if (args.targetPathStr !== undefined) {
            clone.config.targetPath = new Path(args.targetPathStr);
        }
        return clone;
    }

    public override createProcessor(): ConditionalProcessor {
        return new ConditionalProcessor({
            field: this,
        });
    }

    public or(targetPathStr: string, comparisonField: Field): this;
    public or(conditionalField: ConditionalField): this;
    public or(conditionalFieldOrTargetPathStr: ConditionalField | string, comparisonField: Field | null = null) {
        return this._addToConditionalChain('or', conditionalFieldOrTargetPathStr, comparisonField);
    }

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
        const { anyChain, arrayChain, schemaChain, buildStage, comparisonMode, conditionalChain } = this.config;
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
                anyChain,
                arrayChain,
                schemaChain,
                comparisonField: comparisonField!,
                comparisonMode,
                targetPathStr: conditionalFieldOrTargetPathStr,
            });

        return this.clone({
            conditionalChain: conditionalChain.concat([[type, newEntry]])
        });
    }

    public then(thenResult: unknown | Field) {
        const { buildStage, anyChain, arrayChain, schemaChain } = this.config;
        if (buildStage !== 0) {
            throw new Error('Illegal placement of "then" in condition chain');
        }
        return this.clone({
            thenField: FieldCoercer.coerce({
                value: thenResult,
                anyChain,
                arrayChain,
                schemaChain,
            }),
            buildStage: 1
        });
    }

    public otherwise(otherwiseResult: unknown | Field) {
        const { buildStage, anyChain, arrayChain, schemaChain } = this.config;
        if (buildStage !== 1) {
            throw new Error('Illegal placement of "otherwise" in condition chain');
        }
        return this.clone({
            otherwiseField: FieldCoercer.coerce({
                value: otherwiseResult,
                anyChain,
                arrayChain,
                schemaChain,
            }),
            buildStage: 2
        });
    }

}

export { ConditionalField };