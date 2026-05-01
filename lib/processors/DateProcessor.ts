'use strict';

import { DateType } from '../date/DateType.ts';
import { Utils } from '../utils/Utils.ts';
import { ChainProcessor, ChainProcessorProps } from './ChainProcessor.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { State } from './Processor.ts';
import { DateChain, DateChainProps } from '../fields/DateChain.ts';
import { MetaDate } from '../date copy/MetaDate.ts';
import { IsoPrecision } from '../date/DateParser.ts';

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

class DateProcessor extends ChainProcessor<DateProcessorProps> {

    constructor(props: DateProcessorProps) {
        super(props);
        this.props.hasPipelineHooks = true;
    }

    override preProcess(tracker: ValueTracker, state: DateProcessorState = {}): void {
        const { skipPreProcess, dateParser } = this.props.field.props as DateChainProps;
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

    override preStepHook(tracker: ValueTracker, state: State = {}): void {
        console.log('pr');
    }

    override postStepHook(tracker: ValueTracker, state: State = {}): void {
        console.log('pos');
    }

    override postProcess(tracker: ValueTracker, state: DateProcessorState = {}): void {
        const { outputType,  outputFormat, dateParser } = this.props.field.props;
        const metaDate = tracker.getValue() as MetaDate;

        switch (outputType) {
            case 'custom':
                tracker.setValue(dateParser.format(metaDate, outputFormat as string));
                break;
            case 'object':
                tracker.setValue(metaDate.date);
                break;
            case 'iso':
                const format = isoFormatStrings[outputFormat as IsoPrecision || 'date'];
                tracker.setValue(dateParser.format(metaDate, format));
                break;
            case 'isoWeek':
                const target = new Date(metaDate.date);
                const dayNum = target.getUTCDay() || 7;
                target.setUTCDate(target.getUTCDate() + 4 - dayNum);
                const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
                const weekNum = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                tracker.setValue(`${target.getUTCFullYear()}-W${Utils.padLeft(weekNum.toString(), 2, '0')}-${dayNum}`);
                break;
            case 'isoOrdinal':
                const diff = dateValue.getTime() - new Date(Date.UTC(dateValue.getUTCFullYear(), 0, 0)).getTime();
                const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
                tracker.setValue(`${dateValue.getUTCFullYear()}-${Utils.padLeft(dayOfYear.toString(), 3, '0')}`);
                break;
            case 'timestamp':
                tracker.setValue(dateValue.getTime());
                break;
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