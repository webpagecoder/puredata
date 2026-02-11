'use strict';

const Entity = require("../Entity");
const CompiledMixin = require('../CompiledMixin');
const ValueNode = require("../../tracker/ValueNode");
const CompiledEntity = require("../CompiledEntity");
const CompiledGenericChain = require("./CompiledGenericChain");
const NumberUtils = require("../../utils/NumberUtils");

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

module.exports = CompiledNumberChain;