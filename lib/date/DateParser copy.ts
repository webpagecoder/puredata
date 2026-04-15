'use strict';
//todo: date and string add auto trim
import { RegexCache } from "../cache/RegexCache.ts";
import { Locale } from "../Locale.ts";
import { MetaDate, DateMeta, DateType } from "./MetaDate.ts";
import { DateHelpers } from "./DateHelpers.ts";

enum DateOrder {
    MDY,
    DMY,
    YMD
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
const SEPARATOR = '[/. -,:]+';
const HUMAN_TIME_12 = `${HOUR_12}(?::\\s*${MINUTE_LZ}(?::\\s*${SECOND_LZ})?)?\\s*${MERIDIEM}`;
const HUMAN_TIME_24 = `${HOUR_24_LZ}(?::\\s*${MINUTE_LZ}(?::\\s*${SECOND_LZ})?)?`;

// Human readable final formats
const HUMAN_MDY_WORDS = `(#MONTH_NAMES#)${SEPARATOR}${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?${SEPARATOR}${YEAR}(?:${SEPARATOR}${HUMAN_TIME_12})?`;
const HUMAN_DMY_WORDS = `${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?${SEPARATOR}(#MONTH_NAMES#)${SEPARATOR}${YEAR}(?:${SEPARATOR}${HUMAN_TIME_12})?`;
const HUMAN_YMD_WORDS = `${YEAR}${SEPARATOR}(#MONTH_NAMES#)${SEPARATOR}${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?(?:${SEPARATOR}${HUMAN_TIME_12})?`;

const HUMAN_MDY_NUMS = `${MONTH}${SEPARATOR}${DAY_OF_MONTH}${SEPARATOR}${YEAR}(?:${SEPARATOR}${HUMAN_TIME_12})?`;
const HUMAN_DMY_NUMS = `${DAY_OF_MONTH}${SEPARATOR}${MONTH}${SEPARATOR}${YEAR}(?:${SEPARATOR}${HUMAN_TIME_12})?`;
const HUMAN_YMD_NUMS = `${YEAR}${SEPARATOR}${MONTH}${SEPARATOR}${DAY_OF_MONTH}(?:${SEPARATOR}${HUMAN_TIME_12})?`;

const HUMAN_MDY_INDEXES = { month: 1, day: 2, year: 3 };
const HUMAN_DMY_INDEXES = { day: 1, month: 2, year: 3 };
const HUMAN_YMD_INDEXES = { year: 1, month: 2, day: 3 };

class DateParser {

    private _locale: Locale;
    private _allMonths: string[] = [];
    private _humanIndexes: YMDIndexes | null;
    private _humanWords: string | null;
    private _humanNums: string | null;

    constructor(locale: Locale) {
        this._locale = locale;
        this._humanIndexes = null;
        this._humanWords = null;
        this._humanNums = null;
    }

    parse(value: unknown, dateOrder: DateOrder = DateOrder.MDY, parseTypes: DateType[] = []): MetaDate | null {
        const anyType = parseTypes.length === 0;
        const shouldParse = (dateType: DateType): boolean => anyType || new Set(parseTypes).has(dateType);

        if (shouldParse(DateType.OBJECT)) {
            if (value instanceof Date && !isNaN(value.getTime())) {
                return new MetaDate(value, DateType.OBJECT);
            }
        }
        if (shouldParse(DateType.TIMESTAMP)) {
            const result = this.parseTimestamp(value);
            if (result) {
                const { date, parts } = result;
                return new MetaDate(date, DateType.TIMESTAMP, parts);
            }
        }
        if (shouldParse(DateType.ISO)) {
            const result = this.parseIso(value);
            if (result) {
                const { date, parts } = result;
                return new MetaDate(date, DateType.ISO, parts);
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
                return new MetaDate(date, DateType.ISO_WEEK, parts);
            }
        }

        if (shouldParse(DateType.ISO_ORDINAL)) {
            const result = this.parseIsoOrdinal(value);
            if (result) {
                const { date, parts } = result;
                return new MetaDate(date, DateType.ISO_ORDINAL, parts);
            }
        }

        return null;
    }

    parseHuman(dateString: unknown, dateOrder: DateOrder = DateOrder.MDY): MetaDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const normalizedDateString = dateString.trim().toLowerCase();
        if (normalizedDateString.length === 0) {
            return null;
        }

        if (!this._humanWords) {
            const { _locale: locale } = this;

            this._allMonths =
                (locale.translate('calendar/months/full') as string[] || [])
                    .concat(locale.translate('calendar/months/short') as string[] || [])
                    .map(s => s.toLowerCase());

            const allNumberSuffixesJoined =
                (locale.translate('calendar/numberSuffixes') as string[] || [])
                    .map(s => s.toLowerCase())
                    .join('|');

            switch (dateOrder) {
                case DateOrder.MDY:
                    this._humanIndexes = HUMAN_MDY_INDEXES;
                    this._humanWords = HUMAN_MDY_WORDS
                        .replace('#MONTH_NAMES#', this._allMonths.join('|'))
                        .replace('#NUMBER_SUFFIXES#', allNumberSuffixesJoined)
                    this._humanNums = HUMAN_MDY_NUMS;
                    break;
                case DateOrder.DMY:
                    this._humanIndexes = HUMAN_DMY_INDEXES;
                    this._humanWords = HUMAN_DMY_WORDS[0]
                        .replace('#MONTH_NAMES#', this._allMonths.join('|'))
                        .replace('#NUMBER_SUFFIXES#', allNumberSuffixesJoined)
                    this._humanNums = HUMAN_DMY_NUMS;
                    break;
                case DateOrder.YMD:
                    this._humanIndexes = HUMAN_YMD_INDEXES;
                    this._humanWords = HUMAN_YMD_WORDS[0]
                        .replace('#MONTH_NAMES#', this._allMonths.join('|'))
                        .replace('#NUMBER_SUFFIXES#', allNumberSuffixesJoined)
                    this._humanNums = HUMAN_YMD_NUMS;
                    break;
            }
        }

        let matchResult = RegexCache(this._humanWords!, 'i').exec(normalizedDateString);
        let isNumMatch = false;
        if (!matchResult) {
            matchResult = RegexCache(this._humanNums!, 'i').exec(normalizedDateString);
            console.log(matchResult);
            if (!matchResult) {
                return null;
            }
            isNumMatch = true;
        }

        let [
            , , , , // skip date
            hour = null, minute = null, second = null, meridiem = null
        ] = matchResult;

        const indexes = this._humanIndexes!;
        const year = +matchResult[indexes.year];
        const month = isNumMatch
            ? +matchResult[indexes.month]
            : this._allMonths.indexOf(matchResult[indexes.month].toLowerCase()) % 12 + 1;
        const day = +matchResult[indexes.day];

        const yearNum = +year;
        const monthNum = +month;
        const dayNum = +day;

        if (!DateHelpers.isValidDate(yearNum, monthNum, dayNum)) {
            return null;
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

        return new MetaDate({
            date,
            originalInput: dateString,
            type: DateType.HUMAN,
            meta: {
                type: isNumMatch ? 'numbers' : 'words',
            } as DateMeta
        });
    }

    parseIso(dateString: unknown): MetaDate | null {
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
            zulu = null, sign = null, hourOffset = null, timeSep3 = '', minuteOffset = null,               // offset
        ] = matchResult;

        // check separators consistency
        const sepLength = dateSep1.length;
        if (
            day &&
            (sepLength !== dateSep2.length) ||
            (hour && (sepLength !== timeSep1.length || (second && sepLength !== timeSep2.length))) ||
            (hourOffset && sepLength !== timeSep3.length)
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

        return new MetaDate({
            date,
            originalInput: dateString,
            type: DateType.ISO,
            meta: {
                isoIsExpanded: sepLength > 0,
                year, month, day,   // date
                hour, minute, second, millisecond,             // time
                zulu, sign, hourOffset, minuteOffset,          // offset
            } as DateMeta
        });
    }

    parseIsoOrdinal(dateString: unknown): MetaDate | null {
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
            zulu = null, sign = null, hourOffset = null, timeSep3 = '', minuteOffset = null,               // offset
        ] = matchResult;

        // check separators consistency
        const sepLength = dateSep1.length;
        if (
            (hour && (sepLength !== timeSep1.length || (second && sepLength !== timeSep2.length))) ||
            (hourOffset && sepLength !== timeSep3.length)
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

        return new MetaDate({
            date,
            originalInput: dateString,
            type: DateType.ISO_ORDINAL,
            meta: {
                isoIsExpanded: sepLength > 0,
                year, day,                                // date
                hour, minute, second, millisecond,             // time
                zulu, sign, hourOffset, minuteOffset,          // offset
            } as DateMeta
        });
    }

    parseIsoWeek(dateString: unknown): MetaDate | null {
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
            zulu = null, sign = null, hourOffset = null, timeSep3 = '', minuteOffset = null,               // offset
        ] = matchResult;

        // check separators consistency
        const sepLength = dateSep1.length;
        if (
            (day && (sepLength !== dateSep2.length)) ||
            (hour && (sepLength !== timeSep1.length || (second && sepLength !== timeSep2.length))) ||
            (hourOffset && sepLength !== timeSep3.length)
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

        return new MetaDate({
            date,
            originalInput: dateString,
            type: DateType.ISO_WEEK,
            meta: {
                isoIsExpanded: sepLength > 0,
                year, week, day,                         // date
                hour, minute, second, millisecond,             // time
                zulu, sign, hourOffset, minuteOffset          // offset
            } as DateMeta
        });
    }

    parseTimestamp(value: unknown): MetaDate | null {
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
        return new MetaDate({
            date,
            originalInput: value,
            type: DateType.TIMESTAMP,
        });
    }
}

export { DateParser };