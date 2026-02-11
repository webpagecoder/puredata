'use strict';

const ValueNode = require("../tracker/ValueNode");
const CompiledEntity = require("./CompiledEntity");

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

module.exports = CompiledEnum;