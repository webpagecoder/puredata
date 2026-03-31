'use strict';

import { RegexCache } from '../cache/RegexCache.ts';
import { Locale } from '../Locale.ts';
import { NestedStringRecord } from '../utils/Utils.ts';


export type DateLike = Date | string | number;

export enum DateType {
    HUMAN,
    ISO,
    ISO_BASIC,
    ISO_WEEK,
    ISO_WEEK_BASIC,
    ISO_ORDINAL,
    ISO_ORDINAL_BASIC,
    OBJECT,
    TIME_ONLY,
    TIME_ONLY_BASIC,
    TIMESTAMP,
};



export type DateParts = {
    year?: number;
    month?: number;
    week?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
    hourOffset?: number;
    minuteOffset?: number;
    isBasic?: boolean;
}



class BetterDate {
    
    private _date: Date;
    private _parts: DateParts;
    private _type: DateType;

    constructor(date: Date, type: DateType, parts?: DateParts) {
        this._date = date;
        this._type = type;
        this._parts = parts || {};
    }




}



// export type DateParts = {
//     YYYY: number;
//     MM?: number;
//     ww?: number;
//     DD?: number;
//     HH?: number;
//     mm?: number;
//     ss?: number;
//     sss?: number;
//     HHOffset?: number;
//     mmOffset?: number;
//     dash?: string;
// }

// abstract class ParsedDate {
//     year: number;
//     constructor(year: number) {
//         this.year = year;
//     }


// }

export { BetterDate };