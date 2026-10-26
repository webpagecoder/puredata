'use strict';

import { OffsetDate } from './OffsetDate.ts';
import { DateChain } from './DateChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor, AnyProcessorCtorParams } from '../any/AnyProcessor.ts';

/** Constructor options for a date processor. */
export type DateProcessorCtorParams = AnyProcessorCtorParams<DateChain>;

/** Parses date input and formats the processed result. */
class DateProcessor extends AnyProcessor<DateChain> {

    /** Creates a date processor for the supplied date chain. */
    public constructor(args: DateProcessorCtorParams) {
        super(args);
    }

    /** Parses the tracker's input into a date unless generic parsing is disabled. */
    public override preProcess(tracker: ValueTracker): void {
        const { chainHandler, config: { skipGenericParse } } = this.field;
        if (skipGenericParse) {
            return;
        }
        this._copyResultToTracker(
            tracker,
            chainHandler.date(tracker.value)
        );
    }

    /** Runs the chain and formats the resulting date using the chain settings. */
    public override process(tracker: ValueTracker): void {
        super.process(tracker);
        if (tracker.fail) {
            return;
        }
        const { chainHandler, config: { outputFormat, outputTimeMode } } = this.field;
        this._copyResultToTracker(
            tracker,
            chainHandler.toFormat(tracker.value as OffsetDate, outputFormat, outputTimeMode)
        );
    }

}

export { DateProcessor };