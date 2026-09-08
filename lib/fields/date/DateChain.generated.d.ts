// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/fields/date/DateHandler.ts + lib/fields/date/DateChain.ts
// Run: npm run generate:chain-defs

import type { DateHandler } from './DateHandler.ts';

type DropFirst<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];

interface DateChainGeneratedMethods {
    /**
    * Returns a new date shifted forward or backward by a whole number of days.
    * @param numDays Whole number of days to add (or subtract if negative).
    * @returns Returns the date moved forward the amount of days specified.
    */
    addDays(...args: DropFirst<Parameters<DateHandler['addDays']>>): DateChain;

    /**
    * Returns a new date shifted forward or backward by a whole number of hours.
    * @param numHours Whole number of hours to add (or subtract if negative).
    * @returns Returns the date moved forward the amount of hours specified.
    */
    addHours(...args: DropFirst<Parameters<DateHandler['addHours']>>): DateChain;

    /**
    * Returns a new date shifted forward or backward by a whole number of minutes.
    * @param numMinutes Whole number of minutes to add (or subtract if negative).
    * @returns Returns the date moved forward the amount of minutes specified.
    */
    addMinutes(...args: DropFirst<Parameters<DateHandler['addMinutes']>>): DateChain;

    /**
    * Returns a new date shifted forward or backward by a whole number of months.
    * @param numMonths Whole number of months to add (or subtract if negative).
    * @returns Returns the date moved forward the amount of months specified.
    */
    addMonths(...args: DropFirst<Parameters<DateHandler['addMonths']>>): DateChain;

    /**
    * Returns a new date shifted forward or backward by a whole number of years.
    * @param numYears Whole number of years to add (or subtract if negative).
    * @returns Returns the date moved forward the amount of years specified.
    */
    addYears(...args: DropFirst<Parameters<DateHandler['addYears']>>): DateChain;

    /**
    * Validates that the input date occurs strictly after the provided comparison date.
    * @param referenceDate Lower-bound date that the input must be after.
    * @returns Input date or error
    */
    after(...args: DropFirst<Parameters<DateHandler['after']>>): DateChain;

    /**
    * Validates that a value matches one of the allowed values.
    * @param allowedValues Values that are accepted.
    * @returns A passing result when a match is found; otherwise a failing result.
    */
    anyOf(...args: DropFirst<Parameters<DateHandler['anyOf']>>): DateChain;

    /**
    * Validates that the input date occurs strictly before the provided comparison date.
    * @param referenceDate Upper-bound date that the input must be before.
    * @returns Input date or error
    */
    before(...args: DropFirst<Parameters<DateHandler['before']>>): DateChain;

    /**
    * Validates that the input date falls within an inclusive min and max date range.
    * @param minDate Inclusive lower-bound date.
    * @param maxDate Inclusive upper-bound date.
    * @returns Input date or error
    */
    between(...args: DropFirst<Parameters<DateHandler['between']>>): DateChain;

    /**
    * Clamps a date into an inclusive min/max range.
    * @param minDate Inclusive lower-bound date.
    * @param maxDate Inclusive upper-bound date.
    * @returns Returns the date clamped to the min or max if outside the range, otherwise returns the input date.
    */
    clamp(...args: DropFirst<Parameters<DateHandler['clamp']>>): DateChain;

    /**
    * Executes a user-provided handler for custom validation or transformation.
    * If the callback returns a HandlerResult, that result is used directly.
    * Otherwise, the returned value is wrapped in a passing result.
    * @param filterFn Callback that validates and/or transforms the value.
    * @returns The callback result as-is when it is a HandlerResult; otherwise a passing result.
    */
    custom(...args: DropFirst<Parameters<DateHandler['custom']>>): DateChain;

    /**
    * Parses a generic date input using automatic format detection.
    * @param options Parsing options.
    * @returns Input date or error
    */
    date(...args: DropFirst<Parameters<DateHandler['date']>>): DateChain;

    /**
    * Validates that the input date resolves to a specific UTC day-of-week index.
    * @param dayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
    * @returns Input date or error.
    */
    dayOfWeek(...args: DropFirst<Parameters<DateHandler['dayOfWeek']>>): DateChain;

    /**
    * Validates that a value is not undefined.
    * @returns A passing result when the value is defined; otherwise a failing result.
    */
    defined(...args: DropFirst<Parameters<DateHandler['defined']>>): DateChain;

    /**
    * Validates that a value is one of the configured empty values.
    * @param empties Values treated as empty. Defaults to null and undefined.
    * @returns A passing result when the value is considered empty; otherwise a failing result.
    */
    empty(...args: DropFirst<Parameters<DateHandler['empty']>>): DateChain;

    /**
    * Validates that the input date has the same exact timestamp as the comparison date.
    * @param referenceDate Date value to compare against.
    * @returns Input date or error.
    */
    equals(...args: DropFirst<Parameters<DateHandler['equals']>>): DateChain;

    /**
    * Validates that a value is falsy.
    * @returns A passing result for falsy values; otherwise a failing result.
    */
    falsy(...args: DropFirst<Parameters<DateHandler['falsy']>>): DateChain;

    /**
    * Validates that a value is an instance of the supplied constructor.
    * @param constructor Constructor function the value must be an instance of.
    * @returns A passing result when the instance check succeeds; otherwise a failing result.
    */
    instanceOf(...args: DropFirst<Parameters<DateHandler['instanceOf']>>): DateChain;

    /**
    * Validates that the input date falls within a leap year.
    * @returns Input date or error.
    */
    leapYear(...args: DropFirst<Parameters<DateHandler['leapYear']>>): DateChain;

    /**
    * Validates that the input date is not later than the provided maximum date.
    * @param referenceDate Maximum allowed date.
    * @returns Input date or error.
    */
    max(...args: DropFirst<Parameters<DateHandler['max']>>): DateChain;

    /**
    * Validates that the input date is not earlier than the provided minimum date.
    * @param referenceDate Minimum allowed date.
    * @returns Input date or error.
    */
    min(...args: DropFirst<Parameters<DateHandler['min']>>): DateChain;

    /**
    * Validates that a birth date meets a minimum age at the comparison date.
    * @param minAge Minimum required age in years.
    * @param referenceDate Reference date used to calculate current age.
    * @returns Input date or error.
    */
    minAge(...args: DropFirst<Parameters<DateHandler['minAge']>>): DateChain;

    /**
    * Validates that a value does not match any of the forbidden values.
    * @param forbiddenValues Values that are not allowed.
    * @returns A passing result when the value is not found; otherwise a failing result.
    */
    noneOf(...args: DropFirst<Parameters<DateHandler['noneOf']>>): DateChain;

    /**
    * Validates that a value is not one of the configured empty values.
    * @param empties Values treated as empty. Defaults to null and undefined.
    * @returns A passing result when the value is not considered empty; otherwise a failing result.
    */
    notEmpty(...args: DropFirst<Parameters<DateHandler['notEmpty']>>): DateChain;

    /**
    * Validates that the input date has the same exact timestamp as the comparison date.
    * @param referenceDate Date value to compare against.
    * @returns Input date or error.
    */
    notEquals(...args: DropFirst<Parameters<DateHandler['notEquals']>>): DateChain;

    /**
    * Validates that a value is not null.
    * @returns A passing result when the value is not null; otherwise a failing result.
    */
    notNull(...args: DropFirst<Parameters<DateHandler['notNull']>>): DateChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    notNullish(...args: DropFirst<Parameters<DateHandler['notNullish']>>): DateChain;

    /**
    * Validates that a value is null.
    * @returns A passing result when the value is null; otherwise a failing result.
    */
    null(...args: DropFirst<Parameters<DateHandler['null']>>): DateChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    nullish(...args: DropFirst<Parameters<DateHandler['nullish']>>): DateChain;

    /**
    * Validates primitive type expectations for a value.
    * When type is provided, the value must match that primitive type exactly.
    * When type is omitted, any primitive type is accepted.
    * @param type Optional primitive type to enforce.
    * @returns A passing result when type constraints are met; otherwise a failing result.
    */
    primitive(...args: DropFirst<Parameters<DateHandler['primitive']>>): DateChain;

    /**
    * Validates that two dates fall on the same UTC calendar day.
    * @param referenceDate Date value to compare against.
    * @returns Input date or error.
    */
    sameDay(...args: DropFirst<Parameters<DateHandler['sameDay']>>): DateChain;

    /**
    * Validates that two dates fall within the same UTC calendar month.
    * @param referenceDate Date value to compare against.
    * @returns Input date or error.
    */
    sameMonth(...args: DropFirst<Parameters<DateHandler['sameMonth']>>): DateChain;

    /**
    * Validates that two dates fall within the same UTC week.
    * @param referenceDate Date value to compare against.
    * @param firstDayOfWeek First weekday used to calculate week boundaries.
    * @returns Input date or error.
    */
    sameWeek(...args: DropFirst<Parameters<DateHandler['sameWeek']>>): DateChain;

    /**
    * Validates that two dates fall within the same UTC calendar year.
    * @param referenceDate Date value to compare against.
    * @returns Input date or error.
    */
    sameYear(...args: DropFirst<Parameters<DateHandler['sameYear']>>): DateChain;

    /**
    * Normalizes a date to the final millisecond of its UTC day.
    * @returns Returns the date moved forward to the end of day.
    */
    toEndOfDay(...args: DropFirst<Parameters<DateHandler['toEndOfDay']>>): DateChain;

    /**
    * Normalizes a date to the final millisecond of its UTC month.
    * @returns Returns the date moved forward to the end of the month.
    */
    toEndOfMonth(...args: DropFirst<Parameters<DateHandler['toEndOfMonth']>>): DateChain;

    /**
    * Normalizes a date to the final millisecond of its UTC year.
    * @returns Returns the date moved forward to the end of the year.
    */
    toEndOfYear(...args: DropFirst<Parameters<DateHandler['toEndOfYear']>>): DateChain;

    /**
    * Moves a date forward to the next occurrence of the target UTC day of week.
    * @param targetDayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
    * @returns Returns the date moved forward to the next day of the week specified.
    */
    toNextDayOfWeek(...args: DropFirst<Parameters<DateHandler['toNextDayOfWeek']>>): DateChain;

    /**
    * Moves a date forward to the next weekday, skipping Saturday and Sunday.
    * @returns Returns the date moved forward to the next weekday.
    */
    toNextWeekday(...args: DropFirst<Parameters<DateHandler['toNextWeekday']>>): DateChain;

    /**
    * Moves a date backward to the previous occurrence of the target UTC day of week.
    * @param targetDayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
    * @returns Returns the date moved backward to the previous day of the week specified.
    */
    toPreviousDayOfWeek(...args: DropFirst<Parameters<DateHandler['toPreviousDayOfWeek']>>): DateChain;

    /**
    * Moves a date backward to the previous weekday, skipping Saturday and Sunday.
    * @returns Returns the date moved backward to the previous weekday.
    */
    toPreviousWeekday(...args: DropFirst<Parameters<DateHandler['toPreviousWeekday']>>): DateChain;

    /**
    * Normalizes a date to the first millisecond of its UTC day.
    * @returns Returns the date moved to the first millisecond of its UTC day.
    */
    toStartOfDay(...args: DropFirst<Parameters<DateHandler['toStartOfDay']>>): DateChain;

    /**
    * Normalizes a date to the first millisecond of the first day of its UTC month.
    * @returns Returns the date moved to the first millisecond of its UTC month.
    */
    toStartOfMonth(...args: DropFirst<Parameters<DateHandler['toStartOfMonth']>>): DateChain;

    /**
    * Normalizes a date to the first millisecond of January 1st in its UTC year.
    * @returns Returns the date moved to the first millisecond of its UTC year.
    */
    toStartOfYear(...args: DropFirst<Parameters<DateHandler['toStartOfYear']>>): DateChain;

    /**
    * Validates that a value is truthy.
    * @returns A passing result for truthy values; otherwise a failing result.
    */
    truthy(...args: DropFirst<Parameters<DateHandler['truthy']>>): DateChain;

    /**
    * Validates that a value is undefined.
    * @returns A passing result when the value is undefined; otherwise a failing result.
    */
    undefined(...args: DropFirst<Parameters<DateHandler['undefined']>>): DateChain;

    /**
    * Validates that the input date falls on a weekday (Monday through Friday, UTC).
    * @returns Input date or error.
    */
    weekday(...args: DropFirst<Parameters<DateHandler['weekday']>>): DateChain;

    /**
    * Validates that the input date falls on a weekend day (Saturday or Sunday, UTC).
    * @returns Input date or error.
    */
    weekend(...args: DropFirst<Parameters<DateHandler['weekend']>>): DateChain;

    /**
    * Validates that the input date occurred within the last N days from the comparison date.
    * @param numDays Maximum number of days difference allowed..
    * @param referenceDate Reference date used to compute elapsed days.
    * @returns Input date or error.
    */
    within(...args: DropFirst<Parameters<DateHandler['within']>>): DateChain;

}

declare module './DateChain.ts' {
    interface DateChain extends DateChainGeneratedMethods {}
}

declare module './DateChain.js' {
    interface DateChain extends DateChainGeneratedMethods {}
}

export {};
