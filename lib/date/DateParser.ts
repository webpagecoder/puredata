'use strict';
//todo: date and string add auto trim
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
const ISO_BASIC_DATE_REQUIRED_MONTH_DAY = `${YEAR}${MONTH_LZ}${DAY_OF_MONTH_LZ}`;
const ISO_BASIC_DATE_OPTIONAL_MONTH_DAY = `${YEAR}(?:${MONTH_LZ}(?:${DAY_OF_MONTH_LZ})?)?`;
const ISO_BASIC_TIME = `${HOUR_LZ}${MINUTE_LZ}(?:${SECOND_LZ}(?:${THOUSANDTHS_OF_SECOND})?)?`;
const ISO_BASIC_TZ = `(?:(Z)|(?:([+-])${HOUR_LZ}${MINUTE_LZ}))?`;
const ISO_BASIC_TIME_TZ = `${ISO_BASIC_TIME}${ISO_BASIC_TZ}`;
const ISO_EXPANDED_DATE_REQUIRED_MONTH_DAY = `${YEAR}-${MONTH_LZ}-${DAY_OF_MONTH_LZ}`;
const ISO_EXPANDED_DATE_OPTIONAL_MONTH_DAY = `${YEAR}(?:-${MONTH_LZ}(?:-${DAY_OF_MONTH_LZ})?)?`;
const ISO_EXPANDED_TIME = `${HOUR_LZ}:${MINUTE_LZ}(?::${SECOND_LZ}(?:${THOUSANDTHS_OF_SECOND})?)?`;
const ISO_EXPANDED_TZ = `(?:(Z)|(?:([+-])${HOUR_LZ}:${MINUTE_LZ}))?`;
const ISO_EXPANDED_TIME_TZ = `${ISO_EXPANDED_TIME}${ISO_EXPANDED_TZ}`;

// ISO final formats
const ISO_BASIC_DATE_TIME = `^${ISO_BASIC_DATE_REQUIRED_MONTH_DAY}(?:T${ISO_BASIC_TIME_TZ})?$|^${ISO_BASIC_DATE_OPTIONAL_MONTH_DAY}$`;
const ISO_EXPANDED_DATE_TIME = `^${ISO_EXPANDED_DATE_REQUIRED_MONTH_DAY}(?:T${ISO_EXPANDED_TIME_TZ})?$|^${ISO_EXPANDED_DATE_OPTIONAL_MONTH_DAY}$`;

const ISO_EXPANDED_ORDINAL_DATE_TIME_REGEX = `^${YEAR}-${DAY_OF_YEAR_LZ}(?:T${ISO_EXPANDED_TIME_TZ})?$`;
const ISO_BASIC_ORDINAL_DATE_TIME_REGEX = `^${YEAR}${DAY_OF_YEAR_LZ}(?:T${ISO_BASIC_TIME_TZ})?$`;

const ISO_EXPANDED_WEEK_REGEX = `^${YEAR}-W${WEEK_OF_YEAR_LZ}(?:-${DAY_OF_WEEK})?$`;
const ISO_BASIC_WEEK_REGEX = `^${YEAR}W${WEEK_OF_YEAR_LZ}(?:${DAY_OF_WEEK})?$`;

// Human readable building blocks
const HUMAN_TIME = `/^${HOUR}(?::\s*${MINUTE}(?::\s*${SECOND})?)?\s*${MERIDIEM}$|^${ISO_EXPANDED_TIME_TZ}$|^${ISO_BASIC_TIME_TZ}$/`;
const SEPARATOR = '[/. -]+';

// Human readable final formats
const HUMAN_DATE_TIME_MDY_WRITTEN = `(#MONTH_NAMES#)\\s*${DAY_OF_MONTH}(?:\\s*(#NUMBER_SUFFIXES#))?\\s*,?\\s*${YEAR}(?:\\s+${HUMAN_TIME})?`;
const HUMAN_DATE_TIME_DMY_WRITTEN = `${DAY_OF_MONTH}(?:\\s*(#NUMBER_SUFFIXES#))?\\s*(#MONTH_NAMES#)\\s*,?\\s*${YEAR}(?:\\s+${HUMAN_TIME})?`;
const HUMAN_DATE_TIME_YMD_WRITTEN = `${YEAR}\\s*(#MONTH_NAMES#)\\s*${DAY_OF_MONTH}(?:\\s*(#NUMBER_SUFFIXES#))?(?:\\s+${HUMAN_TIME})?`;

const HUMAN_DATE_TIME_MDY_SHORT = `${MONTH}${SEPARATOR}${DAY_OF_MONTH}${SEPARATOR}${YEAR}(?:\\s+${HUMAN_TIME})?`;
const HUMAN_DATE_TIME_DMY_SHORT = `${DAY_OF_MONTH}${SEPARATOR}${MONTH}${SEPARATOR}${YEAR}(?:\\s+${HUMAN_TIME})?`;
const HUMAN_DATE_TIME_YMD_SHORT = `${YEAR}${SEPARATOR}${MONTH}${SEPARATOR}${DAY_OF_MONTH}(?:\\s+${HUMAN_TIME})?`;


class DateParser {

    private _locale: Locale;
    private _humanWrittenDateTime: Record<string, RegExp> | null;

    constructor(locale: Locale) {
        this._locale = locale;
        this._humanWrittenDateTime = null;
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
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }

        
        if (!this._humanWrittenDateTime) {
            const { _locale: locale } = this;
            const allMonths =
                (locale.translate('calendar/months/full') as string[] || [])
                    .concat(locale.translate('calendar/months/short') as string[] || [])
                    .map((name: string): string => name.toLowerCase())
                    .join('|');
            const allNumberSuffixes =
                (locale.translate('calendar/numberSuffixes') as string[] || [])
                    .map((suffix: string): string => suffix.toLowerCase())
                    .join('|');

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

            this._humanWrittenDateTime = {
                MDY: RegexCache(HUMAN_DATE_TIME_MDY_WRITTEN.replace('#MONTH_NAMES#', allMonths).replace('#NUMBER_SUFFIXES#', allNumberSuffixes)),
                DMY: RegexCache(HUMAN_DATE_TIME_DMY_WRITTEN.replace('#MONTH_NAMES#', allMonths).replace('#NUMBER_SUFFIXES#', allNumberSuffixes)),
                YMD: RegexCache(HUMAN_DATE_TIME_YMD_WRITTEN.replace('#MONTH_NAMES#', allMonths).replace('#NUMBER_SUFFIXES#', allNumberSuffixes))
            };
        }

        const { MDY, DMY, YMD } = this._humanWrittenDateTime;

        const normalizedDateString = dateString
            .trim()
            .replace(/,/g, ' ')
            .replace(MULTI_SPACE_REGEX, ' ')
            .replace(TRIM_SEPARATOR_SPACES_REGEX, '$1');

        
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

    parseIso(dateString: unknown): BetterDate | null {
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

    parseIsoOrdinal(dateString: unknown): BetterDate | null {
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

    parseIsoWeek(dateString: unknown): BetterDate | null {
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

    parseTimestamp(value: unknown): BetterDate | null {
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