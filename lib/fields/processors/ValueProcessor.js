'use strict';

import Processor from './Processor.js';


class ValueProcessor extends Processor {

    process(tracker) {
        const { mutable, value } = this.props.entity.props;
        if (!mutable || tracker.getValue() === undefined) {
            tracker.setValue(value);
        }
        return tracker;
    }

}

export default  ValueProcessor;

