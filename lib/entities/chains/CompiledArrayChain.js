'use strict';

const Entity = require("../Entity");
const CompiledMixin = require('../CompiledMixin');
const ValueNode = require("../../tracker/ValueNode");
const CompiledEntity = require("../CompiledEntity");
const CompiledGenericChain = require("./CompiledGenericChain");
const NumberUtils = require("../../utils/NumberUtils");

class CompiledArrayChain extends CompiledGenericChain {

    preProcess(tracker) {
        const {entity} = this.props;
        const { label } = entity;
        const { castSingle } = entity.props;

        if (!Array.isArray(tracker.getValue())) {
            if (castSingle && tracker.getValue() !== undefined) {
                tracker.setValue([tracker.getValue()]);
            }
            else {
                return tracker.addError('array/array');
            }
        }
        else {
            const { maxLength, removeEmpties, emptyValues } = entity.props;

            if (removeEmpties) {
                tracker.setValue(entity.props.processors.removeEmpties(tracker.getValue(), emptyValues).value);
            }

            if (maxLength != null) {
                const result = entity.props.processors.hasMaxLength(tracker.getValue(), maxLength);
                if (result.fail) {
                    return tracker.addError('array/maxLength', {
                        maxLength,
                        label
                    });
                }
            }
        }
    }

}

module.exports = CompiledArrayChain;