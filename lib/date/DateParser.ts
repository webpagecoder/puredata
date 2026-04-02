'use strict';
//todo: date and string add auto trim
import { RegexCache } from "../cache/RegexCache.ts";
import { Locale } from "../Locale.ts";
import { BetterDate, DateMeta, DateType } from "./BetterDate.ts";
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
const HOUR = '(0?[0-9]|1[0-9]|2[0-3])';
const HOUR_LZ = '(0[0-9]|1[0-9]|2[0-3])';
const MINUTE = '(0?[0-9]|[1-5][0-9])';
const MINUTE_LZ = '(0[0-9]|[1-5][0-9])';
const SECOND = '(0?[0-9]|[1-5][0-9])';
const SECOND_LZ = '(0[0-9]|[1-5][0-9])';
const THOUSANDTHS_OF_SECOND = '\\.(\\d{1,3})';
const MERIDIEM = '([AaPp][Mm])';

// ISO building blocks
const ISO_TIME = `${HOUR_LZ}(:?)${MINUTE_LZ}(?:(:?)${SECOND_LZ}(?:${THOUSANDTHS_OF_SECOND})?)?(?:(Z)|(?:([+-])${HOUR_LZ}(:?)${MINUTE_LZ}))?`;
const ISO = `^${YEAR}(?:(-?)${MONTH_LZ}(?:$|(-?)${DAY_OF_MONTH_LZ}(?:T${ISO_TIME})?))?$`;
const ISO_ORDINAL = `^${YEAR}(-?)${DAY_OF_YEAR_LZ}(?:T${ISO_TIME})?$`;
const ISO_WEEK = `^${YEAR}(-?)W${WEEK_OF_YEAR_LZ}(?:(-?)${DAY_OF_WEEK}(?:T${ISO_TIME})?)?$`;

// Human readable building blocks (also accept ISO time)
const HUMAN_TIME = `/^${HOUR}(?::\s*${MINUTE}(?::\s*${SECOND})?)?\s*${MERIDIEM}$/`;
const SEPARATOR = '[/. -,]+';

// Human readable final formats
const HUMAN_MDY_WRITTEN = `(#MONTH_NAMES#)${SEPARATOR}${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?${SEPARATOR}${YEAR}(?:${SEPARATOR}${HUMAN_TIME})?`;
const HUMAN_MDY_WRITTEN_INDEXES = { month: 1, day: 2, year: 3 };

const HUMAN_DMY_WRITTEN = `${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?${SEPARATOR}(#MONTH_NAMES#)${SEPARATOR}${YEAR}(?:${SEPARATOR}${HUMAN_TIME})?`;
const HUMAN_DMY_WRITTEN_INDEXES = { day: 1, month: 2, year: 3 };

const HUMAN_YMD_WRITTEN = `${YEAR}${SEPARATOR}(#MONTH_NAMES#)${SEPARATOR}${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?(?:${SEPARATOR}${HUMAN_TIME})?`;
const HUMAN_YMD_WRITTEN_INDEXES = { year: 1, month: 2, day: 3 };

// const HUMAN_MDY_WRITTEN = `(#MONTH_NAMES#)\\s*${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?\\s*,?\\s*${YEAR}(?:\\s+${HUMAN_TIME})?`;
// const HUMAN_MDY_WRITTEN_INDEXES = { month: 1, day: 2, year: 3 };

// const HUMAN_DMY_WRITTEN = `${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?\\s*(#MONTH_NAMES#)\\s*,?\\s*${YEAR}(?:\\s+${HUMAN_TIME})?`;
// const HUMAN_DMY_WRITTEN_INDEXES = { day: 1, month: 2, year: 3 };

// const HUMAN_YMD_WRITTEN = `${YEAR}\\s*(#MONTH_NAMES#)\\s*${DAY_OF_MONTH}(?:\\s*#NUMBER_SUFFIXES#)?(?:\\s+${HUMAN_TIME})?`;
// const HUMAN_YMD_WRITTEN_INDEXES = { year: 1, month: 2, day: 3 };

const HUMAN_MDY_SHORT = `${MONTH}${SEPARATOR}${DAY_OF_MONTH}${SEPARATOR}${YEAR}(?:${SEPARATOR}${HUMAN_TIME})?`;
const HUMAN_DMY_SHORT = `${DAY_OF_MONTH}${SEPARATOR}${MONTH}${SEPARATOR}${YEAR}(?:${SEPARATOR}${HUMAN_TIME})?`;
const HUMAN_YMD_SHORT = `${YEAR}${SEPARATOR}${MONTH}${SEPARATOR}${DAY_OF_MONTH}(?:${SEPARATOR}${HUMAN_TIME})?`;


class DateParser {

    private _locale: Locale;
    private _humanWritten: string | null;
    private _humanWrittenIndexes: YMDIndexes | null;
    private _allMonths: string[] = [];

    constructor(locale: Locale) {
        this._locale = locale;
        this._humanWritten = null;
        this._humanWrittenIndexes = null;
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

    parseHuman(dateString: unknown, dateOrder: DateOrder = DateOrder.MDY): BetterDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const normalizedDateString = dateString.trim().toLowerCase();
        if (normalizedDateString.length === 0) {
            return null;
        }

        if (!this._humanWritten) {
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
                    this._humanWritten = HUMAN_MDY_WRITTEN
                        .replace('#MONTH_NAMES#', this._allMonths.join('|'))
                        .replace('#NUMBER_SUFFIXES#', allNumberSuffixesJoined)
                    this._humanWrittenIndexes = HUMAN_MDY_WRITTEN_INDEXES;
                    break;
                case DateOrder.DMY:
                    this._humanWritten = HUMAN_DMY_WRITTEN[0]
                        .replace('#MONTH_NAMES#', this._allMonths.join('|'))
                        .replace('#NUMBER_SUFFIXES#', allNumberSuffixesJoined)
                    this._humanWrittenIndexes = HUMAN_DMY_WRITTEN_INDEXES;
                    break;
                case DateOrder.YMD:
                    this._humanWritten = HUMAN_YMD_WRITTEN[0]
                        .replace('#MONTH_NAMES#', this._allMonths.join('|'))
                        .replace('#NUMBER_SUFFIXES#', allNumberSuffixesJoined)
                    this._humanWrittenIndexes = HUMAN_YMD_WRITTEN_INDEXES;
                    break;
            }
        }


        let matchResult = RegexCache(this._humanWritten, 'i').exec(normalizedDateString);
        if (!matchResult) {
            return null;
        }

        let [
            , , , , // skip date
            hour, minute = null, second = null, meridiem
        ] = matchResult;

        const indexes = this._humanWrittenIndexes!;
        const year = +matchResult[indexes.year];
        const monthStr = matchResult[indexes.month];
        const month = this._allMonths.indexOf(monthStr!.toLowerCase()) % 12 + 1;
        const dayOfMonth = +matchResult[indexes.day];

        const yearNum = +year;
        const monthNum = +month;
        const dayOfMonthNum = +dayOfMonth;

        if (!DateHelpers.isValidDate(yearNum, monthNum, dayOfMonthNum)) {
            return null;
        }

        const date = new Date(Date.UTC(
            yearNum,
            monthNum,
            dayOfMonthNum,
            meridiem.toLowerCase() === 'pm' && hour !== '12' ? +hour! + 12 : +hour!,
            +minute!,
            +second!
        ));

        return new BetterDate(
            date,
            DateType.ISO,
            {
                year, month, dayOfMonth,        // date
                hour, minute, second, meridiem,  // time
            } as DateMeta
        );
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
            , year, dateSep1 = '', month = null, dateSep2 = '', dayOfMonth = null,                         // date
            hour = null, timeSep1 = '', minute = null, timeSep2 = '', second = null, millisecond = null,   // time
            zulu = null, sign = null, hourOffset = null, timeSep3 = '', minuteOffset = null,               // offset
        ] = matchResult;

        // check separators consistency
        const sepLength = dateSep1.length;
        if (
            dayOfMonth &&
            (sepLength !== dateSep2.length) ||
            (hour && (sepLength !== timeSep1.length || (second && sepLength !== timeSep2.length))) ||
            (hourOffset && sepLength !== timeSep3.length)
        ) {
            return null;
        }

        const yearNum = +year;
        const monthNum = +month!;
        const dayOfMonthNum = +dayOfMonth!;

        if (dayOfMonthNum > 0 && !DateHelpers.isValidDate(yearNum, monthNum, dayOfMonthNum)) {
            return null;
        }

        const date = new Date(Date.UTC(
            yearNum,
            !monthNum ? 0 : monthNum - 1,
            !dayOfMonthNum ? 1 : dayOfMonthNum,
            +hour!,
            +minute!,
            +second!,
            +millisecond!
        ));

        return new BetterDate(
            date,
            DateType.ISO,
            {
                isoIsExpanded: sepLength > 0,
                year, month, dayOfMonth,   // date
                hour, minute, second, millisecond,             // time
                zulu, sign, hourOffset, minuteOffset,          // offset
            } as DateMeta
        );
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
            , year, dateSep1 = '', dayOfYear = null,                                                       // date
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
        const dayOfYearNum = +dayOfYear!;

        if (dayOfYearNum === 366 && !DateHelpers.isLeapYear(yearNum)) {
            return null;
        }

        const date = new Date(Date.UTC(
            yearNum,
            0,
            dayOfYearNum,
            +hour!,
            +minute!,
            +second!,
            +millisecond!
        ));

        return new BetterDate(
            date,
            DateType.ISO_ORDINAL,
            {
                isoIsExpanded: sepLength > 0,
                year, dayOfYear,                                // date
                hour, minute, second, millisecond,             // time
                zulu, sign, hourOffset, minuteOffset,          // offset
            } as DateMeta
        );
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
            , year, dateSep1 = '', week, dateSep2 = '', dayOfWeek = null,                                   // date
            hour = null, timeSep1 = '', minute = null, timeSep2 = '', second = null, millisecond = null,   // time
            zulu = null, sign = null, hourOffset = null, timeSep3 = '', minuteOffset = null,               // offset
        ] = matchResult;

        // check separators consistency
        const sepLength = dateSep1.length;
        if (
            (dayOfWeek && (sepLength !== dateSep2.length)) ||
            (hour && (sepLength !== timeSep1.length || (second && sepLength !== timeSep2.length))) ||
            (hourOffset && sepLength !== timeSep3.length)
        ) {
            return null;
        }

        const yearNum = +year;
        const weekNum = +week!;
        const dayOfWeekNum = +dayOfWeek!;

        if (weekNum === 53 && !DateHelpers.has53IsoWeeks(yearNum)) {
            return null;
        }

        const date = DateHelpers.isoWeekToDate(yearNum, weekNum, dayOfWeekNum);
        date.setUTCHours(
            +hour!,
            +minute!,
            +second!,
            +millisecond!
        );

        return new BetterDate(
            date,
            DateType.ISO_WEEK,
            {
                isoIsExpanded: sepLength > 0,
                year, week, dayOfWeek,                         // date
                hour, minute, second, millisecond,             // time
                zulu, sign, hourOffset, minuteOffset          // offset
            } as DateMeta
        );
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
        return new BetterDate(date, DateType.TIMESTAMP);
    }
}

export { DateParser };