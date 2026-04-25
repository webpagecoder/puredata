'use strict';

import { DateType } from './DateType.ts';

export type DateParts = {
    year?: number | null;
    month?: number | null;
    day?: number | null;
    hour?: number | null;
    minute?: number | null;
    second?: number | null;
    millisecond?: number | null;
    offsetHour?: number | null;
    offsetMinute?: number | null;
};

class NormalizedDate {

    protected _date: Date;
    protected _meta: Record<string, any>;
    protected _parts: DateParts;
    protected _type: DateType;

    constructor(
        dateOrDateParts: Date = new Date(),
        type: DateType = DateType.OBJECT,
        meta: Record<string, any> = {}
    ) {
        this._meta = meta;
        if(dateOrDateParts instanceof Date) {
            this._date = dateOrDateParts;
            this._parts = {};
            this._type = DateType.OBJECT;
        }
        else {
            this._type = type;
            const {
                year = null,
                month = null,
                day = null,
                hour = null,
                minute = null,
                second = null,
                millisecond = null,
                offsetHour = null,
                offsetMinute = null
            } = dateOrDateParts;
            this._date = new Date(Date.UTC(
                Number(year),
                month ? Number(month) - 1 : 0,
                Number(day) || 1,
                Number(hour) + Number(offsetHour),
                Number(minute) + Number(offsetMinute),
                Number(second),
                Number(millisecond)
            ));
            this._parts = {
                year,
                month,
                day,
                hour,
                minute,
                second,
                millisecond,
                offsetHour,
                offsetMinute
            };
        }
    }

    get date(): Date | null {
        return this._dateOrDateParts;
    }

    get meta(): Record<string, string | number> {
        return this._meta;
    }

    get offsetHour(): number | null {
        return this._parts.offsetHour;
    }

    get offsetMinute(): number | null {
        return this._parts.offsetMinute;
    }

    get type(): DateType {
        return this._type;
    }
    // static FORMAT_TOKEN_MAP: Record<string, (p: { date: Date, locale: Locale, offsetHour: number, offsetMinute: number }) => string> = {
    //     'YYYY': (p) => p.date.getUTCFullYear().toString(), // 4-digit year
    //     'YY': (p) => Utils.padLeft(String(p.date.getUTCFullYear() % 100), 2, '0'), // 2-digit year
    //     'MM': (p) => Utils.padLeft(String(p.date.getUTCMonth() + 1), 2, '0'), // 2-digit month
    //     'M': (p) => (p.date.getUTCMonth() + 1).toString(), // month (1-12)
    //     'DD': (p) => Utils.padLeft(String(p.date.getUTCDate()), 2, '0'), // 2-digit day of month
    //     'D': (p) => p.date.getUTCDate().toString(), // day of month
    //     'HH': (p) => Utils.padLeft(String(p.date.getUTCHours()), 2, '0'), // 2-digit hour (24h)
    //     'H': (p) => p.date.getUTCHours().toString(), // hour (24h)
    //     'hh': (p) => { const h = p.date.getUTCHours() % 12 || 12; return Utils.padLeft(String(h), 2, '0'); }, // 2-digit hour (12h)
    //     'h': (p) => (p.date.getUTCHours() % 12 || 12).toString(), // hour (12h)
    //     'mm': (p) => Utils.padLeft(String(p.date.getUTCMinutes()), 2, '0'), // 2-digit minute
    //     'm': (p) => p.date.getUTCMinutes().toString(), // minute
    //     'ss': (p) => Utils.padLeft(String(p.date.getUTCSeconds()), 2, '0'), // 2-digit second
    //     's': (p) => p.date.getUTCSeconds().toString(), // second
    //     'SSS': (p) => Utils.padLeft(String(p.date.getUTCMilliseconds()), 3, '0'), // 3-digit millisecond
    //     'A': (p) => p.date.getUTCHours() < 12 ? 'AM' : 'PM', // AM/PM
    //     'a': (p) => p.date.getUTCHours() < 12 ? 'am' : 'pm', // am/pm
    //     'Z': (p) => {
    //         const oh = p.offsetHour;
    //         const om = p.offsetMinute;
    //         return (oh >= 0 ? '+' : '-') + Utils.padLeft(String(Math.abs(oh)), 2, '0') + ':' + Utils.padLeft(String(Math.abs(om)), 2, '0');
    //     }, // timezone offset (+hh:mm)
    //     'ZZ': (p) => {
    //         const oh = p.offsetHour;
    //         const om = p.offsetMinute;
    //         return (oh >= 0 ? '+' : '-') + Utils.padLeft(String(Math.abs(oh)), 2, '0') + Utils.padLeft(String(Math.abs(om)), 2, '0');
    //     }, // timezone offset (+hhmm)
    //     'O': (p) => p.offsetHour.toString(), // offset hour
    //     'OO': (p) => Utils.padLeft(String(Math.abs(p.offsetHour)), 2, '0'), // 2-digit offset hour
    //     'P': (p) => p.offsetMinute.toString(), // offset minute
    //     'PP': (p) => Utils.padLeft(String(Math.abs(p.offsetMinute)), 2, '0'), // 2-digit offset minute
    //     'dddd': (p) => (p.locale.translate('calendar/dayNames/full') || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])[p.date.getUTCDay()], // full weekday name
    //     'ddd': (p) => (p.locale.translate('calendar/dayNames/short') || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])[p.date.getUTCDay()], // short weekday name
    //     'MMMM': (p) => (p.locale.translate('calendar/months/full') || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])[p.date.getUTCMonth()], // full month name
    //     'MMM': (p) => (p.locale.translate('calendar/months/short') || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])[p.date.getUTCMonth()], // short month name
    // };

    // transform(format: string, locale: Locale): string {
    //     const p = {
    //         date: this._date,
    //         locale,
    //         offsetHour: this._offsetHour,
    //         offsetMinute: this._offsetMinute
    //     };
    //     return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|SSS|A|a|Z|ZZ|O|OO|P|PP|dddd|ddd|MMMM|MMM/g, match => {
    //         const fn = (this.constructor as typeof NormalizedDate).FORMAT_TOKEN_MAP[match];
    //         return fn ? fn(p) : match;
    //     });
    // }

    // // this should clone props with updated date obj
    // changeDate(newDate):void {

    // }
}

export { NormalizedDate };
