'use strict';

import NumberUtils from '../../utils/NumberUtils.js';
import CompiledGenericChain from './CompiledGenericChain.js';

class CompiledNumberChain extends CompiledGenericChain {

    preProcess(tracker) {
        const { entity } = this.props;
        const result = NumberUtils.toNumber(tracker.getValue(), entity.props);
        if (result == null) {
            return tracker.addError('number/number');
        }
        tracker.setValue(result);
    }

}

export default  CompiledNumberChain;