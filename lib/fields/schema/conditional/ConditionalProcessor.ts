'use strict';

import { ConditionalField } from './ConditionalField.ts';
import { ValueTracker } from '../../../tracker/ValueTracker.ts';
import { Processor, ProcessorCompilationContext, ProcessorCtorParams } from '../../Processor.ts';

export type ConditionalProcessorCtorParams = ProcessorCtorParams<ConditionalField>;

export type ConditionalProcessorCompilationContext = ProcessorCompilationContext & {
    isNested?: boolean
}

class ConditionalProcessor extends Processor<ConditionalField> {

    private _comparisonProcessor: Processor;
    private _conditionalProcessorChain: [type: 'and' | 'or', ConditionalProcessor][];
    private _otherwiseProcessor: Processor | null;
    private _thenProcessor: Processor | null;

    constructor(args: ConditionalProcessorCtorParams) {
        super(args);

        const { comparisonField, conditionalChain, otherwiseField, thenField } = this.field.config;

        this._comparisonProcessor = comparisonField.createProcessor().compile() as Processor;
        this._otherwiseProcessor = otherwiseField
            ? otherwiseField.createProcessor().compile() as Processor
            : null;
        this._thenProcessor = thenField
            ? thenField.createProcessor().compile() as Processor
            : null;

        this._conditionalProcessorChain = [];
        for (let [type, conditionalField] of conditionalChain) {
            this._conditionalProcessorChain.push([
                type,
                (conditionalField.createProcessor() as ConditionalProcessor)
                    .compile({ isNested: true }) as ConditionalProcessor
            ]);
        }
    }

    public override compile({ isNested = false }: ConditionalProcessorCompilationContext = {}): this {
        const { field: { config: { buildStage } } } = this;

        // if (isNested && buildStage !== 0) {
        //     throw new Error('Nested conditionals may NOT contain then/otherwise');
        // }
        // else if (buildStage !== 2) {
        //     throw new Error('Conditionals must contain a complete then/otherwise pair');
        // }

        return this;
    }

    private _nestedProcess(tracker: ValueTracker): void {

        const {
            _comparisonProcessor,
            _conditionalProcessorChain,
            field: {
                config: {
                    comparisonMode,
                    targetPath
                }
            }
        } = this;

        let targetTracker = targetPath.isSelf
            ? tracker
            : tracker.parent.resolvePath(targetPath);

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

            let chainPredicateResult = conditionalProcessor.field.config.comparisonMode === 'equals'
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
