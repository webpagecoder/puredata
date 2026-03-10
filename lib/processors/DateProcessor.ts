// @ts-nocheck
'use strict';

import { Utils } from '../utils/Utils.ts';
import { ChainProcessor } from './ChainProcessor.ts';


class DateProcessor extends ChainProcessor {


    ensureEmptyQueue(type) {
        if (this.field.props.pipeline.length > 0) {
            throw new Error(type + ' processor must be the first processor in the chain, if used.');
        }
    }

    preProcess(tracker, state = {}) {
        const { field } = this.props;
        const { inputType } = field.props;

        state.originalValue = tracker.getValue();
        if (inputType) {
            //todo something doesnt seem right here - shouldnt the date/base error be addded....
            state.inputType = inputType;
        }
        else {
            const parsedDate = Utils.parseDate(tracker.getValue());
            if (!parsedDate) {
                return tracker.addError('date/base');
            }
            else {
                state.inputType = parsedDate.type;
                tracker.setValue(parsedDate.date);
            }
        }
    }

    postProcess(tracker, state = {}) {
        const { field } = this.props;
        const { inputType } = state;
        const outputType = field.props.outputType || inputType;
        const dateValue = tracker.getValue();
        if (!(dateValue instanceof Date) || isNaN(dateValue.getTime())) {
            return tracker.addError('date/base');
        }

        switch (outputType) {
            case DATE_TYPES.ISO:
                tracker.setValue(dateValue.toISOString());
                break;
            case DATE_TYPES.ISO_WEEK:
                const target = new Date(dateValue);
                const dayNum = target.getUTCDay() || 7;
                target.setUTCDate(target.getUTCDate() + 4 - dayNum);
                const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
                const weekNum = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
                tracker.setValue(`${target.getUTCFullYear()}-W${Utils.padLeft(weekNum.toString(), 2, '0')}-${dayNum}`);
                break;
            case DATE_TYPES.ISO_ORDINAL:
                const diff = dateValue - new Date(Date.UTC(dateValue.getUTCFullYear(), 0, 0));
                const dayOfYear = Math.floor(diff / 1000 * 60 * 60 * 24);
                tracker.setValue(`${dateValue.getUTCFullYear()}-${Utils.padLeft(dayOfYear.toString(), 3, '0')}`);
                break;
            case DATE_TYPES.TIMESTAMP:
                tracker.setValue(dateValue.getTime());
                break;
        }
    }


}

export { DateProcessor };