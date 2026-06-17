'use strict';

import { PathField } from '../PathField.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Processor } from '../Processor.ts';

class PathProcessor extends Processor<PathField> {

    public override process(tracker: ValueTracker): void {
        const { path, defaultOrCallback } = this._field.extendedProps;
        const isCallback = typeof defaultOrCallback === 'function';

        if(path.isSelf) {
            const resolvedValue = isCallback
                ? defaultOrCallback(tracker.getValue())
                : tracker.getValue();
            tracker.setValue(resolvedValue);
            return;
        }
        
        const referencedValueTracker = tracker.parent.resolvePath(path);
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
    }
}

export { PathProcessor };
