'use strict';

import { Translation } from '../../Translation.ts';
import { HandlerResult } from '../HandlerResult.ts';
import { AnyHandler } from '../any/AnyHandler.ts';
import { AutoParseOptions, DateConverter, DayOfWeek, GenericDateInput, HumanParseOptions, IsoOrdinalParseOptions, IsoParseOptions, IsoWeekParseOptions, TimeMode, TimestampOptions } from './DateConverter.ts';
import { UtcDate } from './UtcDate.ts';
const { pass, fail } = HandlerResult;

/**
 * Handles date parsing, validation, comparison, and mutation operations.
 */
class DateHandler extends AnyHandler {
    protected _dateConverter: DateConverter | undefined;

    public configDateConverter(calendarText: Translation, utcOffsetMinutes: number = 0) {
        this._dateConverter = new DateConverter(calendarText, utcOffsetMinutes);
    }




    // ***********************************************
    //              FORMAT VALIDATORS 
    // ***********************************************

    /**
     * Parses a generic date input using automatic format detection.
     * @param input Date input to parse.
     * @param options Parsing options.
     * @returns Input date or error
     */
    public date(input: unknown, options: AutoParseOptions = {}): HandlerResult {
        const parsedDate = this._dateConverter!.parseAuto(input, options);
        return !parsedDate
            ? fail(input, 'date/base')
            : pass(parsedDate);
    }

    /**
     * Parses human-readable date text and validates required and forbidden date components.
     * @param input Human-readable date text to parse.
     * @param options Parsing and token validation options.
     * @returns Input date or error
     */
    public human(input: unknown, options: HumanParseOptions = {}): HandlerResult {
        const parsedDate = this._dateConverter!.parseHuman(input, options);
        return !parsedDate
            ? fail(input, 'date/human', { options })
            : pass(parsedDate);
    }

    /**
     * Parses an ISO date string and validates component requirements and format strictness.
     * @param input ISO date text to parse.
     * @param options ISO parsing and validation options.
     * @returns Input date or error
     */
    public iso(input: unknown, options: IsoParseOptions = {}): HandlerResult {
        const parsedDate = this._dateConverter!.parseIso(input, options);
        return !parsedDate
            ? fail(input, 'date/iso', { options })
            : pass(parsedDate);
    }

    /**
     * Parses an ISO ordinal date string and optionally enforces extended format only.
     * @param input ISO ordinal date text to parse.
     * @param options ISO ordinal parsing and validation options.
     * @returns Input date or error
     */
    public isoOrdinal(input: unknown, options: IsoOrdinalParseOptions = {}): HandlerResult {
        const parsedDate = this._dateConverter!.parseIsoOrdinal(input, options);
        return !parsedDate
            ? fail(input, 'date/isoOrdinal', { options })
            : pass(parsedDate);
    }

    /**
     * Parses an ISO week date string and optionally enforces extended format only.
     * @param input ISO week date text to parse.
     * @param options ISO week parsing and validation options.
     * @returns Input date or error
     */
    public isoWeek(input: unknown, options: IsoWeekParseOptions = {}): HandlerResult {
        const parsedDate = this._dateConverter!.parseIsoWeek(input, options);
        return !parsedDate
            ? fail(input, 'date/isoWeek', { options })
            : pass(parsedDate);
    }

    /**
     * Parses a timestamp input into a valid Date instance.
     * @param input Timestamp input value to parse.
     * @param options Timestamp parsing options.
     * @returns Input date or error
     */
    public timestamp(input: unknown, options: TimestampOptions = {}): HandlerResult {
        const parsedDate = this._dateConverter!.parseTimestamp(input, options);
        return !parsedDate
            ? fail(input, 'date/timestamp', { options })
            : pass(parsedDate);
    }



    // ***********************************************
    //              VALIDATORS 
    // ***********************************************




    // ============= OVERRIDES =====================

    /**
     * Validates that the input date has the same exact timestamp as the comparison date.
     * @param inputDate Date value being validated.
     * @param referenceDate Date value to compare against.
     * @returns Input date or error.
     */
    public override equals(inputDate: UtcDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.globalDate.getTime() === parsedReferenceDate.globalDate.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/equals', { referenceDate });
    }

    /**
     * Validates that the input date has the same exact timestamp as the comparison date.
     * @param inputDate Date value being validated.
     * @param referenceDate Date value to compare against.
     * @returns Input date or error.
     */
    public override notEquals(inputDate: UtcDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.globalDate.getTime() !== parsedReferenceDate.globalDate.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/notEquals', { referenceDate });
    }



    // ============= THE REST =====================

    /**
     * Validates that the input date occurs strictly after the provided comparison date.
     * @param inputDate Date value being validated.
     * @param referenceDate Lower-bound date that the input must be after.
     * @returns Input date or error
     */
    public after(inputDate: UtcDate, referenceDate: GenericDateInput = new Date()): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.globalDate > parsedReferenceDate.globalDate
            ? pass(inputDate)
            : fail(inputDate, 'date/after', { referenceDate });
    }

    /**
     * Validates that the input date occurs strictly before the provided comparison date.
     * @param inputDate Date value being validated.
     * @param referenceDate Upper-bound date that the input must be before.
     * @returns Input date or error
     */
    public before(inputDate: UtcDate, referenceDate: GenericDateInput = new Date()): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.globalDate < parsedReferenceDate.globalDate
            ? pass(inputDate)
            : fail(inputDate, 'date/before', { referenceDate });
    }

    /**
     * Validates that the input date falls within an inclusive min and max date range.
     * @param inputDate Date value being validated.
     * @param minDate Inclusive lower-bound date.
     * @param maxDate Inclusive upper-bound date.
     * @returns Input date or error
     */
    public between(inputDate: UtcDate, minDate: GenericDateInput, maxDate: GenericDateInput): HandlerResult {
        const parsedMinDate = this._dateConverter!.parseAuto(minDate);
        const parsedMaxDate = this._dateConverter!.parseAuto(maxDate);
        if (!parsedMinDate) {
            return fail(minDate, 'date/base');
        }
        if (!parsedMaxDate) {
            return fail(maxDate, 'date/base');
        }
        return inputDate.globalDate >= parsedMinDate.globalDate && inputDate.globalDate <= parsedMaxDate.globalDate
            ? pass(inputDate)
            : fail(inputDate, 'date/between', { minDate, maxDate });
    }

    /**
     * Validates that the input date resolves to a specific UTC day-of-week index.
     * @param inputDate Date value being validated.
     * @param dayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
     * @returns Input date or error.
     */
    public dayOfWeek(inputDate: UtcDate, dayOfWeek: number): HandlerResult {
        const dayIndex = inputDate.globalDate.getUTCDay();
        return dayIndex === dayOfWeek
            ? pass(inputDate)
            : fail(inputDate, 'date/dayOfWeek', { dayOfWeek });
    }


    /**
     * Validates that the input date falls within a leap year.
     * @param inputDate Date value being validated.
     * @returns Input date or error.
     */
    public leapYear(inputDate: UtcDate): HandlerResult {
        const year = inputDate.globalDate.getUTCFullYear();
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
            ? pass(inputDate)
            : fail(inputDate, 'date/leapYear');
    }

    /**
     * Validates that the input date is not later than the provided maximum date.
     * @param inputDate Date value being validated.
     * @param referenceDate Maximum allowed date.
     * @returns Input date or error.
     */
    public max(inputDate: UtcDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.globalDate <= parsedReferenceDate.globalDate
            ? pass(inputDate)
            : fail(inputDate, 'date/max', { referenceDate });
    }

    /**
     * Validates that the input date is not earlier than the provided minimum date.
     * @param inputDate Date value being validated.
     * @param referenceDate Minimum allowed date.
     * @returns Input date or error.
     */
    public min(inputDate: UtcDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.globalDate >= parsedReferenceDate.globalDate
            ? pass(inputDate)
            : fail(inputDate, 'date/min', { referenceDate });
    }

    /**
     * Validates that a birth date meets a minimum age at the comparison date.
     * @param birthDate Birth date used to calculate age.
     * @param minAge Minimum required age in years.
     * @param referenceDate Reference date used to calculate current age.
     * @returns Input date or error.
     */
    public minAge(birthDate: UtcDate, minAge: number, referenceDate: GenericDateInput = new Date()): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const date = birthDate.globalDate;
        const refDate = parsedReferenceDate.globalDate;
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
     * Validates that two dates fall on the same UTC calendar day.
     * @param inputDate Date value being validated.
     * @param referenceDate Date value to compare against.
     * @returns Input date or error.
     */
    public sameDay(inputDate: UtcDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.globalDate);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.globalDate);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/sameDay', { referenceDate });
    }

    /**
     * Validates that two dates fall within the same UTC calendar month.
     * @param inputDate Date value being validated.
     * @param referenceDate Date value to compare against.
     * @returns Input date or error.
     */
    public sameMonth(inputDate: UtcDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.globalDate);
        inputNormalized.setUTCDate(1);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.globalDate);
        referenceNormalized.setUTCDate(1);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/sameMonth', { referenceDate });
    }

    /**
     * Validates that two dates fall within the same UTC week.
     * @param inputDate Date value being validated.
     * @param referenceDate Date value to compare against.
     * @param firstDayOfWeek First weekday used to calculate week boundaries.
     * @returns Input date or error.
     */
    public sameWeek(inputDate: UtcDate, referenceDate: GenericDateInput, firstDayOfWeek: DayOfWeek = 1): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.globalDate);
        const inputOffset = (inputNormalized.getUTCDay() - firstDayOfWeek + 7) % 7;
        inputNormalized.setUTCDate(inputNormalized.getUTCDate() - inputOffset);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.globalDate);
        const referenceOffset = (referenceNormalized.getUTCDay() - firstDayOfWeek + 7) % 7;
        referenceNormalized.setUTCDate(referenceNormalized.getUTCDate() - referenceOffset);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/sameWeek', { referenceDate, firstDayOfWeek });
    }

    /**
     * Validates that two dates fall within the same UTC calendar year.
     * @param inputDate Date value being validated.
     * @param referenceDate Date value to compare against.
     * @returns Input date or error.
     */
    public sameYear(inputDate: UtcDate, referenceDate: GenericDateInput): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.globalDate);
        inputNormalized.setUTCMonth(0, 1);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.globalDate);
        referenceNormalized.setUTCMonth(0, 1);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/sameYear', { referenceDate });
    }

    /**
     * Validates that the input date matches the same UTC calendar day as today.
     * @param inputDate Date value being validated.
     * @param today Reference date representing "today".
     * @returns Input date or error.
     */
    public today(inputDate: UtcDate, today: GenericDateInput = new Date()): HandlerResult {
        return this.sameDay(inputDate, today).pass
            ? pass(inputDate)
            : fail(inputDate, 'date/today', { referenceDate: today });
    }

    /**
     * Validates that the input date falls on a weekday (Monday through Friday, UTC).
     * @param inputDate Date value being validated.
     * @returns Input date or error.
     */
    public weekday(inputDate: UtcDate): HandlerResult {
        const dayOfWeek = inputDate.globalDate.getUTCDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5
            ? pass(inputDate)
            : fail(inputDate, 'date/weekday', { dayOfWeek });
    }

    /**
     * Validates that the input date falls on a weekend day (Saturday or Sunday, UTC).
     * @param inputDate Date value being validated.
     * @returns Input date or error.
     */
    public weekend(inputDate: UtcDate): HandlerResult {
        const dayOfWeek = inputDate.globalDate.getUTCDay();
        return dayOfWeek === 0 || dayOfWeek === 6
            ? pass(inputDate)
            : fail(inputDate, 'date/weekend', { dayOfWeek });
    }

    /**
     * Validates that the input date occurred within the last N days from the comparison date.
     * @param inputDate Date value being validated.
     * @param daysDiff Maximum number of days difference allowed..
     * @param referenceDate Reference date used to compute elapsed days.
     * @returns Input date or error.
     */
    public within(inputDate: UtcDate, daysDiff: number = 30, referenceDate: GenericDateInput = new Date()): HandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const actualDiff = (inputDate.globalDate.getTime() - parsedReferenceDate.globalDate.getTime()) / (1000 * 60 * 60 * 24);
        return Math.abs(actualDiff) <= Math.abs(daysDiff)
            ? pass(inputDate)
            : fail(inputDate, 'date/recent', { actualDiff, daysDiff });
    }




    // *******************************************************
    //               DATE STRING FORMATTER 
    //     Last chain item to run since it returns a string
    // *******************************************************

    /**
     * Formats a parsed date into the requested output representation.
     * @param inputDate Parsed date to format.
     * @param formatString Target output format, or null to preserve raw input.
     * @param timeMode Time mode for the output date, either 'utc' or 'local'.
     * @returns Date in requested format.
     */
    public toFormat(inputDate: UtcDate, formatString: string | null, timeMode: TimeMode = 'utc'): HandlerResult<string> {
        let finalForm: unknown;
        if (formatString === null) {
            // A raw date will only exist if the metadate was never modified
            finalForm = inputDate.raw !== null ? inputDate.raw : inputDate.globalDate;
        }
        else if (formatString === 'timestamp') {
            finalForm = inputDate.globalDate.getTime();
        }
        else if (formatString === 'object') {
            finalForm = new Date(inputDate.globalDate);
        }
        else {
            finalForm = this._dateConverter!.format(inputDate, formatString, timeMode);
        }
        return pass(finalForm);
    }




    // *****************************************
    //               MUTATORS
    // *****************************************

    /**
     * Returns a new date shifted forward or backward by a whole number of days.
     * @param inputDate Base date to adjust.
     * @param numDays Whole number of days to add (or subtract if negative).
     * @returns Returns the date moved forward the amount of days specified.
     */
    public addDays(inputDate: UtcDate, numDays: number): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        localDate.setUTCDate(localDate.getUTCDate() + numDays);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of hours.
     * @param inputDate Base date to adjust.
     * @param numHours Whole number of hours to add (or subtract if negative).
     * @returns Returns the date moved forward the amount of hours specified.
     */
    public addHours(inputDate: UtcDate, numHours: number): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        localDate.setUTCHours(localDate.getUTCHours() + numHours);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of minutes.
     * @param inputDate Base date to adjust.
     * @param numMinutes Whole number of minutes to add (or subtract if negative).
     * @returns Returns the date moved forward the amount of minutes specified.
     */
    public addMinutes(inputDate: UtcDate, numMinutes: number): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        localDate.setUTCMinutes(localDate.getUTCMinutes() + numMinutes);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of months.
     * @param inputDate Base date to adjust.
     * @param numMonths Whole number of months to add (or subtract if negative).
     * @returns Returns the date moved forward the amount of months specified.
     */
    public addMonths(inputDate: UtcDate, numMonths: number): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        localDate.setUTCMonth(localDate.getUTCMonth() + numMonths);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of years.
     * @param inputDate Base date to adjust.
     * @param numYears Whole number of years to add (or subtract if negative).
     * @returns Returns the date moved forward the amount of years specified.
     */
    public addYears(inputDate: UtcDate, numYears: number): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        localDate.setUTCFullYear(localDate.getUTCFullYear() + numYears);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Clamps a date into an inclusive min/max range.
     * @param inputDate Date value to clamp.
     * @param minDate Inclusive lower-bound date.
     * @param maxDate Inclusive upper-bound date.
     * @returns Returns the date clamped to the min or max if outside the range, otherwise returns the input date.
     */
    public clamp(inputDate: UtcDate, minDate: GenericDateInput, maxDate: GenericDateInput): HandlerResult {
        const minDateParsed = this._dateConverter!.parseAuto(minDate);
        const maxDateParsed = this._dateConverter!.parseAuto(maxDate);
        if (!minDateParsed) {
            return fail(minDate, 'date/base');
        }
        if (!maxDateParsed) {
            return fail(maxDate, 'date/base');
        }
        if (inputDate.globalDate < minDateParsed.globalDate) {
            return pass(minDateParsed);
        }
        else if (inputDate.globalDate > maxDateParsed.globalDate) {
            return pass(maxDateParsed);
        }
        return pass(inputDate);
    }

    /**
     * Normalizes a date to the final millisecond of its UTC day.
     * @param inputDate Base date to normalize.
     * @returns Returns the date moved forward to the end of day.
     */
    public toEndOfDay(inputDate: UtcDate): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        localDate.setUTCHours(23, 59, 59, 999);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Normalizes a date to the final millisecond of its UTC month.
     * @param inputDate Base date to normalize.
     * @returns Returns the date moved forward to the end of the month.
     */
    public toEndOfMonth(inputDate: UtcDate): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        localDate.setUTCMonth(localDate.getUTCMonth() + 1, 0);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Normalizes a date to the final millisecond of its UTC year.
     * @param inputDate Base date to normalize.
     * @returns Returns the date moved forward to the end of the year.
     */
    public toEndOfYear(inputDate: UtcDate): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        localDate.setUTCFullYear(localDate.getUTCFullYear() + 1, 0, 0);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Moves a date forward to the next occurrence of the target UTC day of week.
     * @param inputDate Base date to adjust.
     * @param targetDayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
     * @returns Returns the date moved forward to the next day of the week specified.
     */
    public toNextDayOfWeek(inputDate: UtcDate, targetDayOfWeek: DayOfWeek): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        let daysToAdd = targetDayOfWeek - localDate.getUTCDay();
        if (daysToAdd <= 0) {
            daysToAdd += 7;
        }
        localDate.setUTCDate(localDate.getUTCDate() + daysToAdd);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Moves a date forward to the next weekday, skipping Saturday and Sunday.
     * @param inputDate Base date to adjust.
     * @returns Returns the date moved forward to the next weekday.
     */
    public toNextWeekday(inputDate: UtcDate): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        do {
            localDate.setUTCDate(localDate.getUTCDate() + 1);
        }
        while (localDate.getUTCDay() === 0 || localDate.getUTCDay() === 6);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Moves a date backward to the previous occurrence of the target UTC day of week.
     * @param inputDate Base date to adjust.
     * @param targetDayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
     * @returns Returns the date moved backward to the previous day of the week specified.
     */
    public toPreviousDayOfWeek(inputDate: UtcDate, targetDayOfWeek: DayOfWeek): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        let daysToSubtract = localDate.getUTCDay() - targetDayOfWeek;
        if (daysToSubtract <= 0) {
            daysToSubtract += 7;
        }
        localDate.setUTCDate(localDate.getUTCDate() - daysToSubtract);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Moves a date backward to the previous weekday, skipping Saturday and Sunday.
     * @param inputDate Base date to adjust.
     * @returns Returns the date moved backward to the previous weekday.
     */
    public toPreviousWeekday(inputDate: UtcDate): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        do {
            localDate.setUTCDate(localDate.getUTCDate() - 1);
        }
        while (localDate.getUTCDay() === 0 || localDate.getUTCDay() === 6);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Normalizes a date to the first millisecond of its UTC day.
     * @param inputDate Base date to normalize.
     * @returns Returns the date moved to the first millisecond of its UTC day.
     */
    public toStartOfDay(inputDate: UtcDate): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        localDate.setUTCHours(0, 0, 0, 0);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Normalizes a date to the first millisecond of the first day of its UTC month.
     * @param inputDate Base date to normalize.
     * @returns Returns the date moved to the first millisecond of its UTC month.
     */
    public toStartOfMonth(inputDate: UtcDate): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        localDate.setUTCDate(1);
        return pass(inputDate.setLocalDate(localDate));
    }

    /**
     * Normalizes a date to the first millisecond of January 1st in its UTC year.
     * @param inputDate Base date to normalize.
     * @returns Returns the date moved to the first millisecond of its UTC year.
     */
    public toStartOfYear(inputDate: UtcDate): HandlerResult {
        const localDate = new Date(inputDate.localDate);
        localDate.setUTCMonth(0, 1);
        return pass(inputDate.setLocalDate(localDate));
    }

}


export { DateHandler };

