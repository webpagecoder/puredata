'use strict';

import { SchemaConditionalField } from '../fields/SchemaConditionalField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Processor, ProcessorCompilationContext, ProcessorConstructorParams } from './Processor.ts';

export type SchemaConditionalProcessorConstructorParams = ProcessorConstructorParams<SchemaConditionalField>;

export type SchemaConditionalProcessorCompilationContext = ProcessorCompilationContext & {
    isNested?: boolean
}

class SchemaConditionalProcessor extends Processor<SchemaConditionalField> {

    protected _comparisonProcessor: Processor;
    protected _conditionalProcessorChain: [type: 'and' | 'or', SchemaConditionalProcessor][];
    protected _otherwiseProcessor: Processor | null;
    protected _thenProcessor: Processor | null;
    protected _isNested: boolean;

    constructor(args: SchemaConditionalProcessorConstructorParams) {
        super(args);

        const { processorMapper } = args;
        const { _field } = this;
        const { comparisonField, conditionalChain, otherwiseField, thenField } = _field.extendedProps;

        this._comparisonProcessor = processorMapper.createProcessor(comparisonField).compile() as Processor;
        this._isNested = false;
        this._otherwiseProcessor = otherwiseField
            ? processorMapper.createProcessor(otherwiseField).compile() as Processor
            : null;
        this._thenProcessor = thenField
            ? processorMapper.createProcessor(thenField).compile() as Processor
            : null;


        this._conditionalProcessorChain = [];
        for (let [type, conditionalField] of conditionalChain) {
            this._conditionalProcessorChain.push([
                type,
                processorMapper.createProcessor(conditionalField).compile({ isNested: true }) as SchemaConditionalProcessor
            ]);
        }
    }

    public override compile({ isNested = false }: SchemaConditionalProcessorCompilationContext): this {
        const { _field: { extendedProps: { buildStage } } } = this;

        this._isNested = isNested;

        if (isNested) {
            if (buildStage !== 0) {
                throw new Error('Nested conditionals may NOT contain then/otherwise');
            }
        }
        else if (buildStage !== 2) {
            throw new Error('Conditionals must contain a complete then/otherwise pair');
        }

        return this;
    }

    public override process(tracker: ValueTracker) {

        const { _field, _comparisonProcessor, _thenProcessor, _otherwiseProcessor, _conditionalProcessorChain,  } = this;
        const { comparisonMode, targetPath } = _field.extendedProps;

        let referencedValueTracker = targetPath.isSelf
            ? tracker
            : tracker.parent.getNodeByPath(targetPath);

        if (!referencedValueTracker) {
            //todo: should fail like this in regular reference processors too.
            throw new Error('Cannot find referenced tracker in conditional: ' + targetPath);
        }

        const comparisonResultTracker = _comparisonProcessor.process(referencedValueTracker.clone());

        let predicateValue = comparisonResultTracker.pass
        if (comparisonMode === 'notEquals') {
            predicateValue = !predicateValue;
        }

        for (let [type, conditionalProcessor] of _conditionalProcessorChain) {
            let result = conditionalProcessor.process(referencedValueTracker).pass;
            if (conditionalProcessor.field.extendedProps.comparisonMode === 'notEquals') {
                result = !result;
            }
            if (type === 'and') {
                predicateValue = predicateValue && result;
            }
            else {
                predicateValue = predicateValue || result;
            }
        }

        if (this._isNested) {
            return predicateValue ? ValueTracker.pass(_field) : ValueTracker.fail(_field);
        }
        else {
            return (predicateValue ? _thenProcessor : _otherwiseProcessor)!.process(tracker);
        }
    }
}

export { SchemaConditionalProcessor };
