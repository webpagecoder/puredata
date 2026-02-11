'use strict';

const Entity = require("../Entity");
const CompiledMixin = require('../CompiledMixin');
const ValueNode = require("../../tracker/ValueNode");
const CompiledEntity = require("../CompiledEntity");
const CompiledGenericChain = require("./CompiledGenericChain");
const NumberUtils = require("../../utils/NumberUtils");

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

module.exports = CompiledBooleanChain;