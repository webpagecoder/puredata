'use strict';

import { HandlerResult } from '../HandlerResult.ts';
import { AnyHandler } from '../any/AnyHandler.ts'; 
const { pass, fail } = HandlerResult;


class NumberHandler extends AnyHandler {

    // ****************************************
    //               VALIDATORS
    // ****************************************

    /**
     * Validates that a number is within a tolerance of a comparison value.
     * @param num Number being validated.
     * @param comparison Target value to compare against.
     * @param tolerance Maximum allowed absolute difference.
     * @returns Returns the original number if it is within tolerance; otherwise returns a validation error.
     */
    public approx(num: any, comparison: any, tolerance: any= Number.EPSILON): HandlerResult {
        return Math.abs(num - comparison) < tolerance
            ? pass(num)
            : fail(num, 'number/approx', { comparison, tolerance });
    }

    /**
     * Validates that a value is a number and not NaN.
     * @param num Value being validated.
     * @returns Returns the original value if it is a valid number; otherwise returns a validation error.
     */
    public number(num: any): HandlerResult {
        return typeof num === 'number' && !Number.isNaN(num)
            ? pass(num)
            : fail(num, 'number/base');
    }

    /**
     * Validates that a number falls within an inclusive range.
     * @param num Number being validated.
     * @param min Inclusive minimum allowed value.
     * @param max Inclusive maximum allowed value.
     * @returns Returns the original number if it is within the inclusive range; otherwise returns a validation error.
     */
    public between(num: any, min: any, max: any): HandlerResult {
        return (num >= min && num <= max)
            ? pass(num)
            : fail(num, 'number/between', { num, min, max });
    }

    /**
     * Validates that a number has a decimal component and optional precision bounds.
     * @param num Number being validated.
     * @param options Decimal options.
     * @param options.minDecimalPlaces Minimum allowed digits after the decimal point.
     * @param options.maxDecimalPlaces Maximum allowed digits after the decimal point.
     * @returns Returns the original number if it has a decimal part within the configured bounds; otherwise returns a validation error.
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
     * Validates strict equality against a comparison value.
     * @param num Number being validated.
     * @param comparison Value num must strictly equal.
     * @returns Returns the original number if it strictly equals the comparison value; otherwise returns a validation error.
     */
    public override equals(num: any, comparison: any): HandlerResult {
        return (num === comparison)
            ? pass(num)
            : fail(num, 'number/equals', { comparison });
    }

    /**
     * Validates that a number is even.
     * @param num Number being validated.
     * @returns Returns the original number if it is even; otherwise returns a validation error.
     */
    public even(num: any): HandlerResult {
        return (num % 2 === 0)
            ? pass(num)
            : fail(num, 'number/even');
    }

    /**
     * Validates that num is a factor of another value.
     * @param num Candidate factor.
     * @param multiple Value that must be divisible by num.
     * @returns Returns the original number if it is a factor of the provided multiple; otherwise returns a validation error.
     */
    public factor(num: any, multiple: any): HandlerResult {
        return (multiple % num === 0)
            ? pass(num)
            : fail(num, 'number/factor', { num, multiple });
    }

    /**
     * Validates that a number is finite.
     * @param num Number being validated.
     * @returns Returns the original number if it is finite; otherwise returns a validation error.
     */
    public finite(num: any): HandlerResult {
        return Number.isFinite(num) ? pass(num) : fail(num, 'number/finite');
    }

    /**
     * Validates that a number is greater than a comparison value.
     * @param num Number being validated.
     * @param comparison Lower bound that num must exceed.
     * @returns Returns the original number if it is greater than the comparison value; otherwise returns a validation error.
     */
    public greaterThan(num: any, comparison: any): HandlerResult {
        return (num > comparison)
            ? pass(num)
            : fail(num, 'number/greaterThan', { comparison });
    }

    /**
     * Validates that a number is positive or negative infinity.
     * @param num Number being validated.
     * @returns Returns the original number if it is Infinity or -Infinity; otherwise returns a validation error.
     */
    public infinity(num: any): HandlerResult {
        return (num === Infinity || num === -Infinity)
            ? pass(num)
            : fail(num, 'number/infinity');
    }

    /**
     * Validates that a number is an integer.
     * @param num Number being validated.
     * @returns Returns the original number if it is an integer; otherwise returns a validation error.
     */
    public integer(num: any): HandlerResult {
        return Number.isInteger(num)
            ? pass(num)
            : fail(num, 'number/integer');
    }

    /**
     * Validates that a number is less than a comparison value.
     * @param num Number being validated.
    * @param comparison Upper bound that num must be below.
     * @returns Returns the original number if it is less than the comparison value; otherwise returns a validation error.
     */
    public lessThan(num: any, comparison: any): HandlerResult {
        return (num < comparison)
            ? pass(num)
            : fail(num, 'number/lessThan', { comparison });
    }

    /**
     * Validates that a number is less than or equal to a maximum value.
     * @param num Number being validated.
     * @param comparison Inclusive maximum.
     * @returns Returns the original number if it is less than or equal to the maximum; otherwise returns a validation error.
     */
    public max(num: any, comparison: any): HandlerResult {
        return (num <= comparison)
            ? pass(num)
            : fail(num, 'number/max', { comparison });
    }

    /**
     * Validates that a number is greater than or equal to a minimum value.
     * @param num Number being validated.
     * @param comparison Inclusive minimum.
     * @returns Returns the original number if it is greater than or equal to the minimum; otherwise returns a validation error.
     */
    public min(num: any, comparison: any): HandlerResult {
        return (num >= comparison)
            ? pass(num)
            : fail(num, 'number/min', { comparison });
    }

    /**
     * Validates that a value's string representation begins with a minus sign.
     * @param num Value being validated.
     * @returns Returns the original value if its string form starts with a minus sign; otherwise returns a validation error.
     */
    public minusSign(num: any): HandlerResult {
        return String(num)[0] === '-'
            ? pass(num)
            : fail(num, 'number/minusSign');
    }

    /**
     * Validates that a number is a multiple of a factor.
     * @param num Number being validated.
     * @param factor Divisor used to check multiplicity.
     * @returns Returns the original number if it is a multiple of the factor; otherwise returns a validation error.
     */
    public multiple(num: any, factor: any): HandlerResult {
        return (num % factor === 0)
            ? pass(num)
            : fail(num, 'number/multiple', { num, factor });
    }

    /**
     * Validates that a number is negative.
     * @param num Number being validated.
     * @returns Returns the original number if it is negative; otherwise returns a validation error.
     */
    public negative(num: any): HandlerResult {
        return (num < 0)
            ? pass(num)
            : fail(num, 'number/negative');
    }

    /**
     * Validates strict inequality against a comparison value.
     * @param num Number being validated.
     * @param comparison Value num must not strictly equal.
     * @returns Returns the original number if it does not strictly equal the comparison value; otherwise returns a validation error.
     */
    public override notEquals(num: any, comparison: any): HandlerResult {
        return (num !== comparison)
            ? pass(num)
            : fail(num, 'number/notEquals', { comparison });
    }

    /**
     * Validates that a number is odd.
     * @param num Number being validated.
     * @returns Returns the original number if it is odd; otherwise returns a validation error.
     */
    public odd(num: any): HandlerResult {
        return (num % 2 !== 0)
            ? pass(num)
            : fail(num, 'number/odd');
    }

    /**
     * Validates that a value's string representation begins with a plus sign.
     * @param num Value being validated.
     * @returns Returns the original value if its string form starts with a plus sign; otherwise returns a validation error.
     */
    public plusSign(num: any): HandlerResult {
        return String(num)[0] === '+'
            ? pass(num)
            : fail(num, 'number/plusSign');
    }

    /**
     * Validates that a number is positive.
     * @param num Number being validated.
     * @returns Returns the original number if it is positive; otherwise returns a validation error.
     */
    public positive(num: any): HandlerResult {
        return (num > 0)
            ? pass(num)
            : fail(num, 'number/positive');
    }

    /**
     * Validates that a number has at most the specified decimal precision.
     * @param num Number being validated.
     * @param precision Maximum decimal places allowed.
     * @returns Returns the original number if it matches the requested precision; otherwise returns a validation error.
     */
    public precision(num: any, precision: any): HandlerResult {
        const multiplier = Math.pow(10, precision);
        return (Math.round(num * multiplier) === num * multiplier)
            ? pass(num)
            : fail(num, 'number/precision', { num, precision });
    }

    /**
     * Validates that a number is prime.
     * @param num Number being validated.
     * @returns Returns the original number if it is prime; otherwise returns a validation error.
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
     * Validates that a number is within JavaScript's safe integer bounds.
     * @param num Number being validated.
     * @returns Returns the original number if it is within safe integer bounds; otherwise returns a validation error.
     */
    public safe(num: any): HandlerResult {
        return num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER
            ? fail(num, 'number/safe')
            : pass(num);
    }

    /**
     * Validates that a number is a safe integer.
     * @param num Number being validated.
     * @returns Returns the original number if it is a safe integer; otherwise returns a validation error.
     */
    public safeInteger(num: any): HandlerResult {
        return Number.isSafeInteger(num)
            ? pass(num)
            : fail(num, 'number/safeInteger');
    }

    /**
     * Validates that a value's string representation has an explicit plus or minus sign.
     * @param num Value being validated.
     * @returns Returns the original value if its string form begins with a sign; otherwise returns a validation error.
     */
    public signed(num: any): HandlerResult {
        const sign = String(num)[0];
        return sign === '-' || sign === '+'
            ? pass(num)
            : fail(num, 'number/signed');
    }

    /**
     * Validates that a value's string representation has no leading plus or minus sign.
     * @param num Value being validated.
     * @returns Returns the original value if its string form has no sign; otherwise returns a validation error.
     */
    public unsigned(num: any): HandlerResult {
        const sign = String(num)[0];
        return sign === '-' || sign === '+'
            ? fail(num, 'number/unsigned', { sign })
            : pass(num);
    }

    /**
     * Validates that a number is exactly zero.
     * @param num Number being validated.
     * @returns Returns the original number if it is exactly zero; otherwise returns a validation error.
     */
    public zero(num: any): HandlerResult {
        return (num === 0)
            ? pass(num)
            : fail(num, 'number/zero');
    }


    

    // *****************************************
    //               MUTATORS
    // *****************************************

    
    /**
     * Returns the absolute value of a number.
     * @param num Number to transform.
     * @returns Returns the absolute value of the input number.
     */
    public abs(num: any): HandlerResult {
        return this.stripSign(num);
    }

    /**
     * Rounds a number up to the nearest integer.
     * @param num Number to transform.
     * @returns Returns the input number rounded up to the nearest integer.
     */
    public ceil(num: any): HandlerResult {
        return this.roundUp(num);
    }

    /**
     * Clamps a number into an inclusive range.
     * @param num Number to transform.
     * @param min Inclusive lower bound.
     * @param max Inclusive upper bound.
     * @returns Returns the input number clamped to the inclusive min and max bounds.
     */
    public clamp(num: any, min: any, max: any): HandlerResult {
        return this.clampBetween(num, min, max);
    }

    /**
     * Clamps a number into an inclusive range.
     * @param num Number to transform.
     * @param min Inclusive lower bound.
     * @param max Inclusive upper bound.
     * @returns Returns the input number clamped to the inclusive min and max bounds.
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
     * Constrains a number into an inclusive range using min/max composition.
     * @param num Number to transform.
     * @param min Inclusive lower bound.
     * @param max Inclusive upper bound.
     * @returns Returns the input number constrained to the inclusive min and max bounds.
     */
    public constrain(num: any, min: any, max: any): HandlerResult {
        return pass(Math.min(Math.max(num, min), max));
    }

    /**
     * Rounds a number down to the nearest integer.
     * @param num Number to transform.
     * @returns Returns the input number rounded down to the nearest integer.
     */
    public floor(num: any): HandlerResult {
        return this.roundDown(num);
    }

    /**
     * Negates a number.
     * @param num Number to transform.
     * @returns Returns the negated value of the input number.
     */
    public negate(num: any): HandlerResult {
        return pass(-num);
    }

    /**
     * Raises a number to an exponent.
     * @param num Base value.
     * @param exponent Exponent to apply.
     * @returns Returns the base raised to the given exponent.
     */
    public pow(num: any, exponent: any): HandlerResult {
        return this.toPower(num, exponent);
    }

    /**
     * Rounds a number to the specified number of decimal places.
     * @param num Number to transform.
     * @param numDecimals Decimal places to keep.
     * @returns Returns the input number rounded to the requested decimal places.
     */
    public round(num: any, numDecimals: any= 0): HandlerResult {
        const multiplier = Math.pow(10, numDecimals);
        return pass(Math.round(num * multiplier) / multiplier);
    }

    /**
     * Floors a number to the nearest lower integer.
     * @param num Number to transform.
     * @returns Returns the input number floored to the nearest integer.
     */
    public roundDown(num: any): HandlerResult {
        return pass(Math.floor(num));
    }

    /**
     * Ceils a number to the nearest higher integer.
     * @param num Number to transform.
     * @returns Returns the input number ceiled to the nearest integer.
     */
    public roundUp(num: any): HandlerResult {
        return pass(Math.ceil(num));
    }

    /**
     * Scales a value from one range to another.
     * @param num Value to scale.
     * @param fromMin Input range minimum.
     * @param fromMax Input range maximum.
     * @param toMin Output range minimum.
     * @param toMax Output range maximum.
     * @returns Returns the input number mapped from the source range to the target range.
     */
    public scale(num: any, fromMin: any, fromMax: any, toMin: any, toMax: any): HandlerResult {
        return this.toScale(num, fromMin, fromMax, toMin, toMax);
    }

    /**
     * Removes sign from a number by returning its absolute value.
     * @param num Number to transform.
     * @returns Returns the absolute value of the input number.
     */
    public stripSign(num: any): HandlerResult {
        return pass(Math.abs(num));
    }

    /**
     * Raises a base value to an exponent.
     * @param num Base value.
     * @param exponent Exponent to apply.
     * @returns Returns the base raised to the given exponent.
     */
    public toPower(num: any, exponent: any): HandlerResult {
        return pass(Math.pow(num, exponent));
    }

    /**
     * Maps a number from one numeric range into another numeric range.
     * @param num Value to scale.
     * @param fromMin Input range minimum.
     * @param fromMax Input range maximum.
     * @param toMin Output range minimum.
     * @param toMax Output range maximum.
     * @returns Returns the input number mapped from the source range to the target range.
     */
    public toScale(num: any, fromMin: any, fromMax: any, toMin: any, toMax: any): HandlerResult {
        const scaled = ((num - fromMin) / (fromMax - fromMin))
         * (toMax - toMin) + toMin;
        return pass(scaled);
    }

    /**
     * Truncates the fractional portion of a number.
     * @param num Number to transform.
     * @returns Returns the input number with its fractional part removed.
     */
    public truncate(num: any): HandlerResult {
        return pass(Math.trunc(num));
    }

}

export { NumberHandler };


