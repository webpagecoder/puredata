// @ts-nocheck
'use strict';

import { Processor } from './Processor.ts';

class PathReferenceProcessor extends Processor {

    process(tracker) {
        const { field } = this.props;
        const { path, callback = x => x, defaultValue } = field.props;
        const referencedValueNode = tracker.parent.getNodeByPath(path);
        let resolvedValue = undefined;
        if (referencedValueNode) {
            resolvedValue = callback(referencedValueNode.value);
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