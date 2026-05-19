'use strict';

import { ArrayChain } from '../fields/ArrayChain.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ChainProcessor } from './ChainProcessor.ts';

class ArrayProcessor<C extends ArrayChain = ArrayChain> extends ChainProcessor<C> {

    public override preProcess(tracker: ValueTracker): void {
        const field = this.field as ArrayChain;

        const { label } = field;
        const { castSingle } = field.props;

        if (!Array.isArray(tracker.getValue())) {
            if (castSingle && tracker.getValue() !== undefined) {
                tracker.setValue([tracker.getValue()]);
            }
            else {
                tracker.addError('array/base');
            }
        }
        else {
            const { maxLength, removeEmpties, emptyValues } = field.props;

            if (removeEmpties) {
                tracker.setValue(field.props.chainHandler.removeEmpties(tracker.getValue(), emptyValues).value);
            }

            if (maxLength != null) {
                const result = field.props.chainHandler.hasMaxLength(tracker.getValue(), maxLength);
                if (result.fail) {
                    tracker.addError('array/maxLength', {
                        maxLength,
                        label
                    });
                }
            }
        }
    }


}

export { ArrayProcessor };