'use strict';

import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Processor } from './Processor.ts';

class PathReferenceProcessor extends Processor<PathReferenceField> {

    public override actualProcess(tracker: ValueTracker): ValueTracker {
        const { path, defaultOrCallback } = this._field.extendedProps;
        const isCallback = typeof defaultOrCallback === 'function';

        if(path.isSelf) {
            const resolvedValue = isCallback
                ? defaultOrCallback(tracker.getValue())
                : tracker.getValue();
            tracker.setValue(resolvedValue);
            return tracker;
        }

        const referencedValueTracker = tracker.parent.getNodeByPath(path);
        let resolvedValue = undefined;
        if (referencedValueTracker) {
            resolvedValue = isCallback
                ? defaultOrCallback(referencedValueTracker.getValue())
                : referencedValueTracker.getValue();
        }

        if (resolvedValue === undefined) {
            tracker.setValue(isCallback ? defaultOrCallback() : defaultOrCallback);
        }
        else {
            tracker.setValue(resolvedValue);
        }

        return tracker;
    }
}

export { PathReferenceProcessor };
