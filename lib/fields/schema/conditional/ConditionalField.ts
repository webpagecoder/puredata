
'use strict';

import { Path } from '../../../Path.ts';
import { AnyChain } from '../../any/AnyChain.ts';
import { Field, FieldCtorParams, FieldConfig } from '../../Field.ts';
import { ConditionalProcessor } from './ConditionalProcessor.ts';

export type ConditionalChainEntry = ['and' | 'or', ConditionalField];

export type ConditionalFieldProps = FieldConfig & {
    anyChain: AnyChain;
    buildStage: number;
    comparisonMode?: 'equals' | 'notEquals';
    comparisonField: Field;
    conditionalChain: ConditionalChainEntry[];
    otherwiseField: null | Field;
    targetPath: Path;
    thenField: null | Field;
};

export type ConditionalFieldCtorParams = FieldCtorParams
    & Partial<Omit<ConditionalFieldProps, 'targetPath'>>
    & Pick<ConditionalFieldProps, 'comparisonField' | 'thenField'>
    & {
        targetPathStr: string;
    };

class ConditionalField extends Field<ConditionalFieldProps> {

    constructor(args: ConditionalFieldCtorParams) {
        super(args);

        const {
            anyChain,
            buildStage = 0,
            comparisonMode = 'equals',
            comparisonField,
            conditionalChain = [],
            otherwiseField = null,
            targetPathStr,
            thenField = null,
        } = args;

        if (!anyChain || !(anyChain instanceof AnyChain)) {
            throw new Error('ConditionalField requires a valid AnyChain instance');
        }

        const { _config } = this;
        _config.anyChain = anyChain.clearChain();
        _config.buildStage = buildStage;
        _config.comparisonMode = comparisonMode;
        _config.comparisonField = comparisonField;
        _config.conditionalChain = conditionalChain;
        _config.otherwiseField = otherwiseField;
        _config.targetPath = new Path(targetPathStr);
        _config.thenField = thenField;
    }

    public override clone(args: Partial<ConditionalFieldCtorParams> = {}): this {
        const clone = super.clone(args);
        if (args.targetPathStr !== undefined) {
            clone._config.targetPath = new Path(args.targetPathStr);
        }
        return clone;
    }

    public override createProcessor(): ConditionalProcessor {
        return new ConditionalProcessor({
            field: this,
        });
    }

    or(conditionalField: ConditionalField) {
        const { buildStage, conditionalChain } = this._config;
        if (buildStage !== 0) {
            throw new Error('Illegal placement of "or" in condition chain');
        }
        return this.clone({
            conditionalChain: conditionalChain.concat([['or', conditionalField]])
        });
    }

    and(conditionalField: ConditionalField) {
        const { buildStage, conditionalChain } = this._config;
        if (buildStage !== 0) {
            throw new Error('Illegal placement of "and" in condition chain');
        }
        return this.clone({
            conditionalChain: conditionalChain.concat([['and', conditionalField]])
        });
    }

    then(thenResult: unknown | Field) {
        const { buildStage, anyChain } = this._config;
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

    otherwise(otherwiseResult: unknown | Field) {
        const { buildStage, anyChain } = this._config;
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