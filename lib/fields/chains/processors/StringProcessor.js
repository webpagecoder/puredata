'use strict';

import ChainProcessor from './ChainProcessor.js';

class StringProcessor extends ChainProcessor {


    preProcess(tracker) {
        const {entity} = this.props;
        const { trim, maxLength, truncate } = entity.props;
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