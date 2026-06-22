'use strict';

import { StringChain } from '../string/StringChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { ChainProcessor } from '../ChainProcessor.ts';

class StringProcessor extends ChainProcessor<StringChain> {

    public override preProcess(tracker: ValueTracker): void {
        const {
            autoConvert,
            extendedProps: {
                matching,
                maxLength,
                trim,
                truncate
            }
        } = this._field;

        if (typeof tracker.getValue() !== 'string') {
            if (!autoConvert) {
                tracker.addError('string/base');
                return;
            }
            tracker.setValue(String(tracker.getValue()));
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