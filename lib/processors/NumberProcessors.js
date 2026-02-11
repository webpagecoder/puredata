'use strict';

const { pass, fail } = require('../Result');
const GenericProcessors = require('./GenericProcessors.js');
const NumberUtils = require('../utils/NumberUtils.js');


class NumberProcessors extends GenericProcessors {

    // Validators 

    static equals(num, comparison) {
        return (num === comparison)
            ? pass(num)
            : fail(num, 'number/equals', { comparison });
    }

    static minusSign(num) {
        return String(num)[0] === '-'
            ? pass(num)
            : fail(num, 'number/minusSign');
    }

    static plusSign(num) {
        return String(num)[0] === '+'
            ? pass(num)
            : fail(num, 'number/plusSign');
    }

    static precision(num, precision) {
        const multiplier = Math.pow(10, precision);
        return (Math.round(num * multiplier) === num * multiplier)
            ? pass(num)
            : fail(num, 'number/precision', { num, precision });
    }

    static approx(num, comparison, tolerance = Number.EPSILON) {
        return Math.abs(num - comparison) < tolerance
            ? pass(num)
            : fail(num, 'number/approx', { comparison, tolerance });
    }

    static between(num, min, max) {
        return (num >= min && num <= max)
            ? pass(num)
            : fail(num, 'number/between', { num, min, max });
    }

    static decimal(num, {
        minDecimalPlaces = 0,
        maxDecimalPlaces = 20,
    } = {}) {
        if (Number.isInteger(num)) {
            return fail(num, 'number/decimal');
        }

        const strVal = String(num);
        const decimalIndex = strVal.indexOf('.');
        const numDecimalPlaces = decimalIndex > -1
            ? strVal.length - decimalIndex - 1
            : 0;

        if (numDecimalPlaces < minDecimalPlaces || numDecimalPlaces > maxDecimalPlaces) {
            return fail(num, 'number/decimal', {
                num,
                numDecimalPlaces,
                minDecimalPlaces,
                maxDecimalPlaces
            });
        }

        return pass(num);
    }

    static even(num) {
        return (num % 2 === 0)
            ? pass(num)
            : fail(num, 'number/even');
    }

    static factor(num, multiple) {
        return (multiple % num === 0)
            ? pass(num)
            : fail(num, 'number/factor', { num, multiple });
    }

    static finite(num) {
        return Number.isFinite(num) ? pass(num) : fail(num, 'number/finite');
    }

    static greaterThan(num, comparison) {
        return (num > comparison)
            ? pass(num)
            : fail(num, 'number/greaterThan', { comparison });
    }

    static infinity(num) {
        return (num === Infinity || num === -Infinity)
            ? pass(num)
            : fail(num, 'number/infinity');
    }

    static integer(num) {
        return Number.isInteger(num)
            ? pass(num)
            : fail(num, 'number/integer');
    }

    static lessThan(num, comparison) {
        return (num < comparison)
            ? pass(num)
            : fail(num, 'number/lessThan', { comparison });
    }

    static max(num, comparison) {
        return (num <= comparison)
            ? pass(num)
            : fail(num, 'number/max', { comparison });
    }

    static min(num, comparison) {
        return (num >= comparison)
            ? pass(num)
            : fail(num, 'number/min', { comparison });
    }

    static multiple(num, factor) {
        return (num % factor === 0)
            ? pass(num)
            : fail(num, 'number/multiple', { num, factor });
    }

    static negative(num) {
        return (num < 0)
            ? pass(num)
            : fail(num, 'number/negative');
    }

    static odd(num) {
        return (num % 2 !== 0)
            ? pass(num)
            : fail(num, 'number/odd');
    }

    static positive(num) {
        return (num > 0)
            ? pass(num)
            : fail(num, 'number/positive');
    }

    static prime(num) {
        if (!Number.isInteger(num) || num < 2) {
            return fail(num, 'number/prime');
        }
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                return fail(num, 'number/prime');
            }
        }
        return pass(num);
    }

    static safe(num) {
        return num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER
            ? fail(num, 'number/safe')
            : pass(num);
    }

    static safeInteger(num) {
        return Number.isSafeInteger(num)
            ? pass(num)
            : fail(num, 'number/safeInteger');
    }

    static signed(num) {
        const sign = String(num)[0];
        return sign === '-' || sign === '+'
            ? pass(num)
            : fail(num, 'number/signed');
    }

    static unsigned(num) {
        const sign = String(num)[0];
        return sign === '-' || sign === '+'
            ? fail(num, 'number/unsigned', { sign })
            : pass(num);
    }

    static zero(num) {
        return (num === 0)
            ? pass(num)
            : fail(num, 'number/zero');
    }

    static notEquals(num, comparison) {
        return (num !== comparison)
            ? pass(num)
            : fail(num, 'number/notEquals', { comparison });
    }


    // Transformers

    static clampBetween(num, min, max) {
        if(num > max) {
            return pass(max);
        }
        if(num < min) {
            return pass(min);
        }
        return pass(num);
    }

    static constrain(num, min, max) {
        return pass(Math.min(Math.max(num, min), max));
    }

    static negate(num) {
        return pass(-num);
    }

    static round(num, numDecimals = 0) {
        const multiplier = Math.pow(10, numDecimals);
        return pass(Math.round(num * multiplier) / multiplier);
    }

    static roundDown(num) {
        return pass(Math.floor(num));
    }

    static roundUp(num) {
        return pass(Math.ceil(num));
    }

    static stripSign(num) {
        return pass(Math.abs(num));
    }

    static toPower(num, exponent) {
        return pass(Math.pow(num, exponent));
    }

    static toScale(num, fromMin, fromMax, toMin, toMax) {
        const scaled = ((num - fromMin) / (fromMax - fromMin))
            * (toMax - toMin) + toMin;
        return pass(scaled);
    }

    static truncate(num) {
        return pass(Math.trunc(num));
    }
}

const self = module.exports = NumberProcessors;


