// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/fields/number/NumberHandler.ts + lib/fields/number/NumberChain.ts
// Run: npm run generate:chain-defs

import type { NumberHandler } from './NumberHandler.ts';

type DropFirst<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];

interface NumberChainGeneratedMethods {
    /**
    * Returns the absolute value of a number.
    * @returns Returns the absolute value of the input number.
    */
    abs(...args: DropFirst<Parameters<NumberHandler['abs']>>): NumberChain;

    /**
    * Validates that a value matches one of the allowed values.
    * @param allowedValues Values that are accepted.
    * @returns A passing result when a match is found; otherwise a failing result.
    */
    anyOf(...args: DropFirst<Parameters<NumberHandler['anyOf']>>): NumberChain;

    /**
    * Validates that a number is within a tolerance of a comparison value.
    * @param comparison Target value to compare against.
    * @param tolerance Maximum allowed absolute difference.
    * @returns Returns the original number if it is within tolerance; otherwise returns a validation error.
    */
    approx(...args: DropFirst<Parameters<NumberHandler['approx']>>): NumberChain;

    /**
    * Validates that a number falls within an inclusive range.
    * @param min Inclusive minimum allowed value.
    * @param max Inclusive maximum allowed value.
    * @returns Returns the original number if it is within the inclusive range; otherwise returns a validation error.
    */
    between(...args: DropFirst<Parameters<NumberHandler['between']>>): NumberChain;

    /**
    * Rounds a number up to the nearest integer.
    * @returns Returns the input number rounded up to the nearest integer.
    */
    ceil(...args: DropFirst<Parameters<NumberHandler['ceil']>>): NumberChain;

    /**
    * Clamps a number into an inclusive range.
    * @param min Inclusive lower bound.
    * @param max Inclusive upper bound.
    * @returns Returns the input number clamped to the inclusive min and max bounds.
    */
    clamp(...args: DropFirst<Parameters<NumberHandler['clamp']>>): NumberChain;

    /**
    * Clamps a number into an inclusive range.
    * @param min Inclusive lower bound.
    * @param max Inclusive upper bound.
    * @returns Returns the input number clamped to the inclusive min and max bounds.
    */
    clampBetween(...args: DropFirst<Parameters<NumberHandler['clampBetween']>>): NumberChain;

    /**
    * Constrains a number into an inclusive range using min/max composition.
    * @param min Inclusive lower bound.
    * @param max Inclusive upper bound.
    * @returns Returns the input number constrained to the inclusive min and max bounds.
    */
    constrain(...args: DropFirst<Parameters<NumberHandler['constrain']>>): NumberChain;

    /**
    * Executes a user-provided handler for custom validation or transformation.
    * If the callback returns a HandlerResult, that result is used directly.
    * Otherwise, the returned value is wrapped in a passing result.
    * @param filterFn Callback that validates and/or transforms the value.
    * @returns The callback result as-is when it is a HandlerResult; otherwise a passing result.
    */
    custom(...args: DropFirst<Parameters<NumberHandler['custom']>>): NumberChain;

    /**
    * Validates that a number has a decimal component and optional precision bounds.
    * @param options Decimal options.
    * @param options.minDecimalPlaces Minimum allowed digits after the decimal point.
    * @param options.maxDecimalPlaces Maximum allowed digits after the decimal point.
    * @returns Returns the original number if it has a decimal part within the configured bounds; otherwise returns a validation error.
    */
    decimal(...args: DropFirst<Parameters<NumberHandler['decimal']>>): NumberChain;

    /**
    * Validates that a value is not undefined.
    * @returns A passing result when the value is defined; otherwise a failing result.
    */
    defined(...args: DropFirst<Parameters<NumberHandler['defined']>>): NumberChain;

    /**
    * Validates that a value is one of the configured empty values.
    * @param empties Values treated as empty. Defaults to null and undefined.
    * @returns A passing result when the value is considered empty; otherwise a failing result.
    */
    empty(...args: DropFirst<Parameters<NumberHandler['empty']>>): NumberChain;

    /**
    * Validates strict equality against a comparison value.
    * @param comparison Value num must strictly equal.
    * @returns Returns the original number if it strictly equals the comparison value; otherwise returns a validation error.
    */
    equals(...args: DropFirst<Parameters<NumberHandler['equals']>>): NumberChain;

    /**
    * Validates that a number is even.
    * @returns Returns the original number if it is even; otherwise returns a validation error.
    */
    even(...args: DropFirst<Parameters<NumberHandler['even']>>): NumberChain;

    /**
    * Validates that num is a factor of another value.
    * @param multiple Value that must be divisible by num.
    * @returns Returns the original number if it is a factor of the provided multiple; otherwise returns a validation error.
    */
    factor(...args: DropFirst<Parameters<NumberHandler['factor']>>): NumberChain;

    /**
    * Validates that a value is falsy.
    * @returns A passing result for falsy values; otherwise a failing result.
    */
    falsy(...args: DropFirst<Parameters<NumberHandler['falsy']>>): NumberChain;

    /**
    * Validates that a number is finite.
    * @returns Returns the original number if it is finite; otherwise returns a validation error.
    */
    finite(...args: DropFirst<Parameters<NumberHandler['finite']>>): NumberChain;

    /**
    * Rounds a number down to the nearest integer.
    * @returns Returns the input number rounded down to the nearest integer.
    */
    floor(...args: DropFirst<Parameters<NumberHandler['floor']>>): NumberChain;

    /**
    * Validates that a number is greater than a comparison value.
    * @param comparison Lower bound that num must exceed.
    * @returns Returns the original number if it is greater than the comparison value; otherwise returns a validation error.
    */
    greaterThan(...args: DropFirst<Parameters<NumberHandler['greaterThan']>>): NumberChain;

    /**
    * Validates that a number is positive or negative infinity.
    * @returns Returns the original number if it is Infinity or -Infinity; otherwise returns a validation error.
    */
    infinity(...args: DropFirst<Parameters<NumberHandler['infinity']>>): NumberChain;

    /**
    * Validates that a value is an instance of the supplied constructor.
    * @param constructor Constructor function the value must be an instance of.
    * @returns A passing result when the instance check succeeds; otherwise a failing result.
    */
    instanceOf(...args: DropFirst<Parameters<NumberHandler['instanceOf']>>): NumberChain;

    /**
    * Validates that a number is an integer.
    * @returns Returns the original number if it is an integer; otherwise returns a validation error.
    */
    integer(...args: DropFirst<Parameters<NumberHandler['integer']>>): NumberChain;

    /**
    * Validates that a number is less than a comparison value.
    * @param comparison Upper bound that num must be below.
    * @returns Returns the original number if it is less than the comparison value; otherwise returns a validation error.
    */
    lessThan(...args: DropFirst<Parameters<NumberHandler['lessThan']>>): NumberChain;

    /**
    * Validates that a number is less than or equal to a maximum value.
    * @param comparison Inclusive maximum.
    * @returns Returns the original number if it is less than or equal to the maximum; otherwise returns a validation error.
    */
    max(...args: DropFirst<Parameters<NumberHandler['max']>>): NumberChain;

    /**
    * Validates that a number is greater than or equal to a minimum value.
    * @param comparison Inclusive minimum.
    * @returns Returns the original number if it is greater than or equal to the minimum; otherwise returns a validation error.
    */
    min(...args: DropFirst<Parameters<NumberHandler['min']>>): NumberChain;

    /**
    * Validates that a value's string representation begins with a minus sign.
    * @returns Returns the original value if its string form starts with a minus sign; otherwise returns a validation error.
    */
    minusSign(...args: DropFirst<Parameters<NumberHandler['minusSign']>>): NumberChain;

    /**
    * Validates that a number is a multiple of a factor.
    * @param factor Divisor used to check multiplicity.
    * @returns Returns the original number if it is a multiple of the factor; otherwise returns a validation error.
    */
    multiple(...args: DropFirst<Parameters<NumberHandler['multiple']>>): NumberChain;

    /**
    * Negates a number.
    * @returns Returns the negated value of the input number.
    */
    negate(...args: DropFirst<Parameters<NumberHandler['negate']>>): NumberChain;

    /**
    * Validates that a number is negative.
    * @returns Returns the original number if it is negative; otherwise returns a validation error.
    */
    negative(...args: DropFirst<Parameters<NumberHandler['negative']>>): NumberChain;

    /**
    * Validates that a value does not match any of the forbidden values.
    * @param forbiddenValues Values that are not allowed.
    * @returns A passing result when the value is not found; otherwise a failing result.
    */
    noneOf(...args: DropFirst<Parameters<NumberHandler['noneOf']>>): NumberChain;

    /**
    * Validates that a value is not one of the configured empty values.
    * @param empties Values treated as empty. Defaults to null and undefined.
    * @returns A passing result when the value is not considered empty; otherwise a failing result.
    */
    notEmpty(...args: DropFirst<Parameters<NumberHandler['notEmpty']>>): NumberChain;

    /**
    * Validates strict inequality against a comparison value.
    * @param comparison Value num must not strictly equal.
    * @returns Returns the original number if it does not strictly equal the comparison value; otherwise returns a validation error.
    */
    notEquals(...args: DropFirst<Parameters<NumberHandler['notEquals']>>): NumberChain;

    /**
    * Validates that a value is not null.
    * @returns A passing result when the value is not null; otherwise a failing result.
    */
    notNull(...args: DropFirst<Parameters<NumberHandler['notNull']>>): NumberChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    notNullish(...args: DropFirst<Parameters<NumberHandler['notNullish']>>): NumberChain;

    /**
    * Validates that a value is null.
    * @returns A passing result when the value is null; otherwise a failing result.
    */
    null(...args: DropFirst<Parameters<NumberHandler['null']>>): NumberChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    nullish(...args: DropFirst<Parameters<NumberHandler['nullish']>>): NumberChain;

    /**
    * Validates that a value is a number and not NaN.
    * @returns Returns the original value if it is a valid number; otherwise returns a validation error.
    */
    number(...args: DropFirst<Parameters<NumberHandler['number']>>): NumberChain;

    /**
    * Validates that a number is odd.
    * @returns Returns the original number if it is odd; otherwise returns a validation error.
    */
    odd(...args: DropFirst<Parameters<NumberHandler['odd']>>): NumberChain;

    /**
    * Validates that a value's string representation begins with a plus sign.
    * @returns Returns the original value if its string form starts with a plus sign; otherwise returns a validation error.
    */
    plusSign(...args: DropFirst<Parameters<NumberHandler['plusSign']>>): NumberChain;

    /**
    * Validates that a number is positive.
    * @returns Returns the original number if it is positive; otherwise returns a validation error.
    */
    positive(...args: DropFirst<Parameters<NumberHandler['positive']>>): NumberChain;

    /**
    * Raises a number to an exponent.
    * @param exponent Exponent to apply.
    * @returns Returns the base raised to the given exponent.
    */
    pow(...args: DropFirst<Parameters<NumberHandler['pow']>>): NumberChain;

    /**
    * Validates that a number has at most the specified decimal precision.
    * @param precision Maximum decimal places allowed.
    * @returns Returns the original number if it matches the requested precision; otherwise returns a validation error.
    */
    precision(...args: DropFirst<Parameters<NumberHandler['precision']>>): NumberChain;

    /**
    * Validates that a number is prime.
    * @returns Returns the original number if it is prime; otherwise returns a validation error.
    */
    prime(...args: DropFirst<Parameters<NumberHandler['prime']>>): NumberChain;

    /**
    * Validates primitive type expectations for a value.
    * When type is provided, the value must match that primitive type exactly.
    * When type is omitted, any primitive type is accepted.
    * @param type Optional primitive type to enforce.
    * @returns A passing result when type constraints are met; otherwise a failing result.
    */
    primitive(...args: DropFirst<Parameters<NumberHandler['primitive']>>): NumberChain;

    /**
    * Rounds a number to the specified number of decimal places.
    * @param numDecimals Decimal places to keep.
    * @returns Returns the input number rounded to the requested decimal places.
    */
    round(...args: DropFirst<Parameters<NumberHandler['round']>>): NumberChain;

    /**
    * Floors a number to the nearest lower integer.
    * @returns Returns the input number floored to the nearest integer.
    */
    roundDown(...args: DropFirst<Parameters<NumberHandler['roundDown']>>): NumberChain;

    /**
    * Ceils a number to the nearest higher integer.
    * @returns Returns the input number ceiled to the nearest integer.
    */
    roundUp(...args: DropFirst<Parameters<NumberHandler['roundUp']>>): NumberChain;

    /**
    * Validates that a number is within JavaScript's safe integer bounds.
    * @returns Returns the original number if it is within safe integer bounds; otherwise returns a validation error.
    */
    safe(...args: DropFirst<Parameters<NumberHandler['safe']>>): NumberChain;

    /**
    * Validates that a number is a safe integer.
    * @returns Returns the original number if it is a safe integer; otherwise returns a validation error.
    */
    safeInteger(...args: DropFirst<Parameters<NumberHandler['safeInteger']>>): NumberChain;

    /**
    * Scales a value from one range to another.
    * @param fromMin Input range minimum.
    * @param fromMax Input range maximum.
    * @param toMin Output range minimum.
    * @param toMax Output range maximum.
    * @returns Returns the input number mapped from the source range to the target range.
    */
    scale(...args: DropFirst<Parameters<NumberHandler['scale']>>): NumberChain;

    /**
    * Validates that a value's string representation has an explicit plus or minus sign.
    * @returns Returns the original value if its string form begins with a sign; otherwise returns a validation error.
    */
    signed(...args: DropFirst<Parameters<NumberHandler['signed']>>): NumberChain;

    /**
    * Removes sign from a number by returning its absolute value.
    * @returns Returns the absolute value of the input number.
    */
    stripSign(...args: DropFirst<Parameters<NumberHandler['stripSign']>>): NumberChain;

    /**
    * Raises a base value to an exponent.
    * @param exponent Exponent to apply.
    * @returns Returns the base raised to the given exponent.
    */
    toPower(...args: DropFirst<Parameters<NumberHandler['toPower']>>): NumberChain;

    /**
    * Maps a number from one numeric range into another numeric range.
    * @param fromMin Input range minimum.
    * @param fromMax Input range maximum.
    * @param toMin Output range minimum.
    * @param toMax Output range maximum.
    * @returns Returns the input number mapped from the source range to the target range.
    */
    toScale(...args: DropFirst<Parameters<NumberHandler['toScale']>>): NumberChain;

    /**
    * Truncates the fractional portion of a number.
    * @returns Returns the input number with its fractional part removed.
    */
    truncate(...args: DropFirst<Parameters<NumberHandler['truncate']>>): NumberChain;

    /**
    * Validates that a value is truthy.
    * @returns A passing result for truthy values; otherwise a failing result.
    */
    truthy(...args: DropFirst<Parameters<NumberHandler['truthy']>>): NumberChain;

    /**
    * Validates that a value is undefined.
    * @returns A passing result when the value is undefined; otherwise a failing result.
    */
    undefined(...args: DropFirst<Parameters<NumberHandler['undefined']>>): NumberChain;

    /**
    * Validates that a value's string representation has no leading plus or minus sign.
    * @returns Returns the original value if its string form has no sign; otherwise returns a validation error.
    */
    unsigned(...args: DropFirst<Parameters<NumberHandler['unsigned']>>): NumberChain;

    /**
    * Validates that a number is exactly zero.
    * @returns Returns the original number if it is exactly zero; otherwise returns a validation error.
    */
    zero(...args: DropFirst<Parameters<NumberHandler['zero']>>): NumberChain;

}

declare module './NumberChain.ts' {
    interface NumberChain extends NumberChainGeneratedMethods {}
}

declare module './NumberChain.js' {
    interface NumberChain extends NumberChainGeneratedMethods {}
}

export {};
