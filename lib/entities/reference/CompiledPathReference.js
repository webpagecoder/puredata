'use strict';

import CompiledEntity  from '../CompiledEntity.js';

class CompiledPathReference extends CompiledEntity {

    process(tracker) {
        const { entity } = this.props;
        const { path, callback = x => x, defaultValue } = entity.props;
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

export default  CompiledPathReference;