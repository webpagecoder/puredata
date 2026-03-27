'use strict';

import { RegexCache } from '../cache/RegexCache.ts';
import { Locale } from '../Locale.ts';


export type DateLike = Date | string | number;

export enum DATE_TYPE {
    HUMAN,
    ISO,
    ISO_BASIC,
    ISO_WEEK,
    ISO_WEEK_BASIC,
    ISO_ORDINAL,
    ISO_ORDINAL_BASIC,
    OBJECT,
    TIME_ONLY,
    TIME_ONLY_BASIC,
    TIMESTAMP,
};

export type DateParts = {
    year?: number;
    month?: number;
    week?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
    hourOffset?: number;
    minuteOffset?: number;
    isBasic?: boolean;
}

/**
 * 
 * @param dateParts 
 * @returns 
 */
export function areDayAndDateValid(dateParts: Record<string, unknown> = {}): boolean {
    let { YYYY, MM, DD } = dateParts as { YYYY?: unknown; MM?: unknown; DD?: unknown };
    YYYY = +(YYYY as any) || 0;
    MM = +(MM as any) || 0;
    DD = +(DD as any) || 0;
    const numDaysInMonth = [4, 6, 9, 11].indexOf(MM as number) > -1 && 30
        || (MM as number) === 2 && (isLeapYear(YYYY as number) ? 29 : 28)
        || [1, 3, 5, 7, 8, 10, 12].indexOf(MM as number) > -1 && 31
        || -1;
    if ((YYYY as number) && (MM as number) && (DD as number) && +(DD as number) > numDaysInMonth) {
        return false;
    }
    return true;
}

export function isLeapYear(year: number): boolean {
    return new Date(Date.UTC(+year, 1, 29)).getUTCDate() === 29;
}

export function getSign(x: unknown): number {
    const num = +(x as any);
    return (Math.sign(num) === -1 || 1 / num === -Infinity) ? -1 : 1;
}

class BetterDate {
    private static _locale: Locale;
    private _date: Date;
    private _parts: DateParts;
    private _type: DATE_TYPE;

    private constructor(date: Date, type: DATE_TYPE, parts?: DateParts) {
        this._date = date;
        this._type = type;
        this._parts = parts || {};
    }

    static setLocale(locale: Locale): void {
        this._locale = locale;
    }

    static parseDate(value: unknown, parseTypes: DATE_TYPE[] = []): BetterDate | null {
        const anyType = parseTypes.length === 0;
        if (anyType || parseTypes.indexOf(DATE_TYPE.OBJECT) > -1) {
            if (value instanceof Date && !isNaN(value.getTime())) {
                return new this(value, DATE_TYPE.OBJECT);
            }
        }
        if (anyType || parseTypes.indexOf(DATE_TYPE.TIMESTAMP) > -1) {
            const result = this.parseDateFromTimestamp(value);
            if (result) {
                const { date, parts } = result;
                return new this(date, DATE_TYPE.TIMESTAMP, parts);
            }
        }
        if (anyType || parseTypes.indexOf(DATE_TYPE.ISO) > -1) {
            const result = this.parseDateFromIso(value);
            if (result) {
                const { date, parts } = result;
                return new this(date, DATE_TYPE.ISO, parts);
            }
        }
        if (anyType || parseTypes.indexOf(DATE_TYPE.HUMAN) > -1) {
            const result = this.parseDateFromHuman(value);
            if (result) {
                const { date, parts } = result;
                return new this(date, DATE_TYPE.HUMAN, parts);
            }
        }

        if (anyType || parseTypes.indexOf(DATE_TYPE.ISO_WEEK) > -1) {
            const result = this.parseDateFromIsoWeek(value);
            if (result) {
                const { date, parts } = result;
                return new this(date, DATE_TYPE.ISO_WEEK, parts);
            }
        }

        if (anyType || parseTypes.indexOf(DATE_TYPE.ISO_ORDINAL) > -1) {
            const result = this.parseDateFromIsoOrdinal(value);
            if (result) {
                const { date, parts } = result;
                return new this(date, DATE_TYPE.ISO_ORDINAL, parts);
            }
        }

        return null;
    }

    static parseDateFromHuman(dateString: unknown, {
        monthBeforeDay = true,
        numberSuffixes = DEFAULT_LANGUAGE.calendar.numberSuffixes,
        fullMonths = DEFAULT_LANGUAGE.calendar.months.full,
        shortMonths = DEFAULT_LANGUAGE.calendar.months.short
    }: { monthBeforeDay?: boolean; numberSuffixes?: string[]; fullMonths?: string[]; shortMonths?: string[] } = {}): { date: Date; parts: Record<string, unknown> } | null {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }

        const allMonths = fullMonths.concat(shortMonths).map((name: string): string => name.toLowerCase());

        const yearRegex = '(\\d{4})';
        const monthRegex = '(1[012]|0?[1-9])';
        const dayNumRegex = '(3[01]|[12]\\d|0?[1-9])(?:' + numberSuffixes.join('|') + ')?';
        const namedDayRegex = '(?:[a-z]{1,20})';
        const allMonthsRegex = '(' + allMonths.map((name: string): string => name.toLowerCase()).join('|') + ')';

        dateString = (dateString as string)
            .trim()
            .replace(/,/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/ ?([/.:-]) ?/g, '$1');

        const dateRegexes: [string[], number[]][] = [
            [[allMonthsRegex, dayNumRegex, yearRegex], [4, 2, 3]],
            [[dayNumRegex, allMonthsRegex, yearRegex], [4, 3, 2]],
            [[yearRegex, allMonthsRegex, dayNumRegex], [2, 3, 4]],
            [[namedDayRegex, allMonthsRegex, dayNumRegex, yearRegex], [4, 2, 3]],
            [[namedDayRegex, dayNumRegex, allMonthsRegex, yearRegex], [4, 3, 2]],
            [[yearRegex, monthRegex, dayNumRegex], [2, 3, 4]],
            ...(monthBeforeDay
                ? [[[monthRegex, dayNumRegex, yearRegex], [4, 2, 3]] as [string[], number[]]]
                : [[[dayNumRegex, monthRegex, yearRegex], [4, 3, 2]] as [string[], number[]]])
        ];

        let matchResult: RegExpExecArray | null, indexes: number[] | undefined;
        for (const [curPattern, curIndexes] of dateRegexes) {
            matchResult = RegexCache(`^(?=(${(curPattern as string[]).join('[/. -]')}))\\1(.*)$`, 'i').exec(dateString);
            if (matchResult) {
                indexes = curIndexes;
                break;
            }
        }
        if (!indexes) {
            return null;
        }

        const timePortion = matchResult![Math.max(...indexes) + 1];
        let HH, mm, ss, sss, amPM, HHOffset, mmOffset;

        if (timePortion) {
            const timeRegex =
                '^(00|0?[1-9]|1[0-9]|2[0-3])' +
                '(:?)([0-5][0-9])?' +
                '(?:\\2([0-5][0-9]))?' +
                '(?:\\.(\\d{1,3}))?' +
                '\\s?' +
                '(AM|PM)?' +
                '\\s?' +
                '(?:' +
                '(?:Z|UTC|GMT)' +
                '|' +
                '(?:([+-](?:0[0-9]|1[0-9]|2[0-3]))' +
                ':?(?:(0[0-9]|[1-5][0-9]))?' +
                ')' +
                ')?' +
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

        let [YYYY, MM, DD] = indexes.map((index: number): unknown => matchResult![index]) as (string | number | undefined)[];

        if (MM) {
            if (!/^[0-9]/.test(MM as string)) {
                const monthNum = allMonths.indexOf((MM as string).toLowerCase());
                if (monthNum === -1) {
                    return null;
                }
                MM = monthNum % 12 + 1;
            }
            MM = +(MM as string);
        }

        if (!areDayAndDateValid({ YYYY: YYYY as string, MM: MM as number, DD: DD as string })) {
            return null;
        }

        YYYY = +(YYYY as string);
        MM = +(MM as number);
        DD = +(DD as string);
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
        if (HHOffset !== undefined) {
            HHOffset = +HHOffset;
        }
        if (mmOffset !== undefined) {
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

        return new BetterDate({
            date: new Date(
                timestamp +
                (Math.abs(HHOffset || 0) * 3600000 + (mmOffset || 0) * 60000) *
                getSign(HHOffset || 0)
            ),
            parts: {
                YYYY,
                MM,
                DD,
                HH,
                mm,
                ss,
                sss,
                HHOffset,
                mmOffset
            },
            format: DATE_TYPE.HUMAN,
            value: dateString
        });
    }

    static parseDateFromIso(dateString: unknown): { date: Date; parts: Record<string, unknown> } | null {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }

        const isoDateTimeOffsetRegex =
            '^' +
            '(?!\\d{6}$)' +
            '(?![^-]*-[^T]*T.*?[^.]\\d{3,})' +
            '(?!\\d{5,}T(?![^:]*$))' +
            '(?:(?:(?=((\\d{4})(?:(-)?(1[012]|0[1-9]))?(?:\\3(3[01]|[12]\\d|0[1-9]))?))\\1))' +
            '(?:T' +
            '(?!\\d{2}:.*?[^.]\\d{3,})' +
            '(?!\\d{3,}(?![^:]*$))' +
            '(?:(0[0-9]|1[0-9]|2[0-3])(?:(?:(:)?(0[0-9]|[1-5][0-9]))(?:(?:\\7(0[0-9]|[1-5][0-9])(?:\\.(\\d{1,3}))?)?)?)?)' +
            '(?:' +
            '(?![+-][^Z]*Z)' +
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

        if (!areDayAndDateValid({ YYYY, MM, DD })) {
            return null;
        }

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
                getSign(HHOffset)
            ),
            parts: {
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

    static parseDateFromIsoOrdinal(dateString: unknown): { date: Date; parts: Record<string, unknown> } | null {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }
        const matchResult = RegexCache(
            '^(\\d{4})(?:(-)?(00[1-9]|0[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6]))$'
        ).exec(dateString);
        if (!matchResult) {
            return null;
        }
        const [, YYYY, dash, DDD] = matchResult;
        if (+DDD === 366 && !isLeapYear(YYYY)) {
            return null;
        }

        const date = new Date(Date.UTC(YYYY, 0, 1));
        date.setUTCDate(date.getUTCDate() + DDD - 1);
        return new BetterDate({
            date,
            parts: {
                YYYY: +YYYY,
                DDD: +DDD,
                dash,
                isExtended: !!dash
            },
            format: DATE_TYPE.ISO_ORDINAL,
            value: dateString
        });
    }

    static parseDateFromIsoWeek(dateString: unknown): { date: Date; parts: Record<string, unknown> } | null {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }

        const matchResult = RegexCache(
            '^(\\d{4})(-)?W(0[1-9]|[1-4]\\d|5[0-3])(?:\\2([1-7]))?$'
        ).exec(dateString.trim());
        if (!matchResult) {
            return null;
        }
        let [, YYYY, dash, ww, DD] = matchResult;
        YYYY = +YYYY;
        ww = +ww;
        DD = DD ? +DD : 1;

        if (ww === 53) {
            const jan1Day = (new Date(Date.UTC(YYYY, 0, 1))).getUTCDay();
            if (jan1Day !== 4 && (jan1Day !== 3 || !isLeapYear(YYYY))) {
                return null;
            }
        }

        const simple = new Date(Date.UTC(YYYY, 0, 4));
        const date = new Date(Date.UTC(YYYY, 0, 4 - (simple.getUTCDay() || 7) + 1));
        date.setUTCDate(date.getUTCDate() + (ww - 1) * 7 + (DD - 1));
        return new BetterDate({
            date,
            parts: {
                YYYY: +YYYY,
                ww: +ww,
                DD: +(DD || 1),
                dash,
                isExtended: !!dash
            },
            format: DATE_TYPE.ISO_WEEK,
            value: dateString
        });
    }

    static parseDateFromTimestamp(value: unknown): { date: Date; parts: Record<string, unknown> } | null {
        if (Number.isInteger(value) && !isNaN(new Date(value as number).getTime())) {
            return new BetterDate({
                date: new Date(Number(value)),
                parts: {},
                format: DATE_TYPE.TIMESTAMP,
                value
            });
        }
        return null;
    }

}



// export type DateParts = {
//     YYYY: number;
//     MM?: number;
//     ww?: number;
//     DD?: number;
//     HH?: number;
//     mm?: number;
//     ss?: number;
//     sss?: number;
//     HHOffset?: number;
//     mmOffset?: number;
//     dash?: string;
// }

// abstract class ParsedDate {
//     year: number;
//     constructor(year: number) {
//         this.year = year;
//     }


// }

export { BetterDate };