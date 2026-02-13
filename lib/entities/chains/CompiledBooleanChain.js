'use strict';

import Entity  from '../Entity.js';
import CompiledMixin  from '../CompiledMixin.js';
import ValueNode  from '../../tracker/ValueNode.js';
import CompiledEntity  from '../CompiledEntity.js';
import CompiledGenericChain  from './CompiledGenericChain.js';
import NumberUtils  from '../../utils/NumberUtils.js';

class CompiledBooleanChain extends CompiledGenericChain {

    preProcess(tracker) {
        const {entity} = this.props;
        const {
            boolishPairs,
            allowBoolish,
            transformer,
            autoConvert
        } = entity.props;
        const parsedBool = BooleanUtils.parse(tracker.getValue(), {
            boolishPairs: allowBoolish ? boolishPairs : [],
            autoConvert,
            transformer
        });
        if (parsedBool == null) {
            return tracker.addError('boolean');
        }
        tracker.setValue(parsedBool);
    }


}

export default  CompiledBooleanChain;