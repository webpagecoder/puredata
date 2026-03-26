'use strict';

import { Processor } from './Processor.ts';

class EnumProcessor extends Processor {

    process(tracker, state = {}) {
        const { structure, isArray } = this.field.props;
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

export { EnumProcessor };