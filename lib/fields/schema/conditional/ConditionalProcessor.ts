'use strict';

import { ConditionalField } from './ConditionalField.ts';
import { ValueTracker } from '../../../tracker/ValueTracker.ts';
import { Processor, ProcessorCompilationContext, ProcessorCtorParams } from '../../Processor.ts';
import { NamedNodeMixin } from '../../../node/NamedNodeMixin.ts';
import { IndexedNodeMixin } from '../../../node/IndexedNodeMixin.ts';

export type ConditionalProcessorCtorParams = ProcessorCtorParams<ConditionalField>;

// export type ConditionalProcessorCompilationContext = ProcessorCompilationContext & {
//     isNested?: boolean
// }

class BoundConditionalProcessor extends Processor<ConditionalField> {
    public override process(tracker: ValueTracker): void { }
}

class ConditionalProcessor extends IndexedNodeMixin(BoundConditionalProcessor) {

    private _comparisonProcessor: Processor;
    private _conditionalProcessorChain: [type: 'and' | 'or', ConditionalProcessor][];
    private _otherwiseProcessor: Processor | null;
    private _thenProcessor: Processor | null;

    constructor(args: ConditionalProcessorCtorParams) {
        super(args);

        const { comparisonField, conditionalChain, otherwiseField, thenField } = this.field.config;

        this._comparisonProcessor = comparisonField.createProcessor();
        this._otherwiseProcessor = otherwiseField ? otherwiseField.createProcessor() : null;
        this._thenProcessor = thenField ? thenField.createProcessor() : null;

        // If any of the processors are nodes, they need to have their parent set to be
        // the same as this processor's parent, so that they can resolve paths correctly
        this.addIndexedChild(this._comparisonProcessor);
        this.addIndexedChild(this._otherwiseProcessor);
        this.addIndexedChild(this._thenProcessor);

        // Figure out the chain, and also set the parent of each processor if needed
        this._conditionalProcessorChain = [];
        for (let [type, conditionalField] of conditionalChain) {
            const processor = conditionalField.createProcessor();
            this.addIndexedChild(processor);
            this._conditionalProcessorChain.push([type, processor]);
        }
    }

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
        const { _thenProcessor, _otherwiseProcessor } = this;
        this._nestedProcess(trackerClone);
        if (trackerClone.pass && _thenProcessor) {
            _thenProcessor.process(tracker);
        }
        else if (trackerClone.fail && _otherwiseProcessor) {
            _otherwiseProcessor.process(tracker);
        }
    }
}

export { ConditionalProcessor };
