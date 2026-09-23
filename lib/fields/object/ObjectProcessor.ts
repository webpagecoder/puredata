'use strict';

import { ObjectChain } from './ObjectChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Utils } from '../../Utils.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';
import { AnyChain } from '../any/AnyChain.ts';

class ObjectProcessor<C extends ObjectChain = ObjectChain> extends AnyProcessor<C> {

    public override preProcess(tracker: ValueTracker): void {
        super.preProcess(tracker);

        const value = tracker.getValue();

        if (!Utils.isObject(value)) {
            tracker.addError('object/base');
            return;
        }

        const {
            chainHandler,
            config: {
                cloneObject,
                ensurePlain,
                maxDepth,
                maxKeyCount,
                stripEmpties,
                stripNestedEmpties,
            }
        } = this._field as ObjectChain;

        if (ensurePlain && !Utils.isPlainObject(value)) {
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

        if (cloneObject) {
            tracker.setValue(Utils.clone(value));
        }

        if (stripNestedEmpties) {
            const val = chainHandler.stripNestedEmpties(tracker.getValue() as object).value;
            tracker.setValue(
                val
            );
        }
        else if (stripEmpties) {
            const val = chainHandler.stripEmpties(tracker.getValue() as object).value;
            tracker.setValue(
                val
            );
        }
    }
}

export { ObjectProcessor };