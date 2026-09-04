
'use strict';

import { Path } from '../../../Path.ts';
import { Field, FieldCloneParams, FieldCtorParams, FieldConfig } from '../../Field.ts';
import { ValueField } from '../../value/ValueField.ts';
import { ConditionalProcessor } from './ConditionalProcessor.ts';

export type ConditionalChainEntry = ['and' | 'or', ConditionalField];

export type ConditionalFieldProps = FieldConfig & {
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

export type ConditionalFieldCloneParams =
    FieldCloneParams<ConditionalFieldProps> & {
        targetPathStr?: string;
    };


class ConditionalField extends Field<ConditionalFieldProps> {

    constructor(args: ConditionalFieldCtorParams) {
        super(args);

        const {
            buildStage = 0,
            comparisonMode = 'equals',
            comparisonField,
            conditionalChain = [],
            otherwiseField = null,
            targetPathStr,
            thenField = null,
        } = args;

        const { props } = this;
        props.comparisonMode = comparisonMode;
        props.comparisonField = comparisonField;
        props.conditionalChain = conditionalChain;
        props.otherwiseField = otherwiseField;
        props.buildStage = buildStage;
        props.targetPath = new Path(targetPathStr);
        props.thenField = thenField;
    }

    public override clone(args: ConditionalFieldCloneParams = {}): this {
        const clone = super.clone(args);
        if (args.targetPathStr !== undefined) {
            clone.props.targetPath = new Path(args.targetPathStr);
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
        if (this._config.buildStage !== 0) {
            throw new Error('Illegal placement of "then" in condition chain');
        }
        return this.clone({
            thenField: thenResult instanceof Field
                ? thenResult
                : new ValueField({ 
                    errorMessages: this._config.errorMessages, 
                    value: thenResult 
                }),
            buildStage: 1
        });
    }

    otherwise(otherwiseResult: unknown | Field) {
        if (this._config.buildStage !== 1) {
            throw new Error('Illegal placement of "otherwise" in condition chain');
        }
        return this.clone({
            otherwiseField: otherwiseResult instanceof Field
                ? otherwiseResult
                : new ValueField({ 
                    errorMessages: this._config.errorMessages, 
                    value: otherwiseResult 
                }),
            buildStage: 2
        });
    }

}

export { ConditionalField };