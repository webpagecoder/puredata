'use strict';

import Utils from '../utils/Utils.js';
import ChainProcessor from './ChainProcessor.js';

class ObjectProcessor extends ChainProcessor {


    preProcess(tracker) {
        
        if (!Utils.isObject(tracker.getValue())) {
            return tracker.addError('object/base');
        }

        const { ensurePlain, clone, maxDepth, maxKeyCount } = this.props.entity.props;

        if (ensurePlain && !Utils.isPlainObject(tracker.getValue())) {
            return tracker.addError('object/plain');
        }

        if (maxDepth != null || maxKeyCount != null) {
            const result = Utils.getDepthAndKeyCount(tracker.getValue(), {
                maxDepth,
                maxKeyCount
            });
            if (result === false) {
                return tracker.addError('object/tooComplex', { maxDepth, maxKeyCount });
            }
        }

        if (clone) {
            // Clone object if transforms are to be performed
            tracker.setValue(Utils.clone(tracker.getValue()));
        }
    }

}

export default ObjectProcessor;