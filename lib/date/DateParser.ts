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
const ISO_TIME = `${HOUR_LZ}(:?)${MINUTE_LZ}(?:(:?)${SECOND_LZ}(?:${THOUSANDTHS_OF_SECOND})?)?(?:(Z)|(?:([+-])${HOUR_LZ}(:?)${MINUTE_LZ}))`;
const ISO = `^${YEAR}(?:(-?)${MONTH_LZ}(?:$|(-?)${DAY_OF_MONTH_LZ}(?:T${ISO_TIME})?))?$`;
const ISO_ORDINAL = `^${YEAR}(-?)${DAY_OF_YEAR_LZ}(?:T${ISO_TIME})?$`;
const ISO_WEEK = `^${YEAR}(-?)W${WEEK_OF_YEAR_LZ}(?:(-?)${DAY_OF_WEEK})?$`;

// Human readable building blocks
const HUMAN_TIME = `/^${HOUR}(?::\s*${MINUTE}(?::\s*${SECOND})?)?\s*${MERIDIEM}$|^${ISO_TIME}$/`;
const SEPARATOR = '[/. -]+';

// Human readable final formats
const HUMAN_DATE_TIME_MDY_WRITTEN = [
    `(#MONTH_NAMES#)\\s*${DAY_OF_MONTH}(?:\\s*(#NUMBER_SUFFIXES#))?\\s*,?\\s*${YEAR}(?:\\s+${HUMAN_TIME})?`,
    {
        month: 1,
        day: 2,
        year: 3,
    }
];
const HUMAN_DATE_TIME_DMY_WRITTEN = [
    `${DAY_OF_MONTH}(?:\\s*(#NUMBER_SUFFIXES#))?\\s*(#MONTH_NAMES#)\\s*,?\\s*${YEAR}(?:\\s+${HUMAN_TIME})?`,
    {
        day: 1,
        month: 2,
        year: 3
    }
];
const HUMAN_DATE_TIME_YMD_WRITTEN = [
    `${YEAR}\\s*(#MONTH_NAMES#)\\s*${DAY_OF_MONTH}(?:\\s*(#NUMBER_SUFFIXES#))?(?:\\s+${HUMAN_TIME})?`,
    {
        year: 1,
        month: 2,
        day: 3
    }
];

const HUMAN_DATE_TIME_MDY_SHORT = `${MONTH}${SEPARATOR}${DAY_OF_MONTH}${SEPARATOR}${YEAR}(?:\\s+${HUMAN_TIME})?`;
const HUMAN_DATE_TIME_DMY_SHORT = `${DAY_OF_MONTH}${SEPARATOR}${MONTH}${SEPARATOR}${YEAR}(?:\\s+${HUMAN_TIME})?`;
const HUMAN_DATE_TIME_YMD_SHORT = `${YEAR}${SEPARATOR}${MONTH}${SEPARATOR}${DAY_OF_MONTH}(?:\\s+${HUMAN_TIME})?`;


class DateParser {

    private _locale: Locale;
    private _humanWrittenDateTime: RegExp | null;

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
        if (typeof dateString !== 'string') {
            return null;
        }
        const trimmedDateString = dateString.trim();
        if (trimmedDateString.length === 0) {
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
                    this._humanWrittenDateTime = RegexCache(HUMAN_DATE_TIME_MDY_WRITTEN.replace('#MONTH_NAMES#', allMonths).replace('#NUMBER_SUFFIXES#', allNumberSuffixes));
                    break;
                case DateOrder.DMY:
                    this._humanWrittenDateTime = RegexCache(HUMAN_DATE_TIME_DMY_WRITTEN.replace('#MONTH_NAMES#', allMonths).replace('#NUMBER_SUFFIXES#', allNumberSuffixes));
                    break;
                case DateOrder.YMD:
                    this._humanWrittenDateTime = RegexCache(HUMAN_DATE_TIME_YMD_WRITTEN.replace('#MONTH_NAMES#', allMonths).replace('#NUMBER_SUFFIXES#', allNumberSuffixes));
                    break;
            }


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

        const matchResult = RegexCache(ISO).exec(trimmedDateString);
        if (!matchResult) {
            return null;
        }

        let [
            , year, sep1 = '', month = 0, sep2 = '', day = 0,                  // date
            hour = 0, sep3 = '', minute = 0, sep4 = '', second = 0, millisecond = 0,   // time
            zulu = '', sign = '', hourOffset = 0, sep5 = '', minuteOffset = 0,      // offset
        ] = matchResult;

        // check separators consistency
        const sepLength = sep1.length;
        if (
            day &&
            (sepLength !== sep2.length) ||
            (hour && (sepLength !== sep3.length || sepLength !== sep4.length)) ||
            (hourOffset && sepLength !== sep5.length)
        ) {
            return null;
        }

        const yearNum = +year;
        const monthNum = +month;
        const dayNum = +day;

        if (dayNum > 0 && !DateHelpers.isValidDate(yearNum, monthNum, dayNum)) {
            return null;
        }

        const hourOffsetNum = +hourOffset;
        const minuteOffsetNum = +minuteOffset;
        const offsetMinsNum = (sign === '-' ? -1 : 1) * hourOffsetNum * 60 + minuteOffsetNum;
        const date = new Date(Date.UTC(
            yearNum,
            monthNum - 1,
            dayNum,
            +hour,
            +minute + offsetMinsNum,
            +second,
            +millisecond
        ));

        return new BetterDate(
            date,
            DateType.ISO,
            {
                hourOffset: hourOffsetNum,
                minuteOffset: minuteOffsetNum,
                isoIsExtended: sepLength > 0,
                isoIsZulu: zulu.length > 0
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

        const matchResult = RegexCache(ISO_WEEK).exec(trimmedDateString);
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