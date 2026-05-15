'use strict';

import { GenericDateInput } from "./DateTypes.ts";

export type DateOrDateParts = ({ dateParts: number[]; date?: never } | { dateParts?: never; date: Date });
export type MetaDateConstructorParams = {
    raw?: GenericDateInput | null;
    offsetMinutes?: number;
} & DateOrDateParts;

class MetaDate {
    private _date: Date;
    private _raw: GenericDateInput | null;
    private _offsetMinutes: number;

    constructor(dateInfo: MetaDateConstructorParams) {
        const { raw = null, offsetMinutes = 0, date, dateParts: [
            year = 0,
            month = 1,
            day = 1,
            hour = 0,
            minute = 0,
            second = 0,
            millisecond = 0
        ] = [] } = dateInfo;

        if (date) {
            this._date = offsetMinutes === 0
                ? date
                : new Date(date.getTime() + offsetMinutes * 60000);
        }
        else {
            this._date = new Date(Date.UTC(
                year,
                month - 1,
                day,
                hour,
                minute + offsetMinutes,
                second,
                millisecond
            ));
        }
        this._raw = raw;
        this._offsetMinutes = offsetMinutes;
    }

    public get utcDate(): Date {
        return this._date;
    }

    public get localDate(): Date {
        const target = new Date(this._date);
        target.setUTCMinutes(target.getUTCMinutes() - this._offsetMinutes);
        return target;
    }

    public get offsetMinutes(): number {
        return this._offsetMinutes;
    }

    public get raw() {
        return this._raw;
    }

    public clone(swapDate: Date | null = null): MetaDate {
        if (swapDate) {
            return new MetaDate({
                date: swapDate,
                offsetMinutes: this._offsetMinutes,
                raw: null
            });
        }
        return new MetaDate({
            date: new Date(this._date),
            offsetMinutes: this._offsetMinutes,
            raw: this._raw
        });
    }

}
export { MetaDate };