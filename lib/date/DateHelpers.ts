'use strict';

class DateHelpers {

    static isValidDate(year: number, month: number, day: number): boolean {
        year = Number(year) || 0;
        month = Number(month) || 0;
        day = Number(day) || 0;
        if (!year || !month || !day) {
            return false;
        }
        let numDaysInMonth = -1;
        if ([4, 6, 9, 11].indexOf(month) !== -1) {
            numDaysInMonth = 30;
        } 
        else if (month === 2) {
            numDaysInMonth = this.isLeapYear(year) ? 29 : 28;
        } 
        else if ([1, 3, 5, 7, 8, 10, 12].indexOf(month) !== -1) {
            numDaysInMonth = 31;
        }
        return day <= numDaysInMonth;
    }

    static isLeapYear(year: number): boolean {
        return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
    }


}

export { DateHelpers };