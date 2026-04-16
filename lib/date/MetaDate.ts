'use strict';

import { RegexCache } from '../cache/RegexCache.ts';
import { Locale } from '../Locale.ts';
import { NestedStringRecord } from '../utils/Utils.ts';
import { Utils } from '../utils/Utils.ts';
import { DateHelpers } from './DateHelpers.ts';

export type DateLike = Date | string | number;

// export enum DateType {
//     HUMAN = 'HUMAN',
//     ISO = 'ISO',
//     ISO_BASIC = 'ISO_BASIC',
//     ISO_WEEK = 'ISO_WEEK',
//     ISO_WEEK_BASIC = 'ISO_WEEK_BASIC',
//     ISO_ORDINAL = 'ISO_ORDINAL',
//     ISO_ORDINAL_BASIC = 'ISO_ORDINAL_BASIC',
//     OBJECT = 'OBJECT',
//     TIME_ONLY = 'TIME_ONLY',
//     TIMESTAMP = 'TIMESTAMP',
// };

export type MetaDateConstructorParams = {
    date: Date,
    offsetHour?: number,
    offsetMinute?: number,
    locale: Locale,
} & ({ date: Date; year?: never } | { date?: never, year: number });

class MetaDate {

    protected _date: Date;
    protected _offsetHour: number;
    protected _offsetMinute: number;
    protected _locale: Locale;

    constructor({
        date = new Date(),
        offsetHour = 0,
        offsetMinute = 0,
        locale,
    }: MetaDateConstructorParams) {
        this._date = date;
        this._offsetHour = offsetHour;
        this._offsetMinute = offsetMinute;
        this._locale = locale!;
    }

    static FORMAT_TOKEN_MAP: Record<string, (p: { date: Date, locale: Locale, offsetHour: number, offsetMinute: number }) => string> = {
        'YYYY': (p) => p.date.getUTCFullYear().toString(), // 4-digit year
        'YY': (p) => Utils.padLeft(String(p.date.getUTCFullYear() % 100), 2, '0'), // 2-digit year
        'MM': (p) => Utils.padLeft(String(p.date.getUTCMonth() + 1), 2, '0'), // 2-digit month
        'M': (p) => (p.date.getUTCMonth() + 1).toString(), // month (1-12)
        'DD': (p) => Utils.padLeft(String(p.date.getUTCDate()), 2, '0'), // 2-digit day of month
        'D': (p) => p.date.getUTCDate().toString(), // day of month
        'HH': (p) => Utils.padLeft(String(p.date.getUTCHours()), 2, '0'), // 2-digit hour (24h)
        'H': (p) => p.date.getUTCHours().toString(), // hour (24h)
        'hh': (p) => { const h = p.date.getUTCHours() % 12 || 12; return Utils.padLeft(String(h), 2, '0'); }, // 2-digit hour (12h)
        'h': (p) => (p.date.getUTCHours() % 12 || 12).toString(), // hour (12h)
        'mm': (p) => Utils.padLeft(String(p.date.getUTCMinutes()), 2, '0'), // 2-digit minute
        'm': (p) => p.date.getUTCMinutes().toString(), // minute
        'ss': (p) => Utils.padLeft(String(p.date.getUTCSeconds()), 2, '0'), // 2-digit second
        's': (p) => p.date.getUTCSeconds().toString(), // second
        'SSS': (p) => Utils.padLeft(String(p.date.getUTCMilliseconds()), 3, '0'), // 3-digit millisecond
        'A': (p) => p.date.getUTCHours() < 12 ? 'AM' : 'PM', // AM/PM
        'a': (p) => p.date.getUTCHours() < 12 ? 'am' : 'pm', // am/pm
        'Z': (p) => {
            const oh = p.offsetHour;
            const om = p.offsetMinute;
            return (oh >= 0 ? '+' : '-') + Utils.padLeft(String(Math.abs(oh)), 2, '0') + ':' + Utils.padLeft(String(Math.abs(om)), 2, '0');
        }, // timezone offset (+hh:mm)
        'ZZ': (p) => {
            const oh = p.offsetHour;
            const om = p.offsetMinute;
            return (oh >= 0 ? '+' : '-') + Utils.padLeft(String(Math.abs(oh)), 2, '0') + Utils.padLeft(String(Math.abs(om)), 2, '0');
        }, // timezone offset (+hhmm)
        'O': (p) => p.offsetHour.toString(), // offset hour
        'OO': (p) => Utils.padLeft(String(Math.abs(p.offsetHour)), 2, '0'), // 2-digit offset hour
        'P': (p) => p.offsetMinute.toString(), // offset minute
        'PP': (p) => Utils.padLeft(String(Math.abs(p.offsetMinute)), 2, '0'), // 2-digit offset minute
        'dddd': (p) => (p.locale.translate('calendar/dayNames/full') || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])[p.date.getUTCDay()], // full weekday name
        'ddd': (p) => (p.locale.translate('calendar/dayNames/short') || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])[p.date.getUTCDay()], // short weekday name
        'MMMM': (p) => (p.locale.translate('calendar/months/full') || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])[p.date.getUTCMonth()], // full month name
        'MMM': (p) => (p.locale.translate('calendar/months/short') || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])[p.date.getUTCMonth()], // short month name
    };

    transform(format: string, locale: Locale): string {
        const p = {
            date: this._date,
            locale,
            offsetHour: this._offsetHour,
            offsetMinute: this._offsetMinute
        };
        return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|SSS|A|a|Z|ZZ|O|OO|P|PP|dddd|ddd|MMMM|MMM/g, match => {
            const fn = (this.constructor as typeof MetaDate).FORMAT_TOKEN_MAP[match];
            return fn ? fn(p) : match;
        });
    }

    // this should clone props with updated date obj
    changeDate(newDate):void {

    }
}

export { MetaDate };
