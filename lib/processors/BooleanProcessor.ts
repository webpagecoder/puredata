// @ts-nocheck
'use strict';

import ChainProcessor from './ChainProcessor.ts';

class BooleanProcessor extends ChainProcessor {

    preProcess(tracker) {
        const { entity } = this.props;
        const {
            boolishPairs,
            allowBoolish,
            transformer = x => x,
            autoConvert
        } = entity.props;

        let value = transformer(tracker.getValue());

        if (typeof value === 'boolean') {
            return;
        }

        if (allowBoolish) {
            for (const [truthy, falsy] of boolishPairs) {
                if (truthy === value) {
                    return tracker.setValue(autoConvert ? true : value);
                }
                else if (falsy === value) {
                    return tracker.setValue(autoConvert ? false : value);
                }
            }
        }

        tracker.addError('boolean/base');
    }
}

export default BooleanProcessor;