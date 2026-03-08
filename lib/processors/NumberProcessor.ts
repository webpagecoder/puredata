// @ts-nocheck
'use strict';

import Utils from '../utils/Utils.ts';
import ChainProcessor from './ChainProcessor.ts';

class NumberProcessor extends ChainProcessor {

    preProcess(tracker) {
        const { entity } = this.props;
        const result = Utils.toNumber(tracker.getValue(), entity.props);
        if (result == null) {
            return tracker.addError('number/base');
        }
        tracker.setValue(result);
    }

}

export default NumberProcessor;