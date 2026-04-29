'use strict';
//todo: date and string add auto trim
import { RegexCache } from "../cache/RegexCache.ts";
import { Locale } from "../Locale.ts";
import { Presence } from "../Presence.ts";
import { DateHelpers } from "./DateHelpers.ts";
import { DatePart, DatePartPresence } from "./DatePart.ts";
import { DateType } from "./DateType.ts";
import { MetaDate } from "./MetaDate.ts";

enum DateOrder {
    MDY = 'MDY',
    DMY = 'DMY',
    YMD = 'YMD'
};

// Date building blocks/keys
const YY = '\\d{2}';
const YYYY = '\\d{4}';
const M = '[1-9]|1[0-2]';
const MM = '0[1-9]|1[0-2]';
const M_OR_MM = '0?[1-9]|1[0-2]';
const MMM = '(?:#SHORT_MONTH_NAMES#)'; // will be replaced with locale short month names in runtime
const MMMM = '(?:#LONG_MONTH_NAMES#)'; // will be replaced with locale long month names in runtime
const D = '[1-9]|[12][0-9]|3[01]';
const DD = '0[1-9]|[12][0-9]|3[01]';
const D_OR_DD = '0?[1-9]|[12][0-9]|3[01]';
// const Do = `${D}(?:#NUMBER_SUFFIXES#)?`; // will be replaced with D + locale number suffixes in runtime
const DDD = '[1-9]|[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6]';
const DDDD = '00[1-9]|0[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6]';
const W = '0?[1-9]|[1-4]\\d|5[0-3]';
const WW = '0[1-9]|[1-4]\\d|5[0-3]';
const E = '[1-7]';
const ddd = '(?:#SHORT_DAY_NAMES#)'; // will be replaced with locale short day names in runtime
const dddd = '(?:#LONG_DAY_NAMES#)'; // will be replaced with locale long day names in runtime

// Time building blocks/keys
const H = '0?[0-9]|1[0-9]|2[0-3]';
const HH = '0[0-9]|1[0-9]|2[0-3]';
const h = '0?[1-9]|1[0-2]';
const hh = '0[1-9]|1[0-2]';
const m = '0?[0-9]|[1-5][0-9]';
const mm = '0[0-9]|[1-5][0-9]';
const s = '0?[0-9]|[1-5][0-9]';
const ss = '0[0-9]|[1-5][0-9]';
const S = '\\d';
const SS = '0[0-9]|[1-9][0-9]|[1-9][0-9]{2}';
const SSS = '\\d{3}';
const A = '[AP]M';
const a = '[ap]m';

// Timezone building blocks/keys
const Z = `[+-]${HH}${mm}`;
const ZZ = `[+-]${HH}:${mm}`;
const z = 'Z';

//todo: support UTC and GMT
//todo: rfc2822

// ISO time + TZ
const ISO_TZ = `(${Z}|${ZZ}|${z})?`;
const ISO_TIME_TZ = `(${HH})(:?)(?:(${mm})(?:(:?)(${ss})(?:\\.(${SSS}))?)?)?(?:${ISO_TZ})?`;

// ISO date + time + TZ
const ISO = `^(${YYYY})(?:(-?)(${MM})(?:(-?)(${DD})(?:T${ISO_TIME_TZ})?)?)?$`;
const ISO_ORDINAL = `^(${YYYY})(-?)(${DDDD})(?:T${ISO_TIME_TZ})?$`;
const ISO_WEEK = `^(${YYYY})(-?)W(${WW})(?:(-?)(${E})(?:T${ISO_TIME_TZ})?)?$`;

// Human readable regex for dates
const DELIM = '[/. -,:]+';
const HUMAN_MDY = (allMonthNames: string, allDayNames: string, numberSuffixes: string) => {
    return [
        `(?:${allDayNames}${DELIM})?(${allMonthNames})${DELIM}(${D_OR_DD})(?:\\s*${numberSuffixes})?${DELIM}(${YYYY})(?:${DELIM}(.*))?$`,
        `(?:${allDayNames}${DELIM})?(${M_OR_MM})${DELIM}(${D_OR_DD})${DELIM}(${YYYY})(?:${DELIM}(.*))?$`
    ];
};
const HUMAN_DMY = (allMonthNames: string, allDayNames: string, numberSuffixes: string) => {
    return [
        `(?:${allDayNames}${DELIM})?(${D_OR_DD})(?:\\s*${numberSuffixes})?${DELIM}(${allMonthNames})${DELIM}(${YYYY})(?:${DELIM}(.*))?$`,
        `(?:${allDayNames}${DELIM})?(${D_OR_DD})${DELIM}(${M_OR_MM})${DELIM}(${YYYY})(?:${DELIM}(.*))?$`
    ];
};
const HUMAN_YMD = (allMonthNames: string, allDayNames: string, numberSuffixes: string) => {
    return [
        `(?:${allDayNames}${DELIM})?(${YYYY})${DELIM}(?:(${allMonthNames}))${DELIM}(${D_OR_DD})(?:\\s*${numberSuffixes})?(?:${DELIM}(.*))?$`,
        `(?:${allDayNames}${DELIM})?(${YYYY})${DELIM}(${M_OR_MM})${DELIM}(${D_OR_DD})(?:${DELIM}(.*))?$`
    ];
};

// Human readable regex for time
const HUMAN_TZ = `(?:(utc|gmt|z)|([+-]${HH})(?::?(${mm})))?`;
const HUMAN_TIME = `^(${H})(?::?(${mm})(?::?(${ss}))?)?(?:\\s*(${a}))?(?:\\s*${HUMAN_TZ})?$`;

type HumanDateCache = null | {
    dateIndexes: Record<string, number>;
    humanRegex: string[];
    shortMonthNames: string[],
    longMonthNames: string[],
    shortDayNames: string[],
    longDayNames: string[],
    numberSuffixes: string[];
    allMonthNamesLower: string[];
    allDayNamesLower: string[];
}

export const HumanPrecision = {
    Date: 'date',
    Time: 'time',
    Timezone: 'timezone',
};
export const IsoPrecision = {
    Date: 'date',
    Year: 'year',
    Month: 'month',
    Day: 'day',

    Time: 'time',
    Hour: 'hour',
    Minute: 'minute',
    Second: 'second',
    Millisecond: 'millisecond',

    Timezone: 'timezone',
};
export const IsoOrdinalPrecision = {
    Date: 'date',
    DayOfYear: 'dayOfYear',

    Time: 'time',
    Hour: 'hour',
    Minute: 'minute',
    Second: 'second',
    Millisecond: 'millisecond',

    Timezone: 'timezone',
}
export const IsoWeekPrecision = {
    Date: 'date',
    Week: 'week',
    DayOfWeek: 'dayOfWeek',

    Time: 'time',
    Hour: 'hour',
    Minute: 'minute',
    Second: 'second',
    Millisecond: 'millisecond',

    Timezone: 'timezone',
}

export type HumanPrecision = typeof HumanPrecision[keyof typeof HumanPrecision];
export type IsoPrecision = typeof IsoPrecision[keyof typeof IsoPrecision];
export type IsoWeekPrecision = typeof IsoWeekPrecision[keyof typeof IsoWeekPrecision];
export type IsoOrdinalPrecision = typeof IsoOrdinalPrecision[keyof typeof IsoOrdinalPrecision];

export type HumanParseOptions = {
    dateOrder?: 'MDY' | 'DMY' | 'YMD';
    minPrecision?: HumanPrecision;
    maxPrecision?: HumanPrecision;
    fixSpacing?: boolean;
};
export type IsoParseOptions = {
    minPrecision?: IsoPrecision;
    maxPrecision?: IsoPrecision;
    expanded?: Presence
};
export type IsoOrdinalParseOptions = {
    minPrecision?: IsoOrdinalPrecision;
    maxPrecision?: IsoOrdinalPrecision;
    expanded?: Presence
};
export type IsoWeekParseOptions = {
    minPrecision?: IsoWeekPrecision;
    maxPrecision?: IsoWeekPrecision;
    expanded?: Presence
};

class DateParser {

    private _locale: Locale;
    private _cache: HumanDateCache;

    constructor(locale: Locale) {
        this._locale = locale;
        this._cache = null;
    }

    parse(value: unknown, parseTypes: DateType[] = []): MetaDate | null {
        const anyType = parseTypes.length === 0;

        if (anyType || parseTypes.indexOf(DateType.OBJECT) !== -1) {
            if (value instanceof Date && !isNaN(value.getTime())) {
                return new MetaDate(value);
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

    _loadCache() {
        if (this._cache) {
            return;
        }

        const locale = this._locale;
        const longMonthNames = (locale.translate('calendar/months/full') || []) as string[];
        const shortMonthNames = (locale.translate('calendar/months/short') || []) as string[];
        const numberSuffixes = (locale.translate('calendar/numberSuffixes') || []) as string[];
        const longDayNames = (locale.translate('calendar/dayNames/full') || []) as string[];
        const shortDayNames = (locale.translate('calendar/dayNames/short') || []) as string[];
        const dateOrder = locale.translate('calendar/dateOrder') as DateOrder;

        const allMonthNamesLower = longMonthNames.concat(shortMonthNames).map(s => s.toLowerCase());
        const allDayNamesLower = longDayNames.concat(shortDayNames).map(s => s.toLowerCase());

        const dayNamesRegex = '(?:' + allDayNamesLower.join('|') + ')';
        const monthNamesRegex = '(?:' + allMonthNamesLower.join('|') + ')';
        const numberSuffixesRegex = '(?:' + numberSuffixes.map(s => s.toLowerCase()).join('|') + ')';

        let humanRegex: string[], dateIndexes: Record<string, number>;
        switch (dateOrder) {
            case DateOrder.MDY:
                dateIndexes = { day: 2, month: 1, year: 3 };
                humanRegex = HUMAN_MDY(monthNamesRegex, dayNamesRegex, numberSuffixesRegex);
                break;
            case DateOrder.DMY:
                dateIndexes = { day: 1, month: 2, year: 3 };
                humanRegex = HUMAN_DMY(monthNamesRegex, dayNamesRegex, numberSuffixesRegex);
                break;
            default:
                dateIndexes = { day: 3, month: 2, year: 1 };
                humanRegex = HUMAN_YMD(monthNamesRegex, dayNamesRegex, numberSuffixesRegex);
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
            shortMonthNames,
            longMonthNames,
            shortDayNames,
            longDayNames,
            allMonthNamesLower,
            allDayNamesLower,
            numberSuffixes,
        };
    }

    parseHuman(dateString: unknown, options: HumanParseOptions = {}): MetaDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const normalizedDateString = dateString.trim().toLowerCase();
        if (normalizedDateString.length === 0) {
            return null;
        }

        this._loadCache();
        const { dateIndexes, humanRegex, allMonthNamesLower } = this._cache!;

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
            : allMonthNamesLower.indexOf(matchResult[dateIndexes.month].toLowerCase()) % 12 + 1;
        const day = Number(matchResult[dateIndexes.day]);

        if (!DateHelpers.isValidDate(year, month, day)) {
            return null;
        }

        let hour = null, minute = null, second = null, meridiem = null,
            timezone = null, offsetHour = null, offsetMinute = null;

        // Check time portion (if it exists)
        const timeString = matchResult[4];
        if (timeString) {

            if (options.maxPrecision === HumanPrecision.Date) {
                return null;
            }

            matchResult = RegexCache(HUMAN_TIME).exec(timeString);
            if (!matchResult) {
                return null;
            }

            ([
                , hour, minute = null, second = null, meridiem = null,
                timezone = null, offsetHour = null, offsetMinute = null
            ] = matchResult);

            if (options.minPrecision === HumanPrecision.Timezone && !timezone && !offsetHour) {
                return null;
            }
            if (options.maxPrecision === HumanPrecision.Time && (timezone || offsetHour)) {
                return null;
            }

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
        else if (options.minPrecision === HumanPrecision.Time) {
            // if time is required but time portion doesn't exist, return null
            return null;
        }

        if(options.fixSpacing) {
            dateString = dateString.replace(/([/. -,:])\1+/g, '$1');
        }
        
        return new MetaDate(dateString as string, {
            year,
            month,
            day,
            hour: Number(hour),
            minute: Number(minute),
            second: Number(second),
            offsetHour: Number(offsetHour),
            offsetMinute: Number(offsetMinute)
        });
    }

    parseIso(dateString: unknown, options: IsoParseOptions = {}): MetaDate | null {
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

        if (month && !day && monthDelim.length === 0) {
            // if month exists without day, delim MUST be used as per ISO format.
            return null;
        }

        // Check delims
        const delimSize = monthDelim.length;
        if (options.expanded === Presence.Required && !delimSize) {
            return null;
        }
        if (options.expanded === Presence.Forbidden && delimSize) {
            return null;
        }
        if (
            day && delimSize !== dayDelim.length ||
            minute && delimSize !== minuteDelim.length ||
            second && delimSize !== secondDelim.length ||
            offsetMinute && delimSize !== offsetMinuteDelim.length
        ) {
            return null;
        }

        switch (options.minPrecision) {
            case IsoPrecision.Date:
            case IsoPrecision.Year:
                if (!year) {
                    return null;
                }
                break;
            case IsoPrecision.Month:
                if (!month) {
                    return null;
                }
                break;
            case IsoPrecision.Day:
                if (!day) {
                    return null;
                }
                break;
            case IsoPrecision.Time:
            case IsoPrecision.Hour:
                if (!hour) {
                    return null;
                }
                break;
            case IsoPrecision.Minute:
                if (!minute) {
                    return null;
                }
                break;
            case IsoPrecision.Second:
                if (!second) {
                    return null;
                }
                break;
            case IsoPrecision.Millisecond:
                if (!millisecond) {
                    return null;
                }
                break;
            case IsoPrecision.Timezone:
                if (!zulu && !offsetHour) {
                    return null;
                }
                break;
        }

        switch (options.maxPrecision) {
            case IsoPrecision.Year:
                if (month) {
                    return null;
                }
                break;
            case IsoPrecision.Month:
                if (day) {
                    return null;
                }
                break;
            case IsoPrecision.Date:
            case IsoPrecision.Day:
                if (hour) {
                    return null;
                }
                break;
            case IsoPrecision.Hour:
                if (minute) {
                    return null;
                }
                break;
            case IsoPrecision.Minute:
                if (second) {
                    return null;
                }
                break;
            case IsoPrecision.Second:
                if (millisecond) {
                    return null;
                }
                break;
            case IsoPrecision.Time:
            case IsoPrecision.Millisecond:
                if (zulu || offsetHour) {
                    return null;
                }
                break;
        }

        const yearNum = Number(year);
        const monthNum = Number(month || 1);
        const dayNum = Number(day || 1);

        if (dayNum > 0 && !DateHelpers.isValidDate(yearNum, monthNum, dayNum)) {
            return null;
        }

        return new MetaDate(dateString, {
            year: yearNum,
            month: monthNum - 1,
            day: dayNum,
            hour: Number(hour),
            minute: Number(minute),
            second: Number(second),
            millisecond: Number(millisecond),
            offsetHour: Number(offsetHour),
            offsetMinute: Number(offsetMinute)
        });
    }

    parseIsoOrdinal(dateString: unknown, options: IsoOrdinalParseOptions = {}): MetaDate | null {
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
            , year, dayDelim = '', dayOfYear = null,                                                       // date
            hour = null, minuteDelim = '', minute = null, secondDelim = '', second = null, millisecond = null,   // time
            zulu = null, offsetHour = null, offsetMinuteDelim = '', offsetMinute = null,               // offset
        ] = matchResult;

        // Check delims
        const delimSize = dayDelim.length;
        if (options.expanded === Presence.Required && !delimSize) {
            return null;
        }
        if (options.expanded === Presence.Forbidden && delimSize) {
            return null;
        }
        if (
            minute && delimSize !== minuteDelim.length ||
            second && delimSize !== secondDelim.length ||
            offsetMinute && delimSize !== offsetMinuteDelim.length
        ) {
            return null;
        }

        switch (options.minPrecision) {
            case IsoOrdinalPrecision.Date:
            case IsoOrdinalPrecision.DayOfYear:
                if (!dayOfYear) {
                    return null;
                }
                break;
            case IsoOrdinalPrecision.Time:
            case IsoOrdinalPrecision.Hour:
                if (!hour) {
                    return null;
                }
                break;
            case IsoOrdinalPrecision.Minute:
                if (!minute) {
                    return null;
                }
                break;
            case IsoOrdinalPrecision.Second:
                if (!second) {
                    return null;
                }
                break;
            case IsoOrdinalPrecision.Millisecond:
                if (!millisecond) {
                    return null;
                }
                break;
            case IsoOrdinalPrecision.Timezone:
                if (!zulu && !offsetHour) {
                    return null;
                }
                break;
        }

        switch (options.maxPrecision) {
            case IsoOrdinalPrecision.Date:
            case IsoOrdinalPrecision.DayOfYear:
                if (hour) {
                    return null;
                }
                break;
            case IsoOrdinalPrecision.Hour:
                if (minute) {
                    return null;
                }
                break;
            case IsoOrdinalPrecision.Minute:
                if (second) {
                    return null;
                }
                break;
            case IsoOrdinalPrecision.Second:
                if (millisecond) {
                    return null;
                }
                break;
            case IsoOrdinalPrecision.Time:
            case IsoOrdinalPrecision.Millisecond:
                if (zulu || offsetHour) {
                    return null;
                }
                break;
        }

        const yearNum = Number(year);
        const dayNum = Number(dayOfYear);

        if (dayNum === 366 && !DateHelpers.isLeapYear(yearNum)) {
            return null;
        }

        return new MetaDate(dateString, {
            year: yearNum,
            month: 0,
            day: dayNum,
            hour: Number(hour),
            minute: Number(minute),
            second: Number(second),
            millisecond: Number(millisecond),
            offsetHour: Number(offsetHour),
            offsetMinute: Number(offsetMinute)
        });
    }

    parseIsoWeek(dateString: unknown, options: IsoWeekParseOptions = {}): MetaDate | null {
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
            , year, weekDelim = '', week, dayDelim = '', dayOfWeek = null,                                   // date
            hour = null, minuteDelim = '', minute = null, secondDelim = '', second = null, millisecond = null,   // time
            zulu = null, offsetHour = null, offsetMinuteDelim = '', offsetMinute = null,               // offset
        ] = matchResult;

        // check delims
        const delimSize = weekDelim.length;
        if (options.expanded === Presence.Required && !delimSize) {
            return null;
        }
        if (options.expanded === Presence.Forbidden && delimSize) {
            return null;
        }
        if (
            dayOfWeek && delimSize !== dayDelim.length ||
            minute && delimSize !== minuteDelim.length ||
            second && delimSize !== secondDelim.length ||
            offsetMinute && delimSize !== offsetMinuteDelim.length
        ) {
            return null;
        }


        switch (options.minPrecision) {
            case IsoWeekPrecision.Date:
            case IsoWeekPrecision.Week:
                if (!week) {
                    return null;
                }
                break;
            case IsoWeekPrecision.DayOfWeek:
                if (!dayOfWeek) {
                    return null;
                }
                break;
            case IsoWeekPrecision.Time:
            case IsoWeekPrecision.Hour:
                if (!hour) {
                    return null;
                }
                break;
            case IsoWeekPrecision.Minute:
                if (!minute) {
                    return null;
                }
                break;
            case IsoWeekPrecision.Second:
                if (!second) {
                    return null;
                }
                break;
            case IsoWeekPrecision.Millisecond:
                if (!millisecond) {
                    return null;
                }
                break;
            case IsoWeekPrecision.Timezone:
                if (!zulu && !offsetHour) {
                    return null;
                }
                break;
        }

        switch (options.maxPrecision) {
            case IsoWeekPrecision.Week:
                if (dayOfWeek) {
                    return null;
                }
                break;
            case IsoWeekPrecision.Date:
            case IsoWeekPrecision.DayOfWeek:
                if (hour) {
                    return null;
                }
                break;
            case IsoWeekPrecision.Hour:
                if (minute) {
                    return null;
                }
                break;
            case IsoWeekPrecision.Minute:
                if (second) {
                    return null;
                }
                break;
            case IsoWeekPrecision.Second:
                if (millisecond) {
                    return null;
                }
                break;
            case IsoWeekPrecision.Time:
            case IsoWeekPrecision.Millisecond:
                if (zulu || offsetHour) {
                    return null;
                }
                break;
        }

        const yearNum = Number(year);
        const weekNum = Number(week);
        const dayNum = Number(dayOfWeek);

        if (weekNum === 53 && !DateHelpers.has53IsoWeeks(yearNum)) {
            return null;
        }

        const date = DateHelpers.isoWeekToDate(yearNum, weekNum, dayNum);

        return new MetaDate(dateString, {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth(),
            day: date.getUTCDate(),
            hour: Number(hour),
            minute: Number(minute),
            second: Number(second),
            millisecond: Number(millisecond),
            offsetHour: Number(offsetHour),
            offsetMinute: Number(offsetMinute)
        });
    }

    parseTimestamp(value: unknown, isMilliseconds: boolean = true): MetaDate | null {
        const valueType = typeof value;
        if (valueType !== 'number' && (valueType !== 'string' || !/^\d+$/.test(value as string))) {
            return null;
        }
        const valueNum = Number(value);
        if (!Number.isInteger(valueNum)) {
            return null;
        }
        const date = new Date(isMilliseconds ? valueNum : valueNum * 1000);
        if (isNaN(date.getTime())) {
            return null;
        }

        return new MetaDate(date);
    }
}

export { DateParser };
