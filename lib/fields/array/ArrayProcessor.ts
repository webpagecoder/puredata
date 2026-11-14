'use strict';

import { ArrayChain } from '../array/ArrayChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

/** Preprocesses array fields, including single-value casting and empty stripping. */
class ArrayProcessor<C extends ArrayChain = ArrayChain> extends AnyProcessor<C> {

    /** Validates the array value and applies configured preprocessing. */
    public override preProcess(tracker: ValueTracker): void {
        super.preProcess(tracker);
        if (tracker.fail) {
            return;
        }

        const { chainHandler, config: { castSingle, cloneValue, empties, stripEmpties } } = this.field;

        if (!Array.isArray(tracker.value)) {
            if (castSingle && tracker.value !== undefined) {
                tracker.setValue([tracker.value]);
            }
            else {
                tracker.addError('array/base');
                return;
            }
        }
        else if (cloneValue) {
            tracker.setValue(this._deepCloneArray(tracker.value as unknown[]));
        }

        if (stripEmpties) {
            tracker.setValue(chainHandler.stripEmpties(tracker.value as unknown[], empties).value);
        }

    }

    private _deepCloneArray(arr: unknown[]): unknown[] {
        const cloned = [];
        for(let i = 0, max = arr.length; i < max; i++) {
            const item = arr[i];
            if (Array.isArray(item)) {
                cloned[i] = this._deepCloneArray(item);
            }
            else {
                cloned[i] = item;
            }
        }
        return cloned;
    }

}

export { ArrayProcessor };