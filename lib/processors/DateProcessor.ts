'use strict';

import { UtcDate } from '../date/UtcDate.ts';
import { DateChain } from '../fields/DateChain.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ChainProcessor, ChainProcessorConstructorParams } from './ChainProcessor.ts';

export type DateProcessorConstructorParams = ChainProcessorConstructorParams<DateChain>;

class DateProcessor extends ChainProcessor<DateChain> {

    constructor(args: DateProcessorConstructorParams) {
        super(args);
        this._hasPipelineHooks = true;
    }

    override preProcess(tracker: ValueTracker): void {
        const { chainHandler, skipGenericParse } = this._field.extendedProps;
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
        const { chainHandler, outputStringFormat, outputTimeMode } = this._field.extendedProps;
        this._copyResultToTracker(
            tracker,
            chainHandler.toFormat(tracker.getValue() as UtcDate, outputStringFormat, outputTimeMode)
        );
    }

}

export { DateProcessor };