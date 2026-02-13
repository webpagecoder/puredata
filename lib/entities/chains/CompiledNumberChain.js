'use strict';

import Entity  from '../Entity.js';
import CompiledMixin  from '../CompiledMixin.js';
import ValueNode  from '../../tracker/ValueNode.js';
import CompiledEntity  from '../CompiledEntity.js';
import CompiledGenericChain  from './CompiledGenericChain.js';
import NumberUtils  from '../../utils/NumberUtils.js';

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