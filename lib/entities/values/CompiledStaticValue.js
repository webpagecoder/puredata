'use strict';

const CompiledEntity = require("../CompiledEntity");


class CompiledStaticValue extends CompiledEntity {

    process(tracker) {
        const { mutable, value } = this.props.entity.props;
        if (!mutable || tracker.getValue() === undefined) {
            tracker.setValue(value);
        }
        return tracker;
    }

}

module.exports = CompiledStaticValue;

