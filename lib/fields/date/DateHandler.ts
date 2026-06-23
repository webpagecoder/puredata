'use strict';

import { DateConverter, DayOfWeek, GenericDateInput, HumanParseOptions, IsoOrdinalParseOptions, IsoParseOptions, IsoWeekParseOptions, TimeMode, TimestampOptions } from './DateConverter.ts';
import { UtcDate } from './UtcDate.ts';
import { Translation } from '../../Translation.ts';
import { ChainHandler } from '../ChainHandler.ts';
import { ChainHandlerResult } from '../ChainHandlerResult.ts';
const { pass, fail } = ChainHandlerResult;

/**
 * Handles date parsing, validation, comparison, and mutation operations.
 */
class DateHandler extends ChainHandler {
    protected _dateConverter: DateConverter | undefined;

    
    public configDateConverter(calendarText: Translation, utcOffsetMinutes: number = 0) {
        this._dateConverter = new DateConverter(calendarText, utcOffsetMinutes);
    }

    // =============================================
    // DATE CATEGORY VALIDATORS 
    // =============================================

    //todo: fix the puedata class to allow passing in of options
    /**
     * Parses a generic date input using automatic format detection.
     * @param input Date input to parse.
     */
    public date(input: unknown): ChainHandlerResult {
        const parsedDate = this._dateConverter!.parseAuto(input);
        return !parsedDate
            ? fail(input, 'date/base')
            : pass(parsedDate);
    }

    /**
     * Parses human-readable date text and validates required and forbidden date components.
     * @param input Human-readable date text to parse.
     * @param options Parsing and token validation options.
     */
    public human(input: unknown, options: HumanParseOptions = {}): ChainHandlerResult {
        const parsedDate = this._dateConverter!.parseHuman(input, options);
        return !parsedDate
            ? fail(input, 'date/human', { options })
            : pass(parsedDate);
    }

    /**
     * Parses an ISO date string and validates component requirements and format strictness.
     * @param input ISO date text to parse.
     * @param options ISO parsing and validation options.
     */
    public iso(input: unknown, options: IsoParseOptions): ChainHandlerResult {
        const parsedDate = this._dateConverter!.parseIso(input, options);
        return !parsedDate
            ? fail(input, 'date/iso', { options })
            : pass(parsedDate);
    }

    /**
     * Parses an ISO ordinal date string and optionally enforces extended format only.
     * @param input ISO ordinal date text to parse.
     * @param options ISO ordinal parsing and validation options.
     */
    public isoOrdinal(input: unknown, options: IsoOrdinalParseOptions): ChainHandlerResult {
        const parsedDate = this._dateConverter!.parseIsoOrdinal(input, options);
        return !parsedDate
            ? fail(input, 'date/isoOrdinal', { options })
            : pass(parsedDate);
    }

    /**
     * Parses an ISO week date string and optionally enforces extended format only.
     * @param input ISO week date text to parse.
     * @param options ISO week parsing and validation options.
     */
    public isoWeek(input: unknown, options: IsoWeekParseOptions): ChainHandlerResult {
        const parsedDate = this._dateConverter!.parseIsoWeek(input, options);
        return !parsedDate
            ? fail(input, 'date/isoWeek', { options })
            : pass(parsedDate);
    }

    /**
     * Parses a timestamp input into a valid Date instance.
     * @param input Timestamp input value to parse.
     * @param options Timestamp parsing options.
     */
    public timestamp(input: unknown, options: TimestampOptions): ChainHandlerResult {
        const parsedDate = this._dateConverter!.parseTimestamp(input, options);
        return !parsedDate
            ? fail(input, 'date/timestamp', { options })
            : pass(parsedDate);
    }

    // =============================================
    // DATE STRING FORMATTER 
    // Last chain item to run since it returns a string
    // =============================================

    /**
     * Formats a parsed date into the requested output representation.
     * @param inputDate Parsed date to format.
     * @param formatString Target output format, or null to preserve raw input.
     * @param timeMode Time mode for the output date, either 'utc' or 'local'.
     */
    public toFormat(inputDate: UtcDate, formatString: string | null, timeMode: TimeMode = 'utc'): ChainHandlerResult {
        let finalForm: unknown;
        if (formatString === null) {
            // A raw date will only exist if the metadate was never modified
            finalForm = inputDate.raw || inputDate.date;
        }
        else if (formatString === 'timestamp') {
            finalForm = inputDate.date.getTime();
        }
        else if (formatString === 'object') {
            finalForm = new Date(inputDate.date);
        }
        else {
            finalForm = this._dateConverter!.format(inputDate, formatString, timeMode);
        }
        return pass(finalForm);
    }

    // =============================================
    // GLOBAL VALIDATORS 
    // =============================================

    /**
     * Validates that the input date occurs strictly after the provided comparison date.
     * @param inputDate Date value being validated.
     * @param referenceDate Lower-bound date that the input must be after.
     */
    public after(inputDate: UtcDate, referenceDate: GenericDateInput): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.date > parsedReferenceDate.date
            ? pass(inputDate)
            : fail(inputDate, 'date/after', { referenceDate });
    }

    /**
     * Validates that the input date occurs strictly before the provided comparison date.
     * @param inputDate Date value being validated.
     * @param referenceDate Upper-bound date that the input must be before.
     */
    public before(inputDate: UtcDate, referenceDate: unknown): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.date < parsedReferenceDate.date
            ? pass(inputDate)
            : fail(inputDate, 'date/before', { referenceDate });
    }

    /**
     * Validates that the input date falls within an inclusive min and max date range.
     * @param inputDate Date value being validated.
     * @param minDate Inclusive lower-bound date.
     * @param maxDate Inclusive upper-bound date.
     */
    public between(inputDate: UtcDate, minDate: GenericDateInput, maxDate: GenericDateInput): ChainHandlerResult {
        const parsedMinDate = this._dateConverter!.parseAuto(minDate);
        const parsedMaxDate = this._dateConverter!.parseAuto(maxDate);
        if (!parsedMinDate) {
            return fail(minDate, 'date/base');
        }
        if (!parsedMaxDate) {
            return fail(maxDate, 'date/base');
        }
        return inputDate.date >= parsedMinDate.date && inputDate.date <= parsedMaxDate.date
            ? pass(inputDate)
            : fail(inputDate, 'date/between', { minDate, maxDate });
    }

    /**
     * Validates that the input date resolves to a specific UTC day-of-week index.
     * @param inputDate Date value being validated.
     * @param dayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
     */
    public dayOfWeek(inputDate: UtcDate, dayOfWeek: number): ChainHandlerResult {
        const dayIndex = inputDate.date.getUTCDay();
        return dayIndex === dayOfWeek
            ? pass(inputDate)
            : fail(inputDate, 'date/dayOfWeek', { dayOfWeek });
    }

    /**
     * Validates that the input date has the same exact timestamp as the comparison date.
     * @param inputDate Date value being validated.
     * @param referenceDate Date value to compare against.
     */
    public override equals(inputDate: UtcDate, referenceDate: GenericDateInput): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.date.getTime() === parsedReferenceDate.date.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/equals', { referenceDate });
    }

    /**
     * Validates that the input date is in the future relative to the comparison date.
     * @param inputDate Date value being validated.
     * @param referenceDate Reference date used as the "now" boundary.
     */
    public future(inputDate: UtcDate, referenceDate: GenericDateInput = new Date()): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.date > parsedReferenceDate.date
            ? pass(inputDate)
            : fail(inputDate, 'date/future', { referenceDate });
    }

    /**
     * Validates that the input date falls within a leap year.
     * @param inputDate Date value being validated.
     */
    public leapYear(inputDate: UtcDate): ChainHandlerResult {
        const year = inputDate.date.getUTCFullYear();
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
            ? pass(inputDate)
            : fail(inputDate, 'date/leapYear');
    }

    /**
     * Validates that the input date is not later than the provided maximum date.
     * @param inputDate Date value being validated.
     * @param referenceDate Maximum allowed date.
     */
    public max(inputDate: UtcDate, referenceDate: GenericDateInput): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.date <= parsedReferenceDate.date
            ? pass(inputDate)
            : fail(inputDate, 'date/max', { referenceDate });
    }

    /**
     * Validates that the input date is not earlier than the provided minimum date.
     * @param inputDate Date value being validated.
     * @param referenceDate Minimum allowed date.
     */
    public min(inputDate: UtcDate, referenceDate: GenericDateInput): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.date >= parsedReferenceDate.date
            ? pass(inputDate)
            : fail(inputDate, 'date/min', { referenceDate });
    }

    /**
     * Validates that a birth date meets a minimum age at the comparison date.
     * @param birthDate Birth date used to calculate age.
     * @param minAge Minimum required age in years.
     * @param referenceDate Reference date used to calculate current age.
     */
    public minAge(birthDate: UtcDate, minAge: number, referenceDate: GenericDateInput = new Date()): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const date = birthDate.date;
        const refDate = parsedReferenceDate.date;
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
     * @param inputDate Date value being validated.
     * @param referenceDate Reference date used as the "now" boundary.
     */
    public past(inputDate: UtcDate, referenceDate: GenericDateInput = new Date()): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        return inputDate.date < parsedReferenceDate.date
            ? pass(inputDate)
            : fail(inputDate, 'date/past', { referenceDate });
    }

    /**
     * Validates that the input date occurred within the last N days from the comparison date.
     * @param inputDate Date value being validated.
     * @param days Maximum number of elapsed days allowed.
     * @param referenceDate Reference date used to compute elapsed days.
     */
    public recent(inputDate: UtcDate, days: number = 30, referenceDate: GenericDateInput = new Date()): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const daysDiff = (parsedReferenceDate.date.getTime() - inputDate.date.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff >= 0 && daysDiff <= days
            ? pass(inputDate)
            : fail(inputDate, 'date/recent', { daysDiff, days });
    }

    /**
     * Validates that two dates fall on the same UTC calendar day.
     * @param inputDate Date value being validated.
     * @param referenceDate Date value to compare against.
     */
    public sameDay(inputDate: UtcDate, referenceDate: GenericDateInput): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.date);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.date);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/sameDay', { referenceDate });
    }

    /**
     * Validates that two dates fall within the same UTC calendar month.
     * @param inputDate Date value being validated.
     * @param referenceDate Date value to compare against.
     */
    public sameMonth(inputDate: UtcDate, referenceDate: GenericDateInput): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.date);
        inputNormalized.setUTCDate(1);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.date);
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
     */
    public sameWeek(inputDate: UtcDate, referenceDate: GenericDateInput, firstDayOfWeek: DayOfWeek = 1): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.date);
        const inputOffset = (inputNormalized.getUTCDay() - firstDayOfWeek + 7) % 7;
        inputNormalized.setUTCDate(inputNormalized.getUTCDate() - inputOffset);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.date);
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
     */
    public sameYear(inputDate: UtcDate, referenceDate: GenericDateInput): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.date);
        inputNormalized.setUTCMonth(0, 1);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.date);
        referenceNormalized.setUTCMonth(0, 1);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/sameYear', { referenceDate });
    }

    /**
     * Validates that the input date matches the same UTC calendar day as today.
     * @param inputDate Date value being validated.
     * @param referenceDate Reference date representing "today".
     */
    public today(inputDate: UtcDate, referenceDate: GenericDateInput = new Date()): ChainHandlerResult {
        const parsedReferenceDate = this._dateConverter!.parseAuto(referenceDate);
        if (!parsedReferenceDate) {
            return fail(referenceDate, 'date/base');
        }
        const inputNormalized = new Date(inputDate.date);
        inputNormalized.setUTCHours(0, 0, 0, 0);
        const referenceNormalized = new Date(parsedReferenceDate.date);
        referenceNormalized.setUTCHours(0, 0, 0, 0);
        return inputNormalized.getTime() === referenceNormalized.getTime()
            ? pass(inputDate)
            : fail(inputDate, 'date/today', { referenceDate });
    }

    /**
     * Validates that the input date falls on a weekday (Monday through Friday, UTC).
     * @param inputDate Date value being validated.
     */
    public weekday(inputDate: UtcDate): ChainHandlerResult {
        const dayOfWeek = inputDate.date.getUTCDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5
            ? pass(inputDate)
            : fail(inputDate, 'date/weekday', { dayOfWeek });
    }

    /**
     * Validates that the input date falls on a weekend day (Saturday or Sunday, UTC).
     * @param inputDate Date value being validated.
     */
    public weekend(inputDate: UtcDate): ChainHandlerResult {
        const dayOfWeek = inputDate.date.getUTCDay();
        return dayOfWeek === 0 || dayOfWeek === 6
            ? pass(inputDate)
            : fail(inputDate, 'date/weekend', { dayOfWeek });
    }


    // =============================================
    // MUTATORS 
    // =============================================

    /**
     * Returns a new date shifted forward or backward by a whole number of days.
     * @param inputDate Base date to adjust.
     * @param numDays Whole number of days to add (or subtract if negative).
     */
    public addDays(inputDate: UtcDate, numDays: number): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        utcDate.setUTCDate(utcDate.getUTCDate() + numDays);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of hours.
     * @param inputDate Base date to adjust.
     * @param numHours Whole number of hours to add (or subtract if negative).
     */
    public addHours(inputDate: UtcDate, numHours: number): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        utcDate.setUTCHours(utcDate.getUTCHours() + numHours);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of minutes.
     * @param inputDate Base date to adjust.
     * @param numMinutes Whole number of minutes to add (or subtract if negative).
     */
    public addMinutes(inputDate: UtcDate, numMinutes: number): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        utcDate.setUTCMinutes(utcDate.getUTCMinutes() + numMinutes);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of months.
     * @param inputDate Base date to adjust.
     * @param numMonths Whole number of months to add (or subtract if negative).
     */
    public addMonths(inputDate: UtcDate, numMonths: number): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        utcDate.setUTCMonth(utcDate.getUTCMonth() + numMonths);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Returns a new date shifted forward or backward by a whole number of years.
     * @param inputDate Base date to adjust.
     * @param numYears Whole number of years to add (or subtract if negative).
     */
    public addYears(inputDate: UtcDate, numYears: number): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        utcDate.setUTCFullYear(utcDate.getUTCFullYear() + numYears);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Clamps a date into an inclusive min/max range.
     * @param inputDate Date value to clamp.
     * @param minDate Inclusive lower-bound date.
     * @param maxDate Inclusive upper-bound date.
     */
    public clamp(inputDate: UtcDate, minDate: GenericDateInput, maxDate: GenericDateInput): ChainHandlerResult {
        const minDateParsed = this._dateConverter!.parseAuto(minDate);
        const maxDateParsed = this._dateConverter!.parseAuto(maxDate);
        if (!minDateParsed) {
            return fail(minDate, 'date/base');
        }
        if (!maxDateParsed) {
            return fail(maxDate, 'date/base');
        }
        if (inputDate.date < minDateParsed.date) {
            return pass(minDateParsed);
        }
        else if (inputDate.date > maxDateParsed.date) {
            return pass(maxDateParsed);
        }
        return pass(inputDate);
    }

    /**
     * Normalizes a date to the final millisecond of its UTC day.
     * @param inputDate Base date to normalize.
     */
    public toEndOfDay(inputDate: UtcDate): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        utcDate.setUTCHours(23, 59, 59, 999);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Normalizes a date to the final millisecond of its UTC month.
     * @param inputDate Base date to normalize.
     */
    public toEndOfMonth(inputDate: UtcDate): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        utcDate.setUTCMonth(utcDate.getUTCMonth() + 1, 0);
        utcDate.setUTCHours(23, 59, 59, 999);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Normalizes a date to the final millisecond of its UTC year.
     * @param inputDate Base date to normalize.
     */
    public toEndOfYear(inputDate: UtcDate): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        utcDate.setUTCFullYear(utcDate.getUTCFullYear() + 1, 0, 0);
        utcDate.setUTCHours(23, 59, 59, 999);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Moves a date forward to the next occurrence of the target UTC day of week.
     * @param inputDate Base date to adjust.
     * @param targetDayOfWeek Target UTC day index where Sunday is 0 and Saturday is 6.
     */
    public toNextDayOfWeek(inputDate: UtcDate, targetDayOfWeek: DayOfWeek): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        let daysToAdd = targetDayOfWeek - utcDate.getUTCDay();
        if (daysToAdd <= 0) {
            daysToAdd += 7;
        }
        utcDate.setUTCDate(utcDate.getUTCDate() + daysToAdd);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Moves a date forward to the next weekday, skipping Saturday and Sunday.
     * @param inputDate Base date to adjust.
     */
    public toNextWeekday(inputDate: UtcDate): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        do {
            utcDate.setUTCDate(utcDate.getUTCDate() + 1);
        }
        while (utcDate.getUTCDay() === 0 || utcDate.getUTCDay() === 6);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Moves a date backward to the previous weekday, skipping Saturday and Sunday.
     * @param inputDate Base date to adjust.
     */
    public toPreviousWeekday(inputDate: UtcDate): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        do {
            utcDate.setUTCDate(utcDate.getUTCDate() - 1);
        }
        while (utcDate.getUTCDay() === 0 || utcDate.getUTCDay() === 6);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Normalizes a date to the first millisecond of its UTC day.
     * @param inputDate Base date to normalize.
     */
    public toStartOfDay(inputDate: UtcDate): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        utcDate.setUTCHours(0, 0, 0, 0);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Normalizes a date to the first millisecond of the first day of its UTC month.
     * @param inputDate Base date to normalize.
     */
    public toStartOfMonth(inputDate: UtcDate): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        utcDate.setUTCDate(1);
        utcDate.setUTCHours(0, 0, 0, 0);
        return pass(inputDate.setDate(utcDate));
    }

    /**
     * Normalizes a date to the first millisecond of January 1st in its UTC year.
     * @param inputDate Base date to normalize.
     */
    public toStartOfYear(inputDate: UtcDate): ChainHandlerResult {
        const utcDate = new Date(inputDate.date);
        utcDate.setUTCMonth(0, 1);
        utcDate.setUTCHours(0, 0, 0, 0);
        return pass(inputDate.setDate(utcDate));
    }

}


export { DateHandler };

