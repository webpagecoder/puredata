
'use strict';

class BooleanUtils {

    static parse(value, {
        autoConvert = true,
        boolishPairs = [],
        transformer = x => x
    } = {}) {
        if (typeof value === 'boolean') {
            return value;
        }

        value = transformer(value);

        if (boolishPairs.map(([truthy, _]) => truthy).indexOf(value) > -1) {
            return autoConvert ? true : value;
        }
        if (boolishPairs.map(([_, falsy]) => falsy).indexOf(value) > -1) {
            return autoConvert ? false : value;
        }

        return null;
    }

}

const self = module.exports = BooleanUtils;
