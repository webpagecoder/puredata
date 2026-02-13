'use strict';

import DateUtils  from '../utils/DateUtils.js';
import { pass, fail }  from '../Result.js';
import GenericProcessors  from './GenericProcessors.js';
import DATE_TYPES  from '../utils/DateTypes.js';

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

class DateProcessors extends GenericProcessors {

    // Validators

    static equals(date, compareDate) {
        const dateInfo = DateUtils.parse(date);
        const compareDateObject = DateUtils.parse(compareDate);

        if (!dateInfo || !compareDateObject) {
            return fail(date, 'date/equals', { date, compareDate });
        }

        return dateInfo.getTime() === compareDateObject.getTime()
            ? pass(date)
            : fail(date, 'date/equals', { date, compareDate });
    }

    static after(date, afterDate) {
        const dateInfo = DateUtils.parse(date);
        const afterDateInfo = DateUtils.parse(afterDate);

        if (!dateInfo || !afterDateInfo) {
            return fail(date, 'date/after', { date, afterDate });
        }

        return dateInfo > afterDateInfo
            ? pass(date)
            : fail(date, 'date/after', { date, afterDate });
    }

    static before(date, beforeDate) {
        const dateInfo = DateUtils.parse(date);
        const beforeDateInfo = DateUtils.parse(beforeDate);

        if (!dateInfo || !beforeDateInfo) {
            return fail(date, 'date/before', { date, beforeDate });
        }

        return dateInfo < beforeDateInfo
            ? pass(date)
            : fail(date, 'date/before', { date, beforeDate });
    }

    static between(date, minDate, maxDate) {
        const dateInfo = DateUtils.parse(date);
        const minDateObject = DateUtils.parse(minDate);
        const maxDateObject = DateUtils.parse(maxDate);

        if (!dateInfo || !minDateObject || !maxDateObject) {
            return fail(date, 'date/between', { date, minDate, maxDate });
        }

        return dateInfo >= minDateObject && dateInfo <= maxDateObject
            ? pass(date)
            : fail(date, 'date/between', { date, minDate, maxDate });
    }

    static dayOfWeek(date, dayOfWeek) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo) {
            return fail(date, 'date/dayOfWeek', { date });
        }
        const dayIndex = dateInfo.date.getUTCDay();
        return dayIndex === dayOfWeek
            ? pass(date)
            : fail(date, 'date/dayOfWeek', { date, dayOfWeek });
    }

    static human(dateString, {
        required = ['YYYY', 'MM', 'DD'],
        forbidden = ['HHOffset'],
        monthBeforeDay = true,
        numberSuffixes,
        fullMonths,
        shortMonths,
    } = {}) {

        const dateInfo = DateUtils.parseFromHuman(dateString, {
            monthBeforeDay,
            numberSuffixes,
            fullMonths,
            shortMonths,
        });
        if (!dateInfo) {
            return fail(dateString, 'date/human');
        }

        const { date, parsed } = dateInfo;
        if (!areOptionsCompliant(parsed, required, forbidden)) {
            return fail(dateString, 'date/human');
        }
        return pass(date);
    }

    static future(date, referenceDate = new Date()) {
        const dateInfo = DateUtils.parse(date);
        const refDateInfo = DateUtils.parse(referenceDate);

        if (!dateInfo || !refDateInfo) {
            return fail(date, 'date/future', { date, referenceDate });
        }

        return dateInfo.date > refDateInfo.date
            ? pass(date)
            : fail(date, 'date/future', { date, referenceDate });
    }

    static iso(dateString, {
        required = ['YYYY', 'MM', 'DD'],
        forbidden = ['HHOffset'],
        allowBasic = false,
    } = {}) {
        const dateInfo = DateUtils.parseFromIso(dateString, [DATE_TYPES.ISO]);
        if (!dateInfo) {
            return fail(dateString, 'date/iso');
        }

        const { date, parsed } = dateInfo;
        if (!areOptionsCompliant(parsed, required, forbidden)) {
            return fail(dateString, 'date/iso');
        }
        if (!allowBasic && !dateInfo.parsed.isExtended) {
            return fail(dateString, 'date/iso');
        }

        return pass(date);
    }

    static isoOrdinal(dateString, allowBasic = false) {
        const dateInfo = DateUtils.parseFromIsoOrdinal(dateString);
        if (!dateInfo) {
            return fail(dateString, 'date/isoOrdinal');
        }

        const { date, parsed } = dateInfo;
        if (!allowBasic && !parsed.isExtended) {
            return fail(dateString, 'date/isoOrdinal');
        }
        return pass(date);
    }

    static isoWeek(dateString, allowBasic = false) {
        const dateInfo = DateUtils.parseFromIsoWeek(dateString);
        if (!dateInfo) {
            return fail(dateString, 'date/isoWeek');
        }

        const { date, parsed } = dateInfo;
        if (!allowBasic && !parsed.isExtended) {
            return fail(dateString, 'date/isoWeek');
        }
        return pass(dateInfo.date);
    }

    static leapYear(date) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo) {
            return fail(date, 'date/leapYear', { date });
        }
        const year = dateInfo.date.getUTCFullYear();
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
            ? pass(date)
            : fail(date, 'date/leapYear', { year });
    }

    static max(date, maxDate) {
        const dateInfo = DateUtils.parse(date);
        const maxDateInfo = DateUtils.parse(maxDate);

        if (!dateInfo || !maxDateInfo) {
            return fail(date, 'date/max', { date, maxDate });
        }

        return dateInfo <= maxDateInfo
            ? pass(date)
            : fail(date, 'date/max', { date, maxDate });
    }

    static min(date, minDate) {
        const dateInfo = DateUtils.parse(date);
        const minDateInfo = DateUtils.parse(minDate);

        if (!dateInfo || !minDateInfo) {
            return fail(date, 'date/min', { date, compareDate: minDate });
        }

        return dateInfo >= minDateInfo
            ? pass(date)
            : fail(date, 'date/min', { date, compareDate: minDate });
    }

    static minAge(birthDate, minAge, referenceDate = new Date()) {
        const birthInfo = DateUtils.parse(birthDate);
        const refInfo = DateUtils.parse(referenceDate);

        if (!birthInfo || !refInfo) {
            return fail(birthDate, 'date/minAge', { birthDate, minAge });
        }
        const date = new Date(birthInfo.date);
        const refDate = new Date(refInfo.date);
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
        const dateInfo = DateUtils.parse(date);
        const refDateInfo = DateUtils.parse(referenceDate);

        if (!dateInfo || !refDateInfo) {
            return fail(date, 'date/past', { date, referenceDate });
        }

        return dateInfo.date < refDateInfo.date
            ? pass(date)
            : fail(date, 'date/past', { date, referenceDate });
    }

    static recent(date, days = 30, referenceDate = new Date()) {
        const dateInfo = DateUtils.parse(date);
        const refDateInfo = DateUtils.parse(referenceDate);

        if (!dateInfo || !refDateInfo) {
            return fail(date, 'date/recent', { date, days, referenceDate });
        }

        const daysDiff = (refDateInfo.date - dateInfo.date) / (1000 * 60 * 60 * 24);
        return daysDiff >= 0 && daysDiff <= days
            ? pass(date)
            : fail(date, 'date/recent', { daysDiff, days });
    }

    static timestamp(value, jsType = true) {
        const dateInfo = DateUtils.parseFromTimestamp(value);
        if (!dateInfo) {
            return fail(value, 'date/timestamp');
        }
        return pass(dateInfo.date);
    }

    static today(date, todaysDate) {
        const dateInfo = DateUtils.parse(date);
        const todaysDateObject = DateUtils.parse(todaysDate);
        if (!dateInfo || !todaysDateObject) {
            return fail(date, 'date/today', { date, todaysDate });
        }
        const newDate = new Date(dateInfo.date);
        newDate.setUTCHours(0, 0, 0, 0);
        todaysDateObject.setUTCHours(0, 0, 0, 0);
        return newDate.getTime() === todaysDateObject.getTime()
            ? pass(date)
            : fail(date, 'date/today', { date });
    }

    static weekday(date) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo) {
            return fail(date, 'date/weekday', { date });
        }

        const dayOfWeek = dateInfo.date.getUTCDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5
            ? pass(date)
            : fail(date, 'date/weekday', { dayOfWeek });
    }

    static weekend(date) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo) {
            return fail(date, 'date/weekend', { date });
        }

        const dayOfWeek = dateInfo.date.getUTCDay();
        return dayOfWeek === 0 || dayOfWeek === 6
            ? pass(date)
            : fail(date, 'date/weekend', { dayOfWeek });
    }


    // Transformers


    static addDays(date, days) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo || !Number.isInteger(days)) {
            return fail(date, 'date/addDays', { date, days });
        }

        const result = new Date(dateInfo.date);
        result.setUTCDate(result.getUTCDate() + days);
        return pass(result);
    }

    static addHours(date, hours) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo || typeof hours !== 'number') {
            return fail(date, 'date/addHours', { date, hours });
        }

        const result = new Date(dateInfo.date);
        result.setUTCHours(result.getUTCHours() + hours);
        return pass(result);
    }

    static addMinutes(date, minutes) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo || typeof minutes !== 'number') {
            return fail(date, 'date/addMinutes', { date, minutes });
        }

        const result = new Date(dateInfo.date);
        result.setUTCMinutes(result.getUTCMinutes() + minutes);
        return pass(result);
    }

    static addMonths(date, months) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo || !Number.isInteger(months)) {
            return fail(date, 'date/addMonths', { date, months });
        }

        const result = new Date(dateInfo.date);
        result.setUTCMonth(result.getUTCMonth() + months);
        return pass(result);
    }

    static addYears(date, years) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo || !Number.isInteger(years)) {
            return fail(date, 'date/addYears', { date, years });
        }

        const result = new Date(dateInfo.date);
        result.setUTCFullYear(result.getUTCFullYear() + years);
        return pass(result);
    }

    static toEndOfDay(date) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo) {
            return fail(date, 'date/toEndOfDay', { date });
        }

        const result = new Date(dateInfo.date);
        result.setUTCHours(23, 59, 59, 999);
        return pass(result);
    }

    static toEndOfMonth(date) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo) {
            return fail(date, 'date/toEndOfMonth', { date });
        }

        const result = new Date(dateInfo.date);
        result.setUTCMonth(result.getUTCMonth() + 1, 0);
        result.setUTCHours(23, 59, 59, 999);
        return pass(result);
    }

    static toNextDayOfWeek(date, targetDay) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo || targetDay < 0 || targetDay > 6) {
            return fail(date, 'date/toNextDayOfWeek', { date, targetDay });
        }

        const result = new Date(dateInfo.date);
        const currentDay = result.getUTCDay();
        let daysToAdd = targetDay - currentDay;

        if (daysToAdd <= 0) {
            daysToAdd += 7;
        }

        result.setUTCDate(result.getUTCDate() + daysToAdd);
        return pass(result);
    }

    static toNextWeekday(date) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo) {
            return fail(date, 'date/toNextWeekday', { date });
        }

        const result = new Date(dateInfo.date);
        do {
            result.setUTCDate(result.getUTCDate() + 1);
        }
        while (result.getUTCDay() === 0 || result.getUTCDay() === 6);

        return pass(result);
    }

    static toPreviousWeekday(date) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo) {
            return fail(date, 'date/toPreviousWeekday', { date });
        }

        const result = new Date(dateInfo.date);
        do {
            result.setUTCDate(result.getUTCDate() - 1);
        }
        while (result.getUTCDay() === 0 || result.getUTCDay() === 6);

        return pass(result);
    }

    static toStartOfDay(date) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo) {
            return fail(date, 'date/toStartOfDay', { date });
        }

        const result = new Date(dateInfo.date);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

    static toStartOfMonth(date) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo) {
            return fail(date, 'date/toStartOfMonth', { date });
        }

        const result = new Date(dateInfo.date);
        result.setUTCDate(1);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

    static toStartOfYear(date) {
        const dateInfo = DateUtils.parse(date);
        if (!dateInfo) {
            return fail(date, 'date/toStartOfYear', { date });
        }

        const result = new Date(dateInfo.date);
        result.setUTCMonth(0, 1);
        result.setUTCHours(0, 0, 0, 0);
        return pass(result);
    }

}


export default  DateProcessors;
