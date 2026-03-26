'use strict';

export type DateParts = {
    YYYY: number;
    MM?: number;
    ww?: number;
    DD?: number;
    HH?: number;
    mm?: number;
    ss?: number;
    sss?: number;
    HHOffset?: number;
    mmOffset?: number;
    dash?: string;

}

abstract class ParsedDate {
    year: number;
    constructor(year: number) {
        this.year = year;
    }


}

export { ParsedDate };