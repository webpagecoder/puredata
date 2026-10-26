'use strict';

import { ArrayChain } from '../array/ArrayChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

/** Preprocesses array fields, including single-value casting and empty stripping. */
class ArrayProcessor<C extends ArrayChain = ArrayChain> extends AnyProcessor<C> {

    /** Validates the array value and applies configured preprocessing. */
    public override preProcess(tracker: ValueTracker): void {
        const { chainHandler, config: { castSingle, empties, stripEmpties } } = this.field;

        const value = tracker.value;

        if (!Array.isArray(value)) {
            if (castSingle && value !== undefined) {
                tracker.setValue([value]);
            }
            else {
                tracker.addError('array/base');
                return;
            }
        }

        if (stripEmpties) {
            tracker.setValue(chainHandler.stripEmpties(tracker.value as unknown[], empties).value);
        }

    }
}

export { ArrayProcessor };