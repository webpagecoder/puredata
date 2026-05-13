'use strict';

import { MetaDate } from '../date copy/MetaDate.ts';
import { IsoPrecision } from '../date/DateParser.ts';
import { DateType } from '../date/DateType.ts';
import { DateChain } from '../fields/DateChain.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ChainProcessor, ChainProcessorProps } from './ChainProcessor.ts';
import { State } from './Processor.ts';

type DateProcessorState = State & {
    originalValue?: unknown;
    inputType?: DateType | null;
};

const isoFormatStrings: Record<IsoPrecision, string> = {
    date: `YYYY-MM-DD`,
    year: 'YYYY',
    month: `YYYY-MM`,
    day: `YYYY-MM-DD`,
    time: `YYYY-MM-DDTHH:MM:SS.sss`,
    hour: `YYYY-MM-DDTHH`,
    minute: `YYYY-MM-DDTHH:MM`,
    second: `YYYY-MM-DDTHH:MM:SS`,
    millisecond: `YYYY-MM-DDTHH:MM:SS.sss`,
    timezone: `YYYY-MM-DDTHH:MM:SS.sssZ`
} as const;


export type DateProcessorProps = ChainProcessorProps<DateChain>;

class DateProcessor extends ChainProcessor<DateChain> {

    constructor(props: DateProcessorProps) {
        super(props);
        this._hasPipelineHooks = true;
    }

    override preProcess(tracker: ValueTracker, state: DateProcessorState = {}): void {
        const { chainHandler: { dateParser }, skipPreProcess } = this._field;
        if (skipPreProcess) {
            return;
        }
        const parsedDate = dateParser.parse(tracker.getValue());
        if (!parsedDate) {
            tracker.addError('date/base');
            return;
        }
        tracker.setValue(parsedDate);
    }

    // override preStepHook(tracker: ValueTracker, state: State = {}): void {
    //     console.log('pr');
    // }

    // override postStepHook(tracker: ValueTracker, state: State = {}): void {
    //     console.log('pos');
    // }

    override postProcess(tracker: ValueTracker, state: DateProcessorState = {}): void {
        if (tracker.fail) {
            return;
        }

        const { chainHandler: { dateParser }, outputFormatString } = this._field;
        const metaDate = tracker.getValue() as MetaDate;

        if (outputFormatString === null) {
            tracker.setValue(metaDate.raw);
        }
        else if (outputFormatString === 'timestamp') {
            tracker.setValue(metaDate.date.getTime());
        }
        else if (outputFormatString === 'object') {
            tracker.setValue(new Date(metaDate.date));
        }
        else {
            tracker.setValue(dateParser.format(metaDate, outputFormatString || ''));
        }
    }

}

export { DateProcessor };






// const { field } = this.props;
// const { inputType } = field.props as DateFieldProps;

// state.originalValue = tracker.getValue();
// if (inputType) {
//     //todo something doesnt seem right here - shouldnt the date/base error be addded....
//     state.inputType = inputType;
// }
// else {
//     const parsedDate = Utils.parseDate(tracker.getValue());
//     if (!parsedDate) {
//         tracker.addError('date/base');
//         return;
//     }
//     else {
//         state.inputType = parsedDate.format;
//         tracker.setValue(parsedDate.date);
//     }
// }
// console.log('1');