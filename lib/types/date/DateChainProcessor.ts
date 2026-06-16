'use strict';

import { UtcDate } from './UtcDate.ts';
import { DateChain } from '../fields/DateChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { ChainProcessor, ChainProcessorConstructorParams } from '../ChainProcessor.ts';

export type DateChainProcessorConstructorParams = ChainProcessorConstructorParams<DateChain>;

class DateChainProcessor extends ChainProcessor<DateChain> {

    public constructor(args: DateChainProcessorConstructorParams) {
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

export { DateChainProcessor };