'use strict';
//TODO: revisit if we need to be checking the 2nd and subsequent args for data types

import { HandlerResult } from './HandlerResult.ts';
import { Utils } from '../utils/Utils.ts';
import { Handler } from './Handler.ts';
const { pass, fail } = HandlerResult;

function areOptionsCompliant(parsed: any= {}, required: any= [], forbidden: any= []): boolean {
    for (const option of required) {
        if (parsed[option] === undefined) {
            return false;
        }
    }
    for (const option of forbidden) {
        if (parsed[option] !== undefined) {
            return false;
        }
    }
    return true;
}

class DateHandler extends Handler {

    // ====================================
    // VALIDATORS 
    // ====================================

    /**
     * Executes the after handler step.
     * @param {any} date
     * @param {any} afterDate
     * @returns {HandlerResult}
     */
    static after(date: any, afterDate: any): HandlerResult {
        const parsedAfterDate = Utils.parseDate(afterDate);
        if (!parsedAfterDate) {
            return fail(date, 'date/base', { date: afterDate });
        }

        return Utils.parseDate(date)!.date > parsedAfterDate.date
            ? pass(date)
            : fail(date, 'date/after', { afterDate });
    }

    /**
     * Executes the before handler step.
     * @param {any} date
     * @param {any} beforeDate
     * @returns {HandlerResult}
     */
    static before(date: any, beforeDate: any): HandlerResult {
        const parsedBeforeDate = Utils.parseDate(beforeDate);

        if (!parsedBeforeDate) {
            return fail(date, 'date/base', { date: beforeDate });
        }

        return Utils.parseDate(date)!.date < parsedBeforeDate.date
            ? pass(date)
            : fail(date, 'date/before', { beforeDate });
    }

    /**
     * Executes the between handler step.
     * @param {any} date
     * @param {any} minDate
     * @param {any} maxDate
     * @returns {HandlerResult}
     */
    static between(date: any, minDate: any, maxDate: any): HandlerResult {
        const parsedMinDate = Utils.parseDate(minDate);
        const parsedMaxDate = Utils.parseDate(maxDate);
        if (!parsedMinDate) {
            return fail(date, 'date/base', { date: minDate });
        }
        if (!parsedMaxDate) {
            return fail(date, 'date/base', { date: maxDate });
        }

        const parsedDate = Utils.parseDate(date);
        if (!parsedDate) {
            return fail(date, 'date/base', { date });
        }
        return parsedDate.date >= parsedMinDate.date && parsedDate.date <= parsedMaxDate.date
            ? pass(date)
            : fail(date, 'date/between', { minDate, maxDate });
    }

    /**
     * Executes the dayOfWeek handler step.
     * @param {any} date
     * @param {any} dayOfWeek
     * @returns {HandlerResult}
     */
    static dayOfWeek(date: any, dayOfWeek: any): HandlerResult {
        const dayIndex = Utils.parseDate(date)!.date.getUTCDay();
        return dayIndex === dayOfWeek
            ? pass(date)
            : fail(date, 'date/dayOfWeek', { dayOfWeek });
    }

    /**
     * Executes the equals handler step.
     * @param {any} date
     * @param {any} compareDate
     * @returns {HandlerResult}
     */
    static equals(date: any, compareDate: any): HandlerResult {
        const parsedCompareDate = Utils.parseDate(compareDate);

        if (!parsedCompareDate) {
            return fail(date, 'date/base', { date: compareDate });
        }

        return Utils.parseDate(date)!.date.getTime() === parsedCompareDate.date.getTime()
            ? pass(date)
            : fail(date, 'date/equals', { compareDate });
    }

    /**
     * Executes the future handler step.
     * @param {any} date
     * @param {any} referenceDate
     * @returns {HandlerResult}
     */
    static future(date: any, referenceDate: any= new Date()): HandlerResult {
        const parsedReferenceDate = Utils.parseDate(referenceDate);

        if (!parsedReferenceDate) {
            return fail(date, 'date/base', { date: referenceDate });
        }

        return Utils.parseDate(date)!.date > parsedReferenceDate.date
            ? pass(date)
            : fail(date, 'date/future', { referenceDate });
    }

    /**
     * Executes the human handler step.
     * @param {any} dateString
     * @param {any} param2
     * @returns {HandlerResult}
     */
    static human(dateString: any, {
        required = ['YYYY', 'MM', 'DD'],
        forbidden = ['HHOffset'],
        monthBeforeDay = true,
        numberSuffixes,
        fullMonths,
        shortMonths,
    }: any= {}): HandlerResult {

        const parsedDate = Utils.parseDateFromHuman(dateString, {
            monthBeforeDay,
            numberSuffixes,
            fullMonths,
            shortMonths,
        });
        if (!parsedDate) {
            return fail(dateString, 'date/human');
        }

        const { date, parsed } = parsedDate;
        if (!areOptionsCompliant(parsed, required, forbidden)) {
            return fail(dateString, 'date/human');
        }
        return pass(date);
    }

    /**
     * Executes the iso handler step.
     * @param {any} dateString
     * @param {any} param2
     * @returns {HandlerResult}
     */
    static iso(dateString: any, {
        required = ['YYYY', 'MM', 'DD'],
        forbidden = [],
        allowBasic = false,
    }: any= {}): HandlerResult {
        const parsedDate = Utils.parseDateFromIso(dateString);
        if (!parsedDate) {
            return fail(dateString, 'date/iso');
        }

        const { date, parsed } = parsedDate;
        if (!areOptionsCompliant(parsed, required, forbidden)) {
            return fail(dateString, 'date/iso');
        }
        if (!allowBasic && !parsedDate.parsed.isExtended) {
            return fail(dateString, 'date/iso');
        }

        return pass(date);
    }

    /**
     * Executes the isoOrdinal handler step.
     * @param {any} dateString
     * @param {any} allowBasic
     * @returns {HandlerResult}
     */
    static isoOrdinal(dateString: any, allowBasic: any= false): HandlerResult {
        const parsedDate = Utils.parseDateFromIsoOrdinal(dateString);
        if (!parsedDate) {
            return fail(dateString, 'date/isoOrdinal');
        }

        const { date, parsed } = parsedDate;
        if (!allowBasic && !parsed.isExtended) {
            return fail(dateString, 'date/isoOrdinal');
        }
        return pass(date);
    }

    /**
     * Executes the isoWeek handler step.
     * @param {any} dateString
     * @param {any} allowBasic
     * @returns {HandlerResult}
     */
    static isoWeek(dateString: any, allowBasic: any= false): HandlerResult {
        const parsedDate = Utils.parseDateFromIsoWeek(dateString);
        if (!parsedDate) {
            return fail(dateString, 'date/isoWeek');
        }

        const { date, parsed } = parsedDate;
        if (!allowBasic && !parsed.isExtended) {
            return fail(dateString, 'date/isoWeek');
        }
        return pass(parsedDate.date);
    }

    /**
     * Executes the leapYear handler step.
     * @param {any} date
     * @returns {HandlerResult}
     */
    static leapYear(date: any): HandlerResult {
        const year = Utils.parseDate(date)!.date.getUTCFullYear();
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
            ? pass(date)
            : fail(date, 'date/leapYear', { year });
    }

    /**
     * Executes the max handler step.
     * @param {any} date
     * @param {any} maxDate
     * @returns {HandlerResult}
     */
    static max(date: any, maxDate: any): HandlerResult {
        const parsedMaxDate = Utils.parseDate(maxDate);

        if (!parsedMaxDate) {
            return fail(date, 'date/base', { date: maxDate });
        }

        return Utils.parseDate(date)!.date <= parsedMaxDate.date
            ? pass(date)
            : fail(date, 'date/max', { maxDate });
    }

    /**
     * Executes the min handler step.
     * @param {any} date
     * @param {any} minDate
     * @returns {HandlerResult}
     */
    static min(date: any, minDate: any): HandlerResult {
        const parsedMinDate = Utils.parseDate(minDate);

        if (!parsedMinDate) {
            return fail(date, 'date/base', { date: minDate });
        }

        return Utils.parseDate(date)!.date >= parsedMinDate.date
            ? pass(date)
            : fail(date, 'date/min', { compareDate: minDate });
    }

    /**
     * Executes the minAge handler step.
     * @param {any} birthDate
     * @param {any} minAge
     * @param {any} referenceDate
     * @returns {HandlerResult}
     */
    static minAge(birthDate: any, minAge: any, referenceDate: any= new Date()): HandlerResult {
        const parsedBirthDate = Utils.parseDate(birthDate);
        const parsedReferenceDate = Utils.parseDate(referenceDate);

        if (!parsedBirthDate) {
            return fail(birthDate, 'date/base', { date: birthDate });
        }
        if (!parsedReferenceDate) {
            return fail(birthDate, 'date/base', { date: referenceDate });
        }
        const date = new Date(parsedBirthDate.date);
        const refDate = new Date(parsedReferenceDate.date);
        let age = refDate.getUTCFullYear() - date.getUTCFullYear();
        const monthDiff = refDate.getUTCMonth() - date.getUTCMonth();

        if (monthDiff < 0 || (monthDiff === 0 && refDate.getUTCDate() < date.getUTCDate())) {
            age--;
        }

        return age >= minAge
            ? pass(birthDate)
            : fail(birthDate, 'date/minAge', { actualAge: age, minAge });
    }

    /**
     * Executes the past handler step.
     * @param {any} date
     * @param {any} referenceDate
     * @returns {HandlerResult}
     */
    static past(date: any, referenceDate: any= new Date()): HandlerResult {
        const parsedReferenceDate = Utils.parseDate(referenceDate);

        if (!parsedReferenceDate) {
            return fail(date, 'date/base', { date: referenceDate });
        }

        return Utils.parseDate(date)!.date < parsedReferenceDate.date
            ? pass(date)
            : fail(date, 'date/past', { referenceDate });
    }

    /**
     * Executes the recent handler step.
     * @param {any} date
     * @param {any} days
     * @param {any} referenceDate
     * @returns {HandlerResult}
     */
    static recent(date: any, days: any= 30, referenceDate: any= new Date()): HandlerResult {
        const parsedReferenceDate = Utils.parseDate(referenceDate);

        if (!parsedReferenceDate) {
            return fail(date, 'date/base', { date: referenceDate });
        }

        const daysDiff = (parsedReferenceDate.date.getTime() - Utils.parseDate(date)!.date.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff >= 0 && daysDiff <= days
            ? pass(date)
            : fail(date, 'date/recent', { daysDiff, days });
    }

    /**
     * Executes the timestamp handler step.
     * @param {any} value
     * @param {any} jsType
     * @returns {HandlerResult}
     */
    static timestamp(value: any, jsType: any= true): HandlerResult {
        const parsedDate = Utils.parseDateFromTimestamp(value);
        if (!parsedDate) {
            return fail(value, 'date/timestamp');
        }
        return pass(parsedDate.date);
    }

    /**
     * Executes the today handler step.
     * @param {any} date
     * @param {any} todaysDate
     * @returns {HandlerResult}
     */
    static today(date: any, todaysDate: any): HandlerResult {
        const parsedTodaysDate = Utils.parseDate(todaysDate);
        if (!parsedTodaysDate) {
            return fail(date, 'date/base', { date: todaysDate });
        }
        const newDate = new Date(Utils.parseDate(date)!.date);
        newDate.setUTCHours(0, 0, 0, 0);
        const normalizedTodayDate = new Date(parsedTodaysDate.date);
        normalizedTodayDate.setUTCHours(0, 0, 0, 0);
        return newDate.getTime() === normalizedTodayDate.getTime()
            ? pass(date)
            : fail(date, 'date/today', {});
    }

    /**
     * Executes the weekday handler step.
     * @param {any} date
     * @returns {HandlerResult}
     */
    static weekday(date: any): HandlerResult {
        const dayOfWeek = Utils.parseDate(date)!.date.getUTCDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5
            ? pass(date)
            : fail(date, 'date/weekday', { dayOfWeek });
    }

    /**
     * Executes the weekend handler step.
     * @param {any} date
     * @returns {HandlerResult}
     */
    static weekend(date: any): HandlerResult {
        const dayOfWeek = Utils.parseDate(date)!.date.getUTCDay();
        return dayOfWeek === 0 || dayOfWeek === 6
            ? pass(date)
            : fail(date, 'date/weekend', { dayOfWeek });
    }


    // ====================================
    // MUTATORS 
    // ====================================

    /**
     * Executes the addDays handler step.
     * @param {any} date
     * @param {any} days
     * @returns {HandlerResult}
     */
    static addDays(date: any, days: any): HandlerResult {
        if (!Number.isInteger(days)) {
            return fail(date, 'date/addDays', { days });
        }

        const result = new Date(Utils.parseDate(date)!.date);
        result.setUTCDate(result.getUTCDate() + days);
        return pass(result);
    }

    /**
     * Executes the addHours handler step.
     * @param {any} date
     * @param {any} hours
     * @returns {HandlerResult}
     */
    static addHours(date: any, hours: any): HandlerResult {
        if (!Number.isInteger(hours)) {
            return fail(date, 'date/addHours', { hours });
        }

        const result = new Date(Utils.parseDate(date)!.date);
        result.setUTCHours(result.getUTCHours() + hours);
        return pass(result);
    }

    /**
     * Executes the addMinutes handler step.
     * @param {any} date
     * @param {any} minutes
     * @returns {HandlerResult}
     */
    static addMinutes(date: any, minutes: any): HandlerResult {
        if (!Number.isInteger(minutes)) {
            return fail(date, 'date/addMinutes', { minutes });
        }

        const result = new Date(Utils.parseDate(date)!.date);
        result.setUTCMinutes(result.getUTCMinutes() + minutes);
        return pass(result);
    }

    /**
     * Executes the addMonths handler step.
     * @param {any} date
     * @param {any} months
     * @returns {HandlerResult}
     */
    static addMonths(date: any, months: any): HandlerResult {
        if (!Number.isInteger(months)) {
            return fail(date, 'date/addMonths', { months });
        }

        const result = new Date(Utils.parseDate(date)!.date);
        result.setUTCMonth(result.getUTCMonth() + months);
        return pass(result);
    }

    /**
     * Executes the addYears handler step.
     * @param {any} date
     * @param {any} years
     * @returns {HandlerResult}
     */
    static addYears(date: any, years: any): HandlerResult {
        if (!Number.isInteger(years)) {
            return fail(date, 'date/addYears', { years });
        }

        const result = new Date(Utils.parseDate(date)!.date);
        result.setUTCFullYear(result.getUTCFullYear() + years);
        return pass(result);
    }

    /**
     * Executes the toEndOfDay handler step.
     * @param {any} date
     * @returns {HandlerResult}
     */
    static toEndOfDay(date: any): HandlerResult {
        const result = new Date(Utils.parseDate(date)!.date);
        result.setUTCHours(23, 59, 59, 999);
        return pass(result);
    }

    /**
     * Executes the toEndOfMonth handler step.
     * @param {any} date
     * @returns {HandlerResult}
     */
    static toEndOfMonth(date: any): HandlerResult {
        const result = new Date(Utils.parseDate(date)!.date);
        result.setUTCMonth(result.getUTCMonth() + 1, 0);
        result.setUTCHours(23, 59, 59, 999);
        return pass(result);
    }

    /**
     * Executes the toNextDayOfWeek handler step.
     * @param {any} date
     * @param {any} targetDay
     * @returns {HandlerResult}
     */
    static toNextDayOfWeek(date: any, targetDay: any): HandlerResult {
        if (targetDay < 0 || targetDay > 6) {
            return fail(date, 'date/toNextDayOfWeek', { targetDay });
        }

        const result = new Date(Utils.parseDate(date)!.date);
        const currentDay = result.getUTCDay();
        let daysToAdd = targetDay - currentDay;

        if (daysToAdd <= 0) {
            daysToAdd += 7;
        }

        result.setUTCDate(result.getUTCDate() + daysToAdd);
        return pass(result);
    }

    /**
     * Executes the toNextWeekday handler step.
     * @param {any} date
     * @returns {HandlerResult}
     */
    static toNextWeekday(date: any): HandlerResult {
        const result = new Date(Utils.parseDate(date)!.date);
        do {
            result.setUTCDate(result.getUTCDate() + 1);
        }
        while (result.getUTCDay() === 0 || result.getUTCDay() === 6);

        return pass(result);
    }

    /**
     * Executes the toPreviousWeekday handler step.
     * @param {any} date
     * @returns {HandlerResult}
     */
    static toPreviousWeekday(date: any): HandlerResult {
        const result = new Date(Utils.parseDate(date)!.date);
        do {
            result.setUTCDate(result.getUTCDate() - 1);
        }
        while (result.getUTCDay() === 0 || result.getUTCDay() === 6);

        return pass(result);
    }

    /**
     * Executes the toStartOfDay handler step.
     * @param {any} date
     * @returns {HandlerResult}
     */
    static toStartOfDay(date: any): HandlerResult {
        const result = new Date(Utils.parseDate(date)!.date);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

    /**
     * Executes the toStartOfMonth handler step.
     * @param {any} date
     * @returns {HandlerResult}
     */
    static toStartOfMonth(date: any): HandlerResult {
        const result = new Date(Utils.parseDate(date)!.date);
        result.setUTCDate(1);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

    /**
     * Executes the toStartOfYear handler step.
     * @param {any} date
     * @returns {HandlerResult}
     */
    static toStartOfYear(date: any): HandlerResult {
        const result = new Date(Utils.parseDate(date)!.date);
        result.setUTCMonth(0, 1);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

}


export { DateHandler };
