'use strict';

import { HandlerResult } from '../HandlerResult.ts';
import { ChainHandler } from '../ChainHandler.ts';
const { pass, fail } = HandlerResult;


class NumberHandler extends ChainHandler {

    // ====================================
    // VALIDATORS
    // ====================================

    /**
     * Executes the approx handler step.
     * @param {any} num
     * @param {any} comparison
     * @param {any} tolerance
     * @returns {HandlerResult}
     */
    public approx(num: any, comparison: any, tolerance: any= Number.EPSILON): HandlerResult {
        return Math.abs(num - comparison) < tolerance
            ? pass(num)
            : fail(num, 'number/approx', { comparison, tolerance });
    }

    /**
     * Executes the number handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public number(num: any): HandlerResult {
        return typeof num === 'number' && !Number.isNaN(num)
            ? pass(num)
            : fail(num, 'number/base');
    }

    /**
     * Executes the between handler step.
     * @param {any} num
     * @param {any} min
     * @param {any} max
     * @returns {HandlerResult}
     */
    public between(num: any, min: any, max: any): HandlerResult {
        return (num >= min && num <= max)
            ? pass(num)
            : fail(num, 'number/between', { num, min, max });
    }

    /**
     * Executes the decimal handler step.
     * @param {any} num
     * @param {any} param2
     * @returns {HandlerResult}
     */
    public decimal(num: any, {
        minDecimalPlaces = 0,
        maxDecimalPlaces = 20,
    }: any= {}): HandlerResult {
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
     * @returns {HandlerResult}
     */
    public equals(num: any, comparison: any): HandlerResult {
        return (num === comparison)
            ? pass(num)
            : fail(num, 'number/equals', { comparison });
    }

    /**
     * Executes the even handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public even(num: any): HandlerResult {
        return (num % 2 === 0)
            ? pass(num)
            : fail(num, 'number/even');
    }

    /**
     * Executes the factor handler step.
     * @param {any} num
     * @param {any} multiple
     * @returns {HandlerResult}
     */
    public factor(num: any, multiple: any): HandlerResult {
        return (multiple % num === 0)
            ? pass(num)
            : fail(num, 'number/factor', { num, multiple });
    }

    /**
     * Executes the finite handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public finite(num: any): HandlerResult {
        return Number.isFinite(num) ? pass(num) : fail(num, 'number/finite');
    }

    /**
     * Executes the greaterThan handler step.
     * @param {any} num
     * @param {any} comparison
     * @returns {HandlerResult}
     */
    public greaterThan(num: any, comparison: any): HandlerResult {
        return (num > comparison)
            ? pass(num)
            : fail(num, 'number/greaterThan', { comparison });
    }

    /**
     * Executes the infinity handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public infinity(num: any): HandlerResult {
        return (num === Infinity || num === -Infinity)
            ? pass(num)
            : fail(num, 'number/infinity');
    }

    /**
     * Executes the integer handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public integer(num: any): HandlerResult {
        return Number.isInteger(num)
            ? pass(num)
            : fail(num, 'number/integer');
    }

    /**
     * Executes the lessThan handler step.
     * @param {any} num
     * @param {any} comparison
     * @returns {HandlerResult}
     */
    public lessThan(num: any, comparison: any): HandlerResult {
        return (num < comparison)
            ? pass(num)
            : fail(num, 'number/lessThan', { comparison });
    }

    /**
     * Executes the max handler step.
     * @param {any} num
     * @param {any} comparison
     * @returns {HandlerResult}
     */
    public max(num: any, comparison: any): HandlerResult {
        return (num <= comparison)
            ? pass(num)
            : fail(num, 'number/max', { comparison });
    }

    /**
     * Executes the min handler step.
     * @param {any} num
     * @param {any} comparison
     * @returns {HandlerResult}
     */
    public min(num: any, comparison: any): HandlerResult {
        return (num >= comparison)
            ? pass(num)
            : fail(num, 'number/min', { comparison });
    }

    /**
     * Executes the minusSign handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public minusSign(num: any): HandlerResult {
        return String(num)[0] === '-'
            ? pass(num)
            : fail(num, 'number/minusSign');
    }

    /**
     * Executes the multiple handler step.
     * @param {any} num
     * @param {any} factor
     * @returns {HandlerResult}
     */
    public multiple(num: any, factor: any): HandlerResult {
        return (num % factor === 0)
            ? pass(num)
            : fail(num, 'number/multiple', { num, factor });
    }

    /**
     * Executes the negative handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public negative(num: any): HandlerResult {
        return (num < 0)
            ? pass(num)
            : fail(num, 'number/negative');
    }

    /**
     * Executes the notEquals handler step.
     * @param {any} num
     * @param {any} comparison
     * @returns {HandlerResult}
     */
    public notEquals(num: any, comparison: any): HandlerResult {
        return (num !== comparison)
            ? pass(num)
            : fail(num, 'number/notEquals', { comparison });
    }

    /**
     * Executes the odd handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public odd(num: any): HandlerResult {
        return (num % 2 !== 0)
            ? pass(num)
            : fail(num, 'number/odd');
    }

    /**
     * Executes the plusSign handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public plusSign(num: any): HandlerResult {
        return String(num)[0] === '+'
            ? pass(num)
            : fail(num, 'number/plusSign');
    }

    /**
     * Executes the positive handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public positive(num: any): HandlerResult {
        return (num > 0)
            ? pass(num)
            : fail(num, 'number/positive');
    }

    /**
     * Executes the precision handler step.
     * @param {any} num
     * @param {any} precision
     * @returns {HandlerResult}
     */
    public precision(num: any, precision: any): HandlerResult {
        const multiplier = Math.pow(10, precision);
        return (Math.round(num * multiplier) === num * multiplier)
            ? pass(num)
            : fail(num, 'number/precision', { num, precision });
    }

    /**
     * Executes the prime handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public prime(num: any): HandlerResult {
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
     * @returns {HandlerResult}
     */
    public safe(num: any): HandlerResult {
        return num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER
            ? fail(num, 'number/safe')
            : pass(num);
    }

    /**
     * Executes the safeInteger handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public safeInteger(num: any): HandlerResult {
        return Number.isSafeInteger(num)
            ? pass(num)
            : fail(num, 'number/safeInteger');
    }

    /**
     * Executes the signed handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public signed(num: any): HandlerResult {
        const sign = String(num)[0];
        return sign === '-' || sign === '+'
            ? pass(num)
            : fail(num, 'number/signed');
    }

    /**
     * Executes the unsigned handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public unsigned(num: any): HandlerResult {
        const sign = String(num)[0];
        return sign === '-' || sign === '+'
            ? fail(num, 'number/unsigned', { sign })
            : pass(num);
    }

    /**
     * Executes the zero handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public zero(num: any): HandlerResult {
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
     * @returns {HandlerResult}
     */
    public clampBetween(num: any, min: any, max: any): HandlerResult {
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
     * @returns {HandlerResult}
     */
    public constrain(num: any, min: any, max: any): HandlerResult {
        return pass(Math.min(Math.max(num, min), max));
    }

    /**
     * Executes the negate handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public negate(num: any): HandlerResult {
        return pass(-num);
    }

    /**
     * Executes the round handler step.
     * @param {any} num
     * @param {any} numDecimals
     * @returns {HandlerResult}
     */
    public round(num: any, numDecimals: any= 0): HandlerResult {
        const multiplier = Math.pow(10, numDecimals);
        return pass(Math.round(num * multiplier) / multiplier);
    }

    /**
     * Executes the roundDown handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public roundDown(num: any): HandlerResult {
        return pass(Math.floor(num));
    }

    /**
     * Executes the roundUp handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public roundUp(num: any): HandlerResult {
        return pass(Math.ceil(num));
    }

    /**
     * Executes the stripSign handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public stripSign(num: any): HandlerResult {
        return pass(Math.abs(num));
    }

    /**
     * Executes the toPower handler step.
     * @param {any} num
     * @param {any} exponent
     * @returns {HandlerResult}
     */
    public toPower(num: any, exponent: any): HandlerResult {
        return pass(Math.pow(num, exponent));
    }

    /**
     * Executes the toScale handler step.
     * @param {any} num
     * @param {any} fromMin
     * @param {any} fromMax
     * @param {any} toMin
     * @param {any} toMax
     * @returns {HandlerResult}
     */
    public toScale(num: any, fromMin: any, fromMax: any, toMin: any, toMax: any): HandlerResult {
        const scaled = ((num - fromMin) / (fromMax - fromMin))
            * (toMax - toMin) + toMin;
        return pass(scaled);
    }

    /**
     * Executes the truncate handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public truncate(num: any): HandlerResult {
        return pass(Math.trunc(num));
    }

    /**
     * Executes the abs handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public abs(num: any): HandlerResult {
        return this.stripSign(num);
    }

    /**
     * Executes the ceil handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public ceil(num: any): HandlerResult {
        return this.roundUp(num);
    }

    /**
     * Executes the clamp handler step.
     * @param {any} num
     * @param {any} min
     * @param {any} max
     * @returns {HandlerResult}
     */
    public clamp(num: any, min: any, max: any): HandlerResult {
        return this.clampBetween(num, min, max);
    }

    /**
     * Executes the floor handler step.
     * @param {any} num
     * @returns {HandlerResult}
     */
    public floor(num: any): HandlerResult {
        return this.roundDown(num);
    }

    /**
     * Executes the pow handler step.
     * @param {any} num
     * @param {any} exponent
     * @returns {HandlerResult}
     */
    public pow(num: any, exponent: any): HandlerResult {
        return this.toPower(num, exponent);
    }

    /**
     * Executes the scale handler step.
     * @param {any} num
     * @param {any} fromMin
     * @param {any} fromMax
     * @param {any} toMin
     * @param {any} toMax
     * @returns {HandlerResult}
     */
    public scale(num: any, fromMin: any, fromMax: any, toMin: any, toMax: any): HandlerResult {
        return this.toScale(num, fromMin, fromMax, toMin, toMax);
    }
}

export { NumberHandler };


