
'use strict';

import { Path } from '../../../Path.ts';
import { AnyChain } from '../../any/AnyChain.ts';
import { Field, FieldCtorParams, FieldConfig } from '../../Field.ts';
import { ConditionalProcessor } from './ConditionalProcessor.ts';

export type ConditionalChainEntry = ['and' | 'or', ConditionalField];

export type ConditionalFieldProps = FieldConfig & {
    anyChain: AnyChain;
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

    constructor(args: ConditionalFieldCtorParams = {}) {
        super(args);

        const {
            anyChain,
            buildStage = 0,
            comparisonMode = 'equals',
            comparisonField,
            conditionalChain = [],
            otherwiseField = null,
            targetPath,
            targetPathStr,
            thenField = null,
        } = args;

        if (!anyChain || !(anyChain instanceof AnyChain)) {
            throw new Error('anyChain value required');
        }
        if (!comparisonField || !(comparisonField instanceof Field)) {
            throw new Error('comparisonField value required');
        }

        const { config } = this;
        config.anyChain = anyChain.clearChain();
        config.buildStage = buildStage;
        config.comparisonMode = comparisonMode;
        config.comparisonField = comparisonField;
        config.conditionalChain = [...conditionalChain];
        config.otherwiseField = otherwiseField;
        config.targetPath = new Path(targetPathStr || targetPath || '');
        config.thenField = thenField;
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
    public or(conditionalField: ConditionalField | string, comparisonField: Field | null): this;
    public or(conditionalFieldOrTargetPathStr: ConditionalField | string, comparisonField: Field | null = null) {
        return this._addToConditionalChain('or', conditionalFieldOrTargetPathStr, comparisonField);
    }

    public and(targetPathStr: string, comparisonField: Field): this;
    public and(conditionalField: ConditionalField | string, comparisonField: Field | null): this;
    public and(conditionalFieldOrTargetPathStr: ConditionalField | string, comparisonField: Field | null = null) {
        return this._addToConditionalChain('and', conditionalFieldOrTargetPathStr, comparisonField);
    }

    private _addToConditionalChain(
        type: 'and' | 'or',
        conditionalFieldOrTargetPathStr: ConditionalField | string,
        comparisonField: Field | null = null
    ) {
        const { anyChain, buildStage, comparisonMode,conditionalChain } = this.config;
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
                comparisonField: comparisonField!,
                comparisonMode,
                targetPathStr: conditionalFieldOrTargetPathStr,
            });

        return this.clone({
            conditionalChain: conditionalChain.concat([[type, newEntry]])
        });
    }

    public then(thenResult: unknown | Field) {
        const { buildStage, anyChain } = this.config;
        if (buildStage !== 0) {
            throw new Error('Illegal placement of "then" in condition chain');
        }
        return this.clone({
            thenField: thenResult instanceof Field
                ? thenResult
                : anyChain.clearChain().default(thenResult),
            buildStage: 1
        });
    }

    public otherwise(otherwiseResult: unknown | Field) {
        const { buildStage, anyChain } = this.config;
        if (buildStage !== 1) {
            throw new Error('Illegal placement of "otherwise" in condition chain');
        }
        return this.clone({
            otherwiseField: otherwiseResult instanceof Field
                ? otherwiseResult
                : anyChain.clearChain().default(otherwiseResult),
            buildStage: 2
        });
    }

}

export { ConditionalField };