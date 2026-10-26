'use strict';

import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Utils } from '../../Utils.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';
import { ObjectChain } from './ObjectChain.ts';

/** Validates object values and applies configured object transformations. */
class ObjectProcessor<C extends ObjectChain = ObjectChain> extends AnyProcessor<C> {

    /** Checks object constraints and applies configured cloning and stripping. */
    public override preProcess(tracker: ValueTracker): void {
        super.preProcess(tracker);

        const value = tracker.value;

        if (!Utils.isObject(value)) {
            tracker.addError('object/base');
            return;
        }

        const {
            chainHandler,
            config: {
                clone,
                plainOnly,
                maxDepth,
                maxKeyCount,
                stripEmpties,
                stripNestedEmpties,
            }
        } = this.field as ObjectChain;

        if (plainOnly && !Utils.isPlainObject(value)) {
            tracker.addError('object/plain');
            return;
        }

        if (maxDepth != null || maxKeyCount != null) {
            const result = Utils.getDepthAndKeyCount(value as object, {
                maxDepth,
                maxKeyCount
            });
            if (result === false) {
                tracker.addError('object/tooComplex', { maxDepth, maxKeyCount });
                return;
            }
        }

        if (clone) {
            tracker.setValue(Utils.clone(value));
        }

        if (stripNestedEmpties) {
            const val = chainHandler.stripNestedEmpties(tracker.value as object).value;
            tracker.setValue(
                val
            );
        }
        else if (stripEmpties) {
            const val = chainHandler.stripEmpties(tracker.value as object).value;
            tracker.setValue(
                val
            );
        }
    }
}

export { ObjectProcessor };
