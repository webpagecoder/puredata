'use strict';

import { BooleanChain } from './BooleanChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

/** Parses, validates, and optionally converts boolean-like values. */
class BooleanProcessor extends AnyProcessor<BooleanChain> {

    /** Converts configured boolean-like inputs and rejects unsupported values. */
    public override preProcess(tracker: ValueTracker): void {
        const { autoConvert, boolishPairs, transform } = this.field.config;

        const value = transform(tracker.value);

        if (typeof value === 'boolean') {
            return;
        }

        for (const [truthy, falsy] of boolishPairs) {
            if (truthy === value) {
                if (autoConvert) {
                    tracker.setValue(true);
                }
                return;
            }
            else if (falsy === value) {
                if (autoConvert) {
                    tracker.setValue(false);
                }
                return;
            }
        }

        tracker.addError('boolean/base');
    }

    /** Converts configured truthy and falsy inputs after pipeline processing. */
    public override postProcess(tracker: ValueTracker): void {
        const { boolishPairs, postConvert } = this.field.config;

        const value = tracker.value;

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