'use strict';
//todo: date and string add auto trim
import { RegexCache } from "../cache/RegexCache.ts";
import { Locale } from "../Locale.ts";
import { NormalizedDate } from "./NormalizedDate.ts";
import { DateHelpers } from "./DateHelpers.ts";
import { DateType } from "./DateType.ts";

enum DateOrder {
    MDY = 'MDY',
    DMY = 'DMY',
    YMD = 'YMD'
};

// Date building blocks
const YEAR = '\\d{4}';
const MONTH = '0?[1-9]|1[0-2]';
const MONTH_LZ = '0[1-9]|1[0-2]';
const DAY_OF_MONTH = '0?[1-9]|[12][0-9]|3[01]';
const DAY_OF_MONTH_LZ = '0[1-9]|[12][0-9]|3[01]';
const DAY_OF_WEEK = '[1-7]';
const DAY_OF_YEAR_LZ = '00[1-9]|0[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6]';
const WEEK_OF_YEAR_LZ = '0[1-9]|[1-4]\\d|5[0-3]';

// Time building blocks
const HOUR_12 = '0?[1-9]|1[0-2]';
const HOUR_24 = '0?[0-9]|1[0-9]|2[0-3]';
const HOUR_24_LZ = '0[0-9]|1[0-9]|2[0-3]';
const MINUTE_LZ = '0[0-9]|[1-5][0-9]';
const SECOND_LZ = '0[0-9]|[1-5][0-9]';
const THOUSANDTHS_OF_SECOND = '\\d{1,3}';
const MERIDIEM = '[ap]m';

//todo: support UTC and GMT
//todo: rfc2822

// ISO regex
const ISO_TZ = `(?:(Z)|(?:([+-]${HOUR_24_LZ})(:?)(${MINUTE_LZ})))`;
const ISO_TIME = `(${HOUR_24_LZ})(:?)(?:(${MINUTE_LZ})(?:(:?)(${SECOND_LZ})(?:\\.(${THOUSANDTHS_OF_SECOND}))?)?)?(?:${ISO_TZ})?`;
const ISO = `^(${YEAR})(-?)(${MONTH_LZ})(?:$|(-?)(${DAY_OF_MONTH_LZ})(?:T${ISO_TIME})?)?$`;
const ISO_ORDINAL = `^(${YEAR})(-?)(${DAY_OF_YEAR_LZ})(?:T${ISO_TIME})?$`;
const ISO_WEEK = `^(${YEAR})(-?)W(${WEEK_OF_YEAR_LZ})(?:(-?)(${DAY_OF_WEEK})(?:T${ISO_TIME})?)?$`;

// Human readable regex for dates
const DELIM = '[/. -,:]+';
const HUMAN_MDY = [
    `(?:#DAY_NAMES#${DELIM})?(#MONTH_NAMES#)${DELIM}(${DAY_OF_MONTH})(?:\\s*#NUMBER_SUFFIXES#)?${DELIM}(${YEAR})(?:${DELIM}(.*))?$`,
    `(?:#DAY_NAMES#${DELIM})?(${MONTH})${DELIM}(${DAY_OF_MONTH})${DELIM}(${YEAR})(?:${DELIM}(.*))?$`
];
const HUMAN_DMY = [
    `(?:#DAY_NAMES#${DELIM})?(${DAY_OF_MONTH})(?:\\s*#NUMBER_SUFFIXES#)?${DELIM}(#MONTH_NAMES#)${DELIM}(${YEAR})(?:${DELIM}(.*))?$`,
    `(?:#DAY_NAMES#${DELIM})?(${DAY_OF_MONTH})${DELIM}(${MONTH})${DELIM}(${YEAR})(?:${DELIM}(.*))?$`
];
const HUMAN_YMD = [
    `(?:#DAY_NAMES#${DELIM})?(${YEAR})${DELIM}(#MONTH_NAMES#)${DELIM}(${DAY_OF_MONTH})(?:\\s*#NUMBER_SUFFIXES#)?(?:${DELIM}(.*))?$`,
    `(?:#DAY_NAMES#${DELIM})?(${YEAR})${DELIM}(${MONTH})${DELIM}(${DAY_OF_MONTH})(?:${DELIM}(.*))?$`
];

// Human readable regex for time
const HUMAN_TZ = `(?:utc|gmt|z|([+-]${HOUR_24_LZ})(?::?(${MINUTE_LZ})))?`;
const HUMAN_TIME = `^(${HOUR_24})(?::?(${MINUTE_LZ})(?::?(${SECOND_LZ}))?)?(?:\\s*(${MERIDIEM}))?(?:\\s*${HUMAN_TZ})?$`;

type HumanDateCache = null | {
    dateIndexes: Record<string, number>;
    humanRegex: string[];
    monthNames: string[];
}


class DateParser {

    private _locale: Locale;
    private _cache: HumanDateCache;

    constructor(locale: Locale) {
        this._locale = locale;
        // this._allMonthsRegexStr = null;
        // this._allDayNamesRegexStr = null;
        this._cache = null;
    }

    parse(value: unknown, parseTypes: DateType[] = []): NormalizedDate | null {
        const anyType = parseTypes.length === 0;
        const shouldParse = (dateType: DateType): boolean => anyType || new Set(parseTypes).has(dateType);

        if (anyType || parseTypes.indexOf(DateType.OBJECT) !== -1) {
            if (value instanceof Date && !isNaN(value.getTime())) {
                return new NormalizedDate({
                    date: value,
                    type: DateType.OBJECT
                });
            }
        }
        if (anyType || parseTypes.indexOf(DateType.TIMESTAMP) !== -1) {
            const normalizedDate = this.parseTimestamp(value);
            if (normalizedDate) {
                return normalizedDate;
            }
        }
        if (anyType || parseTypes.indexOf(DateType.ISO) !== -1) {
            const normalizedDate = this.parseIso(value);
            if (normalizedDate) {
                return normalizedDate;
            }
        }
        if (anyType || parseTypes.indexOf(DateType.HUMAN) !== -1) {
            const normalizedDate = this.parseHuman(value);
            if (normalizedDate) {
                return normalizedDate;
            }
        }
        if (anyType || parseTypes.indexOf(DateType.ISO_WEEK) !== -1) {
            const normalizedDate = this.parseIsoWeek(value);
            if (normalizedDate) {
                return normalizedDate;
            }
        }
        if (anyType || parseTypes.indexOf(DateType.ISO_ORDINAL) !== -1) {
            const normalizedDate = this.parseIsoOrdinal(value);
            if (normalizedDate) {
                return normalizedDate;
            }
        }
        return null;
    }

    parseHuman(dateString: unknown): NormalizedDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const normalizedDateString = dateString.trim().toLowerCase();
        if (normalizedDateString.length === 0) {
            return null;
        }

        const locale = this._locale;

        if (!this._cache) {
            const monthNames = (locale.translate('calendar/months/full') || [])
                .concat(locale.translate('calendar/months/short') || []);
            const numberSuffixes = locale.translate('calendar/numberSuffixes') || [];
            const dayNames = (locale.translate('calendar/dayNames/full') || [])
                .concat(locale.translate('calendar/dayNames/short') || []);
            const dateOrder = locale.translate('calendar/dateOrder') as DateOrder;

            const dayNamesRegex = '(?:' + dayNames.map(s => s.toLowerCase()).join('|') + ')';
            const monthNamesRegex = '(?:' + monthNames.map(s => s.toLowerCase()).join('|') + ')';
            const numberSuffixesRegex = '(?:' + numberSuffixes.map(s => s.toLowerCase()).join('|') + ')';

            let humanRegex: string[], dateIndexes: Record<string, number>;
            switch (dateOrder) {
                case DateOrder.MDY:
                    dateIndexes = { day: 2, month: 1, year: 3 };
                    humanRegex = HUMAN_MDY;
                    break;
                case DateOrder.DMY:
                    dateIndexes = { day: 1, month: 2, year: 3 };
                    humanRegex = HUMAN_DMY;
                    break;
                default:
                    dateIndexes = { day: 3, month: 2, year: 1 };
                    humanRegex = HUMAN_YMD;
                    break;
            }

            this._cache = {
                dateIndexes,
                humanRegex: [
                    humanRegex[0]
                        .replace('#DAY_NAMES#', dayNamesRegex)
                        .replace('#MONTH_NAMES#', monthNamesRegex)
                        .replace('#NUMBER_SUFFIXES#', numberSuffixesRegex),
                    humanRegex[1]
                        .replace('#DAY_NAMES#', dayNamesRegex)
                ],
                monthNames
            };

        }

        const { dateIndexes, humanRegex, monthNames } = this._cache;

        let matchResult = RegexCache(humanRegex[0]).exec(normalizedDateString);
        let isNumMatch = false;
        if (!matchResult) {
            matchResult = RegexCache(humanRegex[1]).exec(normalizedDateString);
            if (!matchResult) {
                return null;
            }
            isNumMatch = true;
        }

        // Check date portion
        const year = Number(matchResult[dateIndexes.year]);
        const month = isNumMatch
            ? Number(matchResult[dateIndexes.month])
            : monthNames.indexOf(matchResult[dateIndexes.month].toLowerCase()) % 12 + 1;
        const day = Number(matchResult[dateIndexes.day]);
        const yearNum = Number(year);
        const monthNum = Number(month);
        const dayNum = Number(day);
        if (!DateHelpers.isValidDate(yearNum, monthNum, dayNum)) {
            return null;
        }

        let hour = null, minute = null, second = null, meridiem = null,
            offsetHour = null, offsetMinute = null;

        // Check time portion (if it exists)
        const timeString = matchResult[4];
        if (timeString) {
            matchResult = RegexCache(HUMAN_TIME).exec(timeString);
            if (!matchResult) {
                return null;
            }

            ([
                , hour, minute = null, second = null, meridiem = null, 
                offsetHour = null, offsetMinute = null
            ] = matchResult);

            if (!meridiem) {
                if (hour.length === 1) {
                    // if the hourly time is 1 digit with no meridiem, time is too ambiguous
                    return null;
                }
            }
            else {
                meridiem = meridiem!.toLowerCase();
            }

            hour = meridiem
                ? (
                    meridiem === 'pm' && hour !== '12'
                        ? Number(hour) + 12
                        : Number(hour)
                )
                : Number(hour);
        }

        return new NormalizedDate({
            date: new Date(Date.UTC(
                yearNum,
                monthNum - 1,
                dayNum,
                Number(hour),
                Number(minute),
                Number(second)
            )),
            offsetHour: Number(offsetHour),
            offsetMinute: Number(offsetMinute),
            type: DateType.HUMAN
        });
    }

    parseIso(dateString: unknown): NormalizedDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const trimmedDateString = dateString.trim();
        if (trimmedDateString.length === 0) {
            return null;
        }

        const matchResult = RegexCache(ISO).exec(trimmedDateString);
        if (!matchResult) {
            return null;
        }

        const [
            , year, monthDelim = '', month = null, dayDelim = '', day = null,                                // date
            hour = null, minuteDelim = '', minute = null, secondDelim = '', second = null, millisecond = null,   // time
            zulu = null, offsetHour = null, offsetMinuteDelim = '', offsetMinute = null,               // offset
        ] = matchResult;

        // check separators consistency
        const delimSize = monthDelim.length;
        if (
            day && delimSize !== dayDelim.length ||
            minute && delimSize !== minuteDelim.length ||
            second && delimSize !== secondDelim.length ||
            offsetMinute && delimSize !== offsetMinuteDelim.length
        ) {
            return null;
        }

        const yearNum = Number(year);
        const monthNum = Number(month);
        const dayNum = Number(day);

        if (dayNum > 0 && !DateHelpers.isValidDate(yearNum, monthNum, dayNum)) {
            return null;
        }

        return new NormalizedDate({
            date: new Date(Date.UTC(
                yearNum,
                !monthNum ? 0 : monthNum - 1,
                !dayNum ? 1 : dayNum,
                Number(hour),
                Number(minute),
                Number(second),
                Number(millisecond)
            )),
            meta: {
                isBasic: delimSize === 0,
            },
            offsetHour: Number(offsetHour),
            offsetMinute: Number(offsetMinute),
            type: DateType.ISO
        });
    }

    parseIsoOrdinal(dateString: unknown): NormalizedDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const trimmedDateString = dateString.trim();
        if (trimmedDateString.length === 0) {
            return null;
        }

        const matchResult = RegexCache(ISO_ORDINAL).exec(trimmedDateString);
        if (!matchResult) {
            return null;
        }

        const [
            , year, dayDelim = '', day = null,                                                       // date
            hour = null, minuteDelim = '', minute = null, secondDelim = '', second = null, millisecond = null,   // time
            zulu = null, offsetHour = null, offsetMinuteDelim = '', offsetMinute = null,               // offset
        ] = matchResult;

        // check separators consistency
        const delimSize = dayDelim.length;
        if (
            minute && delimSize !== minuteDelim.length ||
            second && delimSize !== secondDelim.length ||
            offsetMinute && delimSize !== offsetMinuteDelim.length
        ) {
            return null;
        }

        const yearNum = Number(year);
        const dayNum = Number(day);

        if (dayNum === 366 && !DateHelpers.isLeapYear(yearNum)) {
            return null;
        }

        return new NormalizedDate({
            date: new Date(Date.UTC(
                yearNum,
                0,
                dayNum,
                Number(hour),
                Number(minute),
                Number(second),
                Number(millisecond)
            )),
            meta: {
                isBasic: delimSize === 0,
            },
            offsetHour: Number(offsetHour),
            offsetMinute: Number(offsetMinute),
            type: DateType.ISO_ORDINAL
        });
    }

    parseIsoWeek(dateString: unknown): NormalizedDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const trimmedDateString = dateString.trim();
        if (trimmedDateString.length === 0) {
            return null;
        }

        const matchResult = RegexCache(ISO_WEEK).exec(trimmedDateString);
        if (!matchResult) {
            return null;
        }

        const [
            , year, weekDelim = '', week, dayDelim = '', day = null,                                   // date
            hour = null, minuteDelim = '', minute = null, secondDelim = '', second = null, millisecond = null,   // time
            zulu = null, offsetHour = null, offsetMinuteDelim = '', offsetMinute = null,               // offset
        ] = matchResult;

        // check separators consistency
        const delimSize = weekDelim.length;
        if (
            day && delimSize !== dayDelim.length ||
            minute && delimSize !== minuteDelim.length ||
            second && delimSize !== secondDelim.length ||
            offsetMinute && delimSize !== offsetMinuteDelim.length
        ) {
            return null;
        }

        const yearNum = Number(year);
        const weekNum = Number(week);
        const dayNum = Number(day);

        if (weekNum === 53 && !DateHelpers.has53IsoWeeks(yearNum)) {
            return null;
        }

        const date = DateHelpers.isoWeekToDate(yearNum, weekNum, dayNum);
        date.setUTCHours(
            Number(hour),
            Number(minute),
            Number(second),
            Number(millisecond)
        );

        return new NormalizedDate({
            date,
            meta: {
                isBasic: delimSize === 0,
            },
            offsetHour: Number(offsetHour),
            offsetMinute: Number(offsetMinute),
            type: DateType.ISO_WEEK
        });
    }

    parseTimestamp(value: unknown): NormalizedDate | null {
        const valueType = typeof value;
        if (valueType !== 'number' && (valueType !== 'string' || !/^\d+$/.test(value as string))) {
            return null;
        }
        const valueNum = Number(value);
        if (!Number.isInteger(valueNum)) {
            return null;
        }
        const date = new Date(valueNum);
        if (isNaN(date.getTime())) {
            return null;
        }

        return new NormalizedDate({
            date,
            type: DateType.TIMESTAMP
        });
    }
}

export { DateParser };
