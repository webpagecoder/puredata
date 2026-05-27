'use strict';

import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Processor, State } from './Processor.ts';

class PathReferenceProcessor extends Processor<PathReferenceField> {

    public override actualProcess(tracker: ValueTracker): ValueTracker {
        const { path, defaultOrCallback } = this._field;
        const referencedValueTracker = tracker.parent.getNodeByPath(path);
        let resolvedValue = undefined;
        if (referencedValueTracker) {
            resolvedValue = typeof defaultOrCallback === 'function'
                ? defaultOrCallback(referencedValueTracker.getValue())
                : referencedValueTracker.getValue();
        }

        if (resolvedValue === undefined) {
            tracker.setValue(typeof defaultOrCallback === 'function' ? defaultOrCallback() : defaultOrCallback);
        }
        else {
            tracker.setValue(resolvedValue);
        }

        return tracker;
    }


}

export { PathReferenceProcessor };