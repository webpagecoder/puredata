'use strict';

import { RegexCache } from "../cache/RegexCache.ts";
import { BetterDate, DateLike } from "./BetterDate.ts";
import { DateType } from "./DateTypes.ts";



class DateHelpers {

    static isValidDate(year: number, month: number, day: number): boolean {
        year = +(year as any) || 0;
        month = +(month as any) || 0;
        day = +(day as any) || 0;
        const numDaysInMonth = [4, 6, 9, 11].indexOf(month as number) > -1 && 30
            || (month as number) === 2 && (this.isLeapYear(year as number) ? 29 : 28)
            || [1, 3, 5, 7, 8, 10, 12].indexOf(month as number) > -1 && 31
            || -1;
        if ((year as number) && (month as number) && (day as number) && +(day as number) > numDaysInMonth) {
            return false;
        }
        return true;
    }

    static isLeapYear(year: number): boolean {
        return new Date(Date.UTC(year, 1, 29)).getUTCDate() === 29;
    }

    static getSignMultiplier(x: number): number {
        return (Math.sign(x) === -1 || 1 / x === -Infinity) ? -1 : 1;
    }

}

export { DateHelpers };