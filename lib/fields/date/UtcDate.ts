'use strict';

export type UtcDateCtorParams = {
    localDate: Date;
    offsetMinutes?: number;
};

class UtcDate {
    private _localDate: Date;
    private _globalDate: Date;
    private _offsetMinutes: number;

    public constructor(localDate = new Date(), offsetMinutes = 0) {
        this._localDate = new Date(localDate);
        this._offsetMinutes = offsetMinutes;

        const date = new Date(localDate);
        date.setUTCMinutes(date.getUTCMinutes() - this._offsetMinutes);
        this._globalDate = date;
    }

    public get globalDate(): Date {
        return this._globalDate;
    }

    public get localDate(): Date {
        return this._localDate
    }

    public get offsetMinutes(): number {
        return this._offsetMinutes;
    }

    public clone(): UtcDate {
        return new UtcDate(this._localDate, this._offsetMinutes);
    }

    public equals(other: UtcDate): boolean {
        return this._globalDate.getTime() === other.globalDate.getTime();
    }

    public setLocalDate(newLocalDate: Date): UtcDate {
        return new UtcDate(newLocalDate, this._offsetMinutes);
    }

}
export { UtcDate };