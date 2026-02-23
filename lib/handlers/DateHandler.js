'use strict';
//TODO: revisit if we need to be checking the 2nd and subsequent args for data types

import ProcessResult from '../ProcessResult.js';
import DATE_TYPES from '../utils/DateTypes.js';
import DateUtils from '../utils/DateUtils.js';
import GenericHandler from './GenericHandler.js';
const { pass, fail } = ProcessResult;

function areOptionsCompliant(parsed = {}, required = [], forbidden = []) {
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

class DateHandler extends GenericHandler {

    // ====================================
    // VALIDATORS 
    // ====================================

    static after(date, afterDate) {
        const parsedAfterDate = DateUtils.parse(afterDate);
        if (!parsedAfterDate) {
            return fail(date, 'date/base', { date: afterDate });
        }

        return DateUtils.parse(date).date > parsedAfterDate.date
            ? pass(date)
            : fail(date, 'date/after', { afterDate });
    }

    static before(date, beforeDate) {
        const parsedBeforeDate = DateUtils.parse(beforeDate);

        if (!parsedBeforeDate) {
            return fail(date, 'date/base', { date: beforeDate });
        }

        return DateUtils.parse(date).date < parsedBeforeDate.date
            ? pass(date)
            : fail(date, 'date/before', { beforeDate });
    }

    static between(date, minDate, maxDate) {
        const parsedMinDate = DateUtils.parse(minDate);
        const parsedMaxDate = DateUtils.parse(maxDate);
        if (!parsedMinDate) {
            return fail(date, 'date/base', { date: minDate });
        }
        if (!parsedMaxDate) {
            return fail(date, 'date/base', { date: maxDate });
        }

        const parsedDate = DateUtils.parse(date);
        return parsedDate.date >= parsedMinDate.date && parsedDate.date <= parsedMaxDate.date
            ? pass(date)
            : fail(date, 'date/between', { minDate, maxDate });
    }

    static dayOfWeek(date, dayOfWeek) {
        const dayIndex = DateUtils.parse(date).date.getUTCDay();
        return dayIndex === dayOfWeek
            ? pass(date)
            : fail(date, 'date/dayOfWeek', { dayOfWeek });
    }

    static equals(date, compareDate) {
        const parsedCompareDate = DateUtils.parse(compareDate);

        if (!parsedCompareDate) {
            return fail(date, 'date/base', { date: compareDate });
        }

        return DateUtils.parse(date).date.getTime() === parsedCompareDate.date.getTime()
            ? pass(date)
            : fail(date, 'date/equals', { compareDate });
    }

    static future(date, referenceDate = new Date()) {
        const parsedReferenceDate = DateUtils.parse(referenceDate);

        if (!parsedReferenceDate) {
            return fail(date, 'date/base', { date: referenceDate });
        }

        return DateUtils.parse(date).date > parsedReferenceDate.date
            ? pass(date)
            : fail(date, 'date/future', { referenceDate });
    }

    static human(dateString, {
        required = ['YYYY', 'MM', 'DD'],
        forbidden = ['HHOffset'],
        monthBeforeDay = true,
        numberSuffixes,
        fullMonths,
        shortMonths,
    } = {}) {

        const parsedDate = DateUtils.parseFromHuman(dateString, {
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

    static iso(dateString, {
        required = ['YYYY', 'MM', 'DD'],
        forbidden = [],
        allowBasic = false,
    } = {}) {
        const parsedDate = DateUtils.parseFromIso(dateString, [DATE_TYPES.ISO]);
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

    static isoOrdinal(dateString, allowBasic = false) {
        const parsedDate = DateUtils.parseFromIsoOrdinal(dateString);
        if (!parsedDate) {
            return fail(dateString, 'date/isoOrdinal');
        }

        const { date, parsed } = parsedDate;
        if (!allowBasic && !parsed.isExtended) {
            return fail(dateString, 'date/isoOrdinal');
        }
        return pass(date);
    }

    static isoWeek(dateString, allowBasic = false) {
        const parsedDate = DateUtils.parseFromIsoWeek(dateString);
        if (!parsedDate) {
            return fail(dateString, 'date/isoWeek');
        }

        const { date, parsed } = parsedDate;
        if (!allowBasic && !parsed.isExtended) {
            return fail(dateString, 'date/isoWeek');
        }
        return pass(parsedDate.date);
    }

    static leapYear(date) {
        const year = DateUtils.parse(date).date.getUTCFullYear();
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
            ? pass(date)
            : fail(date, 'date/leapYear', { year });
    }

    static max(date, maxDate) {
        const parsedMaxDate = DateUtils.parse(maxDate);

        if (!parsedMaxDate) {
            return fail(date, 'date/base', { date: maxDate });
        }

        return DateUtils.parse(date).date <= parsedMaxDate.date
            ? pass(date)
            : fail(date, 'date/max', { maxDate });
    }

    static min(date, minDate) {
        const parsedMinDate = DateUtils.parse(minDate);

        if (!parsedMinDate) {
            return fail(date, 'date/base', { date: minDate });
        }

        return DateUtils.parse(date).date >= parsedMinDate.date
            ? pass(date)
            : fail(date, 'date/min', { compareDate: minDate });
    }

    static minAge(birthDate, minAge, referenceDate = new Date()) {
        const parsedBirthDate = DateUtils.parse(birthDate);
        const parsedReferenceDate = DateUtils.parse(referenceDate);

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

    static past(date, referenceDate = new Date()) {
        const parsedReferenceDate = DateUtils.parse(referenceDate);

        if (!parsedReferenceDate) {
            return fail(date, 'date/base', { date: referenceDate });
        }

        return DateUtils.parse(date).date < parsedReferenceDate.date
            ? pass(date)
            : fail(date, 'date/past', { referenceDate });
    }

    static recent(date, days = 30, referenceDate = new Date()) {
        const parsedReferenceDate = DateUtils.parse(referenceDate);

        if (!parsedReferenceDate) {
            return fail(date, 'date/base', { date: referenceDate });
        }

        const daysDiff = (parsedReferenceDate.date - DateUtils.parse(date).date) / (1000 * 60 * 60 * 24);
        return daysDiff >= 0 && daysDiff <= days
            ? pass(date)
            : fail(date, 'date/recent', { daysDiff, days });
    }

    static timestamp(value, jsType = true) {
        const parsedDate = DateUtils.parseFromTimestamp(value);
        if (!parsedDate) {
            return fail(value, 'date/timestamp');
        }
        return pass(parsedDate.date);
    }

    static today(date, todaysDate) {
        const parsedTodaysDate = DateUtils.parse(todaysDate);
        if (!parsedTodaysDate) {
            return fail(date, 'date/base', { date: todaysDate });
        }
        const newDate = new Date(DateUtils.parse(date).date);
        newDate.setUTCHours(0, 0, 0, 0);
        const normalizedTodayDate = new Date(parsedTodaysDate.date);
        normalizedTodayDate.setUTCHours(0, 0, 0, 0);
        return newDate.getTime() === normalizedTodayDate.getTime()
            ? pass(date)
            : fail(date, 'date/today', {});
    }

    static weekday(date) {
        const dayOfWeek = DateUtils.parse(date).date.getUTCDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5
            ? pass(date)
            : fail(date, 'date/weekday', { dayOfWeek });
    }

    static weekend(date) {
        const dayOfWeek = DateUtils.parse(date).date.getUTCDay();
        return dayOfWeek === 0 || dayOfWeek === 6
            ? pass(date)
            : fail(date, 'date/weekend', { dayOfWeek });
    }


    // ====================================
    // MUTATORS 
    // ====================================

    static addDays(date, days) {
        if (!Number.isInteger(days)) {
            return fail(date, 'date/addDays', { days });
        }

        const result = new Date(DateUtils.parse(date).date);
        result.setUTCDate(result.getUTCDate() + days);
        return pass(result);
    }

    static addHours(date, hours) {
        if (!Number.isInteger(hours)) {
            return fail(date, 'date/addHours', { hours });
        }

        const result = new Date(DateUtils.parse(date).date);
        result.setUTCHours(result.getUTCHours() + hours);
        return pass(result);
    }

    static addMinutes(date, minutes) {
        if (!Number.isInteger(minutes)) {
            return fail(date, 'date/addMinutes', { minutes });
        }

        const result = new Date(DateUtils.parse(date).date);
        result.setUTCMinutes(result.getUTCMinutes() + minutes);
        return pass(result);
    }

    static addMonths(date, months) {
        if (!Number.isInteger(months)) {
            return fail(date, 'date/addMonths', { months });
        }

        const result = new Date(DateUtils.parse(date).date);
        result.setUTCMonth(result.getUTCMonth() + months);
        return pass(result);
    }

    static addYears(date, years) {
        if (!Number.isInteger(years)) {
            return fail(date, 'date/addYears', { years });
        }

        const result = new Date(DateUtils.parse(date).date);
        result.setUTCFullYear(result.getUTCFullYear() + years);
        return pass(result);
    }

    static toEndOfDay(date) {
        const result = new Date(DateUtils.parse(date).date);
        result.setUTCHours(23, 59, 59, 999);
        return pass(result);
    }

    static toEndOfMonth(date) {
        const result = new Date(DateUtils.parse(date).date);
        result.setUTCMonth(result.getUTCMonth() + 1, 0);
        result.setUTCHours(23, 59, 59, 999);
        return pass(result);
    }

    static toNextDayOfWeek(date, targetDay) {
        if (targetDay < 0 || targetDay > 6) {
            return fail(date, 'date/toNextDayOfWeek', { targetDay });
        }

        const result = new Date(DateUtils.parse(date).date);
        const currentDay = result.getUTCDay();
        let daysToAdd = targetDay - currentDay;

        if (daysToAdd <= 0) {
            daysToAdd += 7;
        }

        result.setUTCDate(result.getUTCDate() + daysToAdd);
        return pass(result);
    }

    static toNextWeekday(date) {
        const result = new Date(DateUtils.parse(date).date);
        do {
            result.setUTCDate(result.getUTCDate() + 1);
        }
        while (result.getUTCDay() === 0 || result.getUTCDay() === 6);

        return pass(result);
    }

    static toPreviousWeekday(date) {
        const result = new Date(DateUtils.parse(date).date);
        do {
            result.setUTCDate(result.getUTCDate() - 1);
        }
        while (result.getUTCDay() === 0 || result.getUTCDay() === 6);

        return pass(result);
    }

    static toStartOfDay(date) {
        const result = new Date(DateUtils.parse(date).date);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

    static toStartOfMonth(date) {
        const result = new Date(DateUtils.parse(date).date);
        result.setUTCDate(1);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

    static toStartOfYear(date) {
        const result = new Date(DateUtils.parse(date).date);
        result.setUTCMonth(0, 1);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

}


export default DateHandler;
