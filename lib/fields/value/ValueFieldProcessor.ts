'use strict';

import { ValueField } from './ValueField.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Processor, State } from '../Processor.ts';

class ValueFieldProcessor extends Processor<ValueField> {

    public override process(tracker: ValueTracker): void {
        this.preProcess(tracker);
        const { mutable, value } = this._field.props;
        if (!mutable || tracker.getValue() === undefined) {
            tracker.setValue(value);
        }
    }

}

export { ValueFieldProcessor };

