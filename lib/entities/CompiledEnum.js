'use strict';

import ValueNode  from '../tracker/ValueNode.js';
import CompiledEntity  from './CompiledEntity.js';

class CompiledEnum extends CompiledEntity {

    process(tracker, state = {}) {
        const { structure, isArray } = this.entity.props;
        if (isArray) {
            if (structure.indexOf(tracker.getValue()) === -1) {
                tracker.addError('enum/allowedValues', { allowedValues: structure });
            }
        }
        else {
            if (Object.prototype.hasOwnProperty.call(structure, tracker.getValue())) {
                tracker.setValue(structure[tracker.getValue()]);
            }
            else {
                tracker.addError('enum/allowedValues', { allowedValues: Object.keys(structure) });
            }
        }
        return tracker;
    }

}

export default  CompiledEnum;