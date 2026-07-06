'use strict';

import { ArrayChain } from '../array/ArrayChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

class ArrayProcessor<C extends ArrayChain = ArrayChain> extends AnyProcessor<C> {

    public override preProcess(tracker: ValueTracker): void {
        const { autoConvert, label, props } = this.field;
        const value = tracker.getValue();

        if (!Array.isArray(value)) {
            if (autoConvert || props.castSingle && value !== undefined) {
                tracker.setValue([value]);
            }
            else {
                tracker.addError('array/base');
                return;
            }
        }

        const { chainHandler, maxLength, removeEmpties, emptyValues } = props;

        if (removeEmpties) {
            tracker.setValue(chainHandler.removeEmpties(tracker.getValue() as unknown[], emptyValues)._value);
        }

        if (maxLength != null) {
            const result = chainHandler.maxLength(tracker.getValue() as unknown[], maxLength);
            if (result._fail) {
                tracker.addError('array/maxLength', {
                    maxLength,
                    label
                });
            }
        }
    }
}

export { ArrayProcessor };