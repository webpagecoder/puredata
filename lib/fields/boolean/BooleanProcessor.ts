'use strict';

import { BooleanChain } from './BooleanChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

class BooleanProcessor extends AnyProcessor<BooleanChain> {

    public override preProcess(tracker: ValueTracker): void {
        const { field } = this;
        const { autoConvert, props: { boolishPairs, allowBoolish, transformer } } = field;

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