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
                    return tracker.setValue(autoConvert ? true : value);
                }
                else if (falsy === value) {
                    return tracker.setValue(autoConvert ? false : value);
                }
            }
        }

        if(autoConvert) {
            return tracker.setValue(Boolean(value));
        }

        tracker.addError('boolean/base');
    }
}

export { BooleanProcessor };