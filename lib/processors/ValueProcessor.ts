// @ts-nocheck
'use strict';

import Processor from './Processor.ts';


class ValueProcessor extends Processor {

    process(tracker) {
        const { mutable, value } = this.props.entity.props;
        if (!mutable || tracker.getValue() === undefined) {
            tracker.setValue(value);
        }
        return tracker;
    }

}

export default ValueProcessor;

