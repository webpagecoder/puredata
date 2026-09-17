'use strict';

import { ArrayChain } from '../array/ArrayChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

class ArrayProcessor<C extends ArrayChain = ArrayChain> extends AnyProcessor<C> {

    public override preProcess(tracker: ValueTracker): void {
        const { castSingle, chainHandler, emptyValues, stripEmpties } = this.field.configuration;

        const value = tracker.getValue();

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
            tracker.setValue(chainHandler.stripEmpties(tracker.getValue() as unknown[], emptyValues).value);
        }

    }
}

export { ArrayProcessor };