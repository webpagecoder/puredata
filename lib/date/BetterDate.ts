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
    ISO_ORDINAL,
    OBJECT,
    TIME_ONLY,
    TIMESTAMP,
};



export type DateMeta = {
    hourOffset?: number;
    minuteOffset?: number;
    isoIsExtended?: boolean;
    isoIsZulu?: boolean;
}


class BetterDate {
    
    private _date: Date;
    private _meta: DateMeta;
    private _type: DateType;

    constructor(date: Date, type: DateType, meta?: DateMeta) {
        this._date = date;
        this._type = type;
        this._meta = meta || {};
    }




}



// export type DateMeta = {
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