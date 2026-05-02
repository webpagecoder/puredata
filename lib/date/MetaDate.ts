'use strict';

import { DateType } from "./DateType.ts";

const now = new Date();

// export type DateParts = {
//     raw?: Date | string | number;
//     year?: number | null;
//     month?: number | null;
//     day?: number | null;
//     hour?: number | null;
//     minute?: number | null;
//     second?: number | null;
//     millisecond?: number | null;
//     offsetHour?: number | null;
//     offsetMinute?: number | null;
// };

export type MetaDateConstructorParams = {
    raw?: Date | string | number;
    offsetHour?: number;
    offsetMinute?: number;
} & ({ dateParts: number[]; date?: never } | { dateParts?: never; date: Date });

class MetaDate {
    public date: Date;
    public raw: Date | string | number | undefined;
    public offsetHour: number;
    public offsetMinute: number;

    constructor(dateInfo: MetaDateConstructorParams) {
        const { raw, offsetHour = 0, offsetMinute = 0, date, dateParts: [
            year = 0,
            month = 1,
            day = 1,
            hour = 0,
            minute = 0,
            second = 0,
            millisecond = 0
        ] = [] } = dateInfo;

        this.date = date ? date : new Date(Date.UTC(
            year,
            month - 1,
            day,
            hour + offsetHour,
            minute + Math.sign(offsetHour) * offsetMinute,
            second,
            millisecond
        ));
        this.raw = raw;
        this.offsetHour = offsetHour;
        this.offsetMinute = offsetMinute;
    }

    public get dateWithOffsetRemoved(): Date {
        const target = new Date(this.date);
        target.setUTCHours(target.getUTCHours() - this.offsetHour);
        target.setUTCMinutes(
            target.getUTCMinutes() - Math.sign(this.offsetHour) * this.offsetMinute
        );
        return target;
    }

    public cloneWithNewDate(date: Date): MetaDate {
        return new MetaDate({
            date,
            offsetHour: this.offsetHour,
            offsetMinute: this.offsetMinute
        });
    }

}
export { MetaDate };