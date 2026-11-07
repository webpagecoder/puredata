'use strict';

import { Translation } from '../../../lib/Translation.ts';
import { DefaultCalendarText } from '../../../lib/text/DefaultCalendarText.ts';
import { DateConverter } from '../../../lib/fields/date/DateConverter.ts';
import { OffsetDate } from '../../../lib/fields/date/OffsetDate.ts';

function makeOffsetDate(isoString: string | number, offsetMinutes = 0): OffsetDate {
    return new OffsetDate(new Date(isoString), offsetMinutes);
}

describe('DateConverter parseAuto', () => {
    const calendarText = new Translation(DefaultCalendarText);

    it('clones OffsetDate inputs', () => {
        const converter = new DateConverter(calendarText, 0);
        const input = makeOffsetDate('2025-09-02T17:04:09Z', 90);

        const parsed = converter.parseAuto(input);

        expect(parsed).not.toBeNull();
        expect(parsed).not.toBe(input);
        expect(parsed!.equals(input)).toBe(true);
        expect(parsed!.offsetMinutes).toBe(90);
    });

    it('parses Date inputs with the configured default offset', () => {
        const converter = new DateConverter(calendarText, 120);
        const input = new Date('2024-01-02T03:04:05.000Z');

        const parsed = converter.parseAuto(input);

        expect(parsed).not.toBeNull();
        expect(parsed!.localDate.getTime()).toBe(input.getTime());
        expect(parsed!.offsetMinutes).toBe(120);
    });

    it('tries timestamp parsing before ISO when input is numeric', () => {
        const converter = new DateConverter(calendarText, 0);

        const parsed = converter.parseAuto('20240102');
        const parsedTimestamp = converter.parseTimestamp('20240102');

        expect(parsed).not.toBeNull();
        expect(parsedTimestamp).not.toBeNull();
        expect(parsed!.equals(parsedTimestamp!)).toBe(true);
    });

    it('returns null when no parser matches', () => {
        const converter = new DateConverter(calendarText, 0);
        expect(converter.parseAuto('definitely-not-a-date')).toBeNull();
    });
});

describe('DateConverter parse methods', () => {
    let converter: DateConverter;

    beforeEach(() => {
        converter = new DateConverter(new Translation(DefaultCalendarText), 0);
    });

    it('parses human-readable dates with precision constraints', () => {
        const parsed = converter.parseHuman('September 2nd, 2025 5:04:09 pm UTC', {
            order: 'MDY',
            minPrecision: 'timezone',
        });

        expect(parsed).not.toBeNull();
        expect(parsed!.equals(makeOffsetDate('2025-09-02T17:04:09Z'))).toBe(true);
    });

    it('parses ISO dates with min/max precision and expanded rules', () => {
        const parsed = converter.parseIso('2024-01-02T03:04:05Z', {
            minPrecision: 'day',
            maxPrecision: 'timezone',
            expanded: 'required',
        });

        expect(parsed).not.toBeNull();
        expect(parsed!.equals(makeOffsetDate('2024-01-02T03:04:05Z'))).toBe(true);
    });

    it('parses ISO ordinal dates', () => {
        const parsed = converter.parseIsoOrdinal('2024123T010023+0130', {
            expanded: 'forbidden',
            maxPrecision: 'timezone',
        });

        expect(parsed).not.toBeNull();
        expect(parsed!.equals(makeOffsetDate('2024-05-02T01:00:23+01:30'))).toBe(true);
    });

    it('parses ISO week dates', () => {
        const parsed = converter.parseIsoWeek('2024-W12-3T01:00Z', {
            expanded: 'required',
            maxPrecision: 'timezone',
        });

        expect(parsed).not.toBeNull();
        expect(parsed!.equals(makeOffsetDate('2024-03-20T01:00:00Z'))).toBe(true);
    });

    it('applies converter default offset when timezone is omitted', () => {
        const offsetConverter = new DateConverter(new Translation(DefaultCalendarText), 330);
        const parsed = offsetConverter.parseIso('2024-01-02T03:04:05', {
            expanded: 'required',
        });

        expect(parsed).not.toBeNull();
        expect(parsed!.offsetMinutes).toBe(330);
        expect(offsetConverter.format(parsed!, 'YYYY-MM-DDTHH:mm:ss Z', 'local')).toBe('2024-01-02T03:04:05 +05:30');
    });
});

describe('DateConverter parseTimestamp', () => {
    let converter: DateConverter;

    beforeEach(() => {
        converter = new DateConverter(new Translation(DefaultCalendarText), 0);
    });

    it('treats numeric timestamps as seconds by default', () => {
        const parsed = converter.parseTimestamp(1704067200);
        expect(parsed).not.toBeNull();
        expect(parsed!.equals(makeOffsetDate('2024-01-01T00:00:00.000Z'))).toBe(true);
    });

    it('supports millisecond timestamps when requested', () => {
        const parsed = converter.parseTimestamp(1704067200000, { isMilliseconds: true });
        expect(parsed).not.toBeNull();
        expect(parsed!.equals(makeOffsetDate('2024-01-01T00:00:00.000Z'))).toBe(true);
    });

    it('rejects non-integer and non-numeric timestamps', () => {
        expect(converter.parseTimestamp('1704067200.5')).toBeNull();
        expect(converter.parseTimestamp('abc')).toBeNull();
        expect(converter.parseTimestamp(1704067200.25)).toBeNull();
    });

    it('retains converter default offset on parsed timestamps', () => {
        const offsetConverter = new DateConverter(new Translation(DefaultCalendarText), -120);
        const parsed = offsetConverter.parseTimestamp(1704067200);
        expect(parsed).not.toBeNull();
        expect(parsed!.offsetMinutes).toBe(-120);
    });
});

describe('DateConverter format', () => {
    let converter: DateConverter;

    beforeEach(() => {
        converter = new DateConverter(new Translation(DefaultCalendarText), 0);
    });

    it('formats UTC and local time modes with timezone tokens', () => {
        const offsetDate = new OffsetDate(new Date(Date.UTC(2024, 0, 2, 10, 5, 6, 7)), 90);

        const utc = converter.format(offsetDate, 'YYYY-MM-DDTHH:mm:ss.SSS Z z', 'utc');
        const local = converter.format(offsetDate, 'YYYY-MM-DDTHH:mm:ss.SSS Z z', 'local');

        expect(utc).toBe('2024-01-02T08:35:06.007 +00:00 +0000');
        expect(local).toBe('2024-01-02T10:05:06.007 +01:30 +0130');
    });

    it('preserves bracketed literals while replacing tokens', () => {
        const offsetDate = new OffsetDate(new Date(Date.UTC(2024, 0, 2, 10, 5, 6, 7)), 90);
        const formatted = converter.format(offsetDate, '[YYYY]-MM-[DD] ddd MMMM', 'local');

        expect(formatted).toBe('YYYY-01-DD Tue January');
    });

    it('handles day-boundary rollover between local and utc modes', () => {
        const offsetDate = new OffsetDate(new Date(Date.UTC(2024, 0, 1, 0, 15, 0, 0)), 330);
        const utc = converter.format(offsetDate, 'YYYY-MM-DD HH:mm Z', 'utc');
        const local = converter.format(offsetDate, 'YYYY-MM-DD HH:mm Z', 'local');

        expect(utc).toBe('2023-12-31 18:45 +00:00');
        expect(local).toBe('2024-01-01 00:15 +05:30');
    });

    it('formats every supported token in local mode', () => {
        const offsetDate = new OffsetDate(new Date(Date.UTC(2024, 2, 5, 16, 7, 8, 9)), 330);
        const format = 'YYYY|YY|MMMM|MMM|MM|M|DDDD|DDD|DD|D|dddd|ddd|d|ww|w|E|HH|H|hh|h|mm|m|ss|s|SSS|A|a|Z|z';

        const local = converter.format(offsetDate, format, 'local');

        expect(local).toBe('2024|24|March|Mar|03|3|065|65|05|5|Tuesday|Tue|2|10|10|2|16|16|04|4|07|7|08|8|009|PM|pm|+05:30|+0530');
    });

    it('formats every supported token in utc mode', () => {
        const offsetDate = new OffsetDate(new Date(Date.UTC(2024, 2, 5, 16, 7, 8, 9)), 330);
        const format = 'YYYY|YY|MMMM|MMM|MM|M|DDDD|DDD|DD|D|dddd|ddd|d|ww|w|E|HH|H|hh|h|mm|m|ss|s|SSS|A|a|Z|z';

        const utc = converter.format(offsetDate, format, 'utc');

        expect(utc).toBe('2024|24|March|Mar|03|3|065|65|05|5|Tuesday|Tue|2|10|10|2|10|10|10|10|37|37|08|8|009|AM|am|+00:00|+0000');
    });
});
