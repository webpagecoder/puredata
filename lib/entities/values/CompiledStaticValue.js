'use strict';

import CompiledEntity  from '../CompiledEntity.js';


class CompiledStaticValue extends CompiledEntity {

    process(tracker) {
        const { mutable, value } = this.props.entity.props;
        if (!mutable || tracker.getValue() === undefined) {
            tracker.setValue(value);
        }
        return tracker;
    }

}

export default  CompiledStaticValue;

