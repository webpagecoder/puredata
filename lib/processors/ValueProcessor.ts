'use strict';

import { ValueField } from '../fields/ValueField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Processor, State } from './Processor.ts';


class ValueProcessor extends Processor<ValueField> {

    public override process(tracker: ValueTracker): void {
        this.preProcess(tracker);
        const { mutable, value } = this._field.extendedProps;
        if (!mutable || tracker.getValue() === undefined) {
            tracker.setValue(value);
        }
    }

}

export { ValueProcessor };

