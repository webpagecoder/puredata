'use strict';

import { ObjectChain } from '../fields/ObjectChain.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Utils } from '../Utils.ts';
import { ChainProcessor, ChainProcessorConstructorParams } from './ChainProcessor.ts';
import { State } from './Processor.ts';

export type ObjectProcessorProps<C extends ObjectChain = ObjectChain> = ChainProcessorConstructorParams<C> & {
    ensurePlain: boolean;
    cloneObject: boolean;
    maxDepth?: number;
    maxKeyCount?: number;
};

class ObjectProcessor<C extends ObjectChain = ObjectChain> extends ChainProcessor<C> {

    public override preProcess(tracker: ValueTracker, _state?: State): void {

        if (!Utils.isObject(tracker.getValue())) {
            tracker.addError('object/base');
            return;
        }

        const { ensurePlain, cloneObject, maxDepth, maxKeyCount } = this._field;

        if (ensurePlain && !Utils.isPlainObject(tracker.getValue())) {
            tracker.addError('object/plain');
            return;
        }

        if (maxDepth != null || maxKeyCount != null) {
            const result = Utils.getDepthAndKeyCount(tracker.getValue(), {
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
            tracker.setValue(Utils.clone(tracker.getValue()));
        }
    }
}

export { ObjectProcessor };