'use strict';

import { Translation } from '../../../lib/Translation.ts';
import { DefaultCalendarText } from '../../../lib/text/DefaultCalendarText.ts';
import { DateHandler } from '../../../lib/fields/date/DateHandler.ts';
import { UtcDate } from '../../../lib/fields/date/UtcDate.ts';
import { runFailTests, runPassTests } from '../../helpers/runCases.ts';




function equalsDate(date: Date): (date: UtcDate) => boolean {
	return (utcDate: UtcDate) => utcDate.date.getTime() === date.getTime();
}

describe('DateHandler validators', () => {
	let handler: DateHandler;

	beforeEach(() => {
		handler = new DateHandler();
		handler.configDateConverter(new Translation(DefaultCalendarText));
	});

	it('date', () => {
		runPassTests(handler.date.bind(handler), [
			{ input: '2024-01-02', output: equalsDate(new Date('2024-01-02')) },
			{ input: 1704067200, output: equalsDate(new Date(1704067200000)) },
			{ input: new Date('2024-01-12T00:00:00Z'), output: equalsDate(new Date('2024-01-12T00:00:00Z')) },
		]);

		runFailTests(handler.date.bind(handler), [
			{ input: '' },
			{ input: 'not-a-date' },
		]);
	});

	it('human', () => {
		runPassTests(handler.human.bind(handler), [

			// Numeric styles
			{ input: '12/31/2024', args: [{ dateOrder: 'MDY' }], output: equalsDate(new Date('2024-12-31')) },
			{ input: '2024/12/31', args: [{ dateOrder: 'YMD' }], output: equalsDate(new Date('2024-12-31')) },

			// English month/day-name styles
			{ input: 'September 2nd, 2025', args: [{ dateOrder: 'MDY' }], output: equalsDate(new Date('2025-09-02')) },
			{ input: 'Sep 2nd, 2025', args: [{ dateOrder: 'MDY' }], output: equalsDate(new Date('2025-09-02')) },
			{ input: 'Tuesday, September 2nd, 2025', args: [{ dateOrder: 'MDY' }], output: equalsDate(new Date('2025-09-02')) },
			{ input: 'september 2nd, 2025', args: [{ dateOrder: 'MDY' }], output: equalsDate(new Date('2025-09-02')) },
			{ input: 'September 2, 2025', args: [{ dateOrder: 'MDY' }], output: equalsDate(new Date('2025-09-02')) },
			{ input: 'September 2nd 2025', args: [{ dateOrder: 'MDY' }], output: equalsDate(new Date('2025-09-02')) },

			// Time and timezone precision args
			{ input: 'September 2nd, 2025 5pm', args: [{ dateOrder: 'MDY' }], output: equalsDate(new Date('2025-09-02T17:00:00Z')) },
			{ input: 'September 2nd, 2025 5:04 pm', args: [{ dateOrder: 'MDY' }], output: equalsDate(new Date('2025-09-02T17:04:00Z')) },
			{ input: 'September 2nd, 2025 17:04', args: [{ dateOrder: 'MDY' }], output: equalsDate(new Date('2025-09-02T17:04:00Z')) },
			{ input: 'September 2nd, 2025 5:04:09 pm +05:30', args: [{ dateOrder: 'MDY' }], output: equalsDate(new Date('2025-09-02T17:04:09+05:30')) },
			{ input: 'September 2nd, 2025 5:04:09 pm UTC', args: [{ dateOrder: 'MDY', minPrecision: 'timezone' }], output: equalsDate(new Date('2025-09-02T17:04:09Z')) },
			{ input: 'September 2nd, 2025 10:30', args: [{ dateOrder: 'MDY', maxPrecision: 'time' }], output: equalsDate(new Date('2025-09-02T10:30:00Z')) },

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
			{ input: '2024-01-02', output: equalsDate(new Date('2024-01-02')) },
			{ input: '20240102', output: equalsDate(new Date('2024-01-02')) },
			{ input: '2024-01-02', args: [{ expanded: 'required' }], output: equalsDate(new Date('2024-01-02')) },
			{ input: '20240102', args: [{ expanded: 'forbidden' }], output: equalsDate(new Date('2024-01-02')) },
			{ input: '2024-01-02', args: [{ maxPrecision: 'day' }], output: equalsDate(new Date('2024-01-02')) },
			{ input: '2024-01-02T03:04:05Z', args: [{ maxPrecision: 'second' }], output: equalsDate(new Date('2024-01-02T03:04:05Z')) },
			{ input: '2024-01-02T03:04', output: equalsDate(new Date('2024-01-02T03:04:00Z')) },
			{ input: '2024-01-02T03:04:00+05:30', output: equalsDate(new Date('2024-01-02T03:04:00+05:30')) },
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
			{ input: '2024-123', output: equalsDate(new Date('2024-05-02')) },
			{ input: '2024-366', output: equalsDate(new Date('2024-12-31')) },
			{ input: '2024123', output: equalsDate(new Date('2024-05-02')) },
			{ input: '2024-123', args: [{ expanded: 'required' }], output: equalsDate(new Date('2024-05-02')) },
			{ input: '2024123', args: [{ expanded: 'forbidden' }], output: equalsDate(new Date('2024-05-02')) },
			{ input: '2024-123', args: [{ minPrecision: 'dayOfYear' }], output: equalsDate(new Date('2024-05-02')) },
			{ input: '2024-123', args: [{ maxPrecision: 'dayOfYear' }], output: equalsDate(new Date('2024-05-02')) },
			{ input: '2024123T010023+0130', output: equalsDate(new Date('2024-05-02T01:00:23+01:30')) },
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
			{ input: '2024-W12-3', output: equalsDate(new Date('2024-03-20')) },
			{ input: '2024W123', output: equalsDate(new Date('2024-03-20')) },
			{ input: '2024-W12-3', args: [{ expanded: 'required' }], output: equalsDate(new Date('2024-03-20')) },
			{ input: '2024-W12-1', args: [{ minPrecision: 'dayOfWeek' }], output: equalsDate(new Date('2024-03-18')) },
			{ input: '2024-W12', args: [{ maxPrecision: 'dayOfWeek' }], output: equalsDate(new Date('2024-03-18')) },
			{ input: '2024-W12-3T01:00Z', args: [{ maxPrecision: 'timezone' }], output: equalsDate(new Date('2024-03-20T01:00:00Z')) },
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
			{ input: 1704067201000, args:[{ isMilliseconds: true }], output: equalsDate(new Date('2024-01-01T00:00:01.000Z'))  },
			{ input: 1704067201, args:[{ isMilliseconds: false }], output: equalsDate(new Date('2024-01-01T00:00:01.000Z'))  },
			{ input: 0, output: equalsDate(new Date('1970-01-01'))  },

		]);

		runFailTests(handler.timestamp.bind(handler), [
			{ input: 'not a date' },

		]);
	});
});


// describe('DateHandler validators: parsing', () => {
// 	let handler: DateHandler;

// 	beforeEach(() => {
// 		handler = new DateHandler();
// 		handler.configDateConverter(new Translation(DefaultCalendarText));
// 	});

// 	it('date auto parser', () => {
// 		runCases(
// 			(input: unknown): ValidationResult => handler.date(input),
// 			[
// 				{ input: '2024-01-02' },
// 				{ input: 1704067200 },
// 				{ input: new Date('2024-01-02T00:00:00Z') },
// 				{ input: 'not-a-date'errorKey: 'date/base' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('human parser args', () => {
// 		runCases(
// 			(input: unknown, args?: Parameters<DateHandler['human']>[1]): ValidationResult =>
// 				handler.human(input, args),
// 			[
// 				// Numeric styles
// 				{ input: '12/31/2024', args: { dateOrder: 'MDY' } },
// 				{ input: '2024/12/31', args: { dateOrder: 'YMD' } },

// 				// English month/day-name styles
// 				{ input: 'September 2nd, 2025', args: { dateOrder: 'MDY' } },
// 				{ input: 'Sep 2nd, 2025', args: { dateOrder: 'MDY' } },
// 				{ input: 'Tuesday, September 2nd, 2025', args: { dateOrder: 'MDY' } },
// 				{ input: 'september 2nd, 2025', args: { dateOrder: 'MDY' } },
// 				{ input: 'September 2, 2025', args: { dateOrder: 'MDY' } },
// 				{ input: 'September 2nd 2025', args: { dateOrder: 'MDY' } },
// 				{ input: 'Sept 2nd, 2025', args: { dateOrder: 'MDY' } },
// 				{ input: '2nd September, 2025', args: { dateOrder: 'MDY' } },

// 				// Time and timezone precision args
// 				{ input: 'September 2nd, 2025 5pm', args: { dateOrder: 'MDY' } },
// 				{ input: 'September 2nd, 2025 5:04 pm', args: { dateOrder: 'MDY' } },
// 				{ input: 'September 2nd, 2025 17:04', args: { dateOrder: 'MDY' } },
// 				{ input: 'September 2nd, 2025 5:04:09 pm +0530', args: { dateOrder: 'MDY', minPrecision: 'timezone' } },
// 				{ input: 'September 2nd, 2025 5:04:09 pm UTC', args: { dateOrder: 'MDY', minPrecision: 'timezone' } },
// 				{ input: 'September 2nd, 2025 5:04:09 pm', args: { dateOrder: 'MDY', minPrecision: 'timezone' } },
// 				{ input: 'September 2nd, 2025 10:30', args: { dateOrder: 'MDY', maxPrecision: 'date' } },
// 				{ input: 'September 2nd, 2025 10:30', args: { dateOrder: 'MDY', maxPrecision: 'time' } },

// 				// Cleaning/whitespace normalization
// 				{ input: ' 12/31/2024 ', args: { dateOrder: 'MDY', clean: false } },
// 				{ input: ' 12/31/2024 ', args: { dateOrder: 'MDY', clean: true } },
// 				{ input: '  September 2nd, 2025  ', args: { dateOrder: 'MDY', clean: false } },
// 				{ input: '  September 2nd, 2025  ', args: { dateOrder: 'MDY', clean: true } },

// 				// Invalid date content
// 				{ input: 'September 31st, 2025', args: { dateOrder: 'MDY' } },
// 				{ input: 'not a date', args: { dateOrder: 'MDY' } },
// 				{ input: '12/31/2024 10:30 +0530', args: { dateOrder: 'MDY', minPrecision: 'timezone' } },
// 				{ input: '12/31/2024 10:30', args: { dateOrder: 'MDY', minPrecision: 'timezone' } }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('iso parser args', () => {
// 		runCases(
// 			(input: unknown, args?: Parameters<DateHandler['iso']>[1]): ValidationResult =>
// 				handler.iso(input, args || {}),
// 			[
// 				{ input: '2024-01-02', args: {} },
// 				{ input: '20240102', args: {} },
// 				{ input: '2024-01-02', args: { expanded: 'required' } },
// 				{ input: '20240102', args: { expanded: 'required' }},
// 				{ input: '20240102', args: { expanded: 'forbidden' } },
// 				{ input: '2024', args: { minPrecision: 'day' }},
// 				{ input: '2024-01-02T03:04:05Z', args: { maxPrecision: 'day' }},
// 				{ input: '2024-01-02', args: { maxPrecision: 'day' } }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('isoOrdinal parser args', () => {
// 		runCases(
// 			(input: unknown, args?: Parameters<DateHandler['isoOrdinal']>[1]): ValidationResult =>
// 				handler.isoOrdinal(input, args || {}),
// 			[
// 				{ input: '2024-123', args: {} },
// 				{ input: '2024123', args: {} },
// 				{ input: '2024-123', args: { expanded: 'required' } },
// 				{ input: '2024123', args: { expanded: 'required' }},
// 				{ input: '2024', args: { minPrecision: 'dayOfYear' }},
// 				{ input: '2024-123T01:00Z', args: { maxPrecision: 'dayOfYear' }},
// 				{ input: '2024-123', args: { maxPrecision: 'dayOfYear' } }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('isoWeek parser args', () => {
// 		runCases(
// 			(input: unknown, args?: Parameters<DateHandler['isoWeek']>[1]): ValidationResult =>
// 				handler.isoWeek(input, args || {}),
// 			[
// 				{ input: '2024-W12-3', args: {} },
// 				{ input: '2024W123', args: {} },
// 				{ input: '2024-W12-3', args: { expanded: 'required' } },
// 				{ input: '2024W123', args: { expanded: 'required' }errorKey: 'date/isoWeek' },
// 				{ input: '2024-W12', args: { minPrecision: 'dayOfWeek' }errorKey: 'date/isoWeek' },
// 				{ input: '2024-W12-3T01:00Z', args: { maxPrecision: 'dayOfWeek' }errorKey: 'date/isoWeek' },
// 				{ input: '2024-W12-3', args: { maxPrecision: 'dayOfWeek' } }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('timestamp parser args', () => {
// 		runCases(
// 			(input: unknown, args?: Parameters<DateHandler['timestamp']>[1]): ValidationResult =>
// 				handler.timestamp(input, args || {}),
// 			[
// 				{ input: 1704067200, args: { isMilliseconds: false } },
// 				{ input: 1704067200000, args: { isMilliseconds: true } },
// 				{ input: 1704067200000, args: {} },
// 				{ input: 'abc', args: { isMilliseconds: true }errorKey: 'date/timestamp' }
// 			],
// 			'date/unknown'
// 		);
// 	});
// });

// describe('DateHandler validators: global', () => {
// 	let handler: DateHandler;

// 	beforeEach(() => {
// 		handler = new DateHandler();
// 		handler.configDateConverter(new Translation(DefaultCalendarText));
// 	});

// 	const parseUtc = (input: unknown): UtcDate => {
// 		const result = handler.date(input);
// 		expect(result.pass).toBe(true);
// 		return result.value as UtcDate;
// 	};

// 	it('after', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate: unknown }): ValidationResult =>
// 				handler.after(parseUtc(input), args?.referenceDate as never),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-14' } },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-16' }errorKey: 'date/after' },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: 'bad date' }errorKey: 'date/base' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('before', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate: unknown }): ValidationResult =>
// 				handler.before(parseUtc(input), args?.referenceDate),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-16' } },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-14' }errorKey: 'date/before' },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: 'bad date' }errorKey: 'date/base' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('between', () => {
// 		runCases(
// 			(input: unknown, args?: { minDate: unknown; maxDate: unknown }): ValidationResult =>
// 				handler.between(parseUtc(input), args?.minDate as never, args?.maxDate as never),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { minDate: '2024-01-01', maxDate: '2024-01-31' } },
// 				{ input: '2024-02-01T12:00:00Z', args: { minDate: '2024-01-01', maxDate: '2024-01-31' }errorKey: 'date/between' },
// 				{ input: '2024-01-15T12:00:00Z', args: { minDate: 'bad', maxDate: '2024-01-31' }errorKey: 'date/base' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('dayOfWeek', () => {
// 		runCases(
// 			(input: unknown, args?: { dayOfWeek: number }): ValidationResult =>
// 				handler.dayOfWeek(parseUtc(input), args?.dayOfWeek ?? 0),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { dayOfWeek: 1 } },
// 				{ input: '2024-01-15T12:00:00Z', args: { dayOfWeek: 0 }errorKey: 'date/dayOfWeek' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('equals', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate: unknown }): ValidationResult =>
// 				handler.equals(parseUtc(input), args?.referenceDate as never),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-15T12:00:00Z' } },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-15T12:00:01Z' }errorKey: 'date/equals' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('sameDay', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate: unknown }): ValidationResult =>
// 				handler.sameDay(parseUtc(input), args?.referenceDate as never),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-15T00:01:00Z' } },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-16T00:01:00Z' }errorKey: 'date/sameDay' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('sameMonth', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate: unknown }): ValidationResult =>
// 				handler.sameMonth(parseUtc(input), args?.referenceDate as never),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-01T00:00:00Z' } },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-02-01T00:00:00Z' }errorKey: 'date/sameMonth' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('sameWeek', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate: unknown; firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): ValidationResult =>
// 				handler.sameWeek(parseUtc(input), args?.referenceDate as never, args?.firstDayOfWeek),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-16T00:00:00Z', firstDayOfWeek: 1 } },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-21T00:00:00Z', firstDayOfWeek: 0 }errorKey: 'date/sameWeek' },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-21T00:00:00Z', firstDayOfWeek: 1 } }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('sameYear', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate: unknown }): ValidationResult =>
// 				handler.sameYear(parseUtc(input), args?.referenceDate as never),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-12-31T00:00:00Z' } },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2025-01-01T00:00:00Z' }errorKey: 'date/sameYear' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('future', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate?: unknown }): ValidationResult =>
// 				handler.future(parseUtc(input), args?.referenceDate as never),
// 			[
// 				{ input: '2999-01-01T00:00:00Z' },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-01' } },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-02-01' }errorKey: 'date/future' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('past', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate?: unknown }): ValidationResult =>
// 				handler.past(parseUtc(input), args?.referenceDate as never),
// 			[
// 				{ input: '1900-01-01T00:00:00Z' },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-02-01' } },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-01' }errorKey: 'date/past' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('recent', () => {
// 		runCases(
// 			(input: unknown, args?: { days?: number; referenceDate?: unknown }): ValidationResult =>
// 				handler.recent(parseUtc(input), args?.days, args?.referenceDate as never),
// 			[
// 				{ input: new Date() },
// 				{ input: '2024-01-15T12:00:00Z', args: { days: 20, referenceDate: '2024-01-30' } },
// 				{ input: '2024-01-01T12:00:00Z', args: { days: 5, referenceDate: '2024-01-30' }errorKey: 'date/recent' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('today', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate?: unknown }): ValidationResult =>
// 				handler.today(parseUtc(input), args?.referenceDate as never),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-15T23:59:00Z' } },
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-16T00:00:00Z' }errorKey: 'date/today' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('leapYear', () => {
// 		runCases(
// 			(input: unknown): ValidationResult => handler.leapYear(parseUtc(input)),
// 			[
// 				{ input: '2024-02-01' },
// 				{ input: '2023-02-01'errorKey: 'date/leapYear' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('max', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate: unknown }): ValidationResult =>
// 				handler.max(parseUtc(input), args?.referenceDate as never),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-15T12:00:00Z' } },
// 				{ input: '2024-01-16T12:00:00Z', args: { referenceDate: '2024-01-15T12:00:00Z' }errorKey: 'date/max' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('min', () => {
// 		runCases(
// 			(input: unknown, args?: { referenceDate: unknown }): ValidationResult =>
// 				handler.min(parseUtc(input), args?.referenceDate as never),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { referenceDate: '2024-01-15T12:00:00Z' } },
// 				{ input: '2024-01-14T12:00:00Z', args: { referenceDate: '2024-01-15T12:00:00Z' }errorKey: 'date/min' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('minAge', () => {
// 		runCases(
// 			(input: unknown, args?: { minAge: number; referenceDate?: unknown }): ValidationResult =>
// 				handler.minAge(parseUtc(input), args?.minAge ?? 0, args?.referenceDate as never),
// 			[
// 				{ input: '2000-01-01', args: { minAge: 18, referenceDate: '2024-01-02' } },
// 				{ input: '2010-01-01', args: { minAge: 18, referenceDate: '2024-01-02' }errorKey: 'date/minAge' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('weekday', () => {
// 		runCases(
// 			(input: unknown): ValidationResult => handler.weekday(parseUtc(input)),
// 			[
// 				{ input: '2024-01-15' },
// 				{ input: '2024-01-14'errorKey: 'date/weekday' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('weekend', () => {
// 		runCases(
// 			(input: unknown): ValidationResult => handler.weekend(parseUtc(input)),
// 			[
// 				{ input: '2024-01-14' },
// 				{ input: '2024-01-15'errorKey: 'date/weekend' }
// 			],
// 			'date/unknown'
// 		);
// 	});
// });

// describe('DateHandler mutators and formatter', () => {
// 	let handler: DateHandler;

// 	beforeEach(() => {
// 		handler = new DateHandler();
// 		handler.configDateConverter(new Translation(DefaultCalendarText));
// 	});

// 	const parseUtc = (input: unknown): UtcDate => {
// 		const result = handler.date(input);
// 		expect(result.pass).toBe(true);
// 		return result.value as UtcDate;
// 	};

// 	it('addDays', () => {
// 		runCases(
// 			(input: unknown, args?: { numDays: number }): ValidationResult<string> =>
// 				toIsoResult(handler.addDays(parseUtc(input), args?.numDays ?? 0)),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { numDays: 2 }, value: '2024-01-17T12:00:00.000Z' },
// 				{ input: '2024-01-15T12:00:00Z', args: { numDays: -1 }, value: '2024-01-14T12:00:00.000Z' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('addHours', () => {
// 		runCases(
// 			(input: unknown, args?: { numHours: number }): ValidationResult<string> =>
// 				toIsoResult(handler.addHours(parseUtc(input), args?.numHours ?? 0)),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { numHours: 5 }, value: '2024-01-15T17:00:00.000Z' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('addMinutes', () => {
// 		runCases(
// 			(input: unknown, args?: { numMinutes: number }): ValidationResult<string> =>
// 				toIsoResult(handler.addMinutes(parseUtc(input), args?.numMinutes ?? 0)),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { numMinutes: 30 }, value: '2024-01-15T12:30:00.000Z' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('addMonths', () => {
// 		runCases(
// 			(input: unknown, args?: { numMonths: number }): ValidationResult<string> =>
// 				toIsoResult(handler.addMonths(parseUtc(input), args?.numMonths ?? 0)),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { numMonths: 1 }, value: '2024-02-15T12:00:00.000Z' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('addYears', () => {
// 		runCases(
// 			(input: unknown, args?: { numYears: number }): ValidationResult<string> =>
// 				toIsoResult(handler.addYears(parseUtc(input), args?.numYears ?? 0)),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { numYears: 1 }, value: '2025-01-15T12:00:00.000Z' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('clamp', () => {
// 		runCases(
// 			(input: unknown, args?: { minDate: unknown; maxDate: unknown }): ValidationResult<string> =>
// 				toIsoResult(handler.clamp(parseUtc(input), args?.minDate as never, args?.maxDate as never)),
// 			[
// 				{ input: '2023-01-01T00:00:00Z', args: { minDate: '2024-01-01', maxDate: '2024-12-31' }, value: '2024-01-01T00:00:00.000Z' },
// 				{ input: '2025-01-01T00:00:00Z', args: { minDate: '2024-01-01', maxDate: '2024-12-31' }, value: '2024-12-31T00:00:00.000Z' },
// 				{ input: '2024-06-01T00:00:00Z', args: { minDate: '2024-01-01', maxDate: '2024-12-31' }, value: '2024-06-01T00:00:00.000Z' },
// 				{ input: '2024-06-01T00:00:00Z', args: { minDate: 'bad', maxDate: '2024-12-31' }errorKey: 'date/base' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('toStartOfDay', () => {
// 		runCases(
// 			(input: unknown): ValidationResult<string> => toIsoResult(handler.toStartOfDay(parseUtc(input))),
// 			[{ input: '2024-01-15T12:00:00Z', value: '2024-01-15T00:00:00.000Z' }],
// 			'date/unknown'
// 		);
// 	});

// 	it('toEndOfDay', () => {
// 		runCases(
// 			(input: unknown): ValidationResult<string> => toIsoResult(handler.toEndOfDay(parseUtc(input))),
// 			[{ input: '2024-01-15T12:00:00Z', value: '2024-01-15T23:59:59.999Z' }],
// 			'date/unknown'
// 		);
// 	});

// 	it('toStartOfMonth', () => {
// 		runCases(
// 			(input: unknown): ValidationResult<string> => toIsoResult(handler.toStartOfMonth(parseUtc(input))),
// 			[{ input: '2024-01-15T12:00:00Z', value: '2024-01-01T00:00:00.000Z' }],
// 			'date/unknown'
// 		);
// 	});

// 	it('toEndOfMonth', () => {
// 		runCases(
// 			(input: unknown): ValidationResult<string> => toIsoResult(handler.toEndOfMonth(parseUtc(input))),
// 			[{ input: '2024-02-10T00:00:00Z', value: '2024-02-29T23:59:59.999Z' }],
// 			'date/unknown'
// 		);
// 	});

// 	it('toStartOfYear', () => {
// 		runCases(
// 			(input: unknown): ValidationResult<string> => toIsoResult(handler.toStartOfYear(parseUtc(input))),
// 			[{ input: '2024-06-15T12:00:00Z', value: '2024-01-01T00:00:00.000Z' }],
// 			'date/unknown'
// 		);
// 	});

// 	it('toEndOfYear', () => {
// 		runCases(
// 			(input: unknown): ValidationResult<string> => toIsoResult(handler.toEndOfYear(parseUtc(input))),
// 			[{ input: '2024-03-10T00:00:00Z', value: '2024-12-31T23:59:59.999Z' }],
// 			'date/unknown'
// 		);
// 	});

// 	it('toNextDayOfWeek', () => {
// 		runCases(
// 			(input: unknown, args?: { targetDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): ValidationResult<string> =>
// 				toIsoResult(handler.toNextDayOfWeek(parseUtc(input), args?.targetDayOfWeek ?? 0)),
// 			[
// 				{ input: '2024-01-15T00:00:00Z', args: { targetDayOfWeek: 5 }, value: '2024-01-19T00:00:00.000Z' },
// 				{ input: '2024-01-15T00:00:00Z', args: { targetDayOfWeek: 1 }, value: '2024-01-22T00:00:00.000Z' }
// 			],
// 			'date/unknown'
// 		);
// 	});

// 	it('toNextWeekday', () => {
// 		runCases(
// 			(input: unknown): ValidationResult<string> => toIsoResult(handler.toNextWeekday(parseUtc(input))),
// 			[{ input: '2024-01-19T00:00:00Z', value: '2024-01-22T00:00:00.000Z' }],
// 			'date/unknown'
// 		);
// 	});

// 	it('toPreviousWeekday', () => {
// 		runCases(
// 			(input: unknown): ValidationResult<string> => toIsoResult(handler.toPreviousWeekday(parseUtc(input))),
// 			[{ input: '2024-01-22T00:00:00Z', value: '2024-01-19T00:00:00.000Z' }],
// 			'date/unknown'
// 		);
// 	});

// 	it('toFormat output modes', () => {
// 		runCases(
// 			(input: unknown, args?: { formatString: string | null; timeMode?: 'utc' | 'local' }): ValidationResult =>
// 				handler.toFormat(parseUtc(input), args?.formatString ?? null, args?.timeMode),
// 			[
// 				{ input: '2024-01-15T12:00:00Z', args: { formatString: null }, value: '2024-01-15T12:00:00Z' },
// 				{ input: '2024-01-15T12:00:00Z', args: { formatString: 'timestamp' }, value: 1705320000000 },
// 				{ input: '2024-01-15T12:00:00Z', args: { formatString: 'YYYY-MM-DD', timeMode: 'utc' }, value: '2024-01-15' }
// 			],
// 			'date/unknown'
// 		);

// 		const objectResult = handler.toFormat(parseUtc('2024-01-15T12:00:00Z'), 'object');
// 		expect(objectResult.pass).toBe(true);
// 		expect(objectResult.value).toBeInstanceOf(Date);
// 		expect((objectResult.value as Date).toISOString()).toBe('2024-01-15T12:00:00.000Z');
// 	});
// });
