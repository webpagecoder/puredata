'use strict';

const GenericChain = require('./GenericChain.js');
const NumberProcessors = require('../../processors/NumberProcessors.js');
const NumberUtils = require('../../utils/NumberUtils.js');

class NumberChain extends GenericChain {

    get languageKey() {
        return 'number';
    }

    // Configurators

    /**
     * Configure whether to automatically convert string values to numbers
     * @param {boolean} autoConvert - Whether to enable automatic conversion
     * @returns {NumberChain} The chain instance for method chaining
     */
    configAutoConvert(autoConvert = true) {
        return this.setProps({ autoConvert });
    }

    /**
     * Configure whether to ensure numbers are within safe integer range
     * @param {boolean} ensureSafe - Whether to ensure safe integer range
     * @returns {NumberChain} The chain instance for method chaining
     */
    configSafe(ensureSafe = true) {
        return this.setProps({ ensureSafe });
    }

    /**
     * Configure whether to ensure numbers are finite (not Infinity/-Infinity)
     * @param {boolean} ensureFinite - Whether to ensure finite values
     * @returns {NumberChain} The chain instance for method chaining
     */
    configFinite(ensureFinite = true) {
        return this.setProps({ ensureFinite });
    }

    /**
     * Configure whether to preserve precision during number operations
     * @param {boolean} preservePrecision - Whether to preserve precision
     * @returns {NumberChain} The chain instance for method chaining
     */
    configPreservePrecision(preservePrecision = true) {
        return this.setProps({ preservePrecision });
    }


    // Validators

    /**
     * Validate that the number is approximately equal to a comparison value within tolerance
     * @param {number} comparison - The value to compare against
     * @param {number} tolerance - The tolerance for comparison (default: Number.EPSILON)
     * @returns {NumberChain} The chain instance for method chaining
     */
    approx(comparison, tolerance = Number.EPSILON) {
        return this.addStep('approx', [comparison, tolerance]);
    }

    /**
     * Validate that the number is.isBetween min and max values (inclusive)
     * @param {number} min - The minimum value
     * @param {number} max - The maximum value
     * @returns {NumberChain} The chain instance for method chaining
     */
    isBetween(min, max) {
        return this.addStep('between', [min, max]);
    }

    /**
     * Validate that the number is a decimal with specified decimal place constraints
     * @param {Object} options - Options for decimal validation
     * @param {number} options.minDecimalPlaces - Minimum decimal places required
     * @param {number} options.maxDecimalPlaces - Maximum decimal places allowed
     * @returns {NumberChain} The chain instance for method chaining
     */
    decimal(options = {}) {
        return this.addStep('decimal', [options]);
    }

    /**
     * Validate that the number equals a specific value
     * @param {number} comparison - The value to compare against
     * @returns {NumberChain} The chain instance for method chaining
     */
    equals(comparison) {
        return this.addStep('equals', [comparison]);
    }

    /**
     * Validate that the number is even
     * @returns {NumberChain} The chain instance for method chaining
     */
    even() {
        return this.addStep('even');
    }

    /**
     * Validate that the number is a factor of another number
     * @param {number} multiple - The number that should be divisible by this number
     * @returns {NumberChain} The chain instance for method chaining
     */
    factor(multiple) {
        return this.addStep('factor', [multiple]);
    }

    /**
     * Validate that the number is finite (not Infinity or -Infinity)
     * @returns {NumberChain} The chain instance for method chaining
     */
    finite() {
        return this.addStep('finite');
    }

    /**
     * Validate that the number is greater than a comparison value
     * @param {number} comparison - The value to compare against
     * @returns {NumberChain} The chain instance for method chaining
     */
    greaterThan(comparison) {
        return this.addStep('greaterThan', [comparison]);
    }

    /**
     * Validate that the number is Infinity or -Infinity
     * @returns {NumberChain} The chain instance for method chaining
     */
    infinity() {
        return this.addStep('infinity');
    }

    /**
     * Validate that the number is an integer
     * @returns {NumberChain} The chain instance for method chaining
     */
    integer() {
        return this.addStep('integer');
    }

    /**
     * Validate that the number is less than a comparison value
     * @param {number} comparison - The value to compare against
     * @returns {NumberChain} The chain instance for method chaining
     */
    lessThan(comparison) {
        return this.addStep('lessThan', [comparison]);
    }

    /**
     * Validate that the number is less than or equal to a maximum value
     * @param {number} comparison - The maximum value
     * @returns {NumberChain} The chain instance for method chaining
     */
    max(comparison) {
        return this.addStep('max', [comparison]);
    }

    /**
     * Validate that the number is greater than or equal to a minimum value
     * @param {number} comparison - The minimum value
     * @returns {NumberChain} The chain instance for method chaining
     */
    min(comparison) {
        return this.addStep('min', [comparison]);
    }

    /**
     * Validate that the number has a minus sign when represented as a string
     * @returns {NumberChain} The chain instance for method chaining
     */
    minusSign() {
        return this.addStep('minusSign');
    }

    /**
     * Validate that the number is a multiple of another number
     * @param {number} factor - The factor to check divisibility by
     * @returns {NumberChain} The chain instance for method chaining
     */
    multiple(factor) {
        return this.addStep('multiple', [factor]);
    }

    /**
     * Validate that the number is negative
     * @returns {NumberChain} The chain instance for method chaining
     */
    negative() {
        return this.addStep('negative');
    }

    /**
     * Validate that the number does not equal a specific value
     * @param {number} comparison - The value to compare against
     * @returns {NumberChain} The chain instance for method chaining
     */
    notEquals(comparison) {
        return this.addStep('notEquals', [comparison]);
    }

    /**
     * Validate basic number properties
     * @param {Object} options - Options for number validation
     * @returns {NumberChain} The chain instance for method chaining
     */
    number(options = {}) {
        return this.addStep('number', [options]);
    }

    /**
     * Validate that the number is odd
     * @returns {NumberChain} The chain instance for method chaining
     */
    odd() {
        return this.addStep('odd');
    }

    /**
     * Validate that the number has a plus sign when represented as a string
     * @returns {NumberChain} The chain instance for method chaining
     */
    plusSign() {
        return this.addStep('plusSign');
    }

    /**
     * Validate that the number is positive
     * @returns {NumberChain} The chain instance for method chaining
     */
    positive() {
        return this.addStep('positive');
    }

    /**
     * Validate that the number has a specific precision (decimal places)
     * @param {number} precision - The required precision
     * @returns {NumberChain} The chain instance for method chaining
     */
    precision(precision) {
        return this.addStep('precision', [precision]);
    }

    /**
     * Validate that the number is a prime number
     * @returns {NumberChain} The chain instance for method chaining
     */
    prime() {
        return this.addStep('prime');
    }

    /**
     * Validate that the number is within JavaScript's safe integer range
     * @returns {NumberChain} The chain instance for method chaining
     */
    safe() {
        return this.addStep('safe');
    }

    /**
     * Validate that the number is a safe integer
     * @returns {NumberChain} The chain instance for method chaining
     */
    safeInteger() {
        return this.addStep('safeInteger');
    }

    /**
     * Validate that the number has an explicit sign (+ or -)
     * @returns {NumberChain} The chain instance for method chaining
     */
    signed() {
        return this.addStep('signed');
    }

    /**
     * Validate that the number does not have an explicit sign
     * @returns {NumberChain} The chain instance for method chaining
     */
    unsigned() {
        return this.addStep('unsigned');
    }

    /**
     * Validate that the number equals zero
     * @returns {NumberChain} The chain instance for method chaining
     */
    zero() {
        return this.addStep('zero');
    }

    // Transformers

    /**
     * Transform the number to its absolute value (remove sign)
     * @returns {NumberChain} The chain instance for method chaining
     */
    abs() {
        return this.addStep('abs');
    }

    /**
     * Transform the number by rounding up to the nearest integer (ceiling)
     * @returns {NumberChain} The chain instance for method chaining
     */
    ceil() {
        return this.addStep('ceil');
    }

    /**
     * Transform the number by clamping it.isBetween minimum and maximum values
     * @param {number} min - The minimum value
     * @param {number} max - The maximum value
     * @returns {NumberChain} The chain instance for method chaining
     */
    clamp(min, max) {
        return this.addStep('clamp', [min, max]);
    }

    /**
     * Transform the number by constraining it.isBetween minimum and maximum values
     * @param {number} min - The minimum value
     * @param {number} max - The maximum value
     * @returns {NumberChain} The chain instance for method chaining
     */
    constrain(min, max) {
        return this.addStep('constrain', [min, max]);
    }

    /**
     * Transform the number by rounding down to the nearest integer (floor)
     * @returns {NumberChain} The chain instance for method chaining
     */
    floor() {
        return this.addStep('floor');
    }

    /**
     * Transform the number by negating it (multiply by -1)
     * @returns {NumberChain} The chain instance for method chaining
     */
    negate() {
        return this.addStep('negate');
    }

    /**
     * Transform the number by raising it to a power
     * @param {number} exponent - The exponent to raise the number to
     * @returns {NumberChain} The chain instance for method chaining
     */
    pow(exponent) {
        return this.addStep('pow', [exponent]);
    }

    /**
     * Transform the number by rounding to specified decimal places
     * @param {number} numDecimals - The number of decimal places (default: 0)
     * @returns {NumberChain} The chain instance for method chaining
     */
    round(numDecimals = 0) {
        return this.addStep('round', [numDecimals]);
    }

    /**
     * Transform the number by scaling from one range to another
     * @param {number} fromMin - The minimum of the source range
     * @param {number} fromMax - The maximum of the source range
     * @param {number} toMin - The minimum of the target range
     * @param {number} toMax - The maximum of the target range
     * @returns {NumberChain} The chain instance for method chaining
     */
    scale(fromMin, fromMax, toMin, toMax) {
        return this.addStep('scale', [fromMin, fromMax, toMin, toMax]);
    }

    /**
     * Transform the number by truncating its decimal part (round towards zero)
     * @returns {NumberChain} The chain instance for method chaining
     */
    truncate() {
        return this.addStep('truncate');
    }

}

module.exports = NumberChain;