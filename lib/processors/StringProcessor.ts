'use strict';

import { StringChain } from '../fields/StringChain.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ChainProcessor } from './ChainProcessor.ts';

class StringProcessor extends ChainProcessor<StringChain> {

    public override preProcess(tracker: ValueTracker): void {
        const { config: { trim, maxLength, truncate } } = this._field;
        if (typeof tracker.getValue() !== 'string') {
            tracker.addError('string/base');
            return;
        }

        const value = tracker.getValue() as string;
        if (trim) {
            tracker.setValue(value.trim());
        }
        if (maxLength != null && value.length > maxLength) {
            if (truncate) {
                tracker.setValue(value.slice(0, maxLength));
            }
            else {
                tracker.addError('string/maxLength');
                return;
            }
        }
    }

}

export { StringProcessor };