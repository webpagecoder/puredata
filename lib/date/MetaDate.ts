'use strict';

export type MetaDateConstructorParams = {
    raw?: Date | string | number;
    offsetMinutes?: number;
} & ({ dateParts: number[]; date?: never } | { dateParts?: never; date: Date });

class MetaDate {
    private _date: Date;
    private _raw: Date | string | number | undefined;
    private _offsetMinutes: number;

    constructor(dateInfo: MetaDateConstructorParams) {
        const { raw, offsetMinutes = 0, date, dateParts: [
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

    public get globalDate(): Date {
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

}
export { MetaDate };