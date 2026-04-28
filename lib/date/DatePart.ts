'use strict';

import { Presence } from "../Presence.ts";

export enum DatePart {
    // General Date
    FullDate = 'fullDate',  // Represents a date with year, month, and day, but no time
    Year = 'year',
    Month = 'month',
    Day = 'day',  // Represents day of month, day of week, day of year
    WeekNum = 'weekNum',  // Only used for ISO week

    // Time
    Time = 'time', // Represents hours, mins, seconds, and milliseconds
    Hour = 'hour',
    Minute = 'minute',
    Second = 'second',
    Millisecond = 'millisecond',

    // Timezone
    Offset = 'offset', // Represents both offsetHour and offsetMinute
    OffsetHour = 'offsetHour',
    OffsetMinute = 'offsetMinute',
};

export enum DatePrecision {
    Year = 'year',
    Month = 'month',
    Week = 'week',
    Day = 'day',
}

export enum TimePrecision {
    Hour = 'hour',
    Minute = 'minute',
    Second = 'second',
    Millisecond = 'millisecond',
}

export type DatePartPresence = {
    year?: Presence;
    month?: Presence;
    day?: Presence;
    weekNum?: Presence;
    time?: Presence;
    hour?: Presence;
    minute?: Presence;
    second?: Presence;
    millisecond?: Presence;
    offsetHour?: Presence;
    offsetMinute?: Presence;
}
//`${A}:${B}`;

