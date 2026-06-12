'use strict';

import { EnumField } from '../fields/EnumField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Processor } from './Processor.ts';

class EnumProcessor extends Processor<EnumField> {

    public override process(tracker: ValueTracker): void {
        const { structure, isArray } = this.field.extendedProps;
        if (isArray) {
            if ((structure as unknown[]).indexOf(tracker.getValue()) === -1) {
                tracker.addError('enum/allowedValues', { allowedValues: structure });
            }
        }
        else {
            if (Object.prototype.hasOwnProperty.call(structure, tracker.getValue() as PropertyKey)) {
                tracker.setValue((structure as Record<PropertyKey, unknown>)[tracker.getValue() as PropertyKey]);
            }
            else {
                tracker.addError('enum/allowedValues', { allowedValues: Object.keys(structure) });
            }
        }
    }

}

export { EnumProcessor };