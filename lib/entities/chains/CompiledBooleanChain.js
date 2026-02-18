'use strict';

import CompiledGenericChain  from './CompiledGenericChain.js';

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