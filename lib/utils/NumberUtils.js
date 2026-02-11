'use strict';

class NumberUtils {

    static toNumber(value, {
        autoConvert = true,
        ensureSafe = true,
        ensureFinite = true,
        preservePrecision = true
    } = {}) {
        const num = autoConvert && typeof value === 'string' ? Number(value) : value;
        return (
            (typeof num !== 'number' || Number.isNaN(num))
            || (ensureFinite && !Number.isFinite(num))
            || (ensureSafe && (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER))
            || (preservePrecision
                && typeof value === 'string'
                && String(num) !== value
                && String(num) !== value.replace(/\.0+$/, '')
            )
        ) ? null : num;
    }

    static getSignMultiplier(x) {
        return Math.sign(+x) === -1 || 1 / +x === -Infinity ? -1 : 1;
    }
}

const self = module.exports = NumberUtils;