'use strict';

import { Utils } from '../utils/Utils.ts';
import { ChainProcessor } from './ChainProcessor.ts';

class NumberProcessor extends ChainProcessor {

    preProcess(tracker) {
        const { field } = this.props;
        const result = Utils.toNumber(tracker.getValue(), field.props);
        if (result == null) {
            return tracker.addError('number/base');
        }
        tracker.setValue(result);
    }

}

export { NumberProcessor };