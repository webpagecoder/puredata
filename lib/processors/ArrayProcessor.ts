// @ts-nocheck
'use strict';

import ChainProcessor from './ChainProcessor.ts';

class ArrayProcessor extends ChainProcessor {

    preProcess(tracker) {
        const {field} = this.props;
        const { label } = field;
        const { castSingle } = field.props;

        if (!Array.isArray(tracker.getValue())) {
            if (castSingle && tracker.getValue() !== undefined) {
                tracker.setValue([tracker.getValue()]);
            }
            else {
                return tracker.addError('array/array');
            }
        }
        else {
            const { maxLength, removeEmpties, emptyValues } = field.props;

            if (removeEmpties) {
                tracker.setValue(field.props.processors.removeEmpties(tracker.getValue(), emptyValues).value);
            }

            if (maxLength != null) {
                const result = field.props.processors.hasMaxLength(tracker.getValue(), maxLength);
                if (result.fail) {
                    return tracker.addError('array/maxLength', {
                        maxLength,
                        label
                    });
                }
            }
        }
    }

}

export default ArrayProcessor;