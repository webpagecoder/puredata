'use strict';

import { BooleanChain } from '../fields/BooleanChain.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ChainProcessor } from './ChainProcessor.ts';

class BooleanProcessor extends ChainProcessor<BooleanChain> {

    public override preProcess(tracker: ValueTracker): void {
        const { field } = this;
        const { autoConvert, extendedProps: { boolishPairs, allowBoolish, transformer } } = field;

        let value = transformer(tracker.getValue());

        if (typeof value === 'boolean') {
            return;
        }

        if (allowBoolish) {
            for (const [truthy, falsy] of boolishPairs) {
                if (truthy === value) {
                    tracker.setValue(autoConvert ? true : value);
                    return;
                }
                else if (falsy === value) {
                    tracker.setValue(autoConvert ? false : value);
                    return;
                }
            }
        }

        if(autoConvert) {
            tracker.setValue(Boolean(value));
            return;
        }

        tracker.addError('boolean/base');
    }
}

export { BooleanProcessor };