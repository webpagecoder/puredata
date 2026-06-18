'use strict';

import { ChainHandlerResult } from '../ChainHandlerResult.ts';
import { ChainHandler } from '../ChainHandler.ts';
const { pass, fail } = ChainHandlerResult;


class NumberHandler extends ChainHandler {

    // ====================================
    // VALIDATORS
    // ====================================

    /**
     * Executes the approx handler step.
     * @param {any} num
     * @param {any} comparison
     * @param {any} tolerance
     * @returns {ChainHandlerResult}
     */
    public approx(num: any, comparison: any, tolerance: any= Number.EPSILON): ChainHandlerResult {
        return Math.abs(num - comparison) < tolerance
            ? pass(num)
            : fail(num, 'number/approx', { comparison, tolerance });
    }

    /**
     * Executes the number handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public number(num: any): ChainHandlerResult {
        return typeof num === 'number' && !Number.isNaN(num)
            ? pass(num)
            : fail(num, 'number/base');
    }

    /**
     * Executes the between handler step.
     * @param {any} num
     * @param {any} min
     * @param {any} max
     * @returns {ChainHandlerResult}
     */
    public between(num: any, min: any, max: any): ChainHandlerResult {
        return (num >= min && num <= max)
            ? pass(num)
            : fail(num, 'number/between', { num, min, max });
    }

    /**
     * Executes the decimal handler step.
     * @param {any} num
     * @param {any} param2
     * @returns {ChainHandlerResult}
     */
    public decimal(num: any, {
        minDecimalPlaces = 0,
        maxDecimalPlaces = 20,
    }: any= {}): ChainHandlerResult {
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

    /**
     * Executes the equals handler step.
     * @param {any} num
     * @param {any} comparison
     * @returns {ChainHandlerResult}
     */
    public equals(num: any, comparison: any): ChainHandlerResult {
        return (num === comparison)
            ? pass(num)
            : fail(num, 'number/equals', { comparison });
    }

    /**
     * Executes the even handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public even(num: any): ChainHandlerResult {
        return (num % 2 === 0)
            ? pass(num)
            : fail(num, 'number/even');
    }

    /**
     * Executes the factor handler step.
     * @param {any} num
     * @param {any} multiple
     * @returns {ChainHandlerResult}
     */
    public factor(num: any, multiple: any): ChainHandlerResult {
        return (multiple % num === 0)
            ? pass(num)
            : fail(num, 'number/factor', { num, multiple });
    }

    /**
     * Executes the finite handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public finite(num: any): ChainHandlerResult {
        return Number.isFinite(num) ? pass(num) : fail(num, 'number/finite');
    }

    /**
     * Executes the greaterThan handler step.
     * @param {any} num
     * @param {any} comparison
     * @returns {ChainHandlerResult}
     */
    public greaterThan(num: any, comparison: any): ChainHandlerResult {
        return (num > comparison)
            ? pass(num)
            : fail(num, 'number/greaterThan', { comparison });
    }

    /**
     * Executes the infinity handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public infinity(num: any): ChainHandlerResult {
        return (num === Infinity || num === -Infinity)
            ? pass(num)
            : fail(num, 'number/infinity');
    }

    /**
     * Executes the integer handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public integer(num: any): ChainHandlerResult {
        return Number.isInteger(num)
            ? pass(num)
            : fail(num, 'number/integer');
    }

    /**
     * Executes the lessThan handler step.
     * @param {any} num
     * @param {any} comparison
     * @returns {ChainHandlerResult}
     */
    public lessThan(num: any, comparison: any): ChainHandlerResult {
        return (num < comparison)
            ? pass(num)
            : fail(num, 'number/lessThan', { comparison });
    }

    /**
     * Executes the max handler step.
     * @param {any} num
     * @param {any} comparison
     * @returns {ChainHandlerResult}
     */
    public max(num: any, comparison: any): ChainHandlerResult {
        return (num <= comparison)
            ? pass(num)
            : fail(num, 'number/max', { comparison });
    }

    /**
     * Executes the min handler step.
     * @param {any} num
     * @param {any} comparison
     * @returns {ChainHandlerResult}
     */
    public min(num: any, comparison: any): ChainHandlerResult {
        return (num >= comparison)
            ? pass(num)
            : fail(num, 'number/min', { comparison });
    }

    /**
     * Executes the minusSign handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public minusSign(num: any): ChainHandlerResult {
        return String(num)[0] === '-'
            ? pass(num)
            : fail(num, 'number/minusSign');
    }

    /**
     * Executes the multiple handler step.
     * @param {any} num
     * @param {any} factor
     * @returns {ChainHandlerResult}
     */
    public multiple(num: any, factor: any): ChainHandlerResult {
        return (num % factor === 0)
            ? pass(num)
            : fail(num, 'number/multiple', { num, factor });
    }

    /**
     * Executes the negative handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public negative(num: any): ChainHandlerResult {
        return (num < 0)
            ? pass(num)
            : fail(num, 'number/negative');
    }

    /**
     * Executes the notEquals handler step.
     * @param {any} num
     * @param {any} comparison
     * @returns {ChainHandlerResult}
     */
    public notEquals(num: any, comparison: any): ChainHandlerResult {
        return (num !== comparison)
            ? pass(num)
            : fail(num, 'number/notEquals', { comparison });
    }

    /**
     * Executes the odd handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public odd(num: any): ChainHandlerResult {
        return (num % 2 !== 0)
            ? pass(num)
            : fail(num, 'number/odd');
    }

    /**
     * Executes the plusSign handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public plusSign(num: any): ChainHandlerResult {
        return String(num)[0] === '+'
            ? pass(num)
            : fail(num, 'number/plusSign');
    }

    /**
     * Executes the positive handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public positive(num: any): ChainHandlerResult {
        return (num > 0)
            ? pass(num)
            : fail(num, 'number/positive');
    }

    /**
     * Executes the precision handler step.
     * @param {any} num
     * @param {any} precision
     * @returns {ChainHandlerResult}
     */
    public precision(num: any, precision: any): ChainHandlerResult {
        const multiplier = Math.pow(10, precision);
        return (Math.round(num * multiplier) === num * multiplier)
            ? pass(num)
            : fail(num, 'number/precision', { num, precision });
    }

    /**
     * Executes the prime handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public prime(num: any): ChainHandlerResult {
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

    /**
     * Executes the safe handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public safe(num: any): ChainHandlerResult {
        return num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER
            ? fail(num, 'number/safe')
            : pass(num);
    }

    /**
     * Executes the safeInteger handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public safeInteger(num: any): ChainHandlerResult {
        return Number.isSafeInteger(num)
            ? pass(num)
            : fail(num, 'number/safeInteger');
    }

    /**
     * Executes the signed handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public signed(num: any): ChainHandlerResult {
        const sign = String(num)[0];
        return sign === '-' || sign === '+'
            ? pass(num)
            : fail(num, 'number/signed');
    }

    /**
     * Executes the unsigned handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public unsigned(num: any): ChainHandlerResult {
        const sign = String(num)[0];
        return sign === '-' || sign === '+'
            ? fail(num, 'number/unsigned', { sign })
            : pass(num);
    }

    /**
     * Executes the zero handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public zero(num: any): ChainHandlerResult {
        return (num === 0)
            ? pass(num)
            : fail(num, 'number/zero');
    }


    // ====================================
    // MUTATORS
    // ====================================

    /**
     * Executes the clampBetween handler step.
     * @param {any} num
     * @param {any} min
     * @param {any} max
     * @returns {ChainHandlerResult}
     */
    public clampBetween(num: any, min: any, max: any): ChainHandlerResult {
        if(num > max) {
            return pass(max);
        }
        if(num < min) {
            return pass(min);
        }
        return pass(num);
    }

    /**
     * Executes the constrain handler step.
     * @param {any} num
     * @param {any} min
     * @param {any} max
     * @returns {ChainHandlerResult}
     */
    public constrain(num: any, min: any, max: any): ChainHandlerResult {
        return pass(Math.min(Math.max(num, min), max));
    }

    /**
     * Executes the negate handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public negate(num: any): ChainHandlerResult {
        return pass(-num);
    }

    /**
     * Executes the round handler step.
     * @param {any} num
     * @param {any} numDecimals
     * @returns {ChainHandlerResult}
     */
    public round(num: any, numDecimals: any= 0): ChainHandlerResult {
        const multiplier = Math.pow(10, numDecimals);
        return pass(Math.round(num * multiplier) / multiplier);
    }

    /**
     * Executes the roundDown handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public roundDown(num: any): ChainHandlerResult {
        return pass(Math.floor(num));
    }

    /**
     * Executes the roundUp handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public roundUp(num: any): ChainHandlerResult {
        return pass(Math.ceil(num));
    }

    /**
     * Executes the stripSign handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public stripSign(num: any): ChainHandlerResult {
        return pass(Math.abs(num));
    }

    /**
     * Executes the toPower handler step.
     * @param {any} num
     * @param {any} exponent
     * @returns {ChainHandlerResult}
     */
    public toPower(num: any, exponent: any): ChainHandlerResult {
        return pass(Math.pow(num, exponent));
    }

    /**
     * Executes the toScale handler step.
     * @param {any} num
     * @param {any} fromMin
     * @param {any} fromMax
     * @param {any} toMin
     * @param {any} toMax
     * @returns {ChainHandlerResult}
     */
    public toScale(num: any, fromMin: any, fromMax: any, toMin: any, toMax: any): ChainHandlerResult {
        const scaled = ((num - fromMin) / (fromMax - fromMin))
            * (toMax - toMin) + toMin;
        return pass(scaled);
    }

    /**
     * Executes the truncate handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public truncate(num: any): ChainHandlerResult {
        return pass(Math.trunc(num));
    }

    /**
     * Executes the abs handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public abs(num: any): ChainHandlerResult {
        return this.stripSign(num);
    }

    /**
     * Executes the ceil handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public ceil(num: any): ChainHandlerResult {
        return this.roundUp(num);
    }

    /**
     * Executes the clamp handler step.
     * @param {any} num
     * @param {any} min
     * @param {any} max
     * @returns {ChainHandlerResult}
     */
    public clamp(num: any, min: any, max: any): ChainHandlerResult {
        return this.clampBetween(num, min, max);
    }

    /**
     * Executes the floor handler step.
     * @param {any} num
     * @returns {ChainHandlerResult}
     */
    public floor(num: any): ChainHandlerResult {
        return this.roundDown(num);
    }

    /**
     * Executes the pow handler step.
     * @param {any} num
     * @param {any} exponent
     * @returns {ChainHandlerResult}
     */
    public pow(num: any, exponent: any): ChainHandlerResult {
        return this.toPower(num, exponent);
    }

    /**
     * Executes the scale handler step.
     * @param {any} num
     * @param {any} fromMin
     * @param {any} fromMax
     * @param {any} toMin
     * @param {any} toMax
     * @returns {ChainHandlerResult}
     */
    public scale(num: any, fromMin: any, fromMax: any, toMin: any, toMax: any): ChainHandlerResult {
        return this.toScale(num, fromMin, fromMax, toMin, toMax);
    }
}

export { NumberHandler };


