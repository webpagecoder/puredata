
'use strict';

import { Path } from '../Path.ts';
import { Field, FieldCloneParams, FieldConstructorParams, FieldProps } from './Field.ts';
import { ValueField } from './ValueField.ts';

export type SchemaConditionalFieldProps = FieldProps & {
    areEqual?: boolean;
    comparisonField: Field;
    conditionalChain: [string, SchemaConditionalField][];
    otherwiseField: null | Field;
    buildStage: number;
    targetPath: Path;
    thenField: Field;
};

export type SchemaConditionalFieldConstructorParams = FieldConstructorParams
    & Partial<Omit<SchemaConditionalFieldProps, 'targetPath'>>
    & Pick<SchemaConditionalFieldProps, 'comparisonField' | 'thenField'>
    & {
        targetPathStr: string;
    };

export type SchemaConditionalFieldCloneParams =
    FieldCloneParams<SchemaConditionalFieldProps> & {
        targetPathStr?: string;
    };


class SchemaConditionalField extends Field<SchemaConditionalFieldProps> {

    constructor(props: SchemaConditionalFieldConstructorParams) {
        super(props);

        const {
            areEqual = true,
            comparisonField,
            conditionalChain = [],
            otherwiseField = null,
            buildStage = 0,
            targetPathStr,
            thenField,
        } = props;

        const { extendedProps } = this;
        extendedProps.areEqual = areEqual;
        extendedProps.comparisonField = comparisonField;
        extendedProps.conditionalChain = conditionalChain;
        extendedProps.otherwiseField = otherwiseField;
        extendedProps.buildStage = buildStage;
        extendedProps.targetPath = Path.create(targetPathStr);
        extendedProps.thenField = thenField;
    }

    public override clone(args: SchemaConditionalFieldCloneParams = {}): this {
        const clone = super.clone(args);

        if (args.targetPathStr !== undefined) {
            clone.extendedProps.targetPath = Path.create(args.targetPathStr);
        }
        return clone;
    }

    or(conditionalField: SchemaConditionalField) {
        if (this.extendedProps.buildStage !== 0) {
            throw new Error('Illegal placement of "or" in condition chain');
        }
        return this.clone({
            conditionalChain: this.extendedProps.conditionalChain.concat([['or', conditionalField]])
        });
    }

    and(conditionalField: SchemaConditionalField) {
        if (this.extendedProps.buildStage !== 0) {
            throw new Error('Illegal placement of "and" in condition chain');
        }
        return this.clone({
            conditionalChain: this.extendedProps.conditionalChain.concat([['and', conditionalField]])
        });
    }

    then(thenResult: unknown | Field) {
        if (this.extendedProps.buildStage !== 0) {
            throw new Error('Illegal placement of "then" in condition chain');
        }
        return this.clone({
            thenField: thenResult instanceof Field
                ? thenResult
                : new ValueField({ locale: this._locale, processorMapper: this._processorMapper, value: thenResult }),
            buildStage: 1
        });
    }

    otherwise(otherwiseResult: unknown | Field) {
        if (this.extendedProps.buildStage !== 1) {
            throw new Error('Illegal placement of "otherwise" in condition chain');
        }
        return this.clone({
            otherwiseField: otherwiseResult instanceof Field
                ? otherwiseResult
                : new ValueField({ locale: this._locale, processorMapper: this._processorMapper, value: otherwiseResult }),
            buildStage: 2
        });
    }

}

export { SchemaConditionalField };