'use strict';

/** Constructor options describing a local date and its UTC offset. */
export type OffsetDateCtorParams = {
    localDate: Date;
    offsetMinutes?: number;
};

/** Represents a date with a local value and an associated UTC offset. */
class OffsetDate {
    /** Local date supplied to the instance. */
    private _localDate: Date;

    /** Date adjusted to the UTC timeline using the configured offset. */
    private _offsetDate: Date;

    /** Offset in minutes applied to the local date. */
    private _offsetMinutes: number;

    /**
     * Creates a date using a local date and offset in minutes.
     *
     * @param localDate Local date value; defaults to the current date and time.
     * @param offsetMinutes Offset in minutes from UTC.
     */
    public constructor(localDate = new Date(), offsetMinutes = 0) {
        this._localDate = new Date(localDate);
        this._offsetMinutes = offsetMinutes;

        const date = new Date(localDate);
        date.setUTCMinutes(date.getUTCMinutes() - this._offsetMinutes);
        this._offsetDate = date;
    }

    /** Gets the date adjusted to the UTC timeline. */
    public get offsetDate(): Date {
        return this._offsetDate;
    }

    /** Gets the local date. */
    public get localDate(): Date {
        return this._localDate
    }

    /** Gets the configured offset in minutes. */
    public get offsetMinutes(): number {
        return this._offsetMinutes;
    }

    /** Creates a copy of this date with the same offset. */
    public clone(): OffsetDate {
        return new OffsetDate(this._localDate, this._offsetMinutes);
    }

    /** Whether another wrapped date represents the same UTC instant. */
    public equals(other: OffsetDate): boolean {
        return this._offsetDate.getTime() === other.offsetDate.getTime();
    }

    /** Creates a new wrapped date using a different local date and this offset. */
    public setLocalDate(newLocalDate: Date): OffsetDate {
        return new OffsetDate(newLocalDate, this._offsetMinutes);
    }

}
export { OffsetDate };