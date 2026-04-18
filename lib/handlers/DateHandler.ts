'use strict';

import { HandlerResult } from './HandlerResult.ts';
import { Utils } from '../utils/Utils.ts';
import { Handler } from './Handler.ts';
import { DEFAULT_LANGUAGE } from '../config/DefaultLanguage.ts';
import { DateType } from '../date/DateType.ts';
import { RegexCache } from '../cache/RegexCache.ts';
import { Locale } from '../Locale.ts';
import { DateParser } from '../date/DateParser.ts';
const { pass, fail } = HandlerResult;

export type DateLike = Date | string | number;
export type DateMeta = {
    YYYY: number;
    MM?: number;
    ww?: number;
    DD?: number;
    HH?: number;
    mm?: number;
    ss?: number;
    sss?: number;
    HHOffset?: number;
    mmOffset?: number;
    dash?: string;

}
export class ParsedDate {
    date: Date;
    parts: DateMeta;
    format: DateType;
    value: DateLike;

    constructor({ date, parts, format, value }: { date: Date; parts: DateMeta; format: DateType; value: DateLike }) {
        this.date = date;
        this.parts = parts;
        this.format = format;
        this.value = value;
    }
}

/**
 * Checks that parsed date components include all required tokens and exclude forbidden tokens.
 */
export function areOptionsCompliant(parts: any = {}, required: any = [], forbidden: any = []): boolean {
    for (const option of required) {
        if (parts[option] === undefined) {
            return false;
        }
    }
    for (const option of forbidden) {
        if (parts[option] !== undefined) {
            return false;
        }
    }
    return true;
}





class DateHandler extends Handler {

    // ====================================
    // FORMATTER 
    // ====================================
    static format(value: unknown): HandlerResult {
        const result = parseDate(value);
        return result ? pass(result) : fail(value, 'date/base');
    }

    /**
     * Validates that the input date occurs strictly after the provided comparison date.
     * @param date Date value being validated.
     * @param compareDate Lower-bound date that the input must be after.
     * @returns
     */
    static after(date: Date, compareDate: any): HandlerResult {
        const parsedCompareDate = parseDate(compareDate);
        if (!parsedCompareDate) {
            return fail(date, 'date/base', { date: compareDate });
        }

        return date > parsedCompareDate.date
            ? pass(date)
            : fail(date, 'date/after', { afterDate: compareDate });
    }

    /**
     * Validates that the input date occurs strictly before the provided comparison date.
     * @param date Date value being validated.
     * @param compareDate Upper-bound date that the input must be before.
     * @returns
     */
    static before(date: Date, compareDate: any): HandlerResult {
        const parsedCompareDate = parseDate(compareDate);
        if (!parsedCompareDate) {
            return fail(date, 'date/base', { date: compareDate });
        }

        return date < parsedCompareDate.date
            ? pass(date)
            : fail(date, 'date/before', { beforeDate: compareDate });
    }

    /**
     * Validates that the input date falls within an inclusive min and max date range.
     * @param date Date value being validated.
     * @param minDate Inclusive lower-bound date.
     * @param maxDate Inclusive upper-bound date.
     * @returns
     */
    static between(date: Date, minDate: unknown, maxDate: unknown): HandlerResult {
        const parsedMinDate = parseDate(minDate);
        const parsedMaxDate = parseDate(maxDate);
        if (!parsedMinDate) {
            return fail(date, 'date/base', { date: minDate });
        }
        if (!parsedMaxDate) {
            return fail(date, 'date/base', { date: maxDate });
        }
        return date >= parsedMinDate.date && date <= parsedMaxDate.date
            ? pass(date)
            : fail(date, 'date/between', { minDate, maxDate });
    }

    /**
     * Validates that the input date resolves to a specific UTC day-of-week index.
     * @param date Date value being validated.
     * @param dayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
     * @returns
     */
    static dayOfWeek(date: Date, dayOfWeek: number): HandlerResult {
        const dayIndex = date.getUTCDay();
        return dayIndex === dayOfWeek
            ? pass(date)
            : fail(date, 'date/dayOfWeek', { dayOfWeek });
    }

    /**
     * Validates that the input date has the same exact timestamp as the comparison date.
     * @param date Date value being validated.
     * @param compareDate Date value to compare against.
     * @returns
     */
    static equals(date: Date, compareDate: any): HandlerResult {
        const parsedCompareDate = parseDate(compareDate);

        if (!parsedCompareDate) {
            return fail(date, 'date/base', { date: compareDate });
        }

        return date.getTime() === parsedCompareDate.date.getTime()
            ? pass(date)
            : fail(date, 'date/equals', { compareDate });
    }

    /**
     * Validates that the input date is in the future relative to the comparison date.
     * @param date Date value being validated.
     * @param compareDate Reference date used as the "now" boundary.
     * @returns
     */
    static future(date: Date, compareDate: any = new Date()): HandlerResult {
        const parsedReferenceDate = parseDate(compareDate);
        if (!parsedReferenceDate) {
            return fail(date, 'date/base', { date: compareDate });
        }

        return date > parsedReferenceDate.date
            ? pass(date)
            : fail(date, 'date/future', { compareDate });
    }

    /**
     * Parses human-readable date text and validates required and forbidden date components.
     * @param dateString Human-readable date text to parse.
     * @param options Parsing and token validation options.
     * @returns
     */
    static human(dateString: unknown, {
        locale,
        required = ['YYYY', 'MM', 'DD'],
        forbidden = ['HHOffset'],
    }: any = {}): HandlerResult {

        const dateParser = new DateParser(locale);
        const parsedDate = dateParser.parseHuman(dateString);

        if (!parsedDate) {
            return fail(dateString, 'date/human');
        }

        if (!areOptionsCompliant(parts, required, forbidden)) {
            return fail(dateString, 'date/human');
        }
        return pass(date);
    }

    /**
     * Parses an ISO date string and validates component requirements and format strictness.
     * @param dateString ISO date text to parse.
     * @param options ISO parsing and validation options.
     * @returns
     */
    static iso(dateString: any, {
        required = ['YYYY', 'MM', 'DD'],
        forbidden = [],
        allowBasic = false,
    }: any = {}): HandlerResult {
        const parsedDate = parseFromIso(dateString);
        if (!parsedDate) {
            return fail(dateString, 'date/iso');
        }

        const { date, parts } = parsedDate;
        if (!areOptionsCompliant(parts, required, forbidden)) {
            return fail(dateString, 'date/iso');
        }
        if (!allowBasic && !parsedDate.parts.isExtended) {
            return fail(dateString, 'date/iso');
        }

        return pass(date);
    }

    /**
     * Parses an ISO ordinal date string and optionally enforces extended format only.
     * @param dateString ISO ordinal date text to parse.
     * @param allowBasic Whether basic (non-extended) ISO format is allowed.
     * @returns
     */
    static isoOrdinal(dateString: any, allowBasic: any = false): HandlerResult {
        const parsedDate = parseFromIsoOrdinal(dateString);
        if (!parsedDate) {
            return fail(dateString, 'date/isoOrdinal');
        }

        const { date, parts } = parsedDate;
        if (!allowBasic && !parts.isExtended) {
            return fail(dateString, 'date/isoOrdinal');
        }
        return pass(date);
    }

    /**
     * Parses an ISO week date string and optionally enforces extended format only.
     * @param dateString ISO week date text to parse.
     * @param allowBasic Whether basic (non-extended) ISO format is allowed.
     * @returns
     */
    static isoWeek(dateString: any, allowBasic: any = false): HandlerResult {
        const parsedDate = parseFromIsoWeek(dateString);
        if (!parsedDate) {
            return fail(dateString, 'date/isoWeek');
        }

        const { date, parts } = parsedDate;
        if (!allowBasic && !parts.isExtended) {
            return fail(dateString, 'date/isoWeek');
        }
        return pass(date);
    }

    /**
     * Validates that the input date falls within a leap year.
     * @param date Date value being validated.
     * @returns
     */
    static leapYear(date: Date): HandlerResult {
        const year = date.getUTCFullYear();
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
            ? pass(date)
            : fail(date, 'date/leapYear', { year });
    }

    /**
     * Validates that the input date is not later than the provided maximum date.
     * @param date Date value being validated.
     * @param compareDate Maximum allowed date.
     * @returns
     */
    static max(date: Date, compareDate: Date): HandlerResult {
        const parsedCompareDate = parseDate(compareDate);
        if (!parsedCompareDate) {
            return fail(date, 'date/base', { date: compareDate });
        }

        return date <= parsedCompareDate.date
            ? pass(date)
            : fail(date, 'date/max', { maxDate: compareDate });
    }

    /**
     * Validates that the input date is not earlier than the provided minimum date.
     * @param date Date value being validated.
     * @param compareDate Minimum allowed date.
     * @returns
     */
    static min(date: Date, compareDate: Date): HandlerResult {
        const parsedCompareDate = parseDate(compareDate);
        if (!parsedCompareDate) {
            return fail(date, 'date/base', { date: compareDate });
        }

        return date >= parsedCompareDate.date
            ? pass(date)
            : fail(date, 'date/min', { compareDate });
    }

    /**
     * Validates that a birth date meets a minimum age at the comparison date.
     * @param birthDate Birth date used to calculate age.
     * @param minAge Minimum required age in years.
     * @param compareDate Reference date used to calculate current age.
     * @returns
     */
    static minAge(birthDate: any, minAge: any, compareDate: any = new Date()): HandlerResult {
        const parsedBirthDate = parseDate(birthDate);
        const parsedReferenceDate = parseDate(compareDate);

        if (!parsedBirthDate) {
            return fail(birthDate, 'date/base', { date: birthDate });
        }
        if (!parsedReferenceDate) {
            return fail(birthDate, 'date/base', { date: compareDate });
        }
        const date = new Date(parsedBirthDate.date);
        const refDate = new Date(parsedReferenceDate.date);
        let age = refDate.getUTCFullYear() - date.getUTCFullYear();
        const monthDiff = refDate.getUTCMonth() - date.getUTCMonth();

        if (monthDiff < 0 || (monthDiff === 0 && refDate.getUTCDate() < date.getUTCDate())) {
            age--;
        }

        return age >= minAge
            ? pass(birthDate)
            : fail(birthDate, 'date/minAge', { actualAge: age, minAge });
    }

    /**
     * Validates that the input date is in the past relative to the comparison date.
     * @param date Date value being validated.
     * @param compareDate Reference date used as the "now" boundary.
     * @returns
     */
    static past(date: any, compareDate: any = new Date()): HandlerResult {
        const parsedReferenceDate = parseDate(compareDate);

        if (!parsedReferenceDate) {
            return fail(date, 'date/base', { date: compareDate });
        }

        return parseDate(date)!.date < parsedReferenceDate.date
            ? pass(date)
            : fail(date, 'date/past', { compareDate });
    }

    /**
     * Validates that the input date occurred within the last N days from the comparison date.
     * @param date Date value being validated.
     * @param days Maximum number of elapsed days allowed.
     * @param compareDate Reference date used to compute elapsed days.
     * @returns
     */
    static recent(date: any, days: any = 30, compareDate: any = new Date()): HandlerResult {
        const parsedReferenceDate = parseDate(compareDate);

        if (!parsedReferenceDate) {
            return fail(date, 'date/base', { date: compareDate });
        }

        const daysDiff = (parsedReferenceDate.date.getTime() - parseDate(date)!.date.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff >= 0 && daysDiff <= days
            ? pass(date)
            : fail(date, 'date/recent', { daysDiff, days });
    }

    /**
     * Parses a timestamp input into a valid Date instance.
     * @param value Timestamp input value to parse.
     * @param jsType Whether to interpret numeric input using JavaScript timestamp conventions.
     * @returns
     */
    static timestamp(value: any, jsType: any = true): HandlerResult {
        const parsedDate = parseDateFromTimestamp(value);
        if (!parsedDate) {
            return fail(value, 'date/timestamp');
        }
        return pass(parsedDate.date);
    }

    /**
     * Validates that the input date matches the same UTC calendar day as todaysDate.
     * @param date Date value being validated.
     * @param compareDate Reference date representing "today".
     * @returns
     */
    static today(date: any, compareDate: any): HandlerResult {
        const parsedCompareDate = parseDate(compareDate);
        if (!parsedCompareDate) {
            return fail(date, 'date/base', { date: compareDate });
        }
        const newDate = new Date(parseDate(date)!.date);
        newDate.setUTCHours(0, 0, 0, 0);
        const normalizedTodayDate = new Date(parsedCompareDate.date);
        normalizedTodayDate.setUTCHours(0, 0, 0, 0);
        return newDate.getTime() === normalizedTodayDate.getTime()
            ? pass(date)
            : fail(date, 'date/today', {});
    }

    /**
     * Validates that the input date falls on a weekday (Monday through Friday, UTC).
     * @param date Date value being validated.
     * @returns
     */
    static weekday(date: any): HandlerResult {
        const dayOfWeek = parseDate(date)!.date.getUTCDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5
            ? pass(date)
            : fail(date, 'date/weekday', { dayOfWeek });
    }

    /**
     * Validates that the input date falls on a weekend day (Saturday or Sunday, UTC).
     * @param date Date value being validated.
     * @returns
     */
    static weekend(date: any): HandlerResult {
        const dayOfWeek = parseDate(date)!.date.getUTCDay();
        return dayOfWeek === 0 || dayOfWeek === 6
            ? pass(date)
            : fail(date, 'date/weekend', { dayOfWeek });
    }


    // ====================================
    // MUTATORS 
    // ====================================

    /**
     * Returns a new date shifted forward or backward by a whole number of days.
     * @param date Base date to adjust.
     * @param numDays Whole number of days to add (or subtract if negative).
     * @returns
     */
    static addDays(date: unknown, numDays: number): HandlerResult {
        if (!Number.isInteger(numDays)) {
            return fail(date, 'date/addDays', { days: numDays });
        }

        const result = new Date(parseDate(date)!.date);
        result.setUTCDate(result.getUTCDate() + numDays);
        return pass(result);
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of hours.
     * @param date Base date to adjust.
     * @param numHours Whole number of hours to add (or subtract if negative).
     * @returns
     */
    static addHours(date: unknown, numHours: number): HandlerResult {
        if (!Number.isInteger(numHours)) {
            return fail(date, 'date/addHours', { hours: numHours });
        }

        const result = new Date(parseDate(date)!.date);
        result.setUTCHours(result.getUTCHours() + numHours);
        return pass(result);
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of minutes.
     * @param date Base date to adjust.
     * @param numMinutes Whole number of minutes to add (or subtract if negative).
     * @returns
     */
    static addMinutes(date: any, numMinutes: any): HandlerResult {
        if (!Number.isInteger(numMinutes)) {
            return fail(date, 'date/addMinutes', { minutes: numMinutes });
        }

        const result = new Date(parseDate(date)!.date);
        result.setUTCMinutes(result.getUTCMinutes() + numMinutes);
        return pass(result);
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of months.
     * @param date Base date to adjust.
     * @param numMonths Whole number of months to add (or subtract if negative).
     * @returns
     */
    static addMonths(date: any, numMonths: any): HandlerResult {
        if (!Number.isInteger(numMonths)) {
            return fail(date, 'date/addMonths', { months: numMonths });
        }

        const result = new Date(parseDate(date)!.date);
        result.setUTCMonth(result.getUTCMonth() + numMonths);
        return pass(result);
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of years.
     * @param date Base date to adjust.
     * @param years Whole number of years to add (or subtract if negative).
     * @returns
     */
    static addYears(date: any, numYears: any): HandlerResult {
        if (!Number.isInteger(numYears)) {
            return fail(date, 'date/addYears', { years: numYears });
        }

        const result = new Date(parseDate(date)!.date);
        result.setUTCFullYear(result.getUTCFullYear() + numYears);
        return pass(result);
    }

    /**
     * Normalizes a date to the final millisecond of its UTC day.
     * @param date Base date to normalize.
     * @returns
     */
    static toEndOfDay(date: any): HandlerResult {
        const result = new Date(parseDate(date)!.date);
        result.setUTCHours(23, 59, 59, 999);
        return pass(result);
    }

    /**
     * Normalizes a date to the final millisecond of its UTC month.
     * @param date Base date to normalize.
     * @returns
     */
    static toEndOfMonth(date: any): HandlerResult {
        const result = new Date(parseDate(date)!.date);
        result.setUTCMonth(result.getUTCMonth() + 1, 0);
        result.setUTCHours(23, 59, 59, 999);
        return pass(result);
    }

    /**
     * Moves a date forward to the next occurrence of the target UTC day of week.
     * @param date Base date to adjust.
     * @param targetDay Target UTC day index where Sunday is 0 and Saturday is 6.
     * @returns
     */
    static toNextDayOfWeek(date: any, targetDay: any): HandlerResult {
        if (targetDay < 0 || targetDay > 6) {
            return fail(date, 'date/toNextDayOfWeek', { targetDay });
        }

        const result = new Date(parseDate(date)!.date);
        const currentDay = result.getUTCDay();
        let daysToAdd = targetDay - currentDay;

        if (daysToAdd <= 0) {
            daysToAdd += 7;
        }

        result.setUTCDate(result.getUTCDate() + daysToAdd);
        return pass(result);
    }

    /**
     * Moves a date forward to the next weekday, skipping Saturday and Sunday.
     * @param date Base date to adjust.
     * @returns
     */
    static toNextWeekday(date: any): HandlerResult {
        const result = new Date(parseDate(date)!.date);
        do {
            result.setUTCDate(result.getUTCDate() + 1);
        }
        while (result.getUTCDay() === 0 || result.getUTCDay() === 6);

        return pass(result);
    }

    /**
     * Moves a date backward to the previous weekday, skipping Saturday and Sunday.
     * @param date Base date to adjust.
     * @returns
     */
    static toPreviousWeekday(date: any): HandlerResult {
        const result = new Date(parseDate(date)!.date);
        do {
            result.setUTCDate(result.getUTCDate() - 1);
        }
        while (result.getUTCDay() === 0 || result.getUTCDay() === 6);

        return pass(result);
    }

    /**
     * Normalizes a date to the first millisecond of its UTC day.
     * @param date Base date to normalize.
     * @returns
     */
    static toStartOfDay(date: any): HandlerResult {
        const result = new Date(parseDate(date)!.date);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

    /**
     * Normalizes a date to the first millisecond of the first day of its UTC month.
     * @param date Base date to normalize.
     * @returns
     */
    static toStartOfMonth(date: any): HandlerResult {
        const result = new Date(parseDate(date)!.date);
        result.setUTCDate(1);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

    /**
     * Normalizes a date to the first millisecond of January 1st in its UTC year.
     * @param date Base date to normalize.
     * @returns
     */
    static toStartOfYear(date: any): HandlerResult {
        const result = (parseDate(date) as ParsedDate).date;
        result.setUTCMonth(0, 1);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

}


export { DateHandler };
