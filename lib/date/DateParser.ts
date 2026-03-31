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

const HUMAN_TIME_REGEX =
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

const MULTI_SPACE_REGEX = /\s+/g;
const TRIM_SEPARATOR_SPACES_REGEX = / ?([/.:-]) ?/g;
const LEADING_DIGIT_REGEX = /^[0-9]/;
const ISO_DATE_TIME_OFFSET_REGEX =
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
const ISO_ORDINAL_REGEX = '^(\\d{4})(?:(-)?(00[1-9]|0[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6]))$';
const ISO_WEEK_REGEX = '^(\\d{4})(-)?W(0[1-9]|[1-4]\\d|5[0-3])(?:\\2([1-7]))?$';

class DateParser {

    private locale: Locale;

    constructor(locale: Locale) {
        this.locale = locale;
    }

    parse(value: unknown, dateOrder: DateOrder = DateOrder.MDY, parseTypes: DateType[] = []): BetterDate | null {
        const anyType = parseTypes.length === 0;
        const shouldParse = (dateType: DateType): boolean => anyType ||  new Set(parseTypes).has(dateType);

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
            const result = this.parseDateFromIso(value);
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
            const result = this.parseDateFromIsoWeek(value);
            if (result) {
                const { date, parts } = result;
                return new BetterDate(date, DateType.ISO_WEEK, parts);
            }
        }

        if (shouldParse(DateType.ISO_ORDINAL)) {
            const result = this.parseDateFromIsoOrdinal(value);
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
                DateHelpers.getSignMultiplier(hourOffsetNum)
            ),
            DateType.HUMAN,
            {
                year: yearNum,
                month: monthNum,
                day: dayNum,
                hour: hourNum,
                minute: minuteNum,
                second: secondNum,
                millisecond: millisecondNum,
                hourOffset: hourOffsetNum,
                minuteOffset: minuteOffsetNum
            },
        );
    }

    parseDateFromIso(dateString: unknown): BetterDate | null {
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
        let [, , year, dash, month, day, hour, , minute, second, millisecond, hourOffset, , minuteOffset, Z] = matchResult;

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
                DateHelpers.getSignMultiplier(hourOffsetNum)
            ),
            DateType.ISO,
            {
                year: yearNum,
                month: monthNum,
                day: dayNum,
                hour: hourNum,
                minute: minuteNum,
                second: secondNum,
                millisecond: millisecondNum,
                hourOffset: hourOffsetNum,
                minuteOffset: minuteOffsetNum,
                isBasic: !dash
            }
        );
    }

    parseDateFromIsoOrdinal(dateString: unknown): BetterDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const trimmedDateString = dateString.trim();
        if (trimmedDateString.length === 0) {
            return null;
        }
        const matchResult = RegexCache(ISO_ORDINAL_REGEX).exec(trimmedDateString);
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
                isBasic: !dash
            }
        );
    }

    parseDateFromIsoWeek(dateString: unknown): BetterDate | null {
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