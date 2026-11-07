'use strict';

import { DateHelpers } from '../../../lib/fields/date/DateHelpers.ts';

describe('DateHelpers', () => {
    describe('isLeapYear', () => {
        it('handles leap-year rules correctly', () => {
            expect(DateHelpers.isLeapYear(2024)).toBe(true);
            expect(DateHelpers.isLeapYear(2000)).toBe(true);
            expect(DateHelpers.isLeapYear(1900)).toBe(false);
            expect(DateHelpers.isLeapYear(2023)).toBe(false);
        });
    });

    describe('isValidDate', () => {
        it('validates month/day boundaries including leap day', () => {
            expect(DateHelpers.isValidDate(2024, 2, 29)).toBe(true);
            expect(DateHelpers.isValidDate(2023, 2, 29)).toBe(false);
            expect(DateHelpers.isValidDate(2024, 4, 30)).toBe(true);
            expect(DateHelpers.isValidDate(2024, 4, 31)).toBe(false);
            expect(DateHelpers.isValidDate(2024, 13, 1)).toBe(false);
            expect(DateHelpers.isValidDate(0, 1, 1)).toBe(false);
        });
    });

    describe('has53IsoWeeks', () => {
        it('identifies ISO years with 53 weeks', () => {
            expect(DateHelpers.has53IsoWeeks(2015)).toBe(true);
            expect(DateHelpers.has53IsoWeeks(2020)).toBe(true);
            expect(DateHelpers.has53IsoWeeks(2014)).toBe(false);
            expect(DateHelpers.has53IsoWeeks(2021)).toBe(false);
        });
    });

    describe('isoWeekToDate', () => {
        it('converts iso week dates to the expected UTC date', () => {
            const weekDate = DateHelpers.isoWeekToDate(2024, 12, 3);
            const mondayWeek1 = DateHelpers.isoWeekToDate(2024, 1, 1);

            expect(weekDate.toISOString()).toBe('2024-03-20T00:00:00.000Z');
            expect(mondayWeek1.toISOString()).toBe('2024-01-01T00:00:00.000Z');
        });
    });

    describe('getIsoWeek', () => {
        it('returns the expected week number for boundary dates', () => {
            expect(DateHelpers.getIsoWeek(new Date('2024-01-01T00:00:00.000Z'))).toBe(1);
            expect(DateHelpers.getIsoWeek(new Date('2020-12-31T00:00:00.000Z'))).toBe(53);
            expect(DateHelpers.getIsoWeek(new Date('2021-01-01T00:00:00.000Z'))).toBe(53);
        });
    });

    describe('getDayOfYear', () => {
        it('returns one-based day-of-year for leap and non-leap years', () => {
            expect(DateHelpers.getDayOfYear(new Date('2023-12-31T00:00:00.000Z'))).toBe(365);
            expect(DateHelpers.getDayOfYear(new Date('2024-12-31T00:00:00.000Z'))).toBe(366);
            expect(DateHelpers.getDayOfYear(new Date('2024-01-01T00:00:00.000Z'))).toBe(1);
        });
    });
});
