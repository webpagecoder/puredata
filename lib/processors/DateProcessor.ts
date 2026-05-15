'use strict';

import { MetaDate } from '../date/MetaDate.ts';
import { DateChain } from '../fields/DateChain.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ChainProcessor, ChainProcessorProps } from './ChainProcessor.ts';

export type DateProcessorProps = ChainProcessorProps<DateChain>;

class DateProcessor extends ChainProcessor<DateChain> {

    constructor(props: DateProcessorProps) {
        super(props);
        this._hasPipelineHooks = true;
    }

    override preProcess(tracker: ValueTracker): void {
        const { chainHandler, skipGenericParse } = this._field;
        if (skipGenericParse) {
            return;
        }
        this._copyResultToTracker(
            tracker, 
            chainHandler.date(tracker.getValue())
        );
    }

    override postProcess(tracker: ValueTracker): void {
        if (tracker.fail) {
            return;
        }
        const { chainHandler, outputFormatString } = this._field;
        this._copyResultToTracker(
            tracker,
            chainHandler.format(tracker.getValue() as MetaDate, outputFormatString)
        );
    }

}

export { DateProcessor };