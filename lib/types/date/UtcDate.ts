'use strict';

import { GenericDateInput } from "./DateConverter.ts";

export type UtcDateCtorParams = {
    localDate: Date;
    offsetMinutes?: number;
    raw?: GenericDateInput | null;
};

class UtcDate {
    private _localDate: Date;
    private _date: Date;
    private _raw: GenericDateInput | null;
    private _offsetMinutes: number;

    public constructor(dateInfo: UtcDateCtorParams) {
        const { raw = null, offsetMinutes = 0, localDate = new Date() } = dateInfo;

        this._localDate = new Date(localDate);
        this._offsetMinutes = offsetMinutes;
        this._raw = raw;

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

    public get raw() {
        return this._raw;
    }

    public setDate(utcDate: Date): UtcDate {
        const newLocalDate = new Date(utcDate);
        newLocalDate.setUTCMinutes(newLocalDate.getUTCMinutes() + this._offsetMinutes);
        return new UtcDate({
            localDate: newLocalDate,
            offsetMinutes: this._offsetMinutes,
            raw: null
        });
    }

    public clone(): UtcDate {
        return new UtcDate({
            localDate: this._localDate,
            offsetMinutes: this._offsetMinutes,
            raw: this._raw
        });
    }

}
export { UtcDate as UtcDate };