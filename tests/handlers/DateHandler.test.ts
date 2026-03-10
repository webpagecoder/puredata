'use strict';

import { DateHandler } from '../../lib/handlers/DateHandler.ts';

// ====================================
// VALIDATORS
// ====================================

describe('DateHandler.after', () => {
    
    test('should pass when date is after compareDate', () => {
        const date = new Date('2024-01-15');
        const afterDate = new Date('2024-01-10');
        const result = DateHandler.after(date, afterDate);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should fail when date is before compareDate', () => {
        const date = new Date('2024-01-10');
        const afterDate = new Date('2024-01-15');
        const result = DateHandler.after(date, afterDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/after');
    });

    test('should fail when dates are equal', () => {
        const date = new Date('2024-01-15');
        const afterDate = new Date('2024-01-15');
        const result = DateHandler.after(date, afterDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
    });

    test('should work with date strings', () => {
        const date = '2024-01-15';
        const afterDate = '2024-01-10';
        const result = DateHandler.after(date, afterDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid afterDate', () => {
        const date = new Date('2024-01-15');
        const afterDate = 'invalid';
        const result = DateHandler.after(date, afterDate);
        
        expect(result.pass).toBe(false);
    });

});

describe('DateHandler.before', () => {
    
    test('should pass when date is before compareDate', () => {
        const date = new Date('2024-01-10');
        const beforeDate = new Date('2024-01-15');
        const result = DateHandler.before(date, beforeDate);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should fail when date is after compareDate', () => {
        const date = new Date('2024-01-15');
        const beforeDate = new Date('2024-01-10');
        const result = DateHandler.before(date, beforeDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/before');
    });

    test('should fail when dates are equal', () => {
        const date = new Date('2024-01-15');
        const beforeDate = new Date('2024-01-15');
        const result = DateHandler.before(date, beforeDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
    });

    test('should work with date strings', () => {
        const date = '2024-01-10';
        const beforeDate = '2024-01-15';
        const result = DateHandler.before(date, beforeDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid beforeDate', () => {
        const date = new Date('2024-01-10');
        const beforeDate = 'invalid';
        const result = DateHandler.before(date, beforeDate);

        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/base');
        expect(errors[0].args).toEqual({ date: beforeDate });
    });

});

describe('DateHandler.between', () => {
    
    test('should pass when date is between minDate and maxDate', () => {
        const date = new Date('2024-01-15');
        const minDate = new Date('2024-01-10');
        const maxDate = new Date('2024-01-20');
        const result = DateHandler.between(date, minDate, maxDate);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should pass when date equals minDate', () => {
        const date = new Date('2024-01-10');
        const minDate = new Date('2024-01-10');
        const maxDate = new Date('2024-01-20');
        const result = DateHandler.between(date, minDate, maxDate);
        
        expect(result.pass).toBe(true);
    });

    test('should pass when date equals maxDate', () => {
        const date = new Date('2024-01-20');
        const minDate = new Date('2024-01-10');
        const maxDate = new Date('2024-01-20');
        const result = DateHandler.between(date, minDate, maxDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail when date is before minDate', () => {
        const date = new Date('2024-01-05');
        const minDate = new Date('2024-01-10');
        const maxDate = new Date('2024-01-20');
        const result = DateHandler.between(date, minDate, maxDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/between');
    });

    test('should fail when date is after maxDate', () => {
        const date = new Date('2024-01-25');
        const minDate = new Date('2024-01-10');
        const maxDate = new Date('2024-01-20');
        const result = DateHandler.between(date, minDate, maxDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
    });

    test('should work with date strings', () => {
        const date = '2024-01-15';
        const minDate = '2024-01-10';
        const maxDate = '2024-01-20';
        const result = DateHandler.between(date, minDate, maxDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid minDate', () => {
        const date = new Date('2024-01-15');
        const minDate = 'invalid';
        const maxDate = new Date('2024-01-20');
        const result = DateHandler.between(date, minDate, maxDate);

        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/base');
        expect(errors[0].args).toEqual({ date: minDate });
    });

    test('should fail with invalid maxDate', () => {
        const date = new Date('2024-01-15');
        const minDate = new Date('2024-01-10');
        const maxDate = 'invalid';
        const result = DateHandler.between(date, minDate, maxDate);

        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/base');
        expect(errors[0].args).toEqual({ date: maxDate });
    });

});

describe('DateHandler.dayOfWeek', () => {
    
    test('should pass when date has correct day of week', () => {
        const date = new Date('2024-01-15'); // Monday
        const result = DateHandler.dayOfWeek(date, 1);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should pass for Sunday (0)', () => {
        const date = new Date('2024-01-14'); // Sunday
        const result = DateHandler.dayOfWeek(date, 0);
        
        expect(result.pass).toBe(true);
    });

    test('should pass for Saturday (6)', () => {
        const date = new Date('2024-01-13'); // Saturday
        const result = DateHandler.dayOfWeek(date, 6);
        
        expect(result.pass).toBe(true);
    });

    test('should fail when day does not match', () => {
        const date = new Date('2024-01-15'); // Monday
        const result = DateHandler.dayOfWeek(date, 2); // Tuesday
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/dayOfWeek');
    });

    test('should work with date strings', () => {
        const date = '2024-01-15'; // Monday
        const result = DateHandler.dayOfWeek(date, 1);
        
        expect(result.pass).toBe(true);
    });

});

describe('DateHandler.equals', () => {
    
    test('should pass when dates are equal', () => {
        const date = new Date('2024-01-15T10:30:00Z');
        const compareDate = new Date('2024-01-15T10:30:00Z');
        const result = DateHandler.equals(date, compareDate);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should fail when dates are different', () => {
        const date = new Date('2024-01-15T10:30:00Z');
        const compareDate = new Date('2024-01-15T10:31:00Z');
        const result = DateHandler.equals(date, compareDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/equals');
    });

    test('should work with date strings', () => {
        const date = '2024-01-15';
        const compareDate = '2024-01-15';
        const result = DateHandler.equals(date, compareDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid compareDate', () => {
        const date = new Date('2024-01-15');
        const compareDate = 'invalid';
        const result = DateHandler.equals(date, compareDate);
        
        expect(result.pass).toBe(false);
    });

});

describe('DateHandler.future', () => {
    
    test('should pass when date is in the future', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2024-01-20');
        const result = DateHandler.future(date, referenceDate);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should fail when date is in the past', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2024-01-10');
        const result = DateHandler.future(date, referenceDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/future');
    });

    test('should fail when dates are equal', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2024-01-15');
        const result = DateHandler.future(date, referenceDate);
        
        expect(result.pass).toBe(false);
    });

    test('should use current date when referenceDate not provided', () => {
        const futureDate = new Date(Date.now() + 86400000); // Tomorrow
        const result = DateHandler.future(futureDate);
        
        expect(result.pass).toBe(true);
    });

    test('should work with date strings', () => {
        const referenceDate = '2024-01-15';
        const date = '2024-01-20';
        const result = DateHandler.future(date, referenceDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid referenceDate', () => {
        const date = new Date('2024-01-20');
        const referenceDate = 'invalid';
        const result = DateHandler.future(date, referenceDate);

        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/base');
        expect(errors[0].args).toEqual({ date: referenceDate });
    });

});

describe('DateHandler.human', () => {
    
    test('should pass with valid human date format', () => {
        const dateString = 'January 15, 2024';
        const result = DateHandler.human(dateString);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    test('should pass with short month format', () => {
        const dateString = 'Jan 15, 2024';
        const result = DateHandler.human(dateString);
        
        expect(result.pass).toBe(true);
    });

    test('should pass with numeric format', () => {
        const dateString = '01/15/2024';
        const result = DateHandler.human(dateString);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid format', () => {
        const dateString = 'not a date';
        const result = DateHandler.human(dateString);
        
        expect(result.pass).toBe(false);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/human');
    });

    test('should respect required options', () => {
        const dateString = '2024';
        const result = DateHandler.human(dateString, {
            required: ['YYYY', 'MM', 'DD']
        });
        
        expect(result.pass).toBe(false);
    });

    test('should respect forbidden options', () => {
        const dateString = 'January 15, 2024 10:30';
        const result = DateHandler.human(dateString, {
            forbidden: ['HH']
        });
        
        expect(result.pass).toBe(false);
    });

    test('should fail when required options are missing from a valid parse', () => {
        const dateString = 'January 15, 2024';
        const result = DateHandler.human(dateString, {
            required: ['YYYY', 'MM', 'DD', 'HH']
        });

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('date/human');
    });

    test('should parse day-before-month when monthBeforeDay is false', () => {
        const dateString = '15 January 2024';
        const result = DateHandler.human(dateString, {
            monthBeforeDay: false,
            required: ['YYYY', 'MM', 'DD']
        });

        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

});

describe('DateHandler.iso', () => {
    
    test('should pass with valid ISO date', () => {
        const dateString = '2024-01-15';
        const result = DateHandler.iso(dateString);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    test('should pass with ISO datetime', () => {
        const dateString = '2024-01-15T10:30:00Z';
        const result = DateHandler.iso(dateString);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with basic format by default', () => {
        const dateString = '20240115';
        const result = DateHandler.iso(dateString);
        
        expect(result.pass).toBe(false);
    });

    test('should pass with basic format when allowed', () => {
        const dateString = '20240115';
        const result = DateHandler.iso(dateString, { allowBasic: true });
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid format', () => {
        const dateString = 'not iso';
        const result = DateHandler.iso(dateString);
        
        expect(result.pass).toBe(false);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/iso');
    });

    test('should respect required options', () => {
        const dateString = '2024-01';
        const result = DateHandler.iso(dateString, {
            required: ['YYYY', 'MM', 'DD']
        });
        
        expect(result.pass).toBe(false);
    });

    test('should fail when forbidden parsed options are present', () => {
        const dateString = '2024-01-15T10:30:00Z';
        const result = DateHandler.iso(dateString, {
            forbidden: ['HH']
        });

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('date/iso');
    });

});

describe('DateHandler.isoOrdinal', () => {
    
    test('should pass with valid ISO ordinal date', () => {
        const dateString = '2024-015';
        const result = DateHandler.isoOrdinal(dateString);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    test('should fail with basic format by default', () => {
        const dateString = '2024015';
        const result = DateHandler.isoOrdinal(dateString);
        
        expect(result.pass).toBe(false);
    });

    test('should pass with basic format when allowed', () => {
        const dateString = '2024015';
        const result = DateHandler.isoOrdinal(dateString, true);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid format', () => {
        const dateString = 'not ordinal';
        const result = DateHandler.isoOrdinal(dateString);
        
        expect(result.pass).toBe(false);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/isoOrdinal');
    });

    test('should handle day 001', () => {
        const dateString = '2024-001';
        const result = DateHandler.isoOrdinal(dateString);
        
        expect(result.pass).toBe(true);
    });

    test('should handle day 365', () => {
        const dateString = '2024-365';
        const result = DateHandler.isoOrdinal(dateString);
        
        expect(result.pass).toBe(true);
    });

});

describe('DateHandler.isoWeek', () => {
    
    test('should pass with valid ISO week date', () => {
        const dateString = '2024-W03-1';
        const result = DateHandler.isoWeek(dateString);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    test('should fail with basic format by default', () => {
        const dateString = '2024W031';
        const result = DateHandler.isoWeek(dateString);
        
        expect(result.pass).toBe(false);
    });

    test('should pass with basic format when allowed', () => {
        const dateString = '2024W031';
        const result = DateHandler.isoWeek(dateString, true);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid format', () => {
        const dateString = 'not week';
        const result = DateHandler.isoWeek(dateString);
        
        expect(result.pass).toBe(false);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/isoWeek');
    });

    test('should handle week 01', () => {
        const dateString = '2024-W01-1';
        const result = DateHandler.isoWeek(dateString);
        
        expect(result.pass).toBe(true);
    });

    test('should handle week 52', () => {
        const dateString = '2024-W52-7';
        const result = DateHandler.isoWeek(dateString);
        
        expect(result.pass).toBe(true);
    });

});

describe('DateHandler.leapYear', () => {
    
    test('should pass for leap year divisible by 4', () => {
        const date = new Date('2024-01-15');
        const result = DateHandler.leapYear(date);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should pass for leap year divisible by 400', () => {
        const date = new Date('2000-01-15');
        const result = DateHandler.leapYear(date);
        
        expect(result.pass).toBe(true);
    });

    test('should fail for non-leap year divisible by 100', () => {
        const date = new Date('1900-01-15');
        const result = DateHandler.leapYear(date);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/leapYear');
    });

    test('should fail for regular non-leap year', () => {
        const date = new Date('2023-01-15');
        const result = DateHandler.leapYear(date);
        
        expect(result.pass).toBe(false);
    });

    test('should work with date strings', () => {
        const date = '2024-01-15';
        const result = DateHandler.leapYear(date);
        
        expect(result.pass).toBe(true);
    });

});

describe('DateHandler.max', () => {
    
    test('should pass when date is before maxDate', () => {
        const date = new Date('2024-01-10');
        const maxDate = new Date('2024-01-15');
        const result = DateHandler.max(date, maxDate);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should pass when date equals maxDate', () => {
        const date = new Date('2024-01-15');
        const maxDate = new Date('2024-01-15');
        const result = DateHandler.max(date, maxDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail when date is after maxDate', () => {
        const date = new Date('2024-01-20');
        const maxDate = new Date('2024-01-15');
        const result = DateHandler.max(date, maxDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/max');
    });

    test('should work with date strings', () => {
        const date = '2024-01-10';
        const maxDate = '2024-01-15';
        const result = DateHandler.max(date, maxDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid maxDate', () => {
        const date = new Date('2024-01-10');
        const maxDate = 'invalid';
        const result = DateHandler.max(date, maxDate);

        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/base');
        expect(errors[0].args).toEqual({ date: maxDate });
    });

});

describe('DateHandler.min', () => {
    
    test('should pass when date is after minDate', () => {
        const date = new Date('2024-01-15');
        const minDate = new Date('2024-01-10');
        const result = DateHandler.min(date, minDate);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should pass when date equals minDate', () => {
        const date = new Date('2024-01-15');
        const minDate = new Date('2024-01-15');
        const result = DateHandler.min(date, minDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail when date is before minDate', () => {
        const date = new Date('2024-01-10');
        const minDate = new Date('2024-01-15');
        const result = DateHandler.min(date, minDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/min');
    });

    test('should work with date strings', () => {
        const date = '2024-01-15';
        const minDate = '2024-01-10';
        const result = DateHandler.min(date, minDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid minDate', () => {
        const date = new Date('2024-01-15');
        const minDate = 'invalid';
        const result = DateHandler.min(date, minDate);

        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/base');
        expect(errors[0].args).toEqual({ date: minDate });
    });

});

describe('DateHandler.minAge', () => {
    
    test('should pass when age is above minimum', () => {
        const birthDate = new Date('2000-01-15');
        const referenceDate = new Date('2024-01-15');
        const result = DateHandler.minAge(birthDate, 18, referenceDate);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(birthDate);
    });

    test('should pass when age equals minimum', () => {
        const birthDate = new Date('2006-01-15');
        const referenceDate = new Date('2024-01-15');
        const result = DateHandler.minAge(birthDate, 18, referenceDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail when age is below minimum', () => {
        const birthDate = new Date('2010-01-15');
        const referenceDate = new Date('2024-01-15');
        const result = DateHandler.minAge(birthDate, 18, referenceDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(birthDate);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/minAge');
    });

    test('should handle birthday not yet occurred this year', () => {
        const birthDate = new Date('2006-06-15');
        const referenceDate = new Date('2024-01-15');
        const result = DateHandler.minAge(birthDate, 18, referenceDate);
        
        expect(result.pass).toBe(false); // Only 17 years old
    });

    test('should handle birthday already occurred this year', () => {
        const birthDate = new Date('2006-01-01');
        const referenceDate = new Date('2024-06-15');
        const result = DateHandler.minAge(birthDate, 18, referenceDate);
        
        expect(result.pass).toBe(true); // 18 years old
    });

    test('should use current date when referenceDate not provided', () => {
        const birthDate = new Date('1990-01-15');
        const result = DateHandler.minAge(birthDate, 18);
        
        expect(result.pass).toBe(true);
    });

    test('should work with date strings', () => {
        const birthDate = '2000-01-15';
        const referenceDate = '2024-01-15';
        const result = DateHandler.minAge(birthDate, 18, referenceDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid date', () => {
        const birthDate = 'invalid';
        const referenceDate = new Date('2024-01-15');
        const result = DateHandler.minAge(birthDate, 18, referenceDate);
        
        expect(result.pass).toBe(false);
    });

    test('should fail with invalid referenceDate', () => {
        const birthDate = '2000-01-15';
        const referenceDate = 'invalid';
        const result = DateHandler.minAge(birthDate, 18, referenceDate);

        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/base');
        expect(errors[0].args).toEqual({ date: referenceDate });
    });

});

describe('DateHandler.past', () => {
    
    test('should pass when date is in the past', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2024-01-10');
        const result = DateHandler.past(date, referenceDate);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should fail when date is in the future', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2024-01-20');
        const result = DateHandler.past(date, referenceDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/past');
    });

    test('should fail when dates are equal', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2024-01-15');
        const result = DateHandler.past(date, referenceDate);
        
        expect(result.pass).toBe(false);
    });

    test('should use current date when referenceDate not provided', () => {
        const pastDate = new Date(Date.now() - 86400000); // Yesterday
        const result = DateHandler.past(pastDate);
        
        expect(result.pass).toBe(true);
    });

    test('should work with date strings', () => {
        const referenceDate = '2024-01-15';
        const date = '2024-01-10';
        const result = DateHandler.past(date, referenceDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid referenceDate', () => {
        const date = new Date('2024-01-10');
        const referenceDate = 'invalid';
        const result = DateHandler.past(date, referenceDate);

        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/base');
        expect(errors[0].args).toEqual({ date: referenceDate });
    });

});

describe('DateHandler.recent', () => {
    
    test('should pass when date is within recent days', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2024-01-10');
        const result = DateHandler.recent(date, 30, referenceDate);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should pass when date is at boundary', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2023-12-16'); // Exactly 30 days ago
        const result = DateHandler.recent(date, 30, referenceDate);
        
        expect(result.pass).toBe(true);
    });

    test('should pass when date is today', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2024-01-15');
        const result = DateHandler.recent(date, 30, referenceDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail when date is too old', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2023-12-01'); // More than 30 days ago
        const result = DateHandler.recent(date, 30, referenceDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/recent');
    });

    test('should fail when date is in the future', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2024-01-20');
        const result = DateHandler.recent(date, 30, referenceDate);
        
        expect(result.pass).toBe(false);
    });

    test('should use default 30 days', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2024-01-10');
        const result = DateHandler.recent(date, undefined, referenceDate);
        
        expect(result.pass).toBe(true);
    });

    test('should work with custom days', () => {
        const referenceDate = new Date('2024-01-15');
        const date = new Date('2024-01-13');
        const result = DateHandler.recent(date, 7, referenceDate);
        
        expect(result.pass).toBe(true);
    });

    test('should use current date when referenceDate not provided', () => {
        const recentDate = new Date(Date.now() - 86400000); // Yesterday
        const result = DateHandler.recent(recentDate, 30);
        
        expect(result.pass).toBe(true);
    });

    test('should work with date strings', () => {
        const referenceDate = '2024-01-15';
        const date = '2024-01-10';
        const result = DateHandler.recent(date, 30, referenceDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid referenceDate', () => {
        const date = new Date('2024-01-10');
        const referenceDate = 'invalid';
        const result = DateHandler.recent(date, 30, referenceDate);

        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/base');
        expect(errors[0].args).toEqual({ date: referenceDate });
    });

});

describe('DateHandler.timestamp', () => {
    
    test('should pass with valid JavaScript timestamp', () => {
        const timestamp = 1705305600000; // Jan 15, 2024
        const result = DateHandler.timestamp(timestamp);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    test('should pass with valid Unix timestamp', () => {
        const timestamp = 1705305600; // Jan 15, 2024 (seconds)
        const result = DateHandler.timestamp(timestamp, false);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    test('should pass with timestamp 0', () => {
        const timestamp = 0;
        const result = DateHandler.timestamp(timestamp);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid timestamp', () => {
        const timestamp = 'not a timestamp';
        const result = DateHandler.timestamp(timestamp);
        
        expect(result.pass).toBe(false);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/timestamp');
    });

    test('should fail with null', () => {
        const timestamp = null;
        const result = DateHandler.timestamp(timestamp);
        
        expect(result.pass).toBe(false);
    });

    test('should fail with undefined', () => {
        const timestamp = undefined;
        const result = DateHandler.timestamp(timestamp);
        
        expect(result.pass).toBe(false);
    });

    test('should pass with negative timestamp', () => {
        const timestamp = -86400000; // Dec 31, 1969 UTC
        const result = DateHandler.timestamp(timestamp);

        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
        expect(result.value.toISOString()).toBe('1969-12-31T00:00:00.000Z');
    });

});

describe('DateHandler.today', () => {
    
    test('should pass when date is today', () => {
        const date = new Date('2024-01-15T10:30:00Z');
        const todaysDate = new Date('2024-01-15T18:45:00Z');
        const result = DateHandler.today(date, todaysDate);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should fail when date is yesterday', () => {
        const date = new Date('2024-01-14');
        const todaysDate = new Date('2024-01-15');
        const result = DateHandler.today(date, todaysDate);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/today');
    });

    test('should fail when date is tomorrow', () => {
        const date = new Date('2024-01-16');
        const todaysDate = new Date('2024-01-15');
        const result = DateHandler.today(date, todaysDate);
        
        expect(result.pass).toBe(false);
    });

    test('should ignore time component', () => {
        const date = new Date('2024-01-15T01:00:00Z');
        const todaysDate = new Date('2024-01-15T23:00:00Z');
        const result = DateHandler.today(date, todaysDate);
        
        expect(result.pass).toBe(true);
    });

    test('should work with date strings', () => {
        const date = '2024-01-15';
        const todaysDate = '2024-01-15';
        const result = DateHandler.today(date, todaysDate);
        
        expect(result.pass).toBe(true);
    });

    test('should fail with invalid todaysDate', () => {
        const date = new Date('2024-01-15');
        const todaysDate = 'invalid';
        const result = DateHandler.today(date, todaysDate);

        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/base');
        expect(errors[0].args).toEqual({ date: todaysDate });
    });

});

describe('DateHandler.weekday', () => {
    
    test('should pass for Monday', () => {
        const date = new Date('2024-01-15'); // Monday
        const result = DateHandler.weekday(date);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should pass for Tuesday', () => {
        const date = new Date('2024-01-16'); // Tuesday
        const result = DateHandler.weekday(date);
        
        expect(result.pass).toBe(true);
    });

    test('should pass for Wednesday', () => {
        const date = new Date('2024-01-17'); // Wednesday
        const result = DateHandler.weekday(date);
        
        expect(result.pass).toBe(true);
    });

    test('should pass for Thursday', () => {
        const date = new Date('2024-01-18'); // Thursday
        const result = DateHandler.weekday(date);
        
        expect(result.pass).toBe(true);
    });

    test('should pass for Friday', () => {
        const date = new Date('2024-01-19'); // Friday
        const result = DateHandler.weekday(date);
        
        expect(result.pass).toBe(true);
    });

    test('should fail for Saturday', () => {
        const date = new Date('2024-01-13'); // Saturday
        const result = DateHandler.weekday(date);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/weekday');
    });

    test('should fail for Sunday', () => {
        const date = new Date('2024-01-14'); // Sunday
        const result = DateHandler.weekday(date);
        
        expect(result.pass).toBe(false);
    });

    test('should work with date strings', () => {
        const date = '2024-01-15'; // Monday
        const result = DateHandler.weekday(date);
        
        expect(result.pass).toBe(true);
    });

});

describe('DateHandler.weekend', () => {
    
    test('should pass for Saturday', () => {
        const date = new Date('2024-01-13'); // Saturday
        const result = DateHandler.weekend(date);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(date);
    });

    test('should pass for Sunday', () => {
        const date = new Date('2024-01-14'); // Sunday
        const result = DateHandler.weekend(date);
        
        expect(result.pass).toBe(true);
    });

    test('should fail for Monday', () => {
        const date = new Date('2024-01-15'); // Monday
        const result = DateHandler.weekend(date);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(date);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('date/weekend');
    });

    test('should fail for Tuesday', () => {
        const date = new Date('2024-01-16'); // Tuesday
        const result = DateHandler.weekend(date);
        
        expect(result.pass).toBe(false);
    });

    test('should fail for Wednesday', () => {
        const date = new Date('2024-01-17'); // Wednesday
        const result = DateHandler.weekend(date);
        
        expect(result.pass).toBe(false);
    });

    test('should fail for Thursday', () => {
        const date = new Date('2024-01-18'); // Thursday
        const result = DateHandler.weekend(date);
        
        expect(result.pass).toBe(false);
    });

    test('should fail for Friday', () => {
        const date = new Date('2024-01-19'); // Friday
        const result = DateHandler.weekend(date);
        
        expect(result.pass).toBe(false);
    });

    test('should work with date strings', () => {
        const date = '2024-01-13'; // Saturday
        const result = DateHandler.weekend(date);
        
        expect(result.pass).toBe(true);
    });

});

// ====================================
// MUTATORS
// ====================================

describe('DateHandler.addDays', () => {

    test('should add positive days', () => {
        const result = DateHandler.addDays(new Date('2024-01-15T00:00:00Z'), 5);

        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
        expect(result.value.toISOString()).toBe('2024-01-20T00:00:00.000Z');
    });

    test('should add negative days', () => {
        const result = DateHandler.addDays(new Date('2024-01-15T00:00:00Z'), -3);

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-12T00:00:00.000Z');
    });

    test('should fail for non-integer days', () => {
        const result = DateHandler.addDays(new Date('2024-01-15T00:00:00Z'), 1.5);

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('date/addDays');
    });

});

describe('DateHandler.addHours', () => {

    test('should add hours', () => {
        const result = DateHandler.addHours(new Date('2024-01-15T10:00:00Z'), 5);

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-15T15:00:00.000Z');
    });

    test('should handle day rollover', () => {
        const result = DateHandler.addHours(new Date('2024-01-15T22:00:00Z'), 4);

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-16T02:00:00.000Z');
    });

    test('should fail for non-number hours', () => {
        const result = DateHandler.addHours(new Date('2024-01-15T10:00:00Z'), '2');

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('date/addHours');
    });

});

describe('DateHandler.addMinutes', () => {

    test('should add minutes', () => {
        const result = DateHandler.addMinutes(new Date('2024-01-15T10:00:00Z'), 30);

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    test('should handle hour rollover', () => {
        const result = DateHandler.addMinutes(new Date('2024-01-15T10:50:00Z'), 20);

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-15T11:10:00.000Z');
    });

    test('should fail for non-number minutes', () => {
        const result = DateHandler.addMinutes(new Date('2024-01-15T10:00:00Z'), '10');

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('date/addMinutes');
    });

});

describe('DateHandler.addMonths', () => {

    test('should add months', () => {
        const result = DateHandler.addMonths(new Date('2024-01-15T00:00:00Z'), 2);

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-03-15T00:00:00.000Z');
    });

    test('should add negative months', () => {
        const result = DateHandler.addMonths(new Date('2024-03-15T00:00:00Z'), -2);

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    test('should fail for non-integer months', () => {
        const result = DateHandler.addMonths(new Date('2024-01-15T00:00:00Z'), 2.5);

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('date/addMonths');
    });

});

describe('DateHandler.addYears', () => {

    test('should add years', () => {
        const result = DateHandler.addYears(new Date('2024-01-15T00:00:00Z'), 2);

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2026-01-15T00:00:00.000Z');
    });

    test('should add negative years', () => {
        const result = DateHandler.addYears(new Date('2024-01-15T00:00:00Z'), -1);

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2023-01-15T00:00:00.000Z');
    });

    test('should fail for non-integer years', () => {
        const result = DateHandler.addYears(new Date('2024-01-15T00:00:00Z'), 1.2);

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('date/addYears');
    });

});

describe('DateHandler.toEndOfDay', () => {

    test('should set time to end of day', () => {
        const result = DateHandler.toEndOfDay(new Date('2024-01-15T10:30:45.123Z'));

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-15T23:59:59.999Z');
    });

    test('should work with date strings', () => {
        const result = DateHandler.toEndOfDay('2024-01-15');

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-15T23:59:59.999Z');
    });

});

describe('DateHandler.toEndOfMonth', () => {

    test('should set date to end of month', () => {
        const result = DateHandler.toEndOfMonth(new Date('2024-01-15T10:30:45.123Z'));

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-31T23:59:59.999Z');
    });

    test('should handle leap year February', () => {
        const result = DateHandler.toEndOfMonth(new Date('2024-02-10T00:00:00Z'));

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-02-29T23:59:59.999Z');
    });

});

describe('DateHandler.toNextDayOfWeek', () => {

    test('should return next occurrence of target day', () => {
        const result = DateHandler.toNextDayOfWeek(new Date('2024-01-15T00:00:00Z'), 3); // Monday -> Wednesday

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-17T00:00:00.000Z');
    });

    test('should return next week when target day is same day', () => {
        const result = DateHandler.toNextDayOfWeek(new Date('2024-01-15T00:00:00Z'), 1); // Monday -> next Monday

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-22T00:00:00.000Z');
    });

    test('should fail for target day less than 0', () => {
        const result = DateHandler.toNextDayOfWeek(new Date('2024-01-15T00:00:00Z'), -1);

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('date/toNextDayOfWeek');
    });

    test('should fail for target day greater than 6', () => {
        const result = DateHandler.toNextDayOfWeek(new Date('2024-01-15T00:00:00Z'), 7);

        expect(result.pass).toBe(false);
    });

});

describe('DateHandler.toNextWeekday', () => {

    test('should move weekday to next weekday', () => {
        const result = DateHandler.toNextWeekday(new Date('2024-01-15T00:00:00Z')); // Monday -> Tuesday

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-16T00:00:00.000Z');
    });

    test('should skip weekend from Friday to Monday', () => {
        const result = DateHandler.toNextWeekday(new Date('2024-01-19T00:00:00Z')); // Friday -> Monday

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-22T00:00:00.000Z');
    });

    test('should move from Saturday to Monday', () => {
        const result = DateHandler.toNextWeekday(new Date('2024-01-20T00:00:00Z'));

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-22T00:00:00.000Z');
    });

});

describe('DateHandler.toPreviousWeekday', () => {

    test('should move weekday to previous weekday', () => {
        const result = DateHandler.toPreviousWeekday(new Date('2024-01-16T00:00:00Z')); // Tuesday -> Monday

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    test('should skip weekend from Monday to Friday', () => {
        const result = DateHandler.toPreviousWeekday(new Date('2024-01-22T00:00:00Z')); // Monday -> Friday

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-19T00:00:00.000Z');
    });

    test('should move from Sunday to Friday', () => {
        const result = DateHandler.toPreviousWeekday(new Date('2024-01-21T00:00:00Z'));

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-19T00:00:00.000Z');
    });

});

describe('DateHandler.toStartOfDay', () => {

    test('should set time to start of day', () => {
        const result = DateHandler.toStartOfDay(new Date('2024-01-15T10:30:45.123Z'));

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    test('should work with date strings', () => {
        const result = DateHandler.toStartOfDay('2024-01-15');

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

});

describe('DateHandler.toStartOfMonth', () => {

    test('should set date to first day of month', () => {
        const result = DateHandler.toStartOfMonth(new Date('2024-01-15T10:30:45.123Z'));

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    test('should preserve month and year', () => {
        const result = DateHandler.toStartOfMonth(new Date('2024-11-20T20:00:00.000Z'));

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-11-01T00:00:00.000Z');
    });

});

describe('DateHandler.toStartOfYear', () => {

    test('should set date to first day of year', () => {
        const result = DateHandler.toStartOfYear(new Date('2024-06-15T10:30:45.123Z'));

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    test('should preserve year', () => {
        const result = DateHandler.toStartOfYear(new Date('2027-12-31T23:59:59.999Z'));

        expect(result.pass).toBe(true);
        expect(result.value.toISOString()).toBe('2027-01-01T00:00:00.000Z');
    });

});
