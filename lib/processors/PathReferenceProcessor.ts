'use strict';

import { Processor } from './Processor.ts';

class PathReferenceProcessor extends Processor {

    process(tracker) {
        const { field } = this.props;
        const { path, callback = x => x, defaultValue } = field.props;
        const referencedValueTracker = tracker.parent.getNodeByPath(path);
        let resolvedValue = undefined;
        if (referencedValueTracker) {
            resolvedValue = callback(referencedValueTracker.value);
        }

        if (resolvedValue === undefined) {
            tracker.setValue(defaultValue);
        }
        else {
            tracker.setValue(resolvedValue);
        }

        return tracker;
    }


}

export { PathReferenceProcessor };