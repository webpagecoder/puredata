'use strict';

import { RegexCache } from "../cache/RegexCache.ts";
import { Locale } from "../Locale.ts";
import { BetterDate, DateType } from "./BetterDate.ts";
import { DateHelpers } from "./DateHelpers.ts";

enum DateOrder {
    MDY,
    DMY,
    YMD
};

type DatePart = string | number | undefined;

// Misc
const MULTI_SPACE_REGEX = /\s+/g;
const TRIM_SEPARATOR_SPACES_REGEX = / ?([/.:-]) ?/g;
const LEADING_DIGIT_REGEX = /^[0-9]/;

// Date building blocks
const YEAR = '\\d{4}';
const MONTH = '(0[1-9]|1[0-2])';
const DAY = '(0[1-9]|[12][0-9]|3[01])';
const HOUR = '(0[0-9]|1[0-9]|2[0-3])';
const MINUTE = '(0[0-9]|[1-5][0-9])';
const SECOND = '(0[0-9]|[1-5][0-9])';
const ISO_MILLISECOND = '(?:\\.(\\d{1,3}))';

const ISO_EXPANDED_REQUIRED_MONTH_DAY = `${YEAR}-${MONTH}-${DAY}`;
const ISO_EXPANDED_OPTIONAL_MONTH_DAY = `${YEAR}(?:-${MONTH}(?:-${DAY})?)?`;
const ISO_EXPANDED_TIME = `${HOUR}:${MINUTE}(?::${SECOND}(?:${ISO_MILLISECOND})?)?`;
const ISO_EXPANDED_TZ = `(?:(Z)|(?:([+-])${HOUR}:${MINUTE}))?`;

const ISO_BASIC_REQUIRED_MONTH_DAY = `${YEAR}${MONTH}${DAY}`;
const ISO_BASIC_OPTIONAL_MONTH_DAY = `${YEAR}(?:${MONTH}(?:${DAY})?)?`;
const ISO_BASIC_TIME = `${HOUR}${MINUTE}(?:${SECOND}(?:${ISO_MILLISECOND})?)?`;
const ISO_BASIC_TZ = `(?:(Z)|(?:([+-])${HOUR}${MINUTE}))?`;

// Final formats
const ISO_DATE_TIME_EXPANDED =
    `^${ISO_EXPANDED_REQUIRED_MONTH_DAY}(?:T${ISO_EXPANDED_TIME}(?:${ISO_EXPANDED_TZ})?)?$` +
    `|` +
    `^${ISO_EXPANDED_OPTIONAL_MONTH_DAY}$`;
const ISO_DATE_TIME_BASIC =
    `^${ISO_BASIC_REQUIRED_MONTH_DAY}(?:T${ISO_BASIC_TIME}(?:${ISO_BASIC_TZ})?)?$` +
    `|` +
    `^${ISO_BASIC_OPTIONAL_MONTH_DAY}$`;




const HUMAN_TIME_REGEX =
    '^' +
    // Capture group 1: Hours 00-23 (24-hour) or 0?[1-9], 10-19, 20-23
    '(00|0?[1-9]|1[0-9]|2[0-3])' +
    // Capture group 2: Optional colon between hours and minutes
    '(:?)' +
    // Capture group 3: Optional minutes 00-59
    '([0-5][0-9])?' +
    // Capture group 4: Optional seconds 00-59 (must use same separator as group 2)
    '(?:\\2([0-5][0-9]))?' +
    // Capture group 5: Optional fractional seconds (1-3 digits)
    '(?:\\.(\\d{1,3}))?' +
    '\\s?' +  // Optional whitespace
    // Capture group 6: Optional AM/PM
    '(AM|PM)?' +
    '\\s?' +  // Optional whitespace
    // Optional timezone
    '(?:' +
    // Match literal UTC/Z/GMT (no capture)
    '(?:Z|UTC|GMT)' +
    '|' +
    // Capture group 7: timezone hours ±00-23
    '(?:([+-](?:0[0-9]|1[0-9]|2[0-3]))' +
    // Capture group 8: optional timezone minutes 00-59
    ':?(?:(0[0-9]|[1-5][0-9]))?' +
    ')' +
    ')?' +
    '$';

const ISO_TIME_REGEX =
    '(?:T' +
    // Reject invalid milliseconds
    '(?!\\d{2}:.*?[^.]\\d{3,})' +
    // Reject sequences of 3+ digits without colon  
    '(?!\\d{3,}(?![^:]*$))' +
    // Capture group 1: hours 00-23
    '(?:(0[0-9]|1[0-9]|2[0-3])' +
    // Capture group 2: optional colon before minutes, Capture group 3: minutes 00-59
    '(?:(:)?(0[0-9]|[1-5][0-9])' +
    // Capture group 4: seconds 00-59 (colon must match minutes)
    '(?:(?:\\2(0[0-9]|[1-5][0-9])' +
    // Capture group 5: optional fractional seconds (1-3 digits)
    '(?:\\.(\\d{1,3}))?' +
    ')?)?)?' +
    // Capture group 6: optional timezone hours ±00-23
    '(?:([+-](?:0[0-9]|1[0-9]|2[0-3]))' +
    // Capture group 7: optional colon in timezone, capture group 8: optional timezone minutes 00-59
    '(?:(:)?(0[0-9]|[1-5][0-9]))?' +
    ')?' +
    ')?' +
    // Capture group 9: optional UTC 'Z'
    '(Z)?' +
    ')'

const ISO_DATE_TIME_OFFSET_REGEX =
    '^' +
    // Negative lookahead: reject exactly 6 digits (to avoid YYYYMMDD without separators)
    '(?!\\d{6}$)' +
    // Negative lookahead: reject dates with '-' before 'T' that have invalid milliseconds (3+ digits)
    '(?![^-]*-[^T]*T.*?[^.]\\d{3,})' +
    // Negative lookahead: reject 5+ digits immediately before 'T' if there’s no colon afterward
    '(?!\\d{5,}T(?![^:]*$))' +
    // Main capture for the date
    // Start outer non-capturing, inner positive lookahead
    '(?:(?:(?=(' +
    // Capture group 1: year (YYYY)
    '(\\d{4})' +
    // Optional month
    // Capture group 2: optional dash separator before month
    // Capture group 3: month (01-12)
    '(?:(-)?(1[012]|0[0-9]))?' +
    // Optional day (01-31), using same separator as month
    // Capture group 4: day (01-31)
    '(?:\\3(3[01]|[12]\\d|0[0-9]))?' +
    '))\\1))' +
    ISO_TIME_REGEX +
    '$'

const ISO_ORDINAL_TIME_REGEX =
    '^' +
    // 4-digit year (YYYY)
    '(\\d{4})' +
    // Optional ordinal day:
    // (-)? Optional dash separator (capture group 2)
    // (00[1-9]|0[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6]) Day-of-year 001-366 (capture group 3)
    '(?:(-)?(00[1-9]|0[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6]))' +
    ISO_TIME_REGEX +
    '$';

const ISO_WEEK_REGEX =
    '^' +
    // Capture group 1: 4-digit ISO year (YYYY)
    '(\\d{4})' +
    // Capture group 2: optional dash separator before 'W'
    '(-)?' +
    'W' +
    // Capture group 3: ISO week number 01-53
    '(0[1-9]|[1-4]\\d|5[0-3])' +
    // Optional weekday
    // Capture group 4: weekday 1-7, using same separator as group 2 if present
    '(?:\\2([1-7]))?' +
    '$';

class DateParser {

    private locale: Locale;

    constructor(locale: Locale) {
        this.locale = locale;
    }

    parse(value: unknown, dateOrder: DateOrder = DateOrder.MDY, parseTypes: DateType[] = []): BetterDate | null {
        const anyType = parseTypes.length === 0;
        const shouldParse = (dateType: DateType): boolean => anyType || new Set(parseTypes).has(dateType);

        if (shouldParse(DateType.OBJECT)) {
            if (value instanceof Date && !isNaN(value.getTime())) {
                return new BetterDate(value, DateType.OBJECT);
            }
        }
        if (shouldParse(DateType.TIMESTAMP)) {
            const result = this.parseDateFromTimestamp(value);
            if (result) {
                const { date, parts } = result;
                return new BetterDate(date, DateType.TIMESTAMP, parts);
            }
        }
        if (shouldParse(DateType.ISO)) {
            const result = this.parseFromIso(value);
            if (result) {
                const { date, parts } = result;
                return new BetterDate(date, DateType.ISO, parts);
            }
        }
        if (shouldParse(DateType.HUMAN)) {
            const result = this.parseDateFromHuman(value, dateOrder);
            if (result) {
                return result;
            }
        }

        if (shouldParse(DateType.ISO_WEEK)) {
            const result = this.parseFromIsoWeek(value);
            if (result) {
                const { date, parts } = result;
                return new BetterDate(date, DateType.ISO_WEEK, parts);
            }
        }

        if (shouldParse(DateType.ISO_ORDINAL)) {
            const result = this.parseFromIsoOrdinal(value);
            if (result) {
                const { date, parts } = result;
                return new BetterDate(date, DateType.ISO_ORDINAL, parts);
            }
        }

        return null;
    }

    parseDateFromHuman(dateString: unknown, dateOrder: DateOrder = DateOrder.MDY): BetterDate | null {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }
        const locale = this.locale;
        const numberSuffixes = locale.translate('calendar/numberSuffixes') as string[] || [];
        const fullMonths = locale.translate('calendar/months/full') as string[] || [];
        const shortMonths = locale.translate('calendar/months/short') as string[] || [];
        const allMonths = fullMonths.concat(shortMonths).map((name: string): string => name.toLowerCase());

        const yearRegex = '(\\d{4})';
        const monthRegex = '(1[012]|0?[1-9])';
        const dayNumRegex = '(3[01]|[12]\\d|0?[1-9])(?:' + numberSuffixes.join('|') + ')?';
        const namedDayRegex = '(?:[a-z]{1,20})';
        const allMonthsRegex = '(' + allMonths.join('|') + ')';

        const normalizedDateString = dateString
            .trim()
            .replace(/,/g, ' ')
            .replace(MULTI_SPACE_REGEX, ' ')
            .replace(TRIM_SEPARATOR_SPACES_REGEX, '$1');

        let dateOrderRegex: [string[], number[]];
        switch (dateOrder) {
            case DateOrder.MDY:
                dateOrderRegex = [[monthRegex, dayNumRegex, yearRegex], [4, 2, 3]];
                break;
            case DateOrder.DMY:
                dateOrderRegex = [[dayNumRegex, monthRegex, yearRegex], [4, 3, 2]];
                break;
            case DateOrder.YMD:
                dateOrderRegex = [[yearRegex, monthRegex, dayNumRegex], [2, 3, 4]];
                break;
        }

        const dateRegexes: [string[], number[]][] = [
            [[allMonthsRegex, dayNumRegex, yearRegex], [4, 2, 3]],
            [[dayNumRegex, allMonthsRegex, yearRegex], [4, 3, 2]],
            [[yearRegex, allMonthsRegex, dayNumRegex], [2, 3, 4]],
            [[namedDayRegex, allMonthsRegex, dayNumRegex, yearRegex], [4, 2, 3]],
            [[namedDayRegex, dayNumRegex, allMonthsRegex, yearRegex], [4, 3, 2]],
            [[yearRegex, monthRegex, dayNumRegex], [2, 3, 4]],
            dateOrderRegex
        ];

        let matchResult: RegExpExecArray | null = null;
        let indexes: number[] = [];
        for (const [curPattern, curIndexes] of dateRegexes) {
            matchResult = RegexCache(`^(?=(${curPattern.join('[/. -]')}))\\1(.*)$`, 'i').exec(normalizedDateString);
            if (matchResult) {
                indexes = curIndexes;
                break;
            }
        }
        if (!indexes.length) {
            return null;
        }
        const matchedResult = matchResult as RegExpExecArray;

        const timePortionIndex = Math.max(indexes[0], indexes[1], indexes[2]) + 1;
        const timePortion = matchedResult[timePortionIndex];
        let hour: DatePart;
        let minute: DatePart;
        let second: DatePart;
        let millisecond: DatePart;
        let meridiem: DatePart;
        let hourOffset: DatePart;
        let minuteOffset: DatePart;

        if (timePortion) {
            const timeMatch = RegexCache(HUMAN_TIME_REGEX, 'i').exec(timePortion);
            if (!timeMatch) {
                return null;
            }
            [, hour, , minute, second, millisecond, meridiem, hourOffset, minuteOffset] = timeMatch;

            if (meridiem) {
                hour = +hour;
                if (hour > 12 || hour < 1) {
                    return null;
                }
                const meridiemLower = meridiem.toLowerCase();
                if (meridiemLower === 'pm' && hour < 12) {
                    hour += 12;
                }
                else if (meridiemLower === 'am' && hour === 12) {
                    hour = 0;
                }
            }
        }

        let year: DatePart = matchedResult[indexes[0]];
        let month: DatePart = matchedResult[indexes[1]];
        let day: DatePart = matchedResult[indexes[2]];

        if (month) {
            if (!LEADING_DIGIT_REGEX.test(String(month))) {
                const monthNum = allMonths.indexOf(String(month).toLowerCase());
                if (monthNum === -1) {
                    return null;
                }
                month = monthNum % 12 + 1;
            }
        }

        const yearNum = +(year || 0);
        const monthNum = +(month || 0);
        const dayNum = +(day || 0);

        if (!DateHelpers.isValidDate(yearNum, monthNum, dayNum)) {
            return null;
        }

        const hourNum = +(hour || 0);
        const minuteNum = +(minute || 0);
        const secondNum = +(second || 0);
        const millisecondNum = +(millisecond || 0);
        const hourOffsetNum = +(hourOffset || 0);
        const minuteOffsetNum = +(minuteOffset || 0);

        const timestamp = Date.UTC(
            yearNum,
            monthNum - 1,
            dayNum,
            hourNum,
            minuteNum,
            secondNum,
            millisecondNum
        );

        return new BetterDate(
            new Date(
                timestamp +
                (Math.abs(hourOffsetNum) * 3600000 + minuteOffsetNum * 60000) *
                Math.sign(hourOffsetNum)
            ),
            DateType.HUMAN,
            {
                hourOffset: hourOffsetNum,
                minuteOffset: minuteOffsetNum
            },
        );
    }

    parseFromIso(dateString: unknown): BetterDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const trimmedDateString = dateString.trim();
        if (trimmedDateString.length === 0) {
            return null;
        }

        const matchResult = RegexCache(ISO_DATE_TIME_OFFSET_REGEX, 'i').exec(trimmedDateString);
        if (!matchResult) {
            return null;
        }
        let [, , year, dash, month, day, hour, , minute, second, millisecond, hourOffset, , minuteOffset, zulu] = matchResult;

        const yearNum = +year;
        const monthNum = +(month || 0);
        const dayNum = +(day || 0);
        const hourNum = +(hour || 0);
        const minuteNum = +(minute || 0);
        const secondNum = +(second || 0);
        const millisecondNum = +(millisecond || 0);
        const hourOffsetNum = +(hourOffset || 0);
        const minuteOffsetNum = +(minuteOffset || 0);

        if (!DateHelpers.isValidDate(yearNum, monthNum, dayNum)) {
            return null;
        }

        const timestamp = Date.UTC(
            yearNum,
            monthNum - 1,
            dayNum,
            hourNum,
            minuteNum,
            secondNum,
            millisecondNum
        );

        return new BetterDate(
            new Date(
                timestamp +
                (Math.abs(hourOffsetNum) * 3600000 + minuteOffsetNum * 60000) *
                Math.sign(hourOffsetNum)
            ),
            DateType.ISO,
            {
                hourOffset: hourOffsetNum,
                minuteOffset: minuteOffsetNum,
                isoIsExtended: !!dash,
                isoHasZulu: !!zulu
            }
        );
    }

    parseFromIsoOrdinal(dateString: unknown): BetterDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const trimmedDateString = dateString.trim();
        if (trimmedDateString.length === 0) {
            return null;
        }
        const matchResult = RegexCache(ISO_ORDINAL_TIME_REGEX).exec(trimmedDateString);
        if (!matchResult) {
            return null;
        }
        const [, year, dash, day] = matchResult;
        const yearNum = +year;
        const dayNum = +day;
        if (dayNum === 366 && !DateHelpers.isLeapYear(yearNum)) {
            return null;
        }

        const date = new Date(Date.UTC(yearNum, 0, 1));
        date.setUTCDate(date.getUTCDate() + dayNum - 1);
        return new BetterDate(
            date,
            DateType.ISO,
            {
                year: yearNum,
                day: dayNum,
                isoIsExtended: !!dash
            }
        );
    }

    parseFromIsoWeek(dateString: unknown): BetterDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const trimmedDateString = dateString.trim();
        if (trimmedDateString.length === 0) {
            return null;
        }

        const matchResult = RegexCache(ISO_WEEK_REGEX).exec(trimmedDateString);
        if (!matchResult) {
            return null;
        }
        const [, year, dash, week, day] = matchResult;
        const yearNum = +year;
        const weekNum = +week;
        const dayNum = day ? +day : 1;

        if (weekNum === 53) {
            const jan1Day = (new Date(Date.UTC(yearNum, 0, 1))).getUTCDay();
            if (jan1Day !== 4 && (jan1Day !== 3 || !DateHelpers.isLeapYear(yearNum))) {
                return null;
            }
        }

        const simple = new Date(Date.UTC(yearNum, 0, 4));
        const date = new Date(Date.UTC(yearNum, 0, 4 - (simple.getUTCDay() || 7) + 1));
        date.setUTCDate(date.getUTCDate() + (weekNum - 1) * 7 + (dayNum - 1));
        return new BetterDate(
            date,
            DateType.ISO,
            {
                year: yearNum,
                week: weekNum,
                day: dayNum,
                isBasic: !dash
            }
        );
    }

    parseDateFromTimestamp(value: unknown): BetterDate | null {
        if (!Number.isInteger(value)) {
            return null;
        }
        const date = new Date(Number(value));
        if (!isNaN(date.getTime())) {
            return new BetterDate(
                date,
                DateType.ISO,
                {
                    parts: {}
                }
            );
        }
        return null;
    }
}

export { DateParser };