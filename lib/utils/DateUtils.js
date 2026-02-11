
'use strict';

const RegexCache = require('../cache/RegexCache.js');
const NumberUtils = require('./NumberUtils.js');
const StringUtils = require('./StringUtils.js');
const DATE_TYPES = require('./DateTypes.js');

class DateUtils {
    
    static areDayAndDateValid(dateParts = {}) {
        const { YYYY, MM, DD } = dateParts;
        if (YYYY && MM && DD && +DD > this.getNumDaysInMonth(YYYY, MM)) {
            return false;
        }
        return true;
    }

    static getNumDaysInMonth(year, month) {
        month = +month;
        return [4, 6, 9, 11].indexOf(month) > -1 && 30
            || month === 2 && (this.isLeapYear(year) ? 29 : 28)
            || [1, 3, 5, 7, 8, 10, 12].indexOf(month) > -1 && 31
            || -1;
    }

    static isLeapYear(year) {
        return new Date(Date.UTC(+year, 1, 29)).getUTCDate() === 29;
    }

    static has53IsoWeeks(year) {
        const date = new Date(Date.UTC(+year, 0, 1));
        if (!date) {
            return null;
        }
        const jan1Day = date.getUTCDay();
        return jan1Day === 4 || (jan1Day === 3 && this.isLeapYear(year));
    }

    static parse(value, parseTypes = []) {
        const anyType = parseTypes.length === 0;

        if (value instanceof Date && !isNaN(value.getTime())) {
            return { date: value, parsed: {}, type: DATE_TYPES.OBJECT };
        }

        if (anyType || parseTypes.indexOf(DATE_TYPES.TIMESTAMP) > -1) {
            const result = this.parseFromTimestamp(value);
            if (result) {
                const { date, parsed } = result;
                return { date, parsed, type: DATE_TYPES.TIMESTAMP };
            }
        }

        if (anyType || parseTypes.indexOf(DATE_TYPES.ISO) > -1) {
            const result = this.parseFromIso(value);
            if (result) {
                const { date, parsed } = result;
                return { date, parsed, type: DATE_TYPES.ISO };
            }
        }

        if (anyType || parseTypes.indexOf(DATE_TYPES.HUMAN) > -1) {
            const result = this.parseFromHuman(value);
            if (result) {
                const { date, parsed } = result;
                return { date, parsed, type: DATE_TYPES.HUMAN };
            }
        }

        if (anyType || parseTypes.indexOf(DATE_TYPES.ISO_WEEK) > -1) {
            const result = this.parseFromIsoWeek(value);
            if (result) {
                const { date, parsed } = result;
                return { date, parsed, type: DATE_TYPES.ISO_WEEK };
            }
        }

        if (anyType || parseTypes.indexOf(DATE_TYPES.ISO_ORDINAL) > -1) {
            const result = this.parseFromIsoOrdinal(value);
            if (result) {
                const { date, parsed } = result;
                return { date, parsed, type: DATE_TYPES.ISO_ORDINAL };
            }
        }

        return null;
    }

    static parseFromHuman(dateString, {
        monthBeforeDay = true,
        numberSuffixes,
        fullMonths,
        shortMonths
    } = {}) {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }

        const allMonths = fullMonths.concat(shortMonths).map(name => name.toLowerCase());

        // GENERIC DATE REGEXES
        const yearRegex = '(\\d{4})';                   // 4 digit year
        const monthRegex = '(1[012]|0?[1-9])';          // 2 or 4 digit month
        const dayNumRegex = '(3[01]|[12]\\d|0?[1-9])(?:' + numberSuffixes.join('|') + ')?';  // 2 or 4 digit date num
        const namedDayRegex = '(?:[a-z]{1,20})';
        const allMonthsRegex = '(' + allMonths.map(name => name.toLowerCase()).join('|') + ')';

        // Normalize date string as much as possible with whitespace, cmmOffsetas, etc
        dateString = dateString
            .trim()
            .replace(/,/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/ ?([/.:-]) ?/g, '$1');

        // Index order: year, month, date
        const dateRegexes = [
            [
                [allMonthsRegex, dayNumRegex, yearRegex],  // December 31 2024
                [4, 2, 3]
            ],
            [
                [dayNumRegex, allMonthsRegex, yearRegex],  // 31 December 2024
                [4, 3, 2]
            ],
            [
                [yearRegex, allMonthsRegex, dayNumRegex],  // 2024 December 31
                [2, 3, 4]
            ],
            [
                [namedDayRegex, allMonthsRegex, dayNumRegex, yearRegex],  // Tue August 06 2024
                [4, 2, 3]
            ],
            [
                [namedDayRegex, dayNumRegex, allMonthsRegex, yearRegex],  // Tue 06 August 2024
                [4, 3, 2]
            ],
            [
                [yearRegex, monthRegex, dayNumRegex],  // 2024 12 31
                [2, 3, 4]
            ],
            monthBeforeDay ?
                [
                    [monthRegex, dayNumRegex, yearRegex],  // 12 31 2024
                    [4, 2, 3]
                ] :
                [
                    [dayNumRegex, monthRegex, yearRegex],  // 31 12 2024
                    [4, 3, 2]
                ]
        ];

        let matchResult, indexes;
        for (const [curPattern, curIndexes] of dateRegexes) {
            matchResult = RegexCache(`^(?=(${curPattern.join('[/. -]')}))\\1(.*)$`, 'i').exec(dateString);
            if (matchResult) {
                indexes = curIndexes;
                break;
            }
        }
        if (!indexes) {
            return null;
        }

        const timePortion = matchResult[Math.max(...indexes) + 1];
        let HH, mm, ss, sss, amPM, HHOffset, mmOffset;

        if (timePortion) {
            const timeRegex =
                '^(00|0?[1-9]|1[0-9]|2[0-3])' +                // Hours: 0–23, optional leading zero
                '(:?)([0-5][0-9])?' +                          // Optional minutes with optional colon
                '(?:\\2([0-5][0-9]))?' +                           // Optional seconds, matching colon from minutes
                '(?:\\.(\\d{1,3}))?' +                         // Optional milliseconds (.123)
                '\\s?' +                                       // Optional space
                '(AM|PM)?' +                                   // Optional AM/PM
                '\\s?' +                                       // Optional space before timezone
                '(?:' +                                        // Begin optional timezone group
                '(?:Z|UTC|GMT)' +                              //   Z, UTC, or GMT
                '|' +                                          //   OR
                '(?:([+-](?:0[0-9]|1[0-9]|2[0-3]))' +          //   Timezone hour offset
                ':?(?:(0[0-9]|[1-5][0-9]))?' +                 //   Optional minute offset
                ')' +
                ')?' +                                         // End optional timezone
                '$';
            const timeMatch = RegexCache(timeRegex, 'i').exec(timePortion);
            if (!timeMatch) {
                return null;
            }
            [, HH, , mm, ss, sss, amPM, HHOffset, mmOffset] = timeMatch;

            if (amPM) {
                HH = +HH;
                if (HH > 12 || HH < 1) {
                    return null;
                }
                const amPMLower = amPM.toLowerCase();
                if (amPMLower === 'pm' && HH < 12) {
                    HH += 12;
                }
                else if (amPMLower === 'am' && HH === 12) {
                    HH = 0;
                }
            }
        }

        let [YYYY, MM, DD] = indexes.map(index => matchResult[index]);

        if (MM) {
            if (!/^[0-9]/.test(MM)) {
                const monthNum = allMonths.indexOf(MM.toLowerCase());
                if (monthNum === -1) {
                    return null;
                }
                MM = monthNum % 12 + 1;
            }
            MM = +MM;
        }

        if (!self.areDayAndDateValid({ YYYY, MM, DD })) {
            return null;
        }

        // Convert to numbers
        YYYY = +YYYY;
        MM = +MM
        DD = +DD
        if (HH !== undefined) {
            HH = +HH;
        }
        if (mm !== undefined) {
            mm = +mm;
        }
        if (ss !== undefined) {
            ss = +ss;
        }
        if (sss !== undefined) {
            sss = +sss;
        }
        if( HHOffset !== undefined) {
            HHOffset = +HHOffset;
        }
        if( mmOffset !== undefined) {
            mmOffset = +mmOffset;
        }

        const timestamp = Date.UTC(
            YYYY,
            MM - 1,
            DD,
            HH || 0,
            mm || 0,
            ss || 0,
            sss || 0
        );

        return {
            date: new Date(
                timestamp +
                (Math.abs(HHOffset || 0) * 3600000 + (mmOffset || 0) * 60000) *
                NumberUtils.getSignMultiplier(HHOffset || 0)
            ),
            parsed: {
                YYYY,
                MM,
                DD,
                HH,
                mm,
                ss,
                sss,
                HHOffset,
                mmOffset
            }
        };
    }

    static parseFromIso(dateString) {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }

        // Date + Time + UTC offset
        const isoDateTimeOffsetRegex =
            '^' +
            '(?!\\d{6}$)' + // Disallow YYYYMM, must have dash
            '(?![^-]*-[^T]*T.*?[^.]\\d{3,})' + // Disallow extended date followed by basic time/offset
            '(?!\\d{5,}T(?![^:]*$))' + // Disallow basic date followed by extended time/offset

            // ISO date regex, eg 2024-06-12
            '(?:(?:(?=((\\d{4})(?:(-)?(1[012]|0[1-9]))?(?:\\3(3[01]|[12]\\d|0[1-9]))?))\\1))' +

            // Time portion - End with a time offset, eg T12:00:23.123, Z, or nothing
            '(?:T' +
            '(?!\\d{2}:.*?[^.]\\d{3,})' + // Disallow extended time followed by basic offset
            '(?!\\d{3,}(?![^:]*$))' + // Disallow basic time followed by extended offset
            '(?:(0[0-9]|1[0-9]|2[0-3])(?:(?:(:)?(0[0-9]|[1-5][0-9]))(?:(?:\\7(0[0-9]|[1-5][0-9])(?:\\.(\\d{1,3}))?)?)?)?)' + // Time, eg +11:30:59.123

            // UTC offset, eg +11:30
            '(?:' +
            '(?![+-][^Z]*Z)' + // Disallow both an offset and a "Z"
            '(?:([+-](?:0[0-9]|1[0-9]|2[0-3]))(?:(?:(:)?(0[0-9]|[1-5][0-9])))?)' +
            ')?' +
            ')?' +
            '(Z)?' +
            '$';

        const matchResult = RegexCache(isoDateTimeOffsetRegex, 'i').exec(dateString);
        if (!matchResult) {
            return null;
        }
        let [, , YYYY, dash, MM, DD, HH, , mm, ss, sss, HHOffset, , mmOffset, Z] = matchResult;

        if (!self.areDayAndDateValid({ YYYY, MM, DD })) {
            return null;
        }

        // Convert to numbers
        YYYY = +YYYY;
        MM !== undefined && (MM = +MM);
        DD !== undefined && (DD = +DD);
        HH !== undefined && (HH = +HH);
        mm !== undefined && (mm = +mm);
        ss !== undefined && (ss = +ss);
        sss !== undefined && (sss = +sss);
        HHOffset !== undefined && (HHOffset = +HHOffset);
        mmOffset !== undefined && (mmOffset = +mmOffset);

        YYYY = +YYYY;
        if (MM !== undefined) {
            MM = +MM;
        }
        if (DD !== undefined) {
            DD = +DD;
        }
        if (HH !== undefined) {
            HH = +HH;
        }
        if (mm !== undefined) {
            mm = +mm;
        }
        if (ss !== undefined) {
            ss = +ss;
        }
        if (sss !== undefined) {
            sss = +sss;
        }
        HHOffset = HHOffset === undefined ? 0 : +HHOffset;
        mmOffset = mmOffset === undefined ? 0 : +mmOffset;

        const timestamp = Date.UTC(
            YYYY,
            MM - 1,
            DD,
            HH || 0,
            mm || 0,
            ss || 0,
            sss || 0
        );

        return {
            date: new Date(
                timestamp +
                (Math.abs(HHOffset) * 3600000 + mmOffset * 60000) *
                NumberUtils.getSignMultiplier(HHOffset)
            ),
            parsed: {
                YYYY,
                MM,
                DD,
                HH,
                mm,
                ss,
                sss,
                HHOffset,
                mmOffset,
                Z,
                isExtended: !!dash
            }
        };
    }

    static parseFromIsoOrdinal(dateString) {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }
        // Ordinal date: YYYY-DDD
        const matchResult = RegexCache(
            '^(\\d{4})(?:(-)?(00[1-9]|0[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6]))$'
        ).exec(dateString);
        if (!matchResult) {
            return null;
        }
        const [, YYYY, dash, DDD] = matchResult;
        if (+DDD === 366 && !self.isLeapYear(YYYY)) {
            return null;
        }

        const date = new Date(Date.UTC(YYYY, 0, 1));
        date.setUTCDate(date.getUTCDate() + DDD - 1);
        return {
            date,
            parsed: {
                YYYY: +YYYY,
                DDD: +DDD,
                dash,
                isExtended: !!dash
            }
        };
    }

    static parseFromIsoWeek(dateString) {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }
        // Parse week format: YYYY-Www or YYYY-Www-D
        const matchResult = RegexCache(
            '^(\\d{4})(-)?W(0[1-9]|[1-4]\\d|5[0-3])(?:\\2([1-7]))?$'
        ).exec(dateString);
        if (!matchResult) {
            return null;
        }
        let [, YYYY, dash, ww, D] = matchResult;
        if (+ww === 53 && !self.has53IsoWeeks(YYYY)) {
            return null;
        }

        const simple = new Date(Date.UTC(YYYY, 0, 4)); // Jan 4th is always in week 1
        // Calculate the date of the Monday of week 1
        const date = new Date(Date.UTC(YYYY, 0, 4 - (simple.getUTCDay() || 7) + 1)); // Sunday is 0, so convert to 7
        date.setUTCDate(date.getUTCDate() + (ww - 1) * 7 + (D - 1));
        return {
            date,
            parsed: {
                YYYY: +YYYY,
                ww: +ww,
                D: +(D || 1),
                dash,
                isExtended: !!dash
            }
        };
    }

    static parseFromTimestamp(value) {
        if (Number.isInteger(value) && !isNaN(new Date(value))) {
            return {
                date: new Date(Number(value)),
                parsed: {}
            };
        }
        return null;
    }

    static shiftDateByOffset(date, utcOffset) {
        if (!(date instanceof Date)) {
            return null;
        }
        let [hours, minutes] = utcOffset;
        hours = Number(hours);
        minutes = Number(minutes);
        const newDate = new Date(date);
        if (hours || minutes) {
            newDate.setUTCHours(newDate.getUTCHours() + hours);
            newDate.setUTCMinutes(newDate.getUTCMinutes() + minutes);
        }
        return newDate;
    }

    static toIso(date) {
        return date.toISOString();
    }

    static toIsoOrdinal(date) {
        const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        return `${date.getUTCFullYear()}-${StringUtils.padLeft(dayOfYear.toString(), 3, '0')}`;
    }

    static toIsoWeek(date) {
        const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const dayNum = target.getUTCDay() || 7;
        target.setUTCDate(target.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
        const weekNum = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
        return `${target.getUTCFullYear()}-W${StringUtils.padLeft(weekNum.toString(), 2, '0')}-${dayNum}`;
    }

    static toTimestamp(date) {
        return date.getTime();
    }

}

const self = module.exports = DateUtils;
