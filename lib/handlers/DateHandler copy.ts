'use strict';

import { DateConverter, HumanParseOptions, IsoOrdinalParseOptions, IsoParseOptions, IsoWeekParseOptions, TimestampOptions } from '../date/DateConverter.ts';
import { DateOrder, DayOfWeek, GenericDateInput } from '../date/DateTypes.ts';
import { MetaDate } from '../date/MetaDate.ts';
import { Locale } from '../Locale.ts';
import { Handler } from './Handler.ts';
import { HandlerResult } from './HandlerResult.ts';
const { pass, fail } = HandlerResult;

class DateHandler extends Handler {
    protected _dateConverter: DateConverter;

    public constructor(locale: Locale, dateOrder: DateOrder) {
        super();
        this._dateConverter = new DateConverter(locale, dateOrder);
    }

    // =============================================
    // DATE CATEGORY VALIDATORS 
    // =============================================

    //todo: fix the puedata class to allow passing in of options
    public date(value: GenericDateInput): HandlerResult {
        const parsedDate = this._dateConverter.parseAuto(value);
        return !parsedDate
            ? fail(value, 'date/base')
            : pass(parsedDate);
    }

    /**
     * Parses human-readable date text and validates required and forbidden date components.
     * @param dateString Human-readable date text to parse.
     * @param options Parsing and token validation options.
     * @returns
     */
    public human(dateString: GenericDateInput, options: HumanParseOptions = {}): HandlerResult {
        const parsedDate = this._dateConverter.parseHuman(dateString, options);
        return !parsedDate
            ? fail(dateString, 'date/human', { options })
            : pass(parsedDate);
    }

    /**
     * Parses an ISO date string and validates component requirements and format strictness.
     * @param dateString ISO date text to parse.
     * @param options ISO parsing and validation options.
     * @returns
     */
    public iso(dateString: GenericDateInput, options: IsoParseOptions): HandlerResult {
        const parsedDate = this._dateConverter.parseIso(dateString, options);
        return !parsedDate
            ? fail(dateString, 'date/iso', { options })
            : pass(parsedDate);
    }

    /**
     * Parses an ISO ordinal date string and optionally enforces extended format only.
     * @param dateString ISO ordinal date text to parse.
     * @param allowBasic Whether basic (non-extended) ISO format is allowed.
     * @returns
     */
    public isoOrdinal(dateString: GenericDateInput, options: IsoOrdinalParseOptions): HandlerResult {
        const parsedDate = this._dateConverter.parseIsoOrdinal(dateString, options);
        return !parsedDate
            ? fail(dateString, 'date/isoOrdinal', { options })
            : pass(parsedDate);
    }

    /**
     * Parses an ISO week date string and optionally enforces extended format only.
     * @param dateString ISO week date text to parse.
     * @param allowBasic Whether basic (non-extended) ISO format is allowed.
     * @returns
     */
    public isoWeek(dateString: GenericDateInput, options: IsoWeekParseOptions): HandlerResult {
        const parsedDate = this._dateConverter.parseIsoWeek(dateString, options);
        return !parsedDate
            ? fail(dateString, 'date/isoWeek', { options })
            : pass(parsedDate);
    }

    /**
     * Parses a timestamp input into a valid Date instance.
     * @param value Timestamp input value to parse.
     * @param jsType Whether to interpret numeric input using JavaScript timestamp conventions.
     * @returns
     */
    public timestamp(value: GenericDateInput, options: TimestampOptions): HandlerResult {
        const parsedDate = this._dateConverter.parseTimestamp(value, options);
        return !parsedDate
            ? fail(value, 'date/timestamp', { options })
            : pass(parsedDate);
    }

    // =============================================
    // DATE STRING FORMATTER (last chain item to run)
    // =============================================

    public format(inputDate: MetaDate, formatString: string | null): HandlerResult {
        let finalForm: unknown;
        if (formatString === null) {
            finalForm = inputDate.raw;
        }
        else if (formatString === 'timestamp') {
            finalForm = inputDate.utcDate.getTime();
        }
        else if (formatString === 'object') {
            finalForm = new Date(inputDate.utcDate);
        }
        else {
            finalForm = this._dateConverter.format(inputDate, formatString);
        }
        return pass(finalForm);
    }

    // =============================================
    // GLOBAL VALIDATORS 
    // =============================================

    /**
     * Validates that the input date occurs strictly after the provided comparison date.
     * @param date Date value being validated.
     * @param referenceDate Lower-bound date that the input must be after.
     * @returns
     */
    public after(inputDate: MetaDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.utcDate > parsedReferenceDate.utcDate
            ? pass(inputDate)
            : fail(inputDate, 'date/after', { referenceDate });
    }

    /**
     * Validates that the input date occurs strictly before the provided comparison date.
     * @param date Date value being validated.
     * @param referenceDate Upper-bound date that the input must be before.
     * @returns
     */
    public before(inputDate: MetaDate, referenceDate: unknown): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.utcDate < parsedReferenceDate.utcDate
            ? pass(inputDate)
            : fail(inputDate, 'date/before', { referenceDate });
    }

    /**
     * Validates that the input date falls within an inclusive min and max date range.
     * @param date Date value being validated.
     * @param minDate Inclusive lower-bound date.
     * @param maxDate Inclusive upper-bound date.
     * @returns
     */
    public between(inputDate: MetaDate, minDate: GenericDateInput, maxDate: GenericDateInput): HandlerResult {
        const parsedMinDate = this._dateConverter.parseAuto(minDate);
        const parsedMaxDate = this._dateConverter.parseAuto(maxDate);
        if (!parsedMinDate) {
            return fail(minDate, 'date/base');
        }
        if (!parsedMaxDate) {
            return fail(maxDate, 'date/base');
        }
        return inputDate.utcDate >= parsedMinDate.utcDate && inputDate.utcDate <= parsedMaxDate.utcDate
            ? pass(inputDate)
            : fail(inputDate, 'date/between', { minDate, maxDate });
    }

    /**
     * Validates that the input date resolves to a specific UTC day-of-week index.
     * @param date Date value being validated.
     * @param dayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
     * @returns
     */
    public dayOfWeek(inputDate: MetaDate, dayOfWeek: number): HandlerResult {
        const dayIndex = inputDate.utcDate.getUTCDay();
        return dayIndex === dayOfWeek
            ? pass(inputDate)
            : fail(inputDate, 'date/dayOfWeek', { dayOfWeek });
    }

    /**
     * Validates that the input date has the same exact timestamp as the comparison date.
     * @param date Date value being validated.
     * @param referenceDate Date value to compare against.
     * @returns
     */
    public override equals(inputDate: MetaDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.utcDate.getTime() === parsedReferenceDate.utcDate.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/equals', { referenceDate });
    }

    /**
     * Validates that the input date is in the future relative to the comparison date.
     * @param date Date value being validated.
     * @param referenceDate Reference date used as the "now" boundary.
     * @returns
     */
    public future(inputDate: MetaDate, referenceDate: GenericDateInput = new Date()): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.utcDate > parsedReferenceDate.utcDate
            ? pass(inputDate)
            : fail(inputDate, 'date/future', { referenceDate });
    }

    /**
     * Validates that the input date falls within a leap year.
     * @param date Date value being validated.
     * @returns
     */
    public leapYear(inputDate: MetaDate): HandlerResult {
        const year = inputDate.utcDate.getUTCFullYear();
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
            ? pass(inputDate)
            : fail(inputDate, 'date/leapYear');
    }

    /**
     * Validates that the input date is not later than the provided maximum date.
     * @param date Date value being validated.
     * @param referenceDate Maximum allowed date.
     * @returns
     */
    public max(inputDate: MetaDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.utcDate <= parsedReferenceDate.utcDate
            ? pass(inputDate)
            : fail(inputDate, 'date/max', { referenceDate });
    }

    /**
     * Validates that the input date is not earlier than the provided minimum date.
     * @param date Date value being validated.
     * @param referenceDate Minimum allowed date.
     * @returns
     */
    public min(inputDate: MetaDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.utcDate >= parsedReferenceDate.utcDate
            ? pass(inputDate)
            : fail(inputDate, 'date/min', { referenceDate });
    }

    /**
     * Validates that a birth date meets a minimum age at the comparison date.
     * @param birthDate Birth date used to calculate age.
     * @param minAge Minimum required age in years.
     * @param referenceDate Reference date used to calculate current age.
     * @returns
     */
    public minAge(birthDate: MetaDate, minAge: number, referenceDate: GenericDateInput = new Date()): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const date = birthDate.utcDate;
        const refDate = parsedReferenceDate.utcDate;
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
     * @param referenceDate Reference date used as the "now" boundary.
     * @returns
     */
    public past(inputDate: MetaDate, referenceDate: GenericDateInput = new Date()): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.utcDate < parsedReferenceDate.utcDate
            ? pass(inputDate)
            : fail(inputDate, 'date/past', { referenceDate });
    }

    /**
     * Validates that the input date occurred within the last N days from the comparison date.
     * @param date Date value being validated.
     * @param days Maximum number of elapsed days allowed.
     * @param compareDate Reference date used to compute elapsed days.
     * @returns
     */
    public recent(inputDate: MetaDate, days: number = 30, referenceDate: GenericDateInput = new Date()): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const daysDiff = (parsedReferenceDate.utcDate.getTime() - inputDate.utcDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff >= 0 && daysDiff <= days
            ? pass(inputDate)
            : fail(inputDate, 'date/recent', { daysDiff, days });
    }

    public sameDay(inputDate: MetaDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.utcDate);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.utcDate);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/sameDay', { referenceDate });
    }

    public sameMonth(inputDate: MetaDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.utcDate);
        inputNormalized.setUTCDate(1);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.utcDate);
        referenceNormalized.setUTCDate(1);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/sameMonth', { referenceDate });
    }

    public sameWeek(inputDate: MetaDate, referenceDate: GenericDateInput, firstDayOfWeek: DayOfWeek = 1): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.utcDate);
        const inputOffset = (inputNormalized.getUTCDay() - firstDayOfWeek + 7) % 7;
        inputNormalized.setUTCDate(inputNormalized.getUTCDate() - inputOffset);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.utcDate);
        const referenceOffset = (referenceNormalized.getUTCDay() - firstDayOfWeek + 7) % 7;
        referenceNormalized.setUTCDate(referenceNormalized.getUTCDate() - referenceOffset);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/sameWeek', { referenceDate, firstDayOfWeek });
    }

    public sameYear(inputDate: MetaDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.utcDate);
        inputNormalized.setUTCMonth(0, 1);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.utcDate);
        referenceNormalized.setUTCMonth(0, 1);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/sameYear', { referenceDate });
    }

    /**
     * Validates that the input date matches the same UTC calendar day as todaysDate.
     * @param date Date value being validated.
     * @param referenceDate Reference date representing "today".
     * @returns
     */
    public today(inputDate: MetaDate, referenceDate: GenericDateInput = new Date()): HandlerResult {
        const parsedReferenceDate = this._dateConverter.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.utcDate);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.utcDate);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/today', { referenceDate });
    }

    /**
     * Validates that the input date falls on a weekday (Monday through Friday, UTC).
     * @param date Date value being validated.
     * @returns
     */
    public weekday(inputDate: MetaDate): HandlerResult {
        const dayOfWeek = inputDate.utcDate.getUTCDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5
            ? pass(inputDate)
            : fail(inputDate, 'date/weekday', { dayOfWeek });
    }

    /**
     * Validates that the input date falls on a weekend day (Saturday or Sunday, UTC).
     * @param date Date value being validated.
     * @returns
     */
    public weekend(inputDate: MetaDate): HandlerResult {
        const dayOfWeek = inputDate.utcDate.getUTCDay();
        return dayOfWeek === 0 || dayOfWeek === 6
            ? pass(inputDate)
            : fail(inputDate, 'date/weekend', { dayOfWeek });
    }


    // =============================================
    // MUTATORS 
    // =============================================

    /**
     * Returns a new date shifted forward or backward by a whole number of days.
     * @param date Base date to adjust.
     * @param numDays Whole number of days to add (or subtract if negative).
     * @returns
     */
    public addDays(inputDate: MetaDate, numDays: number): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        modifiedDate.setUTCDate(modifiedDate.getUTCDate() + numDays);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of hours.
     * @param inputDate Base date to adjust.
     * @param numHours Whole number of hours to add (or subtract if negative).
     * @returns
     */
    public addHours(inputDate: MetaDate, numHours: number): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        modifiedDate.setUTCHours(modifiedDate.getUTCHours() + numHours);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of minutes.
     * @param inputDate Base date to adjust.
     * @param numMinutes Whole number of minutes to add (or subtract if negative).
     * @returns
     */
    public addMinutes(inputDate: MetaDate, numMinutes: number): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        modifiedDate.setUTCMinutes(modifiedDate.getUTCMinutes() + numMinutes);
        return pass(inputDate.clone(modifiedDate));
    }

    public addWeeks(inputDate: MetaDate, numWeeks: number): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        modifiedDate.setUTCDate(modifiedDate.getUTCDate() + numWeeks * 7);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of months.
     * @param date Base date to adjust.
     * @param numMonths Whole number of months to add (or subtract if negative).
     * @returns
     */
    public addMonths(inputDate: MetaDate, numMonths: number): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        modifiedDate.setUTCMonth(modifiedDate.getUTCMonth() + numMonths);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of years.
     * @param date Base date to adjust.
     * @param years Whole number of years to add (or subtract if negative).
     * @returns
     */
    public addYears(inputDate: MetaDate, numYears: number): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        modifiedDate.setUTCFullYear(modifiedDate.getUTCFullYear() + numYears);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Normalizes a date to the final millisecond of its UTC day.
     * @param date Base date to normalize.
     * @returns
     */
    public toEndOfDay(inputDate: MetaDate): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        modifiedDate.setUTCHours(23, 59, 59, 999);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Normalizes a date to the final millisecond of its UTC month.
     * @param date Base date to normalize.
     * @returns
     */
    public toEndOfMonth(inputDate: MetaDate): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        modifiedDate.setUTCMonth(modifiedDate.getUTCMonth() + 1, 0);
        modifiedDate.setUTCHours(23, 59, 59, 999);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Moves a date forward to the next occurrence of the target UTC day of week.
     * @param date Base date to adjust.
     * @param targetDayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
     * @returns
     */
    public toNextDayOfWeek(inputDate: MetaDate, targetDayOfWeek: DayOfWeek): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        let daysToAdd = targetDayOfWeek - modifiedDate.getUTCDay();
        if (daysToAdd <= 0) {
            daysToAdd += 7;
        }
        modifiedDate.setUTCDate(modifiedDate.getUTCDate() + daysToAdd);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Moves a date forward to the next weekday, skipping Saturday and Sunday.
     * @param date Base date to adjust.
     * @returns
     */
    public toNextWeekday(inputDate: MetaDate): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        do {
            modifiedDate.setUTCDate(modifiedDate.getUTCDate() + 1);
        }
        while (modifiedDate.getUTCDay() === 0 || modifiedDate.getUTCDay() === 6);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Moves a date backward to the previous weekday, skipping Saturday and Sunday.
     * @param date Base date to adjust.
     * @returns
     */
    public toPreviousWeekday(inputDate: MetaDate): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        do {
            modifiedDate.setUTCDate(modifiedDate.getUTCDate() - 1);
        }
        while (modifiedDate.getUTCDay() === 0 || modifiedDate.getUTCDay() === 6);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Normalizes a date to the first millisecond of its UTC day.
     * @param date Base date to normalize.
     * @returns
     */
    public toStartOfDay(inputDate: MetaDate): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        modifiedDate.setUTCHours(0, 0, 0, 0);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Normalizes a date to the first millisecond of the first day of its UTC month.
     * @param date Base date to normalize.
     * @returns
     */
    public toStartOfMonth(inputDate: MetaDate): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        modifiedDate.setUTCDate(1);
        modifiedDate.setUTCHours(0, 0, 0, 0);
        return pass(inputDate.clone(modifiedDate));
    }

    /**
     * Normalizes a date to the first millisecond of January 1st in its UTC year.
     * @param date Base date to normalize.
     * @returns
     */
    public toStartOfYear(inputDate: MetaDate): HandlerResult {
        const modifiedDate = new Date(inputDate.utcDate);
        modifiedDate.setUTCMonth(0, 1);
        modifiedDate.setUTCHours(0, 0, 0, 0);
        return pass(inputDate.clone(modifiedDate));
    }

    public clamp(inputDate: MetaDate, minDate: GenericDateInput, maxDate: GenericDateInput): HandlerResult {
        const minDateParsed = this._dateConverter.parseAuto(minDate);
        const maxDateParsed = this._dateConverter.parseAuto(maxDate);
        if (!minDateParsed) {
            return fail(minDate, 'date/base');
        }
        if (!maxDateParsed) {
            return fail(maxDate, 'date/base');
        }
        const modifiedDate = new Date(inputDate.utcDate);
        if (modifiedDate < minDateParsed.utcDate) {
            modifiedDate.setTime(minDateParsed.utcDate.getTime());
        }
        else if (modifiedDate > maxDateParsed.utcDate) {
            modifiedDate.setTime(maxDateParsed.utcDate.getTime());
        }
        return pass(inputDate.clone(modifiedDate));
    }

}


export { DateHandler };

