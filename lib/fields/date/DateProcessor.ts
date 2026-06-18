'use strict';

import { UtcDate } from './UtcDate.ts';
import { DateChain } from './DateChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { ChainProcessor, ChainProcessorCtorParams } from '../ChainProcessor.ts';

export type DateProcessorCtorParams = ChainProcessorCtorParams<DateChain>;

class DateProcessor extends ChainProcessor<DateChain> {

    public constructor(args: DateProcessorCtorParams) {
        super(args);
    }

    public override preProcess(tracker: ValueTracker): void {
        const { chainHandler, skipGenericParse } = this._field.extendedProps;
        if (skipGenericParse) {
            return;
        }
        this._copyResultToTracker(
            tracker,
            chainHandler.date(tracker.getValue())
        );
    }

    public override process(tracker: ValueTracker): void {
        super.process(tracker);
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