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

        const { fieldProcessorMap } = args;
        const { _field } = this;
        const { comparisonField, conditionalChain, otherwiseField, thenField } = _field.extendedProps;

        this._comparisonProcessor = fieldProcessorMap.resolve(comparisonField).compile() as Processor;
        this._isNested = false;
        this._otherwiseProcessor = otherwiseField
            ? fieldProcessorMap.resolve(otherwiseField).compile() as Processor
            : null;
        this._thenProcessor = thenField
            ? fieldProcessorMap.resolve(thenField).compile() as Processor
            : null;

        this._conditionalProcessorChain = [];
        for (let [type, conditionalField] of conditionalChain) {
            this._conditionalProcessorChain.push([
                type,
                (fieldProcessorMap.resolve(conditionalField) as ConditionalProcessor)
                    .compile({ isNested: true }) as ConditionalProcessor
            ]);
        }
    }

    public override compile({ isNested = false }: ConditionalProcessorCompilationContext = {}): this {
        const { _field: { extendedProps: { buildStage } } } = this;

        this._isNested = isNested;

        if (isNested && buildStage !== 0) {
            throw new Error('Nested conditionals may NOT contain then/otherwise');
        }
        else if (buildStage !== 2) {
            throw new Error('Conditionals must contain a complete then/otherwise pair');
        }

        return this;
    }

    protected _nestedProcess(tracker: ValueTracker): void {

        const { _field, _comparisonProcessor, _conditionalProcessorChain, } = this;
        const { comparisonMode, targetPath } = _field.extendedProps;

        let targetTracker = targetPath.isSelf
            ? tracker
            : tracker.resolvePath(targetPath);

        if (!targetTracker) {
            throw new Error('Cannot find referenced tracker in conditional: ' + targetPath);
        }

        const targetTrackerClone = targetTracker.cloneWithoutErrors();
        _comparisonProcessor.process(targetTrackerClone);

        let predicateResult = comparisonMode === 'equals'
            ? targetTrackerClone.pass
            : !targetTrackerClone.pass;

        for (let [type, conditionalProcessor] of _conditionalProcessorChain) {
            const trackerClone = tracker.cloneWithoutErrors();
            conditionalProcessor._nestedProcess(trackerClone);

            let chainPredicateResult = conditionalProcessor.field.extendedProps.comparisonMode === 'equals'
                ? trackerClone.pass
                : !trackerClone.pass;

            predicateResult = type === 'and'
                ? predicateResult && chainPredicateResult
                : predicateResult || chainPredicateResult;
        }

        predicateResult ? tracker.setPass() : tracker.setFail();
    }

    public override process(tracker: ValueTracker): void {
        const trackerClone = tracker.cloneWithoutErrors();
        this._nestedProcess(trackerClone);
        if (trackerClone.pass) {
            this._thenProcessor!.process(tracker);
        }
        else {
            this._otherwiseProcessor!.process(tracker);
        }
    }
}

export { ConditionalProcessor };
