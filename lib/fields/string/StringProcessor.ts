'use strict';

import { StringChain } from '../string/StringChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

/** Converts, trims, and length-checks string field values. */
class StringProcessor extends AnyProcessor<StringChain> {

    /** Converts supported values to strings and applies configured preprocessing. */
    public override preProcess(tracker: ValueTracker): void {
        const {
            autoConvert,
            config: { trim }
        } = this.field;

        if (typeof tracker.value !== 'string') {
            if (!autoConvert) {
                tracker.addError('string/base');
                return;
            }
            tracker.setValue(String(tracker.value));
        }

        if (trim) {
            tracker.setValue((tracker.value as string).trim());
        }
    }

}

export { StringProcessor };