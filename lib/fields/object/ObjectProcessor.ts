'use strict';

import { ObjectChain } from './ObjectChain.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Utils } from '../../Utils.ts';
import { AnyProcessor } from '../any/AnyProcessor.ts';

class ObjectProcessor<C extends ObjectChain = ObjectChain> extends AnyProcessor<C> {

    public override preProcess(tracker: ValueTracker): void {
        super.preProcess(tracker);

        const value = tracker.getValue();

        if (!Utils.isObject(value)) {
            tracker.addError('object/base');
            return;
        }

        const { ensurePlain, cloneObject, maxDepth, maxKeyCount } = this._field.props;

        if (ensurePlain && !Utils.isPlainObject(value)) {
            tracker.addError('object/plain');
            return;
        }

        if (maxDepth != null || maxKeyCount != null) {
            const result = Utils.getDepthAndKeyCount(value as object, {
                maxDepth,
                maxKeyCount
            });
            if (result === false) {
                tracker.addError('object/tooComplex', { maxDepth, maxKeyCount });
                return;
            }
        }

        if (cloneObject) {
            // Clone object if transforms are to be performed
            tracker.setValue(Utils.clone(value));
        }
    }
}

export { ObjectProcessor };