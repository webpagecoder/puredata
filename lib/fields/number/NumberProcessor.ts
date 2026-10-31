'use strict';

import { NumberChain } from '../number/NumberChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

/** Parses and validates numeric values using the chain's conversion settings. */
class NumberProcessor extends AnyProcessor<NumberChain> {

    /** Converts a value to a number and records an error if parsing fails. */
    public override preProcess(tracker: ValueTracker): void {
        super.preProcess(tracker);
        if (tracker.fail) {
            return;
        }

        let { value } = tracker;
        const { autoConvert, safe, finite, precision } = this.field.config;
        const valueType = typeof value;

        let num;
        if (autoConvert === 'force') {
            num = Number(value);
        }
        else if (valueType === 'string' && autoConvert === 'normal') {
            // Trim whitespace from the string and check if it's empty.
            value = (value as string).trim();
            if (value === '') {
                tracker.addError('number/base');
                return;
            }

            // Check if the string is a valid int or decimal representation.
            if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value as string)) {
                tracker.addError('number/base');
                return;
            }

            // Convert the string to a number and check if it's NaN.
            num = Number(value);
        }
        else if (valueType !== 'number') {
            // Can't convert non-number, non-string values to a number.
            tracker.addError('number/base');
            return;
        }
        else {
            num = value as number;
        }


        // If the value is a number, check if it's NaN.
        if (Number.isNaN(num)) {
            tracker.addError('number/base');
            return;
        }

        if (finite && !Number.isFinite(num)) {
            tracker.addError('number/base');
            return;
        }

        if (safe && (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER)) {
            tracker.addError('number/base');
            return;
        }

        if (
            precision && valueType === 'string' &&
            String(num) !== (value as string) &&
            String(num) !== (value as string).replace(/\.0+$/, '')
        ) {
            tracker.addError('number/base');
            return;
        }

        tracker.setValue(num);
    }

}

export { NumberProcessor };