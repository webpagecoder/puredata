'use strict';

import { EnumField } from './EnumField.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Processor } from '../Processor.ts';

/** Validates values against an enum field's list or key-value structure. */
class EnumProcessor extends Processor<EnumField> {

    /** Validates the value and maps enum keys to their configured values. */
    public override process(tracker: ValueTracker): void {
        const { structure } = this.field.config;
        if (Array.isArray(structure)) {
            if ((structure as unknown[]).indexOf(tracker.value) === -1) {
                tracker.addError('enum/allowedValues', { allowedValues: structure });
            }
        }
        else {
            if (Object.prototype.hasOwnProperty.call(structure, tracker.value as PropertyKey)) {
                tracker.setValue((structure as Record<PropertyKey, unknown>)[tracker.value as PropertyKey]);
            }
            else {
                tracker.addError('enum/allowedValues', { allowedValues: Object.keys(structure) });
            }
        }
    }

}

export { EnumProcessor };