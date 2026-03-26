'use strict';

import { HandlerResult } from './HandlerResult.ts';
import { Utils } from '../utils/Utils.ts';
import { Handler } from './Handler.ts';
import { DEFAULT_LANGUAGE } from '../config/DefaultLanguage.ts';
import { DATE_TYPE } from '../types/date/DateTypes.ts';
import { RegexCache } from '../cache/RegexCache.ts';
const { pass, fail } = HandlerResult;

export type DateLike = Date | string | number;
export type DateParts = {
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
    parts: DateParts;
    format: DATE_TYPE;
    value: DateLike;

    constructor({ date, parts, format, value }: { date: Date; parts: DateParts; format: DATE_TYPE; value: DateLike }) {
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

export function areDayAndDateValid(dateParts: Record<string, unknown> = {}): boolean {
    let { YYYY, MM, DD } = dateParts as { YYYY?: unknown; MM?: unknown; DD?: unknown };
    YYYY = +(YYYY as any) || 0;
    MM = +(MM as any) || 0;
    DD = +(DD as any) || 0;
    const numDaysInMonth = [4, 6, 9, 11].indexOf(MM as number) > -1 && 30
        || (MM as number) === 2 && (isLeapYear(YYYY as number) ? 29 : 28)
        || [1, 3, 5, 7, 8, 10, 12].indexOf(MM as number) > -1 && 31
        || -1;
    if ((YYYY as number) && (MM as number) && (DD as number) && +(DD as number) > numDaysInMonth) {
        return false;
    }
    return true;
}

export function isLeapYear(year: unknown): boolean {
    return new Date(Date.UTC(+(year as any), 1, 29)).getUTCDate() === 29;
}

export function parseDate(value: unknown, parseTypes: DATE_TYPE[] = []): ParsedDate | null {
    if (value instanceof Date && !isNaN(value.getTime())) {
        return { date: value, parts: {}, format: DATE_TYPE.OBJECT };
    }

    const anyType = parseTypes.length === 0;
    if (anyType || parseTypes.indexOf(DATE_TYPE.TIMESTAMP) > -1) {
        const result = parseDateFromTimestamp(value);
        if (result) {
            const { date, parts } = result;
            return { date, parts, format: DATE_TYPE.TIMESTAMP };
        }
    }

    if (anyType || parseTypes.indexOf(DATE_TYPE.ISO) > -1) {
        const result = parseDateFromIso(value);
        if (result) {
            const { date, parts } = result;
            return { date, parts, format: DATE_TYPE.ISO };
        }
    }

    if (anyType || parseTypes.indexOf(DATE_TYPE.HUMAN) > -1) {
        const result = parseDateFromHuman(value);
        if (result) {
            const { date, parts } = result;
            return { date, parts, format: DATE_TYPE.HUMAN };
        }
    }

    if (anyType || parseTypes.indexOf(DATE_TYPE.ISO_WEEK) > -1) {
        const result = parseDateFromIsoWeek(value);
        if (result) {
            const { date, parts } = result;
            return { date, parts, format: DATE_TYPE.ISO_WEEK };
        }
    }

    if (anyType || parseTypes.indexOf(DATE_TYPE.ISO_ORDINAL) > -1) {
        const result = parseDateFromIsoOrdinal(value);
        if (result) {
            const { date, parts } = result;
            return { date, parts, format: DATE_TYPE.ISO_ORDINAL };
        }
    }

    return null;
}

export function parseDateFromHuman(dateString: string, {
    monthBeforeDay = true,
    numberSuffixes = DEFAULT_LANGUAGE.calendar.numberSuffixes,
    fullMonths = DEFAULT_LANGUAGE.calendar.months.full,
    shortMonths = DEFAULT_LANGUAGE.calendar.months.short
}: { monthBeforeDay?: boolean; numberSuffixes?: string[]; fullMonths?: string[]; shortMonths?: string[] } = {}): { date: Date; parts: Record<string, unknown> } | null {
    if (typeof dateString !== 'string' || dateString.trim().length === 0) {
        return null;
    }

    const allMonths = fullMonths.concat(shortMonths).map((name: string): string => name.toLowerCase());

    const yearRegex = '(\\d{4})';
    const monthRegex = '(1[012]|0?[1-9])';
    const dayNumRegex = '(3[01]|[12]\\d|0?[1-9])(?:' + numberSuffixes.join('|') + ')?';
    const namedDayRegex = '(?:[a-z]{1,20})';
    const allMonthsRegex = '(' + allMonths.map((name: string): string => name.toLowerCase()).join('|') + ')';

    dateString = (dateString as string)
        .trim()
        .replace(/,/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/ ?([/.:-]) ?/g, '$1');

    const dateRegexes: [string[], number[]][] = [
        [[allMonthsRegex, dayNumRegex, yearRegex], [4, 2, 3]],
        [[dayNumRegex, allMonthsRegex, yearRegex], [4, 3, 2]],
        [[yearRegex, allMonthsRegex, dayNumRegex], [2, 3, 4]],
        [[namedDayRegex, allMonthsRegex, dayNumRegex, yearRegex], [4, 2, 3]],
        [[namedDayRegex, dayNumRegex, allMonthsRegex, yearRegex], [4, 3, 2]],
        [[yearRegex, monthRegex, dayNumRegex], [2, 3, 4]],
        ...(monthBeforeDay
            ? [[[monthRegex, dayNumRegex, yearRegex], [4, 2, 3]] as [string[], number[]]]
            : [[[dayNumRegex, monthRegex, yearRegex], [4, 3, 2]] as [string[], number[]]])
    ];

    let matchResult: RegExpExecArray | null, indexes: number[] | undefined;
    for (const [curPattern, curIndexes] of dateRegexes) {
        matchResult = RegexCache(`^(?=(${(curPattern as string[]).join('[/. -]')}))\\1(.*)$`, 'i').exec(dateString);
        if (matchResult) {
            indexes = curIndexes;
            break;
        }
    }
    if (!indexes) {
        return null;
    }

    const timePortion = matchResult![Math.max(...indexes) + 1];
    let HH, mm, ss, sss, amPM, HHOffset, mmOffset;

    if (timePortion) {
        const timeRegex =
            '^(00|0?[1-9]|1[0-9]|2[0-3])' +
            '(:?)([0-5][0-9])?' +
            '(?:\\2([0-5][0-9]))?' +
            '(?:\\.(\\d{1,3}))?' +
            '\\s?' +
            '(AM|PM)?' +
            '\\s?' +
            '(?:' +
            '(?:Z|UTC|GMT)' +
            '|' +
            '(?:([+-](?:0[0-9]|1[0-9]|2[0-3]))' +
            ':?(?:(0[0-9]|[1-5][0-9]))?' +
            ')' +
            ')?' +
            '$';
        const timeMatch = RegexCache(timeRegex, 'i').exec(timePortion);
        if (!timeMatch) {
            return null;
        }
        [, HH, , mm, ss, sss, amPM, HHOffset, mmOffset] = timeMatch;

        if (amPM) {
            HH = +HH;
            if (HH > 12 || HH < 1) {
                return null;
            }
            const amPMLower = amPM.toLowerCase();
            if (amPMLower === 'pm' && HH < 12) {
                HH += 12;
            }
            else if (amPMLower === 'am' && HH === 12) {
                HH = 0;
            }
        }
    }

    let [YYYY, MM, DD] = indexes.map((index: number): unknown => matchResult![index]) as (string | number | undefined)[];

    if (MM) {
        if (!/^[0-9]/.test(MM as string)) {
            const monthNum = allMonths.indexOf((MM as string).toLowerCase());
            if (monthNum === -1) {
                return null;
            }
            MM = monthNum % 12 + 1;
        }
        MM = +(MM as string);
    }

    if (!areDayAndDateValid({ YYYY: YYYY as string, MM: MM as number, DD: DD as string })) {
        return null;
    }

    YYYY = +(YYYY as string);
    MM = +(MM as number);
    DD = +(DD as string);
    if (HH !== undefined) {
        HH = +HH;
    }
    if (mm !== undefined) {
        mm = +mm;
    }
    if (ss !== undefined) {
        ss = +ss;
    }
    if (sss !== undefined) {
        sss = +sss;
    }
    if (HHOffset !== undefined) {
        HHOffset = +HHOffset;
    }
    if (mmOffset !== undefined) {
        mmOffset = +mmOffset;
    }

    const timestamp = Date.UTC(
        YYYY,
        MM - 1,
        DD,
        HH || 0,
        mm || 0,
        ss || 0,
        sss || 0
    );

    return new ParsedDate({
        date: new Date(
            timestamp +
            (Math.abs(HHOffset || 0) * 3600000 + (mmOffset || 0) * 60000) *
            Utils.getSign(HHOffset || 0)
        ),
        parts: {
            YYYY,
            MM,
            DD,
            HH,
            mm,
            ss,
            sss,
            HHOffset,
            mmOffset
        },
        format: DATE_TYPE.HUMAN,
        value: dateString
    });
}

export function parseDateFromIso(dateString: unknown): { date: Date; parts: Record<string, unknown> } | null {
    if (typeof dateString !== 'string' || dateString.trim().length === 0) {
        return null;
    }

    const isoDateTimeOffsetRegex =
        '^' +
        '(?!\\d{6}$)' +
        '(?![^-]*-[^T]*T.*?[^.]\\d{3,})' +
        '(?!\\d{5,}T(?![^:]*$))' +
        '(?:(?:(?=((\\d{4})(?:(-)?(1[012]|0[1-9]))?(?:\\3(3[01]|[12]\\d|0[1-9]))?))\\1))' +
        '(?:T' +
        '(?!\\d{2}:.*?[^.]\\d{3,})' +
        '(?!\\d{3,}(?![^:]*$))' +
        '(?:(0[0-9]|1[0-9]|2[0-3])(?:(?:(:)?(0[0-9]|[1-5][0-9]))(?:(?:\\7(0[0-9]|[1-5][0-9])(?:\\.(\\d{1,3}))?)?)?)?)' +
        '(?:' +
        '(?![+-][^Z]*Z)' +
        '(?:([+-](?:0[0-9]|1[0-9]|2[0-3]))(?:(?:(:)?(0[0-9]|[1-5][0-9])))?)' +
        ')?' +
        ')?' +
        '(Z)?' +
        '$';

    const matchResult = RegexCache(isoDateTimeOffsetRegex, 'i').exec(dateString);
    if (!matchResult) {
        return null;
    }
    let [, , YYYY, dash, MM, DD, HH, , mm, ss, sss, HHOffset, , mmOffset, Z] = matchResult;

    if (!areDayAndDateValid({ YYYY, MM, DD })) {
        return null;
    }

    YYYY = +YYYY;
    MM !== undefined && (MM = +MM);
    DD !== undefined && (DD = +DD);
    HH !== undefined && (HH = +HH);
    mm !== undefined && (mm = +mm);
    ss !== undefined && (ss = +ss);
    sss !== undefined && (sss = +sss);
    HHOffset !== undefined && (HHOffset = +HHOffset);
    mmOffset !== undefined && (mmOffset = +mmOffset);

    YYYY = +YYYY;
    if (MM !== undefined) {
        MM = +MM;
    }
    if (DD !== undefined) {
        DD = +DD;
    }
    if (HH !== undefined) {
        HH = +HH;
    }
    if (mm !== undefined) {
        mm = +mm;
    }
    if (ss !== undefined) {
        ss = +ss;
    }
    if (sss !== undefined) {
        sss = +sss;
    }
    HHOffset = HHOffset === undefined ? 0 : +HHOffset;
    mmOffset = mmOffset === undefined ? 0 : +mmOffset;

    const timestamp = Date.UTC(
        YYYY,
        MM - 1,
        DD,
        HH || 0,
        mm || 0,
        ss || 0,
        sss || 0
    );

    return {
        date: new Date(
            timestamp +
            (Math.abs(HHOffset) * 3600000 + mmOffset * 60000) *
            Utils.getSign(HHOffset)
        ),
        parts: {
            YYYY,
            MM,
            DD,
            HH,
            mm,
            ss,
            sss,
            HHOffset,
            mmOffset,
            Z,
            isExtended: !!dash
        }
    };
}

export function parseDateFromIsoOrdinal(dateString: string): { date: Date; parts: Record<string, unknown> } | null {
    if (typeof dateString !== 'string' || dateString.trim().length === 0) {
        return null;
    }
    const matchResult = RegexCache(
        '^(\\d{4})(?:(-)?(00[1-9]|0[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6]))$'
    ).exec(dateString);
    if (!matchResult) {
        return null;
    }
    const [, YYYY, dash, DDD] = matchResult;
    if (+DDD === 366 && !isLeapYear(YYYY)) {
        return null;
    }

    const date = new Date(Date.UTC(YYYY, 0, 1));
    date.setUTCDate(date.getUTCDate() + DDD - 1);
    return new ParsedDate({
        date,
        parts: {
            YYYY: +YYYY,
            DDD: +DDD,
            dash,
            isExtended: !!dash
        },
        format: DATE_TYPE.ISO_ORDINAL,
        value: dateString
    });
}

export function parseDateFromIsoWeek(dateString: unknown): { date: Date; parts: Record<string, unknown> } | null {
    if (typeof dateString !== 'string' || dateString.trim().length === 0) {
        return null;
    }

    const matchResult = RegexCache(
        '^(\\d{4})(-)?W(0[1-9]|[1-4]\\d|5[0-3])(?:\\2([1-7]))?$'
    ).exec(dateString.trim());
    if (!matchResult) {
        return null;
    }
    let [, YYYY, dash, ww, DD] = matchResult;
    YYYY = +YYYY;
    ww = +ww;
    DD = DD ? +DD : 1;

    if (ww === 53) {
        const jan1Day = (new Date(Date.UTC(YYYY, 0, 1))).getUTCDay();
        if (jan1Day !== 4 && (jan1Day !== 3 || !isLeapYear(YYYY))) {
            return null;
        }
    }

    const simple = new Date(Date.UTC(YYYY, 0, 4));
    const date = new Date(Date.UTC(YYYY, 0, 4 - (simple.getUTCDay() || 7) + 1));
    date.setUTCDate(date.getUTCDate() + (ww - 1) * 7 + (DD - 1));
    return new ParsedDate({
        date,
        parts: {
            YYYY: +YYYY,
            ww: +ww,
            DD: +(DD || 1),
            dash,
            isExtended: !!dash
        },
        format: DATE_TYPE.ISO_WEEK,
        value: dateString
    });
}

export function parseDateFromTimestamp(value: unknown): { date: Date; parts: Record<string, unknown> } | null {
    if (Number.isInteger(value) && !isNaN(new Date(value as number).getTime())) {
        return new ParsedDate({
            date: new Date(Number(value)),
            parts: {},
            format: DATE_TYPE.TIMESTAMP,
            value
        });
    }
    return null;
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
        required = ['YYYY', 'MM', 'DD'],
        forbidden = ['HHOffset'],
        monthBeforeDay = true,
        numberSuffixes,
        fullMonths,
        shortMonths,
    }: any = {}): HandlerResult {

        const parsedDate = parseDateFromHuman(dateString, {
            monthBeforeDay,
            numberSuffixes,
            fullMonths,
            shortMonths,
        });
        if (!parsedDate) {
            return fail(dateString, 'date/human');
        }

        const { date, parts } = parsedDate;
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
        const parsedDate = parseDateFromIso(dateString);
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
        const parsedDate = parseDateFromIsoOrdinal(dateString);
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
        const parsedDate = parseDateFromIsoWeek(dateString);
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
