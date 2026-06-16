'use strict';

import { SchemaConditionalField } from '../../fields/SchemaConditionalField.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Processor, ProcessorCompilationContext, ProcessorConstructorParams } from '../Processor.ts';

export type SchemaConditionalFieldProcessorConstructorParams = ProcessorConstructorParams<SchemaConditionalField>;

export type SchemaConditionalFieldProcessorCompilationContext = ProcessorCompilationContext & {
    isNested?: boolean
}

class SchemaConditionalFieldProcessor extends Processor<SchemaConditionalField> {

    protected _comparisonProcessor: Processor;
    protected _conditionalProcessorChain: [type: 'and' | 'or', SchemaConditionalFieldProcessor][];
    protected _otherwiseProcessor: Processor | null;
    protected _thenProcessor: Processor | null;
    protected _isNested: boolean;

    constructor(args: SchemaConditionalFieldProcessorConstructorParams) {
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
                (processorMapper.createProcessor(conditionalField) as SchemaConditionalFieldProcessor)
                    .compile({ isNested: true }) as SchemaConditionalFieldProcessor
            ]);
        }
    }

    public override compile({ isNested = false }: SchemaConditionalFieldProcessorCompilationContext = {}): this {
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

    public override process(tracker: ValueTracker): void {

        const { _field, _comparisonProcessor, _thenProcessor, _otherwiseProcessor, _conditionalProcessorChain,  } = this;
        const { comparisonMode, targetPath } = _field.extendedProps;

        let referencedValueTracker = targetPath.isSelf
            ? tracker
            : tracker.parent.resolvePath(targetPath);

        if (!referencedValueTracker) {
            //todo: should fail like this in regular reference processors too.
            throw new Error('Cannot find referenced tracker in conditional: ' + targetPath);
        }

        const trackerClone = referencedValueTracker.cloneWithoutErrors();
        _comparisonProcessor.process(trackerClone);
        // why we have to clone tracker before passing back or something...
        // trackerClone yes should be passed here, but it is referring to testing
        // the value at referenceValueTracker

        let predicateValue = trackerClone.pass;
        if (comparisonMode === 'notEquals') {
            predicateValue = !predicateValue;
        }

        for (let [type, conditionalProcessor] of _conditionalProcessorChain) {
            conditionalProcessor.process(tracker);
            let result = tracker.pass; //todo: can we do a shortcircuit to fail on first error to save compute?
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
            // If this is nested, then the tracker is a clone of the parent conditional's tracker,
            predicateValue ? tracker.setPass() : tracker.setFail();
        }
        else {
            (predicateValue ? _thenProcessor : _otherwiseProcessor)!.process(tracker);//TODO:!!! NO RETURNING
        }
    }
}

export { SchemaConditionalFieldProcessor };
