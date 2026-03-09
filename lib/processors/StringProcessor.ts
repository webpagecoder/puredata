// @ts-nocheck
'use strict';

import ChainProcessor from './ChainProcessor.ts';

class StringProcessor extends ChainProcessor {


    preProcess(tracker) {
        const {field} = this.props;
        const { trim, maxLength, truncate } = field.props;
        if (typeof tracker.getValue() !== 'string') {
            return tracker.addError('string/base');
        }
        if (trim) {
            tracker.setValue(tracker.getValue().trim());
        }
        if (maxLength != null && tracker.getValue().length > maxLength) {
            if (truncate) {
                tracker.setValue(tracker.getValue().slice(0, maxLength));
            }
            else {
                return tracker.addError('string/maxLength');
            }
        }
    }

}

export default StringProcessor;