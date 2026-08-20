'use strict';

export type UtcDateCtorParams = {
    localDate: Date;
    offsetMinutes?: number;
};

class UtcDate {
    private _localDate: Date;
    private _date: Date;
    private _offsetMinutes: number;

    public constructor(localDate = new Date(), offsetMinutes = 0) {
        this._localDate = new Date(localDate);
        this._offsetMinutes = offsetMinutes;

        const date = new Date(localDate);
        date.setUTCMinutes(date.getUTCMinutes() - this._offsetMinutes);
        this._date = date;
    }

    public get date(): Date {
        return this._date;
    }

    public get localDate(): Date {
        return this._localDate
    }

    public get offsetMinutes(): number {
        return this._offsetMinutes;
    }

    public setDate(utcDate: Date): UtcDate {
        const newLocalDate = new Date(utcDate);
        newLocalDate.setUTCMinutes(newLocalDate.getUTCMinutes() + this._offsetMinutes);
        return new UtcDate(newLocalDate, this._offsetMinutes);
    }

    public clone(): UtcDate {
        return new UtcDate(this._localDate, this._offsetMinutes);
    }

}
export { UtcDate };