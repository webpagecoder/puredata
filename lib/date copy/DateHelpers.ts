'use strict';

class DateHelpers {

    static isValidDate(year: number, month: number, day: number): boolean {
        year = Number(year) || 0;
        month = Number(month) || 1;
        day = Number(day) || 1;
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

    static has53IsoWeeks(year: number): boolean {
        // ISO years have 53 weeks if Jan 1 is a Thursday, or it's a leap year starting on Wednesday,
        // or Dec 31 is a Thursday (or a leap year ending on Thursday/Friday)
        // getUTCDay(): 0=Sunday, 1=Monday, ..., 4=Thursday, 5=Friday, 6=Saturday
        return (new Date(Date.UTC(year, 0, 1))).getUTCDay() === 4 ||
            (new Date(Date.UTC(year, 11, 31))).getUTCDay() === 4;
    }

    static isoWeekToDate(year: number, week: number, day: number = 1): Date {
        // ISO weeks: week 1 is the week with the first Thursday of the year (Jan 4th always in week 1)
        const simple = new Date(Date.UTC(year, 0, 4));
        const dayOfWeek = simple.getUTCDay() || 7; // 1=Monday, 7=Sunday
        // Calculate the date of the Monday of week 1
        const mondayOfWeek1 = new Date(simple);
        mondayOfWeek1.setUTCDate(simple.getUTCDate() - dayOfWeek + 1);
        // Add weeks and days
        return new Date(mondayOfWeek1.getTime() + ((week - 1) * 7 + (day - 1)) * 86400000);
    }
}

export { DateHelpers };