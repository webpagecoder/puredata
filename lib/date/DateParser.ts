'use strict';
//todo: date and string add auto trim
import { RegexCache } from "../cache/RegexCache.ts";
import { Locale } from "../Locale.ts";
import { BetterDate, DateMeta, DateType } from "./BetterDate.ts";
import { DateHelpers } from "./DateHelpers.ts";

enum DateOrder {
    MDY = 'MDY',
    DMY = 'DMY',
    YMD = 'YMD'
};

type DatePart = string | number | undefined;
type YMDIndexes = {
    year: number;
    month: number;
    day: number;
};

// Misc
const MULTI_SPACE_REGEX = /\s+/g;
const TRIM_SEPARATOR_SPACES_REGEX = / ?([/.:-]) ?/g;
const LEADING_DIGIT_REGEX = /^[0-9]/;

// Date building blocks
const YEAR = '(\\d{4})';
const MONTH = '(0?[1-9]|1[0-2])';
const MONTH_LZ = '(0[1-9]|1[0-2])';
const DAY_OF_MONTH = '(0?[1-9]|[12][0-9]|3[01])';
const DAY_OF_MONTH_LZ = '(0[1-9]|[12][0-9]|3[01])';
const DAY_OF_WEEK = '([1-7])';
const DAY_OF_YEAR_LZ = '(00[1-9]|0[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6])';
const WEEK_OF_YEAR_LZ = '(0[1-9]|[1-4]\\d|5[0-3])';

// Time building blocks
const HOUR_12 = '(0?[1-9]|1[0-2])';
const HOUR_24_LZ = '(0[0-9]|1[0-9]|2[0-3])';
const MINUTE_LZ = '(0[0-9]|[1-5][0-9])';
const SECOND_LZ = '(0[0-9]|[1-5][0-9])';
const THOUSANDTHS_OF_SECOND = '\\.(\\d{1,3})';
const MERIDIEM = '([AaPp][Mm])';

//todo: support UTC and GMT
//todo: rfc2822

// ISO building blocks
const ISO_TIME = `${HOUR_24_LZ}(:?)${MINUTE_LZ}(?:(:?)${SECOND_LZ}(?:${THOUSANDTHS_OF_SECOND})?)?(?:(Z)|(?:([+-])${HOUR_24_LZ}(:?)${MINUTE_LZ}))?`;
const ISO = `^${YEAR}(?:(-?)${MONTH_LZ}(?:$|(-?)${DAY_OF_MONTH_LZ}(?:T${ISO_TIME})?))?$`;
const ISO_ORDINAL = `^${YEAR}(-?)${DAY_OF_YEAR_LZ}(?:T${ISO_TIME})?$`;
const ISO_WEEK = `^${YEAR}(-?)W${WEEK_OF_YEAR_LZ}(?:(-?)${DAY_OF_WEEK}(?:T${ISO_TIME})?)?$`;

// Human readable building blocks
const DELIM = '[/. -,:]+';
const HUMAN_TZ = '(?:GMT|UTC|Z|([+-])([0-9]{2}):?([0-9]{2}))';
const HUMAN_TIME_12 = `${HOUR_12}(?::${MINUTE_LZ}(?::${SECOND_LZ})?)?\\s*${MERIDIEM}(?:\\s*${HUMAN_TZ})?`;
const HUMAN_TIME_24 = `${HOUR_24_LZ}(?::${MINUTE_LZ}(?::${SECOND_LZ})?)?(?:\\s*${HUMAN_TZ})?`;
const HUMAN_TIME = `(?:${HUMAN_TIME_12}|${HUMAN_TIME_24})${HUMAN_TZ}?`;

// Human readable final date formats
const HUMAN_MDY = [
    `(?:#DAY_NAMES#${DELIM})?(#MONTH_NAMES#)${DELIM}${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?${DELIM}${YEAR}(?:${DELIM}(.*))?$`,
    `(?:#DAY_NAMES#${DELIM})?${MONTH}${DELIM}${DAY_OF_MONTH}${DELIM}${YEAR}(?:${DELIM}(.*))?$`
];
const HUMAN_DMY = [
    `(?:#DAY_NAMES#${DELIM})?${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?${DELIM}(#MONTH_NAMES#)${DELIM}${YEAR}(?:${DELIM}(.*))?$`,
    `(?:#DAY_NAMES#${DELIM})?${DAY_OF_MONTH}${DELIM}${MONTH}${DELIM}${YEAR}(?:${DELIM}(.*))?$`
];
const HUMAN_YMD = [
    `(?:#DAY_NAMES#${DELIM})?${YEAR}${DELIM}(#MONTH_NAMES#)${DELIM}${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?(?:${DELIM}(.*))?$`,
    `(?:#DAY_NAMES#${DELIM})?${YEAR}${DELIM}${MONTH}${DELIM}${DAY_OF_MONTH}(?:${DELIM}(.*))?$`
];
//(?:${SEPARATOR}${HUMAN_TIME_12})?



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

    parse(value: unknown, parseTypes: DateType[] = []): BetterDate | null {
        const anyType = parseTypes.length === 0;
        const shouldParse = (dateType: DateType): boolean => anyType || new Set(parseTypes).has(dateType);

        if (shouldParse(DateType.OBJECT)) {
            if (value instanceof Date && !isNaN(value.getTime())) {
                return new BetterDate(value, DateType.OBJECT);
            }
        }
        if (shouldParse(DateType.TIMESTAMP)) {
            const result = this.parseTimestamp(value);
            if (result) {
                const { date, parts } = result;
                return new BetterDate(date, DateType.TIMESTAMP, parts);
            }
        }
        if (shouldParse(DateType.ISO)) {
            const result = this.parseIso(value);
            if (result) {
                const { date, parts } = result;
                return new BetterDate(date, DateType.ISO, parts);
            }
        }
        if (shouldParse(DateType.HUMAN)) {
            const result = this.parseHuman(value, dateOrder);
            if (result) {
                return result;
            }
        }

        if (shouldParse(DateType.ISO_WEEK)) {
            const result = this.parseIsoWeek(value);
            if (result) {
                const { date, parts } = result;
                return new BetterDate(date, DateType.ISO_WEEK, parts);
            }
        }

        if (shouldParse(DateType.ISO_ORDINAL)) {
            const result = this.parseIsoOrdinal(value);
            if (result) {
                const { date, parts } = result;
                return new BetterDate(date, DateType.ISO_ORDINAL, parts);
            }
        }

        return null;
    }

    parseHuman(dateString: unknown): BetterDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const normalizedDateString = dateString.trim().toLowerCase();
        if (normalizedDateString.length === 0) {
            return null;
        }

        if (!this._cache) {
            const { _locale: locale } = this;

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
        const year = +matchResult[dateIndexes.year];
        const month = isNumMatch
            ? +matchResult[dateIndexes.month]
            : monthNames.indexOf(matchResult[dateIndexes.month].toLowerCase()) % 12 + 1;
        const day = +matchResult[dateIndexes.day];
        const yearNum = +year;
        const monthNum = +month;
        const dayNum = +day;
        if (!DateHelpers.isValidDate(yearNum, monthNum, dayNum)) {
            return null;
        }

        // Check time portion if it exists
        const timeString = matchResult[4];
        if (timeString) {
            matchResult = RegexCache(HUMAN_TIME).exec(timeString);
            if (matchResult) {
                let [hour = null, minute = null, second = null, meridiem = null,
                    offsetSign = null, offsetHour = null, offsetMinute = null] = matchResult;

            }
            if (!matchResult) {
                matchResult = RegexCache(HUMAN_TIME_24).exec(timeString);
                if (matchResult) {
                    let [hour = null, minute = null, second = null] = matchResult;



                    meridiem = null,
                        offsetSign = null, offsetHour = null, offsetMinute = null

                    hour = matchResult[1];
                    minute = matchResult[2];
                    second = matchResult[3];
                    meridiem = matchResult[4];
                }

            }

            hour = matchResult[1];
            minute = matchResult[2];
            second = matchResult[3];



            if (!matchResult) {

            }
            if (matchResult) {
                let [
                    , , , , // skip date
                    hour = null, minute = null, second = null, meridiem = null
                ] = matchResult;
            }
        }


        const adjustedHour = meridiem
            ? (meridiem.toLowerCase() === 'pm' && hour !== '12' ? +hour! + 12 : +hour!)
            : +hour!;
        const date = new Date(Date.UTC(
            yearNum,
            monthNum,
            dayNum,
            adjustedHour,
            +minute!,
            +second!
        ));

        return new BetterDate({
            date,
            originalInput: dateString,
            type: DateType.HUMAN,
            meta: {
                type: isNumMatch ? 'numbers' : 'words',
            } as DateMeta
        });
    }

    parseIso(dateString: unknown): BetterDate | null {
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
            , year, dateSep1 = '', month = null, dateSep2 = '', day = null,                                // date
            hour = null, timeSep1 = '', minute = null, timeSep2 = '', second = null, millisecond = null,   // time
            zulu = null, offsetSign = null, offsetHour = null, timeSep3 = '', offsetMinute = null,               // offset
        ] = matchResult;

        // check separators consistency
        const sepLength = dateSep1.length;
        if (
            day &&
            (sepLength !== dateSep2.length) ||
            (hour && (sepLength !== timeSep1.length || (second && sepLength !== timeSep2.length))) ||
            (offsetHour && sepLength !== timeSep3.length)
        ) {
            return null;
        }

        const yearNum = +year;
        const monthNum = +month!;
        const dayNum = +day!;

        if (dayNum > 0 && !DateHelpers.isValidDate(yearNum, monthNum, dayNum)) {
            return null;
        }

        const date = new Date(Date.UTC(
            yearNum,
            !monthNum ? 0 : monthNum - 1,
            !dayNum ? 1 : dayNum,
            +hour!,
            +minute!,
            +second!,
            +millisecond!
        ));

        return new BetterDate({
            date,
            originalInput: dateString,
            type: DateType.ISO,
            meta: {
                isoIsExpanded: sepLength > 0,
                year, month, day,   // date
                hour, minute, second, millisecond,             // time
                zulu, offsetSign, offsetHour, offsetMinute,          // offset
            } as DateMeta
        });
    }

    parseIsoOrdinal(dateString: unknown): BetterDate | null {
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
            , year, dateSep1 = '', day = null,                                                       // date
            hour = null, timeSep1 = '', minute = null, timeSep2 = '', second = null, millisecond = null,   // time
            zulu = null, offsetSign = null, offsetHour = null, timeSep3 = '', offsetMinute = null,               // offset
        ] = matchResult;

        // check separators consistency
        const sepLength = dateSep1.length;
        if (
            (hour && (sepLength !== timeSep1.length || (second && sepLength !== timeSep2.length))) ||
            (offsetHour && sepLength !== timeSep3.length)
        ) {
            return null;
        }

        const yearNum = +year;
        const dayNum = +day!;

        if (dayNum === 366 && !DateHelpers.isLeapYear(yearNum)) {
            return null;
        }

        const date = new Date(Date.UTC(
            yearNum,
            0,
            dayNum,
            +hour!,
            +minute!,
            +second!,
            +millisecond!
        ));

        return new BetterDate({
            date,
            originalInput: dateString,
            type: DateType.ISO_ORDINAL,
            meta: {
                isoIsExpanded: sepLength > 0,
                year, day,                                // date
                hour, minute, second, millisecond,             // time
                zulu, offsetSign, offsetHour, offsetMinute,          // offset
            } as DateMeta
        });
    }

    parseIsoWeek(dateString: unknown): BetterDate | null {
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
            , year, dateSep1 = '', week, dateSep2 = '', day = null,                                   // date
            hour = null, timeSep1 = '', minute = null, timeSep2 = '', second = null, millisecond = null,   // time
            zulu = null, offsetSign = null, offsetHour = null, timeSep3 = '', offsetMinute = null,               // offset
        ] = matchResult;

        // check separators consistency
        const sepLength = dateSep1.length;
        if (
            (day && (sepLength !== dateSep2.length)) ||
            (hour && (sepLength !== timeSep1.length || (second && sepLength !== timeSep2.length))) ||
            (offsetHour && sepLength !== timeSep3.length)
        ) {
            return null;
        }

        const yearNum = +year;
        const weekNum = +week!;
        const dayNum = +day!;

        if (weekNum === 53 && !DateHelpers.has53IsoWeeks(yearNum)) {
            return null;
        }

        const date = DateHelpers.isoWeekToDate(yearNum, weekNum, dayNum);
        date.setUTCHours(
            +hour!,
            +minute!,
            +second!,
            +millisecond!
        );

        return new BetterDate({
            date,
            originalInput: dateString,
            type: DateType.ISO_WEEK,
            meta: {
                isoIsExpanded: sepLength > 0,
                year, week, day,                         // date
                hour, minute, second, millisecond,             // time
                zulu, offsetSign, offsetHour, offsetMinute          // offset
            } as DateMeta
        });
    }

    parseTimestamp(value: unknown): BetterDate | null {
        const valueType = typeof value;
        if (valueType !== 'number' && (valueType !== 'string' || !/^\d+$/.test(value as string))) {
            return null;
        }
        const valueNum = +value!;
        if (!Number.isInteger(valueNum)) {
            return null;
        }
        const date = new Date(valueNum);
        if (isNaN(date.getTime())) {
            return null;
        }
        return new BetterDate({
            date,
            originalInput: value,
            type: DateType.TIMESTAMP,
        });
    }
}

export { DateParser };
