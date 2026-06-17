'use strict';

import { ArrayChain } from '../array/ArrayChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { ChainProcessor } from '../ChainProcessor.ts';

class ArrayProcessor<C extends ArrayChain = ArrayChain> extends ChainProcessor<C> {

    public override preProcess(tracker: ValueTracker): void {
        const { autoConvert, label, extendedProps } = this.field;
        const value = tracker.getValue();

        if (!Array.isArray(value)) {
            if (autoConvert || extendedProps.castSingle && value !== undefined) {
                tracker.setValue([value]);
            }
            else {
                tracker.addError('array/base');
                return;
            }
        }

        const { chainHandler, maxLength, removeEmpties, emptyValues } = extendedProps;

        if (removeEmpties) {
            tracker.setValue(chainHandler.removeEmpties(tracker.getValue() as unknown[], emptyValues).value);
        }

        if (maxLength != null) {
            const result = chainHandler.maxLength(tracker.getValue() as unknown[], maxLength);
            if (result.fail) {
                tracker.addError('array/maxLength', {
                    maxLength,
                    label
                });
            }
        }
    }
}

export { ArrayProcessor };