'use strict';

const DateProcessors = require('../../lib/processors/DateProcessors');

describe('DateProcessors.isIso', () => {
    it('should pass for valid extended ISO date', () => {
        const result = DateProcessors.isIso('2024-07-20', {forbidden: [] });
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    it('should fail for invalid ISO date', () => {
        const result = DateProcessors.isIso('2024-02-30');
        expect(result.pass).toBe(false);
    });

    it('should fail for ISO date with offset if allowOffset is false', () => {
        const result = DateProcessors.isIso('2024-07-20T15:30:45+02:00');
        expect(result.pass).toBe(false);
    });

    it('should pass for ISO date with offset if allowOffset is true', () => {
        const result = DateProcessors.isIso('2024-07-20T15:30:45+02:00', { forbidden: [] });
        expect(result.pass).toBe(true);
    });

    it('should fail for basic ISO date if allowBasic is false', () => {
        const result = DateProcessors.isIso('20240720', { allowBasic: false,  });
        expect(result.pass).toBe(false);
    });

    it('should pass for basic ISO date if allowBasic is true', () => {
        const result = DateProcessors.isIso('20240720', { allowBasic: true, forbidden: [] });
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    it('should fail for non-date string', () => {
        const result = DateProcessors.isIso('not-a-date', {  });
        expect(result.pass).toBe(false);
    });

    it('should fail for empty string', () => {
        const result = DateProcessors.isIso('', {  });
        expect(result.pass).toBe(false);
    });

    it('should pass for ISO date with Zulu time', () => {
        const result = DateProcessors.isIso('2024-07-20T15:30:45Z', { forbidden: [] });
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    it('should fail for ISO week date', () => {
        const result = DateProcessors.isIso('2024-W29-1', {  });
        expect(result.pass).toBe(false);
    });

    it('should fail for ISO ordinal date', () => {
        const result = DateProcessors.isIso('2024-201', {  });
        expect(result.pass).toBe(false);
    });
});

describe('DateProcessors.isIsoWeek', () => {
    it('should pass for valid extended ISO week date', () => {
        const result = DateProcessors.isIsoWeek('2024-W29-1');
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    it('should pass for valid extended ISO week date with Sunday', () => {
        const result = DateProcessors.isIsoWeek('2024-W29-7');
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    it('should pass for valid basic ISO week date if allowBasic is true', () => {
        const result = DateProcessors.isIsoWeek('2024W291', true);
        expect(result.pass).toBe(true);
    });

    it('should fail for basic ISO week date if allowBasic is false', () => {
        const result = DateProcessors.isIsoWeek('2024W291', false);
        expect(result.pass).toBe(false);
    });

    it('should fail for invalid ISO week date (week too high)', () => {
        const result = DateProcessors.isIsoWeek('2024-W54-1');
        expect(result.pass).toBe(false);
    });

    it('should fail for invalid ISO week date (day too high)', () => {
        const result = DateProcessors.isIsoWeek('2024-W29-8');
        expect(result.pass).toBe(false);
    });

    it('should fail for week 53 in year without 53 ISO weeks', () => {
        const result = DateProcessors.isIsoWeek('2021-W53-1');
        expect(result.pass).toBe(false);
    });

    it('should pass for week 53 in year with 53 ISO weeks', () => {
        const result = DateProcessors.isIsoWeek('2020-W53-1');
        expect(result.pass).toBe(true);
    });

    it('should fail for non-week string', () => {
        const result = DateProcessors.isIsoWeek('not-a-week');
        expect(result.pass).toBe(false);
    });

    it('should fail for empty string', () => {
        const result = DateProcessors.isIsoWeek('');
        expect(result.pass).toBe(false);
    });
});

describe('DateProcessors.isIsoOrdinal', () => {
    it('should pass for valid extended ISO ordinal date', () => {
        const result = DateProcessors.isIsoOrdinal('2024-201');
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    it('should pass for valid basic ISO ordinal date if allowBasic is true', () => {
        const result = DateProcessors.isIsoOrdinal('2024201', true);
        expect(result.pass).toBe(true);
    });

    it('should fail for basic ISO ordinal date if allowBasic is false', () => {
        const result = DateProcessors.isIsoOrdinal('2024201', false);
        expect(result.pass).toBe(false);
    });

    it('should fail for invalid ISO ordinal date (day too high)', () => {
        const result = DateProcessors.isIsoOrdinal('2024-367');
        expect(result.pass).toBe(false);
    });

    it('should fail for invalid ISO ordinal date (not a leap year)', () => {
        const result = DateProcessors.isIsoOrdinal('2023-366');
        expect(result.pass).toBe(false);
    });

    it('should pass for leap year day 366', () => {
        const result = DateProcessors.isIsoOrdinal('2024-366');
        expect(result.pass).toBe(true);
        expect(result.value).toBeInstanceOf(Date);
    });

    it('should fail for non-ordinal string', () => {
        const result = DateProcessors.isIsoOrdinal('not-an-ordinal');
        expect(result.pass).toBe(false);
    });

    it('should fail for empty string', () => {
        const result = DateProcessors.isIsoOrdinal('');
        expect(result.pass).toBe(false);
    });
});