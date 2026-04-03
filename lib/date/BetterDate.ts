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

export type BetterDateConstructorParams = {
    date: Date;
    originalInput: unknown;
    type: DateType;
    meta?: Record<string, unknown>;
};

class BetterDate {
    
    private _date: Date;
    private _meta?: Record<string, unknown>;
    private _type: DateType;
    private _originalInput: unknown;

    constructor({date, originalInput, type, meta}: BetterDateConstructorParams) {
        this._date = date;
        this._type = type;
        this._meta = meta;
        this._originalInput = originalInput;
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