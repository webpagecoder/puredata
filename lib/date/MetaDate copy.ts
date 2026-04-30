'use strict';

const now = new Date();

export type DateParts = {
    raw?: Date | string | number;
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

class MetaDate {
    private _date: Date;
    private _raw: Date | string | number | null;
    private _offsetHour: number | null;
    private _offsetMinute: number | null;

    constructor(dateParts: DateParts = {}) {
        if (dateParts.raw instanceof Date) {
            this._date = dateParts.raw;
        }
        else {
            this._date = new Date(Date.UTC(
                dateParts.year || 0,
                dateParts.month ? dateParts.month - 1 : 0,
                dateParts.day || 1,
                (dateParts.hour || 0) + (dateParts.offsetHour || 0),
                (dateParts.minute || 0) + (dateParts.offsetMinute || 0),
                dateParts.second || 0
            ));
        }
        this._raw = dateParts.raw || null;
        this._offsetHour = dateParts.offsetHour || null;
        this._offsetMinute = dateParts.offsetMinute || null;
    }

    get date(): Date {
        return this._date;
    }

    get raw(): Date | string | number | null {
        return this._raw;
    }

    modifyDate(dateParts: Omit<DateParts, 'offsetHour' | 'offsetMinute'>): MetaDate {
        const modifiedDate = new Date(this._date);
        if (dateParts.year) {
            modifiedDate.setUTCFullYear(Number(dateParts.year));
        }
        if (dateParts.month) {
            modifiedDate.setUTCMonth(Number(dateParts.month) - 1);
        }
        if (dateParts.day) {
            modifiedDate.setUTCDate(Number(dateParts.day));
        }
        if (dateParts.hour) {
            modifiedDate.setUTCHours(Number(dateParts.hour));
        }
        if (dateParts.minute) {
            modifiedDate.setUTCMinutes(Number(dateParts.minute));
        }
        if (dateParts.second) {
            modifiedDate.setUTCSeconds(Number(dateParts.second));
        }
        if (dateParts.millisecond) {
            modifiedDate.setUTCMilliseconds(Number(dateParts.millisecond));
        }
        return new MetaDate(null,{
            raw: null,
            offsetHour: this._offsetHour,
            offsetMinute: this._offsetMinute
        });
    }

}
export { MetaDate };