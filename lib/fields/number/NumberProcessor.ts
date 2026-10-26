'use strict';

import { NumberChain } from '../number/NumberChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Utils } from '../../Utils.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

/** Parses and validates numeric values using the chain's conversion settings. */
class NumberProcessor extends AnyProcessor<NumberChain> {

    /** Converts a value to a number and records an error if parsing fails. */
    public override preProcess(tracker: ValueTracker): void {
        const { autoConvert, safe, finite, precision } = this.field.config;
        const result = Utils.parseNumber(tracker.value, {
            autoConvert,
            safe,
            finite,
            precision
        });
        if (result == null) {
            tracker.addError('number/base');
        }
        else {
            tracker.setValue(result);
        }
    }

}

export { NumberProcessor };