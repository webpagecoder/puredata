'use strict';
//todo: date and string add auto trim
import { Presence } from "../../Presence.ts";
import { RegexCache } from "../../RegexCache.ts";
import { Translation } from "../../Translation.ts";
import { Utils } from "../../Utils.ts";
import { DateHelpers } from "./DateHelpers.ts";
import { UtcDate } from "./UtcDate.ts";
const padLeft = Utils.padLeft;

// Date building blocks/keys
const YYYY = '\\d{4}';
const MM = '0[1-9]|1[0-2]';
const M_OR_MM = '0?[1-9]|1[0-2]';
const DD = '0[1-9]|[12][0-9]|3[01]';
const D_OR_DD = '0?[1-9]|[12][0-9]|3[01]';
const DDDD = '00[1-9]|0[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6]';
const WW = '0[1-9]|[1-4]\\d|5[0-3]';
const E = '[1-7]';

// Time building blocks/keys
const H = '0?[0-9]|1[0-9]|2[0-3]';
const HH = '0[0-9]|1[0-9]|2[0-3]';
const mm = '0[0-9]|[1-5][0-9]';
const ss = '0[0-9]|[1-5][0-9]';
const SSS = '\\d{3}';
const a = '[ap]m';


//todo: support UTC and GMT
//todo: rfc2822

// ISO time + TZ
const ISO_TZ = `(Z)|([+-]${HH})(:?)(${mm})`;
const ISO_TIME_TZ = `(${HH})(:?)(?:(${mm})(?:(:?)(${ss})(?:\\.(${SSS}))?)?)?(?:${ISO_TZ})?`;


// ISO date + time + TZ
const ISO = `^(${YYYY})(?:(-?)(${MM})(?:(-?)(${DD})(?:T${ISO_TIME_TZ})?)?)?$`;
const ISO_ORDINAL = `^(${YYYY})(-?)(${DDDD})(?:T${ISO_TIME_TZ})?$`;
const ISO_WEEK = `^(${YYYY})(-?)W(${WW})(?:(-?)(${E})(?:T${ISO_TIME_TZ})?)?$`;

// Human readable regex for dates
const HUMAN = (allMonthNames: string, allDayNames: string, numberSuffixes: string) => {
    return {
        regexes: {
            MDY: `(?:${allDayNames}[., ]+)?(?:(?:(${M_OR_MM})[/. -]+(${D_OR_DD})[/. -]+)|(?:(${allMonthNames})[., ]+(${D_OR_DD})(?:\\s*${numberSuffixes})?[ ,]+))(${YYYY})(?:[, ]+(.*))?$`,
            DMY: `(?:${allDayNames}[., ]+)?(?:(?:(${D_OR_DD})[/. -]+(${M_OR_MM})[/. -]+)(?:(${D_OR_DD})(?:\\s*${numberSuffixes})?[ ,]+(${allMonthNames})[., ]+))(${YYYY})(?:[, ]+(.*))?$`,
            YMD: `(?:${allDayNames}[., ]+)?(${YYYY})(?:(?:[/. -]+(${M_OR_MM})[/. -]+(${D_OR_DD}))|(?:[ ,]+(?:(${allMonthNames}))[., ]+(${D_OR_DD})(?:\\s*${numberSuffixes})?))(?:[, ]+(.*))?$`
        },
        indexes: {
            MDY: { numStyleMonth: 1, numStyleDay: 2, wordStyleMonth: 3, wordStyleDay: 4, year: 5 },
            DMY: { numStyleDay: 1, numStyleMonth: 2, wordStyleDay: 3, wordStyleMonth: 4, year: 5 },
            YMD: { year: 1, numStyleMonth: 2, numStyleDay: 3, wordStyleMonth: 4, wordStyleDay: 5 }
        }
    };
};

// Human readable regex for time
const HUMAN_TZ = `(?:(utc|gmt|z)|([+-]${HH})(?::?(${mm})))?`;
const HUMAN_TIME = `^(${H})(?:[.:]?(${mm})(?:[.:]?(${ss}))?)?(?:\\s*(${a}))?(?:\\s*${HUMAN_TZ})?$`;

// Cache for human date parsing regexes and locale-specific date components
type HumanDateCache = null | {
    humanRegexes: Record<DateOrder, string>;
    humanIndexes: Record<DateOrder, {
        numStyleMonth: number,
        numStyleDay: number,
        wordStyleMonth: number,
        wordStyleDay: number,
        year: number
    }>;
    shortMonthNames: string[],
    longMonthNames: string[],
    shortDayNames: string[],
    longDayNames: string[],
    numberSuffixes: string[];
    allMonthNamesLower: string[];
    allDayNamesLower: string[];
}

export type DateType = 'human' | 'iso' | 'isoWeek' | 'isoOrdinal' | 'instance' | 'timestamp';
export type DateOrder = 'MDY' | 'DMY' | 'YMD';
export type GenericDateInput = Date | string | number;
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type TimeMode = 'utc' | 'local';

export type HumanPrecision = 'date' | 'time' | 'timezone';
export type IsoPrecision = 'date' | 'year' | 'month' | 'day' | 'time' | 'hour' | 'minute' | 'second' | 'millisecond' | 'timezone';
export type IsoWeekPrecision = 'date' | 'week' | 'dayOfWeek' | 'time' | 'hour' | 'minute' | 'second' | 'millisecond' | 'timezone';
export type IsoOrdinalPrecision = 'date' | 'dayOfYear' | 'time' | 'hour' | 'minute' | 'second' | 'millisecond' | 'timezone';

export type HumanParseOptions = {
    dateOrder?: DateOrder;
    minPrecision?: HumanPrecision;
    maxPrecision?: HumanPrecision;
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
export type TimestampOptions = {
    isMilliseconds?: boolean;
};

class DateConverter {

    private _calendarText: Translation;
    private _defaultUtcOffsetMinutes: number;
    private _cache: HumanDateCache;

    constructor(calendarText: Translation, defaultOffsetMinutes: number = 0) {
        this._calendarText = calendarText;
        this._cache = null;
        this._defaultUtcOffsetMinutes = defaultOffsetMinutes;
    }

    private _loadCache() {
        if (this._cache) {
            return;
        }

        const calendarText = this._calendarText;
        const longMonthNames = (calendarText.getText('months/full') || []) as string[];
        const shortMonthNames = (calendarText.getText('months/short') || []) as string[];
        const numberSuffixes = (calendarText.getText('numberSuffixes') || []) as string[];
        const longDayNames = (calendarText.getText('dayNames/full') || []) as string[];
        const shortDayNames = (calendarText.getText('dayNames/short') || []) as string[];

        const allMonthNamesLower = longMonthNames.concat(shortMonthNames).map(s => s.toLowerCase());
        const allDayNamesLower = longDayNames.concat(shortDayNames).map(s => s.toLowerCase());

        const dayNamesRegex = '(?:' + allDayNamesLower.join('|') + ')';
        const monthNamesRegex = '(?:' + allMonthNamesLower.join('|') + ')';
        const numberSuffixesRegex = '(?:' + numberSuffixes.map(s => s.toLowerCase()).join('|') + ')';

        const human = HUMAN(monthNamesRegex, dayNamesRegex, numberSuffixesRegex);

        this._cache = {
            humanRegexes: human.regexes,
            humanIndexes: human.indexes,
            shortMonthNames,
            longMonthNames,
            shortDayNames,
            longDayNames,
            allMonthNamesLower,
            allDayNamesLower,
            numberSuffixes,
        };
    }

    public parseAuto(value: unknown, parseTypes: DateType[] = []): UtcDate | null {
        const anyType = parseTypes.length === 0;

        if (anyType || parseTypes.indexOf('instance') !== -1) {
            if (value instanceof Date && !isNaN(value.getTime())) {
                return new UtcDate(value, this._defaultUtcOffsetMinutes);
            }
        }
        if (anyType || parseTypes.indexOf('timestamp') !== -1) {
            const normalizedDate = this.parseTimestamp(value);
            if (normalizedDate) {
                return normalizedDate;
            }
        }
        if (anyType || parseTypes.indexOf('iso') !== -1) {
            const normalizedDate = this.parseIso(value);
            if (normalizedDate) {
                return normalizedDate;
            }
        }
        if (anyType || parseTypes.indexOf('human') !== -1) {
            const normalizedDate = this.parseHuman(value);
            if (normalizedDate) {
                return normalizedDate;
            }
        }
        if (anyType || parseTypes.indexOf('isoWeek') !== -1) {
            const normalizedDate = this.parseIsoWeek(value);
            if (normalizedDate) {
                return normalizedDate;
            }
        }
        if (anyType || parseTypes.indexOf('isoOrdinal') !== -1) {
            const normalizedDate = this.parseIsoOrdinal(value);
            if (normalizedDate) {
                return normalizedDate;
            }
        }
        return null;
    }

    public parseHuman(dateString: unknown, options: HumanParseOptions = {}): UtcDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const normalizedDateString = dateString.trim().toLowerCase();
        if (normalizedDateString.length === 0) {
            return null;
        }

        this._loadCache();
        const { humanIndexes, humanRegexes, allMonthNamesLower } = this._cache!;

        const { dateOrder = 'MDY' } = options;
        let matchResult, dateIndexes;
        switch (dateOrder) {
            case 'DMY':
                matchResult = RegexCache.get(humanRegexes.DMY).exec(normalizedDateString);
                dateIndexes = humanIndexes.DMY;
                break;
            case 'YMD':
                matchResult = RegexCache.get(humanRegexes.YMD).exec(normalizedDateString);
                dateIndexes = humanIndexes.YMD;
                break;
            case 'MDY':
            default:
                matchResult = RegexCache.get(humanRegexes.MDY).exec(normalizedDateString);
                dateIndexes = humanIndexes.MDY;
                break;
        }
        if (!matchResult) {
            return null;
        }

        // Grab date portion
        const isNumMatch = !!matchResult[dateIndexes.numStyleMonth];
        const year = Number(matchResult[dateIndexes.year]);
        const month = isNumMatch
            ? Number(matchResult[dateIndexes.numStyleMonth])
            : allMonthNamesLower.indexOf(matchResult[dateIndexes.wordStyleMonth].toLowerCase()) % 12 + 1;
        const day = isNumMatch
            ? Number(matchResult[dateIndexes.numStyleDay])
            : Number(matchResult[dateIndexes.wordStyleDay]);

        if (!DateHelpers.isValidDate(year, month, day)) {
            return null;
        }

        let hour = null, minute = null, second = null, meridiem = null,
            timezone = null, offsetHours = null, offsetMinutes = null;

        // Check time portion (if it exists)
        const timeString = matchResult[6];
        if (timeString) {

            if (options.maxPrecision === "date") {
                return null;
            }

            matchResult = RegexCache.get(HUMAN_TIME).exec(timeString);
            if (!matchResult) {
                return null;
            }

            ([
                , hour, minute = null, second = null, meridiem = null,
                timezone = null, offsetHours = null, offsetMinutes = null
            ] = matchResult);

            if (options.minPrecision === "timezone" && !timezone && !offsetHours) {
                return null;
            }
            if (options.maxPrecision === "time" && (timezone || offsetHours)) {
                return null;
            }

            if (!meridiem) {
                if (hour.length === 1) {
                    // if the hourly time is 1 digit with no meridiem, time is too ambiguous
                    return null;
                }
            }
            else {
                hour = Number(hour);
                if (hour > 12 || hour === 0) {
                    return null;
                }
                meridiem = meridiem!.toLowerCase();
                if (meridiem === 'pm' && hour < 12) {
                    hour += 12;
                }
                else if (meridiem === 'am' && hour === 12) {
                    hour = 0;
                }
            }
        }
        else if (options.minPrecision === "time") {
            // if time is required but time portion doesn't exist, return null
            return null;
        }

        let totalOffsetMinutes;
        if (offsetHours === null) {
            totalOffsetMinutes = this._defaultUtcOffsetMinutes;
        }
        else {
            const offsetHoursNum = Number(offsetHours);
            const offsetMinutesNum = Number(offsetMinutes);
            totalOffsetMinutes = Math.sign(offsetHoursNum) * (Math.abs(offsetHoursNum) * 60 + offsetMinutesNum);
        }

        return new UtcDate(
            new Date(Date.UTC(
                year,
                month - 1,
                day,
                Number(hour),
                Number(minute),
                Number(second)
            )),
            totalOffsetMinutes
        );
    }

    public parseIso(dateString: unknown, options: IsoParseOptions = {}): UtcDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const trimmedDateString = dateString.trim();
        if (trimmedDateString.length === 0) {
            return null;
        }

        const matchResult = RegexCache.get(ISO).exec(trimmedDateString);
        if (!matchResult) {
            return null;
        }

        const [
            , year, monthDelim = '', month = null, dayDelim = '', day = null,                                // date
            hour = null, minuteDelim = '', minute = null, secondDelim = '', second = null, millisecond = null,   // time
            zulu = null, offsetHours = null, offsetMinutesDelim = '', offsetMinutes = null,               // offset
        ] = matchResult;

        if (month && !day && monthDelim.length === 0) {
            // if month exists without day, delim MUST be used as per ISO format.
            return null;
        }

        // Check delims
        const delimSize = monthDelim.length;
        if (options.expanded === 'required' && !delimSize) {
            return null;
        }
        if (options.expanded === 'forbidden' && delimSize) {
            return null;
        }
        if (
            day && delimSize !== dayDelim.length ||
            minute && delimSize !== minuteDelim.length ||
            second && delimSize !== secondDelim.length ||
            offsetMinutes && delimSize !== offsetMinutesDelim.length
        ) {
            return null;
        }

        switch (options.minPrecision) {
            case "date":
            case "year":
                if (!year) {
                    return null;
                }
                break;
            case "month":
                if (!month) {
                    return null;
                }
                break;
            case "day":
                if (!day) {
                    return null;
                }
                break;
            case "time":
            case "hour":
                if (!hour) {
                    return null;
                }
                break;
            case "minute":
                if (!minute) {
                    return null;
                }
                break;
            case "second":
                if (!second) {
                    return null;
                }
                break;
            case "millisecond":
                if (!millisecond) {
                    return null;
                }
                break;
            case "timezone":
                if (!zulu && !offsetHours) {
                    return null;
                }
                break;
        }

        switch (options.maxPrecision) {
            case "year":
                if (month) {
                    return null;
                }
                break;
            case "month":
                if (day) {
                    return null;
                }
                break;
            case "date":
            case "day":
                if (hour) {
                    return null;
                }
                break;
            case "hour":
                if (minute) {
                    return null;
                }
                break;
            case "minute":
                if (second) {
                    return null;
                }
                break;
            case "second":
                if (millisecond) {
                    return null;
                }
                break;
            case "time":
            case "millisecond":
                if (zulu || offsetHours) {
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

        let totalOffsetMinutes;
        if (offsetHours === null && zulu === null) {
            totalOffsetMinutes = this._defaultUtcOffsetMinutes;
        }
        else {
            const offsetHoursNum = Number(offsetHours);
            const offsetMinutesNum = Number(offsetMinutes);
            totalOffsetMinutes = Math.sign(offsetHoursNum) * (Math.abs(offsetHoursNum) * 60 + offsetMinutesNum);
        }

        return new UtcDate(
            new Date(Date.UTC(
                yearNum,
                monthNum - 1,
                dayNum,
                Number(hour),
                Number(minute),
                Number(second),
                Number(millisecond)
            )),
            totalOffsetMinutes
        );
    }

    public parseIsoOrdinal(dateString: unknown, options: IsoOrdinalParseOptions = {}): UtcDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const trimmedDateString = dateString.trim();
        if (trimmedDateString.length === 0) {
            return null;
        }

        const matchResult = RegexCache.get(ISO_ORDINAL).exec(trimmedDateString);
        if (!matchResult) {
            return null;
        }

        const [
            , year, dayDelim = '', dayOfYear = null,                                                       // date
            hour = null, minuteDelim = '', minute = null, secondDelim = '', second = null, millisecond = null,   // time
            zulu = null, offsetHours = null, offsetMinutesDelim = '', offsetMinutes = null,               // offset
        ] = matchResult;

        // Check delims
        const delimSize = dayDelim.length;
        if (options.expanded === 'required' && !delimSize) {
            return null;
        }
        if (options.expanded === 'forbidden' && delimSize) {
            return null;
        }
        if (
            minute && delimSize !== minuteDelim.length ||
            second && delimSize !== secondDelim.length ||
            offsetMinutes && delimSize !== offsetMinutesDelim.length
        ) {
            return null;
        }

        switch (options.minPrecision) {
            case "date":
            case "dayOfYear":
                if (!dayOfYear) {
                    return null;
                }
                break;
            case "time":

            case "hour":
                if (!hour) {
                    return null;
                }
                break;
            case "minute":
                if (!minute) {
                    return null;
                }
                break;
            case "second":
                if (!second) {
                    return null;
                }
                break;
            case "millisecond":
                if (!millisecond) {
                    return null;
                }
                break;
            case "timezone":
                if (!zulu && !offsetHours) {
                    return null;
                }
                break;
        }

        switch (options.maxPrecision) {
            case "date":
            case "dayOfYear":
                if (hour) {
                    return null;
                }
                break;
            case "hour":
                if (minute) {
                    return null;
                }
                break;
            case "minute":
                if (second) {
                    return null;
                }
                break;
            case "second":
                if (millisecond) {
                    return null;
                }
                break;
            case "time":
            case "millisecond":
                if (zulu || offsetHours) {
                    return null;
                }
                break;
        }

        const yearNum = Number(year);
        const dayOfYearNum = Number(dayOfYear);

        if (dayOfYearNum === 366 && !DateHelpers.isLeapYear(yearNum)) {
            return null;
        }

        let totalOffsetMinutes;
        if (offsetHours === null && zulu === null) {
            totalOffsetMinutes = this._defaultUtcOffsetMinutes;
        }
        else {
            const offsetHoursNum = Number(offsetHours);
            const offsetMinutesNum = Number(offsetMinutes);
            totalOffsetMinutes = Math.sign(offsetHoursNum) * (Math.abs(offsetHoursNum) * 60 + offsetMinutesNum);
        }

        return new UtcDate(
            new Date(Date.UTC(
                yearNum,
                0,
                dayOfYearNum,
                Number(hour),
                Number(minute),
                Number(second),
                Number(millisecond)
            )),
            totalOffsetMinutes
        );
    }

    public parseIsoWeek(dateString: unknown, options: IsoWeekParseOptions = {}): UtcDate | null {
        if (typeof dateString !== 'string') {
            return null;
        }
        const trimmedDateString = dateString.trim();
        if (trimmedDateString.length === 0) {
            return null;
        }

        const matchResult = RegexCache.get(ISO_WEEK).exec(trimmedDateString);
        if (!matchResult) {
            return null;
        }

        const [
            , year, weekDelim = '', week, dayDelim = '', dayOfWeek = null,                                   // date
            hour = null, minuteDelim = '', minute = null, secondDelim = '', second = null, millisecond = null,   // time
            zulu = null, offsetHours = null, offsetMinutesDelim = '', offsetMinutes = null,               // offset
        ] = matchResult;

        // check delims
        const delimSize = weekDelim.length;
        if (options.expanded === 'required' && !delimSize) {
            return null;
        }
        if (options.expanded === 'forbidden' && delimSize) {
            return null;
        }
        if (
            dayOfWeek && delimSize !== dayDelim.length ||
            minute && delimSize !== minuteDelim.length ||
            second && delimSize !== secondDelim.length ||
            offsetMinutes && delimSize !== offsetMinutesDelim.length
        ) {
            return null;
        }

        switch (options.minPrecision) {
            case "date":
            case "week":
                if (!week) {
                    return null;
                }
                break;
            case "dayOfWeek":
                if (!dayOfWeek) {
                    return null;
                }
                break;
            case "time":
            case "hour":
                if (!hour) {
                    return null;
                }
                break;
            case "minute":
                if (!minute) {
                    return null;
                }
                break;
            case "second":
                if (!second) {
                    return null;
                }
                break;
            case "millisecond":
                if (!millisecond) {
                    return null;
                }
                break;
            case "timezone":
                if (!zulu && !offsetHours) {
                    return null;
                }
                break;
        }

        switch (options.maxPrecision) {
            case "week":
                if (dayOfWeek) {
                    return null;
                }
                break;
            case "date":
            case "dayOfWeek":
                if (hour) {
                    return null;
                }
                break;
            case "hour":
                if (minute) {
                    return null;
                }
                break;
            case "minute":
                if (second) {
                    return null;
                }
                break;
            case "second":
                if (millisecond) {
                    return null;
                }
                break;
            case "time":
            case "millisecond":
                if (zulu || offsetHours) {
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

        let totalOffsetMinutes;
        if (offsetHours === null && zulu === null) {
            totalOffsetMinutes = this._defaultUtcOffsetMinutes;
        }
        else {
            const offsetHoursNum = Number(offsetHours);
            const offsetMinutesNum = Number(offsetMinutes);
            totalOffsetMinutes = Math.sign(offsetHoursNum) * (Math.abs(offsetHoursNum) * 60 + offsetMinutesNum);
        }

        return new UtcDate(date, totalOffsetMinutes);
    }

    public parseTimestamp(value: unknown, options: TimestampOptions = {}): UtcDate | null {
        const { isMilliseconds = false } = options;
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

        return new UtcDate(date, this._defaultUtcOffsetMinutes);
    }

    public format(utcDate: UtcDate, formatString: string, mode: TimeMode = 'utc'): string {

        let offsetMinutes, date;
        if (mode === 'utc') {
            offsetMinutes = 0;
            date = utcDate.date;
        }
        else {
            offsetMinutes = utcDate.offsetMinutes;
            date = utcDate.localDate;
        }

        this._loadCache();

        const yearNum = date.getUTCFullYear();
        const monthNum = date.getUTCMonth() + 1;
        const dayNum = date.getUTCDate();
        const hourNum = date.getUTCHours();
        const minuteNum = date.getUTCMinutes();
        const secondNum = date.getUTCSeconds();
        const millisecondNum = date.getUTCMilliseconds();

        const tokens: Record<string, () => string> = {
            YYYY: () => padLeft(String(yearNum), 4, '0'),
            YY: () => padLeft(String(yearNum % 100), 2, '0'),
            MMMM: () => this._cache!.longMonthNames[monthNum - 1],
            MMM: () => this._cache!.shortMonthNames[monthNum - 1],
            MM: () => padLeft(String(monthNum), 2, '0'),
            M: () => String(monthNum),
            DDDD: () => padLeft(String(DateHelpers.getDayOfYear(date)), 3, '0'),
            DDD: () => String(DateHelpers.getDayOfYear(date)),
            DD: () => padLeft(String(dayNum), 2, '0'),
            D: () => String(dayNum),
            dddd: () => this._cache!.longDayNames[date.getUTCDay() % 7],
            ddd: () => this._cache!.shortDayNames[date.getUTCDay() % 7],
            d: () => String(date.getUTCDay()),
            ww: () => padLeft(String(DateHelpers.getIsoWeek(date)), 2, '0'),
            w: () => String(DateHelpers.getIsoWeek(date)),
            E: () => String(date.getUTCDay() || 7),
            HH: () => padLeft(String(hourNum), 2, '0'),
            H: () => String(hourNum),
            hh: () => padLeft(String(hourNum % 12 || 12), 2, '0'),
            h: () => String(hourNum % 12 || 12),
            mm: () => padLeft(String(minuteNum), 2, '0'),
            m: () => String(minuteNum),
            ss: () => padLeft(String(secondNum), 2, '0'),
            s: () => String(secondNum),
            SSS: () => padLeft(String(millisecondNum), 3, '0'),
            A: () => hourNum < 12 ? 'AM' : 'PM',
            a: () => hourNum < 12 ? 'am' : 'pm',
            Z: () =>
                (offsetMinutes >= 0 ? '+' : '-') +
                padLeft(String(Math.floor(Math.abs(offsetMinutes) / 60)), 2, '0') +
                ':' +
                padLeft(String(Math.abs(offsetMinutes) % 60), 2, '0'),
            z: () =>
                (offsetMinutes >= 0 ? '+' : '-') +
                padLeft(String(Math.floor(Math.abs(offsetMinutes) / 60)), 2, '0') +
                padLeft(String(Math.abs(offsetMinutes) % 60), 2, '0')
        };

        // Replace all recognized tokens in one pass, while preserving bracket-wrapped literals like [YYYY].
        return formatString.replace(/\[?(?:YYYY|YY|MMMM|MMM|MM|M|DDDD|DDD|DD|D|dddd|ddd|d|ww|w|E|HH|H|hh|h|mm|m|ss|s|SSS|A|a|Z|z)\]?/g, (token, offset, source) => {
            if (token.slice(0, 1) === '[' && token.slice(-1) === ']') {
                return token.slice(1, -1);
            }
            return tokens[token]();
        });
    }
}

export { DateConverter };

