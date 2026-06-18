'use strict';

import { ConditionalField } from './ConditionalField.ts';
import { ValueTracker } from '../../../tracker/ValueTracker.ts';
import { Processor, ProcessorCompilationContext, ProcessorCtorParams } from '../../Processor.ts';

export type ConditionalProcessorCtorParams = ProcessorCtorParams<ConditionalField>;

export type ConditionalProcessorCompilationContext = ProcessorCompilationContext & {
    isNested?: boolean
}

class ConditionalProcessor extends Processor<ConditionalField> {

    protected _comparisonProcessor: Processor;
    protected _conditionalProcessorChain: [type: 'and' | 'or', ConditionalProcessor][];
    protected _otherwiseProcessor: Processor | null;
    protected _thenProcessor: Processor | null;
    protected _isNested: boolean;

    constructor(args: ConditionalProcessorCtorParams) {
        super(args);

        const { processorMapper } = args;
        const { _field } = this;
        const { comparisonField, conditionalChain, otherwiseField, thenField } = _field.extendedProps;

        this._comparisonProcessor = processorMapper.resolve(comparisonField).compile() as Processor;
        this._isNested = false;
        this._otherwiseProcessor = otherwiseField
            ? processorMapper.resolve(otherwiseField).compile() as Processor
            : null;
        this._thenProcessor = thenField
            ? processorMapper.resolve(thenField).compile() as Processor
            : null;

        this._conditionalProcessorChain = [];
        for (let [type, conditionalField] of conditionalChain) {
            this._conditionalProcessorChain.push([
                type,
                (processorMapper.resolve(conditionalField) as ConditionalProcessor)
                    .compile({ isNested: true }) as ConditionalProcessor
            ]);
        }
    }

    public override compile({ isNested = false }: ConditionalProcessorCompilationContext = {}): this {
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
            : tracker.resolvePath(targetPath);

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
            //todo: double cloning - where can we eliminate?
            const trackerClone = tracker.cloneWithoutErrors();
            conditionalProcessor.process(trackerClone);

            let result = trackerClone.pass; //todo: can we do a shortcircuit to fail on first error to save compute?
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
            // Nested conditionals cannot have then/otherwise, so we just set pass/fail
            predicateValue ? tracker.setPass() : tracker.setFail();
        }
        else {
            // Root must have then/otherwise processors
            if(predicateValue) {
                _thenProcessor!.process(tracker);
            }
            else {
                _otherwiseProcessor!.process(tracker);
            }
        }
    }
}

export { ConditionalProcessor };
