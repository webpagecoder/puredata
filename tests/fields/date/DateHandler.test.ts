'use strict';

import { Translation } from '../../../lib/Translation.ts';
import { DefaultCalendarText } from '../../../lib/text/DefaultCalendarText.ts';
import { DateHandler } from '../../../lib/fields/date/DateHandler.ts';
import { UtcDate } from '../../../lib/fields/date/UtcDate.ts';
import { runFailTests, runPassTests } from '../../helpers/runCases.ts';


function compareToDate(isoString: string | number, offsetMinutes = 0): (date: UtcDate) => boolean {
	return function (utcDate: UtcDate) {
		return utcDate.equals(makeUtcDate(isoString, offsetMinutes));
	};
}

function makeUtcDate(isoString: string | number, offsetMinutes = 0): UtcDate {
	return new UtcDate(new Date(isoString), offsetMinutes);
}


describe('DateHandler parsers', () => {
	let handler: DateHandler;

	beforeEach(() => {
		handler = new DateHandler();
		handler.configDateConverter(new Translation(DefaultCalendarText));
	});

	it('date', () => {
		runPassTests(handler.date.bind(handler), [
			{ input: '2024-01', output: compareToDate('2024-01') },
			{ input: '2024-01-02', output: compareToDate('2024-01-02') },
			{ input: 1704067200, output: compareToDate(1704067200000) },
			{ input: new Date('2024-01-12T00:00:00Z'), output: compareToDate('2024-01-12T00:00:00Z') },
			{ input: 'Tuesday, September 2nd, 2025', output: compareToDate('2025-09-02') },
			{ input: '2024-01-02T03:04:05Z', args: [{ maxPrecision: 'second' }], output: compareToDate('2024-01-02T03:04:05Z') },
			{ input: '2024123T010023+0130', output: compareToDate('2024-05-02T01:00:23+01:30') },
			{ input: '2024-W12-3T01:00Z', args: [{ maxPrecision: 'timezone' }], output: compareToDate('2024-03-20T01:00:00Z') },
		]);

		runFailTests(handler.date.bind(handler), [
			{ input: '' },
			{ input: 'not-a-date' },
			{ input: '2024-01-02', args: [{ expanded: 'forbidden' }] },
		]);
	});

	it('human', () => {
		runPassTests(handler.human.bind(handler), [

			// Numeric styles
			{ input: '12/31/2024', args: [{ dateOrder: 'MDY' }], output: compareToDate('2024-12-31') },
			{ input: '2024/12/31', args: [{ dateOrder: 'YMD' }], output: compareToDate('2024-12-31') },

			// English month/day-name styles
			{ input: 'September 2nd, 2025', args: [{ dateOrder: 'MDY' }], output: compareToDate('2025-09-02') },
			{ input: 'Sep 2nd, 2025', args: [{ dateOrder: 'MDY' }], output: compareToDate('2025-09-02') },
			{ input: 'Tuesday, September 2nd, 2025', args: [{ dateOrder: 'MDY' }], output: compareToDate('2025-09-02') },
			{ input: 'Tues, 2025 September 2nd', args: [{ dateOrder: 'YMD' }], output: compareToDate('2025-09-02') },
			{ input: 'Tues. 2 September 2025', args: [{ dateOrder: 'DMY' }], output: compareToDate('2025-09-02') },
			{ input: 'september 2nd, 2025', args: [{ dateOrder: 'MDY' }], output: compareToDate('2025-09-02') },
			{ input: 'September 2, 2025', args: [{ dateOrder: 'MDY' }], output: compareToDate('2025-09-02') },
			{ input: 'September 2nd 2025', args: [{ dateOrder: 'MDY' }], output: compareToDate('2025-09-02') },

			// Time and timezone precision args
			{ input: 'September 2nd, 2025 5pm', args: [{ dateOrder: 'MDY' }], output: compareToDate('2025-09-02T17:00:00Z') },
			{ input: 'September 2nd, 2025 5:04 pm', args: [{ dateOrder: 'MDY' }], output: compareToDate('2025-09-02T17:04:00Z') },
			{ input: 'September 2nd, 2025 17:04', args: [{ dateOrder: 'MDY' }], output: compareToDate('2025-09-02T17:04:00Z') },
			{ input: 'September 2nd, 2025 5:04:09 pm +05:30', args: [{ dateOrder: 'MDY' }], output: compareToDate('2025-09-02T17:04:09+05:30') },
			{ input: 'September 2nd, 2025 5:04:09 pm UTC', args: [{ dateOrder: 'MDY', minPrecision: 'timezone' }], output: compareToDate('2025-09-02T17:04:09Z') },
			{ input: 'September 2nd, 2025 10:30', args: [{ dateOrder: 'MDY', maxPrecision: 'time' }], output: compareToDate('2025-09-02T10:30:00Z') },

		]);

		runFailTests(handler.human.bind(handler), [
			{ input: 'Sept 2nd, 2025', args: [{ dateOrder: 'MDY' }] },
			{ input: '2nd September, 2025', args: [{ dateOrder: 'MDY' }] },
			{ input: 'September 31st, 2025', args: [{ dateOrder: 'MDY' }] },
			{ input: 'not a date', args: [{ dateOrder: 'MDY' }] },
			{ input: '12/31/2024 10:30', args: [{ dateOrder: 'MDY', minPrecision: 'timezone' }] }
		]);
	});


	it('iso', () => {
		runPassTests(handler.iso.bind(handler), [
			{ input: '2024-01-02', output: compareToDate('2024-01-02') },
			{ input: '20240102', output: compareToDate('2024-01-02') },
			{ input: '2024-01-02', args: [{ expanded: 'required' }], output: compareToDate('2024-01-02') },
			{ input: '20240102', args: [{ expanded: 'forbidden' }], output: compareToDate('2024-01-02') },
			{ input: '2024-01-02', args: [{ maxPrecision: 'day' }], output: compareToDate('2024-01-02') },
			{ input: '2024-01-02T03:04:05Z', args: [{ maxPrecision: 'second' }], output: compareToDate('2024-01-02T03:04:05Z') },
			{ input: '2024-01-02T03:04', output: compareToDate('2024-01-02T03:04:00Z') },
			{ input: '2024-01-02T03:04:00+05:30', output: compareToDate('2024-01-02T03:04:00+05:30') },
		]);

		runFailTests(handler.iso.bind(handler), [
			{ input: '20240132' },
			{ input: '202401-30' },
			{ input: '20240102', args: [{ expanded: 'required' }] },
			{ input: '2024-01-02T03:04:05Z', args: [{ maxPrecision: 'day' }] },
			{ input: '2024', args: [{ minPrecision: 'day' }] },
			{ input: '2024-01-02T03:04:05Z', args: [{ maxPrecision: 'hour' }] },
			{ input: '2024-01-02', args: [{ expanded: 'forbidden' }] },
			{ input: 'not a date' },
		]);
	});

	it('isoOrdinal', () => {
		runPassTests(handler.isoOrdinal.bind(handler), [
			{ input: '2024-123', output: compareToDate('2024-05-02') },
			{ input: '2024-366', output: compareToDate('2024-12-31') },
			{ input: '2024123', output: compareToDate('2024-05-02') },
			{ input: '2024-123', args: [{ expanded: 'required' }], output: compareToDate('2024-05-02') },
			{ input: '2024123', args: [{ expanded: 'forbidden' }], output: compareToDate('2024-05-02') },
			{ input: '2024-123', args: [{ minPrecision: 'dayOfYear' }], output: compareToDate('2024-05-02') },
			{ input: '2024-123', args: [{ maxPrecision: 'dayOfYear' }], output: compareToDate('2024-05-02') },
			{ input: '2024123T010023+0130', output: compareToDate('2024-05-02T01:00:23+01:30') },
		]);

		runFailTests(handler.isoOrdinal.bind(handler), [
			{ input: '2024', args: [{ minPrecision: 'dayOfYear' }] },
			{ input: '2024-367' },
			{ input: '2023-366', },
			{ input: '2024-123T01:00Z', args: [{ maxPrecision: 'dayOfYear' }] },
			{ input: 'not a date' },
			{ input: '20240102', args: [{ expanded: 'required' }] },
			{ input: '2024-123T03:04:05Z', args: [{ maxPrecision: 'dayOfYear' }] },
			{ input: '2024', args: [{ minPrecision: 'dayOfYear' }] },
			{ input: '2024-123T03:04:05Z', args: [{ maxPrecision: 'hour' }] },
			{ input: '2024-123', args: [{ expanded: 'forbidden' }] },
		]);
	});

	it('isoWeek', () => {
		runPassTests(handler.isoWeek.bind(handler), [
			{ input: '2024-W12-3', output: compareToDate('2024-03-20') },
			{ input: '2024W123', output: compareToDate('2024-03-20') },
			{ input: '2024-W12-3', args: [{ expanded: 'required' }], output: compareToDate('2024-03-20') },
			{ input: '2024-W12-1', args: [{ minPrecision: 'dayOfWeek' }], output: compareToDate('2024-03-18') },
			{ input: '2024-W12', args: [{ maxPrecision: 'dayOfWeek' }], output: compareToDate('2024-03-18') },
			{ input: '2024-W12-3T01:00Z', args: [{ maxPrecision: 'timezone' }], output: compareToDate('2024-03-20T01:00:00Z') },
		]);

		runFailTests(handler.isoWeek.bind(handler), [
			{ input: 'not a date' },
			{ input: '2024W123', args: [{ expanded: 'required' }] },
			{ input: '2024-W-123', args: [{ expanded: 'forbidden' }] },
			{ input: '2024-W12', args: [{ minPrecision: 'dayOfWeek' }] },
			{ input: '2024-W12-1', args: [{ maxPrecision: 'week' }] },
			{ input: '2024-W12-3T01:00Z', args: [{ maxPrecision: 'dayOfWeek' }] },
		]);
	});

	it('timestamp', () => {
		runPassTests(handler.timestamp.bind(handler), [
			{ input: 1704067201000, args: [{ isMilliseconds: true }], output: compareToDate('2024-01-01T00:00:01.000Z') },
			{ input: 1704067201, args: [{ isMilliseconds: false }], output: compareToDate('2024-01-01T00:00:01.000Z') },
			{ input: 0, output: compareToDate('1970-01-01') },
		]);

		runFailTests(handler.timestamp.bind(handler), [
			{ input: 'not a date' },
		]);
	});
});






describe('DateHandler validators', () => {
	let handler: DateHandler;

	beforeEach(() => {
		handler = new DateHandler();
		handler.configDateConverter(new Translation(DefaultCalendarText));
	});

	it('after', () => {
		runPassTests(handler.after.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:00:00Z'), args: [new Date('2024-01-14T12:00:00Z')] },
			{ input: makeUtcDate('2024-01-15T12:00:00.001Z'), args: [new Date('2024-01-15T12:00:00Z')] },
		]);

		runFailTests(handler.after.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:00:00Z'), args: [new Date('2024-01-16T12:00:00Z')] },
			{ input: makeUtcDate('2024-01-15T12:00:00.001Z'), args: [new Date('2024-01-16T12:00:00Z')] },
		]);
	});

	it('before', () => {
		runPassTests(handler.before.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:00:00Z'), args: [new Date('2024-01-16T12:00:00Z')] },
			{ input: makeUtcDate('2024-01-15T12:00:00.001Z'), args: [new Date('2024-01-16T12:00:00Z')] },
		]);

		runFailTests(handler.before.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:00:00Z'), args: [new Date('2024-01-14T12:00:00Z')] },
			{ input: makeUtcDate('2024-01-15T12:00:00.001Z'), args: [new Date('2024-01-15T12:00:00Z')] },
		]);
	});

	it('between', () => {
		runPassTests(handler.between.bind(handler), [
			{ input: makeUtcDate('2024-01-17T12:00:00Z'), args: [new Date('2024-01-16T12:00:00Z'), new Date('2024-01-17T12:00:00Z')] },
			{ input: makeUtcDate('2024-01-16T12:28:00Z'), args: [new Date('2024-01-16T12:00:00Z'), new Date('2024-01-16T12:30:00Z')] },
		]);

		runFailTests(handler.between.bind(handler), [
			{ input: makeUtcDate('2024-01-17T12:00:00Z'), args: [new Date('2024-01-16T12:00:00Z'), new Date('2024-01-16T12:01:00Z')] },
			{ input: makeUtcDate('2024-01-16T12:28:00Z'), args: [new Date('2024-01-16T12:00:00Z'), new Date('2024-01-16T12:27:00Z')] },
		]);
	});

	it('dayOfWeek', () => {
		runPassTests(handler.dayOfWeek.bind(handler), [
			{ input: makeUtcDate('2024-01-15'), args: [1] },
			{ input: makeUtcDate('2024-01-16'), args: [2] },
		]);

		runFailTests(handler.dayOfWeek.bind(handler), [
			{ input: makeUtcDate('2024-01-15'), args: [2] },
			{ input: makeUtcDate('2024-01-16'), args: [3] },
		]);
	});

	it('equals', () => {
		runPassTests(handler.equals.bind(handler), [
			{ input: makeUtcDate('2024-01-15'), args: [new Date('2024-01-15')] },
			{ input: makeUtcDate('2024-01-16'), args: [new Date('2024-01-16')] },
		]);

		runFailTests(handler.equals.bind(handler), [
			{ input: makeUtcDate('2024-01-15'), args: [new Date('2024-01-16')] },
			{ input: makeUtcDate('2024-01-16'), args: [new Date('2024-01-17')] },
		]);
	});

	it('leapYear', () => {
		runPassTests(handler.leapYear.bind(handler), [
			{ input: makeUtcDate('2024-01-15'), args: [] },
			{ input: makeUtcDate('2028-01-16'), args: [] },
		]);

		runFailTests(handler.leapYear.bind(handler), [
			{ input: makeUtcDate('2023-01-15'), args: [] },
			{ input: makeUtcDate('2021-01-16'), args: [] },
		]);
	});


	it('max', () => {
		runPassTests(handler.max.bind(handler), [
			{ input: makeUtcDate('2024-01-15'), args: [new Date('2024-01-16')] },
			{ input: makeUtcDate('2024-01-17'), args: [new Date('2024-01-17T00:00:01Z')] },
		]);

		runFailTests(handler.max.bind(handler), [
			{ input: makeUtcDate('2024-01-15'), args: [new Date('2024-01-14')] },
			{ input: makeUtcDate('2024-01-17T00:00:02Z'), args: [new Date('2024-01-17T00:00:01Z')] },
		]);
	});

	it('min', () => {
		runPassTests(handler.min.bind(handler), [
			{ input: makeUtcDate('2024-01-15'), args: [new Date('2024-01-14')] },
			{ input: makeUtcDate('2024-01-17T00:00:02Z'), args: [new Date('2024-01-17T00:00:01Z')] },
		]);

		runFailTests(handler.min.bind(handler), [
			{ input: makeUtcDate('2024-01-15'), args: [new Date('2024-01-16')] },
			{ input: makeUtcDate('2024-01-17'), args: [new Date('2024-01-17T00:00:01Z')] },
		]);
	});

	it('minAge', () => {
		runPassTests(handler.minAge.bind(handler), [
			{ input: makeUtcDate('1982-01-15'), args: [44] },
			{ input: makeUtcDate('2024-01-17T00:00:02Z'), args: [2] },
		]);

		runFailTests(handler.minAge.bind(handler), [
			{ input: makeUtcDate('1982-01-15'), args: [54] },
			{ input: makeUtcDate('2024-01-17T00:00:02Z'), args: [21] },
		]);
	});

	it('notEquals', () => {
		runPassTests(handler.notEquals.bind(handler), [
			{ input: makeUtcDate('2024-01-15'), args: [new Date('2024-01-16')] },
			{ input: makeUtcDate('2024-01-16'), args: [new Date('2024-01-17')] },
		]);

		runFailTests(handler.notEquals.bind(handler), [
			{ input: makeUtcDate('2024-01-15'), args: [new Date('2024-01-15')] },
			{ input: makeUtcDate('2024-01-16'), args: [new Date('2024-01-16')] },
		]);
	});

	it('sameDay', () => {
		runPassTests(handler.sameDay.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:01:00Z'), args: [new Date('2024-01-15T05:00:00Z')] },
			{ input: makeUtcDate('2024-01-16T00:00:00Z'), args: [new Date('2024-01-16T05:00Z')] },
		]);

		runFailTests(handler.sameDay.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:01:00Z'), args: [new Date('2024-01-16T05:00:00Z')] },
			{ input: makeUtcDate('2024-01-16T00:00:00Z'), args: [new Date('2024-01-17T05:00Z')] },
		]);
	});

	it('sameMonth', () => {
		runPassTests(handler.sameMonth.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:01:00Z'), args: [new Date('2024-01-22T05:00:00Z')] },
			{ input: makeUtcDate('2024-12-16T00:00:00Z'), args: [new Date('2024-12-01T05:00Z')] },
		]);

		runFailTests(handler.sameMonth.bind(handler), [
			{ input: makeUtcDate('2024-02-15T12:01:00Z'), args: [new Date('2024-01-16T05:00:00Z')] },
			{ input: makeUtcDate('2024-11-16T00:00:00Z'), args: [new Date('2024-01-17T05:00Z')] },
		]);
	});

	it('sameWeek', () => {
		runPassTests(handler.sameWeek.bind(handler), [
			{ input: makeUtcDate('2026-08-25'), args: [new Date('2026-08-24')] },
			{ input: makeUtcDate('2026-08-23'), args: [new Date('2026-08-17')] },
		]);

		runFailTests(handler.sameWeek.bind(handler), [
			{ input: makeUtcDate('2026-08-24'), args: [new Date('2026-08-31')] },
			{ input: makeUtcDate('2027-08-23'), args: [new Date('2026-08-23')] },
		]);
	});

	it('sameYear', () => {
		runPassTests(handler.sameYear.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:01:00Z'), args: [new Date('2024-11-15T05:00:00Z')] },
			{ input: makeUtcDate('2022-01-16T00:00:00Z'), args: [new Date('2022-12-16T05:00Z')] },
		]);

		runFailTests(handler.sameYear.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:01:00Z'), args: [new Date('2022-01-16T05:00:00Z')] },
			{ input: makeUtcDate('2024-01-16T00:00:00Z'), args: [new Date('2027-01-17T05:00Z')] },
		]);
	});

	it('today', () => {
		runPassTests(handler.today.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:01:00Z'), args: [new Date('2024-01-15T12:11:00Z')] },
			{ input: makeUtcDate('2022-01-16T00:00:00Z'), args: [new Date('2022-01-16T05:00Z')] },
		]);

		runFailTests(handler.today.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:01:00Z'), args: [new Date('2024-01-16T12:11:00Z')] },
			{ input: makeUtcDate('2022-01-16T00:00:00Z'), args: [new Date('2022-01-17T05:00Z')] },
		]);
	});

	it('weekday', () => {
		runPassTests(handler.weekday.bind(handler), [
			{ input: makeUtcDate('2026-08-24T12:01:00Z') },
			{ input: makeUtcDate('2026-08-28T00:00:00Z') },
		]);

		runFailTests(handler.weekday.bind(handler), [
			{ input: makeUtcDate('2026-08-23T12:01:00Z') },
			{ input: makeUtcDate('2026-08-29T00:00:00Z') },
		]);
	});

	it('weekend', () => {
		runPassTests(handler.weekend.bind(handler), [
			{ input: makeUtcDate('2026-08-23T12:01:00Z') },
			{ input: makeUtcDate('2026-08-29T00:00:00Z') },
		]);

		runFailTests(handler.weekend.bind(handler), [
			{ input: makeUtcDate('2026-08-24T12:01:00Z') },
			{ input: makeUtcDate('2026-08-28T00:00:00Z') },
		]);
	});

	it('within', () => {
		runPassTests(handler.within.bind(handler), [
			{ input: makeUtcDate('2024-01-19'), args: [2, new Date('2024-01-17')] },
			{ input: makeUtcDate('2024-01-15'), args: [10, new Date('2024-01-25')] },
			{ input: makeUtcDate('2024-12-31'), args: [10, new Date('2025-01-09')] },
		]);

		runFailTests(handler.within.bind(handler), [
			{ input: makeUtcDate('2024-01-19'), args: [1, new Date('2024-01-17')] },
			{ input: makeUtcDate('2024-01-15'), args: [0, new Date('2024-01-16')] },
			{ input: makeUtcDate('2024-12-31'), args: [10, new Date('2025-10-09')] },
		]);
	});

});





describe('DateHandler formatter', () => {
	let handler: DateHandler;

	beforeEach(() => {
		handler = new DateHandler();
		handler.configDateConverter(new Translation(DefaultCalendarText));
	});

	it('toFormat', () => {
		runPassTests(handler.toFormat.bind(handler), [
			{ input: makeUtcDate('2024-01-15T12:00:00Z'), args: ['MM/DD/YYYY'], output: (val: unknown) => (val as string) === '01/15/2024' },
			{ input: makeUtcDate('2024-01-15T12:34:56.789Z'), args: ['YYYY-MM-DD HH:mm:ss.SSS'], output: (val: unknown) => val === '2024-01-15 12:34:56.789' },
			{ input: makeUtcDate('2024-01-15T12:34:56.789Z'), args: ['ddd, MMM D, YY'], output: (val: unknown) => val === 'Mon, Jan 15, 24' },
			{ input: makeUtcDate('2024-01-15T12:34:56.789Z'), args: ['DDDD|ww|E'], output: (val: unknown) => val === '015|03|1' },
			{ input: makeUtcDate('2024-01-15T12:34:56.789Z'), args: ['h:mm A UTC Z'], output: (val: unknown) => val === '12:34 PM UTC +00:00' },
			{ input: makeUtcDate('2024-01-15T12:34:56.789Z'), args: ['h:mm a z'], output: (val: unknown) => val === '12:34 pm +0000' },
			{ input: makeUtcDate('2024-01-15T12:34:56.789Z'), args: ['[YYYY]-MM-DD'], output: (val: unknown) => val === 'YYYY-01-15' },
			{ input: makeUtcDate('2024-01-15T12:00:00Z'), args: ['timestamp'], output: (val: unknown) => typeof val === 'number' && val === new Date('2024-01-15T12:00:00Z').getTime() },
			{ input: new UtcDate(new Date('2024-01-15T12:00:00Z'), 330), args: ['HH:mm Z', 'local'], output: (val: unknown) => val === '12:00 +05:30' },

		]);
	});

});





describe('DateHandler mutators', () => {
	let handler: DateHandler;

	beforeEach(() => {
		handler = new DateHandler();
		handler.configDateConverter(new Translation(DefaultCalendarText));
	});

	it('addDays', () => {
		runPassTests(handler.addDays.bind(handler), [
			{ input: makeUtcDate('2026-08-25'), args: [2], output: compareToDate('2026-08-27') },
			{ input: makeUtcDate('2026-08-25'), args: [-2], output: compareToDate('2026-08-23') },
			{ input: makeUtcDate('2024-02-28'), args: [2], output: compareToDate('2024-03-01') },
		]);
	});

	it('addHours', () => {
		runPassTests(handler.addHours.bind(handler), [
			{ input: makeUtcDate('2026-08-25T23:00:00Z'), args: [2], output: compareToDate('2026-08-26T01:00:00Z') },
			{ input: makeUtcDate('2026-08-25T23:00:00Z'), args: [-2], output: compareToDate('2026-08-25T21:00:00Z') },
			{ input: makeUtcDate('2024-02-28T23:00:00Z'), args: [2], output: compareToDate('2024-02-29T01:00:00Z') },
		]);
	});


	it('addMinutes', () => {
		runPassTests(handler.addMinutes.bind(handler), [
			{ input: makeUtcDate('2026-08-25T23:00:00Z'), args: [2], output: compareToDate('2026-08-25T23:02:00Z') },
			{ input: makeUtcDate('2026-08-25T23:00:00Z'), args: [-2], output: compareToDate('2026-08-25T22:58:00Z') },
			{ input: makeUtcDate('2024-02-28T23:58:00Z'), args: [2], output: compareToDate('2024-02-29T00:00:00Z') },
		]);
	});


	it('addMonths', () => {
		runPassTests(handler.addMonths.bind(handler), [
			{ input: makeUtcDate('2026-08-25'), args: [5], output: compareToDate('2027-01-25') },
			{ input: makeUtcDate('2026-08-25'), args: [-2], output: compareToDate('2026-06-25') },
			{ input: makeUtcDate('2024-02-28'), args: [2], output: compareToDate('2024-04-28') },
		]);
	});

	it('addYears', () => {
		runPassTests(handler.addYears.bind(handler), [
			{ input: makeUtcDate('2026-08-25'), args: [5], output: compareToDate('2031-08-25') },
			{ input: makeUtcDate('2026-08-25'), args: [-2], output: compareToDate('2024-08-25') },
			{ input: makeUtcDate('2024-02-28'), args: [2], output: compareToDate('2026-02-28') },
		]);
	});

	it('clamp', () => {
		runPassTests(handler.clamp.bind(handler), [
			{ input: makeUtcDate('2024-08-25'), args: [makeUtcDate('2024-08-25'), makeUtcDate('2031-08-25')], output: compareToDate('2024-08-25') },
			{ input: makeUtcDate('2026-08-20'), args: [makeUtcDate('2024-08-25'), makeUtcDate('2031-08-25')], output: compareToDate('2026-08-20') },
			{ input: makeUtcDate('2033-08-25'), args: [makeUtcDate('2024-08-25'), makeUtcDate('2031-08-25')], output: compareToDate('2031-08-25') },
		]);
	});

	it('toEndOfDay', () => {
		runPassTests(handler.toEndOfDay.bind(handler), [
			{ input: makeUtcDate('2024-08-25'), output: compareToDate('2024-08-25T23:59:59.999Z') },
			{ input: makeUtcDate('2024-08-25T15:30:00Z'), output: compareToDate('2024-08-25T23:59:59.999Z') },
			{ input: makeUtcDate('2024-08-25', 300), output: compareToDate('2024-08-25T23:59:59.999Z', 300) },
		]);
	});

	it('toEndOfMonth', () => {
		runPassTests(handler.toEndOfMonth.bind(handler), [
			{ input: makeUtcDate('2024-08-25'), output: compareToDate('2024-08-31') },
			{ input: makeUtcDate('2024-08-25T23:59:59.999Z'), output: compareToDate('2024-08-31T23:59:59.999Z') },
			{ input: makeUtcDate('2024-02-28', 300), output: compareToDate('2024-02-29', 300) },
		]);
	});

	it('toEndOfYear', () => {
		runPassTests(handler.toEndOfYear.bind(handler), [
			{ input: makeUtcDate('2024-08-25'), output: compareToDate('2024-12-31') },
			{ input: makeUtcDate('2024-08-25T15:30:00Z'), output: compareToDate('2024-12-31T15:30:00Z') },
			{ input: makeUtcDate('2024-08-25', 300), output: compareToDate('2024-12-31', 300) },
		]);
	});

	it('toNextDayOfWeek', () => {
		runPassTests(handler.toNextDayOfWeek.bind(handler), [
			{ input: makeUtcDate('2026-08-25'), args: [0], output: compareToDate('2026-08-30') },
			{ input: makeUtcDate('2026-08-27'), args: [5], output: compareToDate('2026-08-28') },
			{ input: makeUtcDate('2026-08-28', 300), args: [5], output: compareToDate('2026-09-04', 300) },
		]);
	});

	it('toNextWeekday', () => {
		runPassTests(handler.toNextWeekday.bind(handler), [
			{ input: makeUtcDate('2026-08-25'), output: compareToDate('2026-08-26') },
			{ input: makeUtcDate('2026-08-28'), output: compareToDate('2026-08-31') },
			{ input: makeUtcDate('2026-08-24'), output: compareToDate('2026-08-25') },
		]);
	});

	it('toPreviousDayOfWeek', () => {
		runPassTests(handler.toPreviousDayOfWeek.bind(handler), [
			{ input: makeUtcDate('2026-08-27'), args: [0], output: compareToDate('2026-08-23') },
			{ input: makeUtcDate('2026-08-27'), args: [5], output: compareToDate('2026-08-21') },
			{ input: makeUtcDate('2026-08-28', 300), args: [5], output: compareToDate('2026-08-21', 300) },
		]);
	});

	it('toPreviousWeekday', () => {
		runPassTests(handler.toPreviousWeekday.bind(handler), [
			{ input: makeUtcDate('2026-08-25'), output: compareToDate('2026-08-24') },
			{ input: makeUtcDate('2026-08-24'), output: compareToDate('2026-08-21') },
			{ input: makeUtcDate('2026-08-18'), output: compareToDate('2026-08-17') },
		]);
	});

	it('toStartOfDay', () => {
		runPassTests(handler.toStartOfDay.bind(handler), [
			{ input: makeUtcDate('2024-08-25'), output: compareToDate('2024-08-25T00:00:00.000Z') },
			{ input: makeUtcDate('2024-08-25T15:30:00Z'), output: compareToDate('2024-08-25T00:00:00.000Z') },
			{ input: makeUtcDate('2024-08-25', 300), output: compareToDate('2024-08-25T00:00:00.000Z', 300) },
		]);
	});

	it('toStartOfMonth', () => {
		runPassTests(handler.toStartOfMonth.bind(handler), [
			{ input: makeUtcDate('2024-08-25'), output: compareToDate('2024-08-01') },
			{ input: makeUtcDate('2024-08-25T15:30:00Z'), output: compareToDate('2024-08-01T15:30:00Z') },
			{ input: makeUtcDate('2024-08-25', 300), output: compareToDate('2024-08-01T00:00:00.000Z', 300) },
		]);
	});

	it('toStartOfYear', () => {
		runPassTests(handler.toStartOfYear.bind(handler), [
			{ input: makeUtcDate('2024-08-25'), output: compareToDate('2024-01-01') },
			{ input: makeUtcDate('2024-08-25T15:30:00Z'), output: compareToDate('2024-01-01T15:30:00Z') },
			{ input: makeUtcDate('2024-08-25', 300), output: compareToDate('2024-01-01T00:00:00.000Z', 300) },
		]);
	});
});
