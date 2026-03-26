'use strict';

import { ChainProcessor } from './ChainProcessor.ts';

class BooleanProcessor extends ChainProcessor {

    preProcess(tracker) {
        const { field } = this.props;
        const {
            boolishPairs,
            allowBoolish,
            transformer = x => x,
            autoConvert
        } = field.props;

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

export { BooleanProcessor };