'use strict';

import { BooleanChain } from './BooleanChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

class BooleanProcessor extends AnyProcessor<BooleanChain> {

    public override preProcess(tracker: ValueTracker): void {
        const { field } = this;
        const { autoConvert, props: { boolishPairs, transformer } } = field;

        const value = transformer(tracker.getValue());

        if (typeof value === 'boolean') {
            return;
        }

        for (const [truthy, falsy] of boolishPairs) {
            if (truthy === value) {
                if(autoConvert) {
                    tracker.setValue(true);
                }
                return;
            }
            else if (falsy === value) {
                if(autoConvert) {
                    tracker.setValue(false);
                }
                return;
            }
        }

        tracker.addError('boolean/base');
    }

    public override postProcess(tracker: ValueTracker): void {
        const { field } = this;
        const { props: { boolishPairs, postConvert } } = field;

        const value = tracker.getValue();

        if (typeof value === 'boolean') {
            return;
        }

        if (postConvert) {
            for (const [truthy, falsy] of boolishPairs) {
                if (truthy === value) {
                    tracker.setValue(true);
                    return;
                }
                else if (falsy === value) {
                    tracker.setValue(false);
                    return;
                }
            }
        }
    }

}

export { BooleanProcessor };