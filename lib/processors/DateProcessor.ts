'use strict';

import { DateType } from '../date/DateType.ts';
import { Utils } from '../utils/Utils.ts';
import { ChainProcessor, ChainProcessorProps } from './ChainProcessor.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { State } from './Processor.ts';
import { DateChainProps } from '../fields/DateChain.ts';

type DateProcessorState = State & {
    originalValue?: unknown;
    inputType?: DateType | null;
};

class DateProcessor extends ChainProcessor {

    constructor(props: ChainProcessorProps) {
        super(props);
        this.props.hasPipelineHooks = true;
    }

    override preProcess(tracker: ValueTracker, state: DateProcessorState = {}): void {
        const { inputType, dateParser } = this.props.field.props as DateChainProps;
        if (inputType === null) {
            const parsedDate = dateParser.parse(tracker.getValue());
            if (!parsedDate) {
                tracker.addError('date/base');
                return;
            }
            tracker.setValue(parsedDate);
        }
    }

    override preStepHook(tracker: ValueTracker, state: State = {}): void {
        console.log('pr');
    }

    override postStepHook(tracker: ValueTracker, state: State = {}): void {
        console.log('pos');
    }

    override postProcess(tracker: ValueTracker, state: DateProcessorState = {}): void {
        console.log('2');
        const { field } = this.props;
        const { inputType } = state;
        const outputType = (field.props as DateFieldProps).outputType || inputType;
        const dateValue = tracker.getValue();
        if (!(dateValue instanceof Date) || isNaN(dateValue.getTime())) {
            tracker.addError('date/base');
            return;
        }

        switch (outputType) {
            case DateType.ISO:
                tracker.setValue(dateValue.toISOString());
                break;
            case DateType.ISO_WEEK:
                const target = new Date(dateValue);
                const dayNum = target.getUTCDay() || 7;
                target.setUTCDate(target.getUTCDate() + 4 - dayNum);
                const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
                const weekNum = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                tracker.setValue(`${target.getUTCFullYear()}-W${Utils.padLeft(weekNum.toString(), 2, '0')}-${dayNum}`);
                break;
            case DateType.ISO_ORDINAL:
                const diff = dateValue.getTime() - new Date(Date.UTC(dateValue.getUTCFullYear(), 0, 0)).getTime();
                const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
                tracker.setValue(`${dateValue.getUTCFullYear()}-${Utils.padLeft(dayOfYear.toString(), 3, '0')}`);
                break;
            case DateType.TIMESTAMP:
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