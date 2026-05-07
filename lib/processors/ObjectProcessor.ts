'use strict';

import { ObjectChain } from '../fields/ObjectChain.ts';
import { Chain } from '../fields/Chain.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Utils } from '../utils/Utils.ts';
import { ChainProcessor, ChainProcessorProps } from './ChainProcessor.ts';
import { State } from './Processor.ts';

type ObjectFieldLike = Chain & {
    ensurePlain: boolean;
    cloneObject: boolean;
    maxDepth?: number;
    maxKeyCount?: number;
};

export type ObjectProcessorProps<F extends ObjectFieldLike = ObjectChain> = ChainProcessorProps<F>;

class ObjectProcessor<F extends ObjectFieldLike = ObjectChain> extends ChainProcessor<F> {

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