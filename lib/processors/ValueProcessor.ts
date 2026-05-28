'use strict';

import { ValueField } from '../fields/ValueField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Processor, State } from './Processor.ts';


class ValueProcessor extends Processor<ValueField> {

    public override actualProcess(tracker: ValueTracker, state: State = {}): ValueTracker {
        this.preProcess(tracker, state);
        const { mutable, value } = this._field.extendedProps;
        if (!mutable || tracker.getValue() === undefined) {
            tracker.setValue(value);
        }
        return tracker;
    }

}

export { ValueProcessor };

