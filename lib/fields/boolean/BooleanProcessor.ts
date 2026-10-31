'use strict';

import { BooleanChain } from './BooleanChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

/** Parses, validates, and optionally converts boolean-like values. */
class BooleanProcessor extends AnyProcessor<BooleanChain> {

    /** Converts configured boolean-like inputs and rejects unsupported values. */
    public override preProcess(tracker: ValueTracker): void {
        super.preProcess(tracker);
        if (tracker.fail) {
            return;
        }

        const { autoConvert, boolishPairs, boolishTransform } = this.field.config;

        const { value } = tracker;

        if (typeof value === 'boolean') {
            return;
        }

        // If autoConvert is disabled, we reject any non-boolean value.
        if (autoConvert === 'none') {
            tracker.addError('boolean/base');
            return;
        }

        // If autoConvert is forced, we convert the value to a boolean.
        if (autoConvert === 'force') {
            tracker.setValue(Boolean(value));
            return;
        }

        // Check boolish pairs for a match, using the configured transform function.
        const transformedValue = boolishTransform(value);
        for (const [truthy, falsy] of boolishPairs) {
            if (truthy === transformedValue || falsy === transformedValue) {
                tracker.setValue(transformedValue);
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