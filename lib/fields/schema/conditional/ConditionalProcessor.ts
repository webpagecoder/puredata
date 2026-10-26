'use strict';

import { ValueTracker } from '../../../tracker/ValueTracker.ts';
import { Processor, ProcessorCompilationContext, ProcessorCtorParams } from '../../Processor.ts';
import { ConditionalField } from './ConditionalField.ts';

/** Constructor options for a conditional processor. */
export type ConditionalProcessorCtorParams = ProcessorCtorParams<ConditionalField>;

/** Evaluates a conditional field and processes its selected result branch. */
class ConditionalProcessor extends  Processor<ConditionalField> {

    /** Processor used to validate the comparison value. */
    private _comparisonProcessor: Processor;

    /** Additional AND/OR conditions in the conditional chain. */
    private _conditionalProcessorChain: [type: 'and' | 'or', ConditionalProcessor][];

    /** Processor for the failing branch, when configured. */
    private _otherwiseProcessor: Processor | null;

    /** Processor for the passing branch, when configured. */
    private _thenProcessor: Processor | null;

    /** Creates processors for the comparison and configured result branches. */
    constructor(args: ConditionalProcessorCtorParams) {
        super(args);

        const { comparisonField, conditionalChain, otherwiseField, thenField } = this.field.config;

        this._comparisonProcessor = comparisonField.createProcessor();
        this._otherwiseProcessor = otherwiseField ? otherwiseField.createProcessor() : null;
        this._thenProcessor = thenField ? thenField.createProcessor() : null;

        // Figure out the chain, and also set the parent of each processor if needed
        this._conditionalProcessorChain = [];
        for (let [type, conditionalField] of conditionalChain) {
            const processor = conditionalField.createProcessor();
            this._conditionalProcessorChain.push([type, processor]);
        }
    }

    /** Compiles the comparison, condition-chain, and branch processors. */
    public override compile(context: ProcessorCompilationContext = {}): this {
        const { _comparisonProcessor, _conditionalProcessorChain, _otherwiseProcessor, _thenProcessor } = this;
        const { absolutePath } = context;
        const subContext = { absolutePath };
        this._comparisonProcessor = _comparisonProcessor.compile(subContext);
        this._otherwiseProcessor = _otherwiseProcessor ? _otherwiseProcessor.compile(subContext) : null;
        this._thenProcessor = _thenProcessor ? _thenProcessor.compile(subContext) : null;
        for (let i = 0, max = _conditionalProcessorChain.length; i < max; i++) {
            this._conditionalProcessorChain[i][1] = this._conditionalProcessorChain[i][1].compile(subContext) as ConditionalProcessor;
        }
        return this;
    }

    /** Evaluates this condition and any chained AND/OR conditions. */
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
            : tracker.parent.resolvePath(targetPath) as ValueTracker;

        if (!targetTracker) {
            //todo: should we get rid of this
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

    /** Evaluates the condition and processes its passing or failing branch. */
    public override process(tracker: ValueTracker): void {
        const trackerClone = tracker.cloneWithoutErrors();
        const { _thenProcessor, _otherwiseProcessor } = this;
        this._nestedProcess(trackerClone);
        
        if (trackerClone.pass) {
            if(_thenProcessor) {
                _thenProcessor.process(tracker);
            }
            else {
                tracker.setValue(true);
            }
        }
        else if (trackerClone.fail) {
            if(_otherwiseProcessor) {
                _otherwiseProcessor.process(tracker);
            }
            else {
                tracker.setValue(false);
            }
        }
    }
}

export { ConditionalProcessor };
