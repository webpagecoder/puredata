'use strict';

import { ReferenceField } from './ReferenceField.ts';
import { ValueTracker } from '../../../tracker/ValueTracker.ts';
import { Processor } from '../../Processor.ts';

/** Resolves a reference field's target value or configured fallback. */
class ReferenceProcessor extends Processor<ReferenceField> {

    /** Reads the referenced value and applies its fallback when no value is available. */
    public override process(tracker: ValueTracker): void {
        const { path, defaultOrCallback } = this.field.config;
        const isCallback = typeof defaultOrCallback === 'function';

        if(path.isSelf) {
            const resolvedValue = isCallback
                ? defaultOrCallback(tracker.value)
                : tracker.value;
            tracker.setValue(resolvedValue);
            return;
        }
        
        const referencedValueTracker = tracker.parent.resolvePath(path);
        let resolvedValue = undefined;
        if (referencedValueTracker) {
            resolvedValue = isCallback
                ? defaultOrCallback(referencedValueTracker.value)
                : referencedValueTracker.value;
        }

        if (resolvedValue === undefined) {
            tracker.setValue(isCallback ? defaultOrCallback() : defaultOrCallback);
        }
        else {
            tracker.setValue(resolvedValue);
        }
    }
}

export { ReferenceProcessor };
