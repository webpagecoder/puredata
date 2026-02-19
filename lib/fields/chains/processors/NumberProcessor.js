'use strict';

import NumberUtils from '../../../utils/NumberUtils.js';
import Processor from '../../processors/Processor.js';

class NumberProcessor extends Processor {

    preProcess(tracker) {
        const { entity } = this.props;
        const result = NumberUtils.toNumber(tracker.getValue(), entity.props);
        if (result == null) {
            return tracker.addError('number/number');
        }
        tracker.setValue(result);
    }

}

export default  NumberProcessor;