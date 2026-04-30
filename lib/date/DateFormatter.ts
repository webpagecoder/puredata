'use strict';

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

class DateFormatter {

    private _locale: Locale;
    private _cache: HumanDateCache;
    private _dateOrder: 'MDY' | 'DMY' | 'YMD';

    constructor(locale: Locale, dateOrder: 'MDY' | 'DMY' | 'YMD' = 'MDY') {
        this._locale = locale;
        this._cache = null;
        this._dateOrder = dateOrder;
    }

    parse(value: unknown, parseTypes: DateType[] = []): MetaDate | null {
        const anyType = parseTypes.length === 0;

        if (anyType || parseTypes.indexOf('object') !== -1) {
            if (value instanceof Date && !isNaN(value.getTime())) {
                return new MetaDate(value);
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

        const allMonthNamesLower = longMonthNames.concat(shortMonthNames).map(s => s.toLowerCase());
        const allDayNamesLower = longDayNames.concat(shortDayNames).map(s => s.toLowerCase());

        const dayNamesRegex = '(?:' + allDayNamesLower.join('|') + ')';
        const monthNamesRegex = '(?:' + allMonthNamesLower.join('|') + ')';
        const numberSuffixesRegex = '(?:' + numberSuffixes.map(s => s.toLowerCase()).join('|') + ')';

        let humanRegex: string[], dateIndexes: Record<string, number>;
        switch (this._dateOrder) {
            case 'MDY':
                dateIndexes = { day: 2, month: 1, year: 3 };
                humanRegex = HUMAN_MDY(monthNamesRegex, dayNamesRegex, numberSuffixesRegex);
                break;
            case 'DMY':
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

            if (options.maxPrecision === "date") {
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

            if (options.minPrecision === "timezone" && !timezone && !offsetHour) {
                return null;
            }
            if (options.maxPrecision === "time" && (timezone || offsetHour)) {
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
        else if (options.minPrecision === "time") {
            // if time is required but time portion doesn't exist, return null
            return null;
        }

        if (options.cleanInput === undefined || options.cleanInput) {
            dateString = dateString.replace(/([/. -,:])\1+/g, '$1');
        }

        const offsetHourNum = Number(offsetHour);
        const offsetMinuteNum = Number(offsetMinute);
        return new MetaDate({
            raw: dateString as string,
            date: new Date(Date.UTC(
                year, 
                month - 1, 
                day, 
                Number(hour) + offsetHourNum, 
                Number(minute) + offsetMinuteNum, 
                Number(second)
            )),
            offsetHour: offsetHourNum,
            offsetMinute: offsetMinuteNum
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
            offsetMinute && delimSize !== offsetMinuteDelim.length
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
                if (!zulu && !offsetHour) {
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

        const offsetHourNum = Number(offsetHour);
        const offsetMinuteNum = Number(offsetMinute);
        return new MetaDate({
            raw: dateString,
            date: new Date(Date.UTC(
                yearNum,
                monthNum - 1,
                dayNum,
                Number(hour) + offsetHourNum,
                Number(minute) + offsetMinuteNum,
                Number(second),
                Number(millisecond)
            )),
            offsetHour: offsetHourNum,
            offsetMinute: offsetMinuteNum
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
        if (options.expanded === 'required' && !delimSize) {
            return null;
        }
        if (options.expanded === 'forbidden' && delimSize) {
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
                if (!zulu && !offsetHour) {
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
            offsetMinute && delimSize !== offsetMinuteDelim.length
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
                if (!zulu && !offsetHour) {
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

    format(metaDate: MetaDate, formatString: string): string {
        const date = metaDate.date;
        const offsetHour = metaDate.offsetHour || 0;
        const offsetMinute = metaDate.offsetMinute || 0;

        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours();
        const minute = date.getUTCMinutes();
        const second = date.getUTCSeconds();
        const millisecond = date.getUTCMilliseconds();
    }


}

export { DateFormatter };
