'use strict';

import { RegexCache } from "../cache/RegexCache.ts";
import { BetterDate, DateLike } from "./BetterDate.ts";
import { DATE_TYPE } from "./DateTypes.ts";



class DateHelpers {

    static areDayAndDateValid(dateParts: Record<string, unknown> = {}): boolean {
        let { YYYY, MM, DD } = dateParts as { YYYY?: unknown; MM?: unknown; DD?: unknown };
        YYYY = +(YYYY as any) || 0;
        MM = +(MM as any) || 0;
        DD = +(DD as any) || 0;
        const numDaysInMonth = [4, 6, 9, 11].indexOf(MM as number) > -1 && 30
            || (MM as number) === 2 && (this.isLeapYear(YYYY as number) ? 29 : 28)
            || [1, 3, 5, 7, 8, 10, 12].indexOf(MM as number) > -1 && 31
            || -1;
        if ((YYYY as number) && (MM as number) && (DD as number) && +(DD as number) > numDaysInMonth) {
            return false;
        }
        return true;
    }

    static isLeapYear(year: number): boolean {
        return new Date(Date.UTC(+year, 1, 29)).getUTCDate() === 29;
    }

}

export { DateHelpers };