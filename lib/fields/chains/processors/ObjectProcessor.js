'use strict';

import ObjectUtils from '../../../utils/ObjectUtils.js';
import Processor from '../../processors/Processor.js';

class ObjectProcessor extends Processor {


    preProcess(tracker) {
        
        if (!ObjectUtils.isObject(tracker.getValue())) {
            return tracker.addError('object/isObject');
        }

        const { ensurePlain, clone, maxDepth, maxKeyCount } = this.props.entity.props;

        if (ensurePlain && !ObjectUtils.isPlainObject(tracker.getValue())) {
            return tracker.addError('object/ensurePlain');
        }

        if (maxDepth != null || maxKeyCount != null) {
            const result = ObjectUtils.getDepthAndKeyCount(tracker.getValue(), {
                maxDepth,
                maxKeyCount
            });
            if (result === false) {
                return tracker.addError('object/tooComplex', { maxDepth, maxKeyCount });
            }
        }

        if (clone) {
            // Clone object if transforms are to be performed
            tracker.setValue(ObjectUtils.clone(tracker.getValue()));
        }
    }

}

export default  ObjectProcessor;