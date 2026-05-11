'use strict';

import { NumberChain } from '../fields/NumberChain.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Utils } from '../utils/Utils.ts';
import { ChainProcessor } from './ChainProcessor.ts';
import { State } from './Processor.ts';

class NumberProcessor extends ChainProcessor<NumberChain> {

    public override preProcess(tracker: ValueTracker, state: State = {}): void {
        const { _field } = this;
        const result = Utils.parseNumber(tracker.getValue(), {
            autoConvert: _field.autoConvert,
            ensureSafe: _field.ensureSafe,
            ensureFinite: _field.ensureFinite,
            preservePrecision: _field.preservePrecision
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