'use strict';

const ObjectUtils = require('./ObjectUtils.js');
const Entity = require('../entities/Entity.js');

const hasOwnProperty = Object.prototype.hasOwnProperty;

class Utils {

    static xor(x, y) {
        return !!x != !!y;
    }

    static areEqual(x, y) {
        if (x === y) {
            return true;
        }

        const xIsChain = x instanceof Entity;
        const yIsChain = y instanceof Entity;

        if (self.xor(xIsChain, yIsChain)) {
            const [chain, value] = (xIsChain && [x, y]) || (yIsChain && [y, x]);
            return chain.process(value).pass;
        }

        if (Array.isArray(x)) {
            if (!Array.isArray(y) || x.length !== y.length) {
                return false;
            }
            for (let i = 0, max = x.length; i < max; i++) {
                if (!this.areEqual(x[i], y[i])) {
                    return false;
                }
            }
            return true;
        }

        if (!ObjectUtils.isPlainObject(x) || !ObjectUtils.isPlainObject(y)) {
            return false;
        }

        const xKeys = Object.keys(x);
        const yKeys = Object.keys(y);
        if (xKeys.length !== yKeys.length) {
            return false;
        }

        for (const key of xKeys) {
            if (!hasOwnProperty.call(y, key) || !this.areEqual(x[key], y[key])) {
                return false;
            }
        }
        return true;
    }
}


const self = module.exports = Utils;

// Object.assign(self, {
//     numToStrFormatter: new Intl.NumberFormat('en-US', {
//         useGrouping: false,
//         maximumFractionDigits: 20,
//         numberingSystem: 'latn'
//     }),
// });




