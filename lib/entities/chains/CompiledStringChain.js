'use strict';

const Entity = require("../Entity");
const CompiledMixin = require('../CompiledMixin');
const ValueNode = require("../../tracker/ValueNode");
const CompiledEntity = require("../CompiledEntity");
const CompiledGenericChain = require("./CompiledGenericChain");
const NumberUtils = require("../../utils/NumberUtils");
const ObjectUtils = require("../../utils/ObjectUtils");
const StringUtils = require("../../utils/StringUtils");

class CompiledStringChain extends CompiledGenericChain {


    preProcess(tracker) {
        const {entity} = this.props;
        const { trim, maxLength, truncate } = entity.props;
        if (typeof tracker.getValue() !== 'string') {
            return tracker.addError('string/string');
        }
        if (trim) {
            tracker.setValue(StringUtils.trim(tracker.getValue()));
        }
        if (maxLength != null && tracker.getValue().length > maxLength) {
            if (truncate) {
                tracker.setValue(tracker.getValue().slice(0, maxLength));
            }
            else {
                return tracker.addError('string/maxLength');
            }
        }
    }

}

module.exports = CompiledStringChain;