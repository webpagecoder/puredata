'use strict';

import { NumberChain } from '../number/NumberChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Utils } from '../../Utils.ts';
import { ChainProcessor } from '../ChainProcessor.ts';

class NumberProcessor extends ChainProcessor<NumberChain> {

    public override preProcess(tracker: ValueTracker): void {
        const { autoConvert, ensureSafe, ensureFinite, preservePrecision } = this._field.extendedProps;
        const result = Utils.parseNumber(tracker.getValue(), {
            autoConvert,
            ensureSafe,
            ensureFinite,
            preservePrecision
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