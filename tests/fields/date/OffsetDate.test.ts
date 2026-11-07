'use strict';

import { OffsetDate } from '../../../lib/fields/date/OffsetDate.ts';

describe('OffsetDate', () => {
    it('computes offsetDate from local date and offset minutes', () => {
        const localDate = new Date('2024-01-02T10:00:00.000Z');
        const wrapped = new OffsetDate(localDate, 90);

        expect(wrapped.localDate.getTime()).toBe(localDate.getTime());
        expect(wrapped.offsetMinutes).toBe(90);
        expect(wrapped.offsetDate.toISOString()).toBe('2024-01-02T08:30:00.000Z');
    });

    it('supports negative offsets', () => {
        const localDate = new Date('2024-01-02T10:00:00.000Z');
        const wrapped = new OffsetDate(localDate, -120);

        expect(wrapped.offsetDate.toISOString()).toBe('2024-01-02T12:00:00.000Z');
    });

    it('clone returns an equivalent but distinct instance', () => {
        const wrapped = new OffsetDate(new Date('2024-01-02T10:00:00.000Z'), 60);
        const clone = wrapped.clone();

        expect(clone).not.toBe(wrapped);
        expect(clone.localDate.getTime()).toBe(wrapped.localDate.getTime());
        expect(clone.offsetDate.getTime()).toBe(wrapped.offsetDate.getTime());
        expect(clone.offsetMinutes).toBe(wrapped.offsetMinutes);
    });

    it('equals compares utc instants', () => {
        const a = new OffsetDate(new Date('2024-01-02T10:00:00.000Z'), 60);   // 09:00Z
        const b = new OffsetDate(new Date('2024-01-02T11:00:00.000Z'), 120);  // 09:00Z
        const c = new OffsetDate(new Date('2024-01-02T10:00:00.000Z'), 0);    // 10:00Z

        expect(a.equals(b)).toBe(true);
        expect(a.equals(c)).toBe(false);
    });

    it('setLocalDate returns a new instance with same offset', () => {
        const original = new OffsetDate(new Date('2024-01-02T10:00:00.000Z'), 30);
        const updated = original.setLocalDate(new Date('2024-01-03T01:15:00.000Z'));

        expect(updated).not.toBe(original);
        expect(updated.offsetMinutes).toBe(30);
        expect(updated.localDate.toISOString()).toBe('2024-01-03T01:15:00.000Z');
        expect(updated.offsetDate.toISOString()).toBe('2024-01-03T00:45:00.000Z');

        expect(original.localDate.toISOString()).toBe('2024-01-02T10:00:00.000Z');
        expect(original.offsetDate.toISOString()).toBe('2024-01-02T09:30:00.000Z');
    });

    it('treats different offsets as equal when they represent the same utc instant', () => {
        const baseUtc = Date.UTC(2024, 0, 2, 12, 0, 0, 0);
        const offsets = [0, 90, -120, 330, -480];
        const dates = offsets.map((offsetMinutes) => {
            const localDate = new Date(baseUtc + offsetMinutes * 60 * 1000);
            return new OffsetDate(localDate, offsetMinutes);
        });

        for (const dateA of dates) {
            for (const dateB of dates) {
                expect(dateA.equals(dateB)).toBe(true);
            }
        }
    });
});
