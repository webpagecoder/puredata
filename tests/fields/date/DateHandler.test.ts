'use strict';

import { Translation } from '../../../lib/Translation.ts';
import { DefaultCalendarText } from '../../../lib/text/DefaultCalendarText.ts';
import { DateHandler } from '../../../lib/fields/date/DateHandler.ts';
import { UtcDate } from '../../../lib/fields/date/UtcDate.ts';
import { runCases, type ValidationResult } from '../../helpers/runCases.ts';

const toIsoResult = (result: ValidationResult): ValidationResult<string> => {
	if (!result.pass) {
		return { pass: false, fail: true, errors: result.errors };
	}
	const utcDate = result.value as UtcDate;
	return {
		pass: true,
		fail: false,
		value: utcDate.date.toISOString()
	};
};

describe('DateHandler validators: parsing', () => {
	let handler: DateHandler;

	beforeEach(() => {
		handler = new DateHandler();
		handler.configDateConverter(new Translation(DefaultCalendarText));
	});

	it('date auto parser', () => {
		runCases(
			(input: unknown): ValidationResult => handler.date(input),
			[
				{ input: '2024-01-02', pass: true },
				{ input: 1704067200, pass: true },
				{ input: new Date('2024-01-02T00:00:00Z'), pass: true },
				{ input: 'not-a-date', pass: false, errorKey: 'date/base' }
			],
			'date/unknown'
		);
	});

	it('human parser options', () => {
		runCases(
			(input: unknown, options?: Parameters<DateHandler['human']>[1]): ValidationResult =>
				handler.human(input, options),
			[
				// Numeric styles
				{ input: '12/31/2024', options: { dateOrder: 'MDY' }, pass: true },
				{ input: '2024/12/31', options: { dateOrder: 'YMD' }, pass: true },

				// English month/day-name styles
				{ input: 'September 2nd, 2025', options: { dateOrder: 'MDY' }, pass: true },
				{ input: 'Sep 2nd, 2025', options: { dateOrder: 'MDY' }, pass: true },
				{ input: 'Tuesday, September 2nd, 2025', options: { dateOrder: 'MDY' }, pass: true },
				{ input: 'september 2nd, 2025', options: { dateOrder: 'MDY' }, pass: true },
				{ input: 'September 2, 2025', options: { dateOrder: 'MDY' }, pass: true },
				{ input: 'September 2nd 2025', options: { dateOrder: 'MDY' }, pass: true },
				{ input: 'Sept 2nd, 2025', options: { dateOrder: 'MDY' }, pass: false, errorKey: 'date/human' },
				{ input: '2nd September, 2025', options: { dateOrder: 'MDY' }, pass: false, errorKey: 'date/human' },

				// Time and timezone precision options
				{ input: 'September 2nd, 2025 5pm', options: { dateOrder: 'MDY' }, pass: true },
				{ input: 'September 2nd, 2025 5:04 pm', options: { dateOrder: 'MDY' }, pass: true },
				{ input: 'September 2nd, 2025 17:04', options: { dateOrder: 'MDY' }, pass: true },
				{ input: 'September 2nd, 2025 5:04:09 pm +0530', options: { dateOrder: 'MDY', minPrecision: 'timezone' }, pass: true },
				{ input: 'September 2nd, 2025 5:04:09 pm UTC', options: { dateOrder: 'MDY', minPrecision: 'timezone' }, pass: true },
				{ input: 'September 2nd, 2025 5:04:09 pm', options: { dateOrder: 'MDY', minPrecision: 'timezone' }, pass: false, errorKey: 'date/human' },
				{ input: 'September 2nd, 2025 10:30', options: { dateOrder: 'MDY', maxPrecision: 'date' }, pass: false, errorKey: 'date/human' },
				{ input: 'September 2nd, 2025 10:30', options: { dateOrder: 'MDY', maxPrecision: 'time' }, pass: true },

				// Cleaning/whitespace normalization
				{ input: ' 12/31/2024 ', options: { dateOrder: 'MDY', clean: false }, pass: true },
				{ input: ' 12/31/2024 ', options: { dateOrder: 'MDY', clean: true }, pass: true },
				{ input: '  September 2nd, 2025  ', options: { dateOrder: 'MDY', clean: false }, pass: true },
				{ input: '  September 2nd, 2025  ', options: { dateOrder: 'MDY', clean: true }, pass: true },

				// Invalid date content
				{ input: 'September 31st, 2025', options: { dateOrder: 'MDY' }, pass: false, errorKey: 'date/human' },
				{ input: 'not a date', options: { dateOrder: 'MDY' }, pass: false, errorKey: 'date/human' },
				{ input: '12/31/2024 10:30 +0530', options: { dateOrder: 'MDY', minPrecision: 'timezone' }, pass: true },
				{ input: '12/31/2024 10:30', options: { dateOrder: 'MDY', minPrecision: 'timezone' }, pass: false, errorKey: 'date/human' }
			],
			'date/unknown'
		);
	});

	it('iso parser options', () => {
		runCases(
			(input: unknown, options?: Parameters<DateHandler['iso']>[1]): ValidationResult =>
				handler.iso(input, options || {}),
			[
				{ input: '2024-01-02', options: {}, pass: true },
				{ input: '20240102', options: {}, pass: true },
				{ input: '2024-01-02', options: { expanded: 'required' }, pass: true },
				{ input: '20240102', options: { expanded: 'required' }, pass: false, errorKey: 'date/iso' },
				{ input: '20240102', options: { expanded: 'forbidden' }, pass: true },
				{ input: '2024', options: { minPrecision: 'day' }, pass: false, errorKey: 'date/iso' },
				{ input: '2024-01-02T03:04:05Z', options: { maxPrecision: 'day' }, pass: false, errorKey: 'date/iso' },
				{ input: '2024-01-02', options: { maxPrecision: 'day' }, pass: true }
			],
			'date/unknown'
		);
	});

	it('isoOrdinal parser options', () => {
		runCases(
			(input: unknown, options?: Parameters<DateHandler['isoOrdinal']>[1]): ValidationResult =>
				handler.isoOrdinal(input, options || {}),
			[
				{ input: '2024-123', options: {}, pass: true },
				{ input: '2024123', options: {}, pass: true },
				{ input: '2024-123', options: { expanded: 'required' }, pass: true },
				{ input: '2024123', options: { expanded: 'required' }, pass: false, errorKey: 'date/isoOrdinal' },
				{ input: '2024', options: { minPrecision: 'dayOfYear' }, pass: false, errorKey: 'date/isoOrdinal' },
				{ input: '2024-123T01:00Z', options: { maxPrecision: 'dayOfYear' }, pass: false, errorKey: 'date/isoOrdinal' },
				{ input: '2024-123', options: { maxPrecision: 'dayOfYear' }, pass: true }
			],
			'date/unknown'
		);
	});

	it('isoWeek parser options', () => {
		runCases(
			(input: unknown, options?: Parameters<DateHandler['isoWeek']>[1]): ValidationResult =>
				handler.isoWeek(input, options || {}),
			[
				{ input: '2024-W12-3', options: {}, pass: true },
				{ input: '2024W123', options: {}, pass: true },
				{ input: '2024-W12-3', options: { expanded: 'required' }, pass: true },
				{ input: '2024W123', options: { expanded: 'required' }, pass: false, errorKey: 'date/isoWeek' },
				{ input: '2024-W12', options: { minPrecision: 'dayOfWeek' }, pass: false, errorKey: 'date/isoWeek' },
				{ input: '2024-W12-3T01:00Z', options: { maxPrecision: 'dayOfWeek' }, pass: false, errorKey: 'date/isoWeek' },
				{ input: '2024-W12-3', options: { maxPrecision: 'dayOfWeek' }, pass: true }
			],
			'date/unknown'
		);
	});

	it('timestamp parser options', () => {
		runCases(
			(input: unknown, options?: Parameters<DateHandler['timestamp']>[1]): ValidationResult =>
				handler.timestamp(input, options || {}),
			[
				{ input: 1704067200, options: { isMilliseconds: false }, pass: true },
				{ input: 1704067200000, options: { isMilliseconds: true }, pass: true },
				{ input: 1704067200000, options: {}, pass: true },
				{ input: 'abc', options: { isMilliseconds: true }, pass: false, errorKey: 'date/timestamp' }
			],
			'date/unknown'
		);
	});
});

describe('DateHandler validators: global', () => {
	let handler: DateHandler;

	beforeEach(() => {
		handler = new DateHandler();
		handler.configDateConverter(new Translation(DefaultCalendarText));
	});

	const parseUtc = (input: unknown): UtcDate => {
		const result = handler.date(input);
		expect(result.pass).toBe(true);
		return result.value as UtcDate;
	};

	it('after', () => {
		runCases(
			(input: unknown, options?: { referenceDate: unknown }): ValidationResult =>
				handler.after(parseUtc(input), options?.referenceDate as never),
			[
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-14' }, pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-16' }, pass: false, errorKey: 'date/after' },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: 'bad date' }, pass: false, errorKey: 'date/base' }
			],
			'date/unknown'
		);
	});

	it('before', () => {
		runCases(
			(input: unknown, options?: { referenceDate: unknown }): ValidationResult =>
				handler.before(parseUtc(input), options?.referenceDate),
			[
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-16' }, pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-14' }, pass: false, errorKey: 'date/before' },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: 'bad date' }, pass: false, errorKey: 'date/base' }
			],
			'date/unknown'
		);
	});

	it('between', () => {
		runCases(
			(input: unknown, options?: { minDate: unknown; maxDate: unknown }): ValidationResult =>
				handler.between(parseUtc(input), options?.minDate as never, options?.maxDate as never),
			[
				{ input: '2024-01-15T12:00:00Z', options: { minDate: '2024-01-01', maxDate: '2024-01-31' }, pass: true },
				{ input: '2024-02-01T12:00:00Z', options: { minDate: '2024-01-01', maxDate: '2024-01-31' }, pass: false, errorKey: 'date/between' },
				{ input: '2024-01-15T12:00:00Z', options: { minDate: 'bad', maxDate: '2024-01-31' }, pass: false, errorKey: 'date/base' }
			],
			'date/unknown'
		);
	});

	it('dayOfWeek', () => {
		runCases(
			(input: unknown, options?: { dayOfWeek: number }): ValidationResult =>
				handler.dayOfWeek(parseUtc(input), options?.dayOfWeek ?? 0),
			[
				{ input: '2024-01-15T12:00:00Z', options: { dayOfWeek: 1 }, pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { dayOfWeek: 0 }, pass: false, errorKey: 'date/dayOfWeek' }
			],
			'date/unknown'
		);
	});

	it('equals', () => {
		runCases(
			(input: unknown, options?: { referenceDate: unknown }): ValidationResult =>
				handler.equals(parseUtc(input), options?.referenceDate as never),
			[
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-15T12:00:00Z' }, pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-15T12:00:01Z' }, pass: false, errorKey: 'date/equals' }
			],
			'date/unknown'
		);
	});

	it('sameDay', () => {
		runCases(
			(input: unknown, options?: { referenceDate: unknown }): ValidationResult =>
				handler.sameDay(parseUtc(input), options?.referenceDate as never),
			[
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-15T00:01:00Z' }, pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-16T00:01:00Z' }, pass: false, errorKey: 'date/sameDay' }
			],
			'date/unknown'
		);
	});

	it('sameMonth', () => {
		runCases(
			(input: unknown, options?: { referenceDate: unknown }): ValidationResult =>
				handler.sameMonth(parseUtc(input), options?.referenceDate as never),
			[
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-01T00:00:00Z' }, pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-02-01T00:00:00Z' }, pass: false, errorKey: 'date/sameMonth' }
			],
			'date/unknown'
		);
	});

	it('sameWeek', () => {
		runCases(
			(input: unknown, options?: { referenceDate: unknown; firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): ValidationResult =>
				handler.sameWeek(parseUtc(input), options?.referenceDate as never, options?.firstDayOfWeek),
			[
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-16T00:00:00Z', firstDayOfWeek: 1 }, pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-21T00:00:00Z', firstDayOfWeek: 0 }, pass: false, errorKey: 'date/sameWeek' },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-21T00:00:00Z', firstDayOfWeek: 1 }, pass: true }
			],
			'date/unknown'
		);
	});

	it('sameYear', () => {
		runCases(
			(input: unknown, options?: { referenceDate: unknown }): ValidationResult =>
				handler.sameYear(parseUtc(input), options?.referenceDate as never),
			[
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-12-31T00:00:00Z' }, pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2025-01-01T00:00:00Z' }, pass: false, errorKey: 'date/sameYear' }
			],
			'date/unknown'
		);
	});

	it('future', () => {
		runCases(
			(input: unknown, options?: { referenceDate?: unknown }): ValidationResult =>
				handler.future(parseUtc(input), options?.referenceDate as never),
			[
				{ input: '2999-01-01T00:00:00Z', pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-01' }, pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-02-01' }, pass: false, errorKey: 'date/future' }
			],
			'date/unknown'
		);
	});

	it('past', () => {
		runCases(
			(input: unknown, options?: { referenceDate?: unknown }): ValidationResult =>
				handler.past(parseUtc(input), options?.referenceDate as never),
			[
				{ input: '1900-01-01T00:00:00Z', pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-02-01' }, pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-01' }, pass: false, errorKey: 'date/past' }
			],
			'date/unknown'
		);
	});

	it('recent', () => {
		runCases(
			(input: unknown, options?: { days?: number; referenceDate?: unknown }): ValidationResult =>
				handler.recent(parseUtc(input), options?.days, options?.referenceDate as never),
			[
				{ input: new Date(), pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { days: 20, referenceDate: '2024-01-30' }, pass: true },
				{ input: '2024-01-01T12:00:00Z', options: { days: 5, referenceDate: '2024-01-30' }, pass: false, errorKey: 'date/recent' }
			],
			'date/unknown'
		);
	});

	it('today', () => {
		runCases(
			(input: unknown, options?: { referenceDate?: unknown }): ValidationResult =>
				handler.today(parseUtc(input), options?.referenceDate as never),
			[
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-15T23:59:00Z' }, pass: true },
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-16T00:00:00Z' }, pass: false, errorKey: 'date/today' }
			],
			'date/unknown'
		);
	});

	it('leapYear', () => {
		runCases(
			(input: unknown): ValidationResult => handler.leapYear(parseUtc(input)),
			[
				{ input: '2024-02-01', pass: true },
				{ input: '2023-02-01', pass: false, errorKey: 'date/leapYear' }
			],
			'date/unknown'
		);
	});

	it('max', () => {
		runCases(
			(input: unknown, options?: { referenceDate: unknown }): ValidationResult =>
				handler.max(parseUtc(input), options?.referenceDate as never),
			[
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-15T12:00:00Z' }, pass: true },
				{ input: '2024-01-16T12:00:00Z', options: { referenceDate: '2024-01-15T12:00:00Z' }, pass: false, errorKey: 'date/max' }
			],
			'date/unknown'
		);
	});

	it('min', () => {
		runCases(
			(input: unknown, options?: { referenceDate: unknown }): ValidationResult =>
				handler.min(parseUtc(input), options?.referenceDate as never),
			[
				{ input: '2024-01-15T12:00:00Z', options: { referenceDate: '2024-01-15T12:00:00Z' }, pass: true },
				{ input: '2024-01-14T12:00:00Z', options: { referenceDate: '2024-01-15T12:00:00Z' }, pass: false, errorKey: 'date/min' }
			],
			'date/unknown'
		);
	});

	it('minAge', () => {
		runCases(
			(input: unknown, options?: { minAge: number; referenceDate?: unknown }): ValidationResult =>
				handler.minAge(parseUtc(input), options?.minAge ?? 0, options?.referenceDate as never),
			[
				{ input: '2000-01-01', options: { minAge: 18, referenceDate: '2024-01-02' }, pass: true },
				{ input: '2010-01-01', options: { minAge: 18, referenceDate: '2024-01-02' }, pass: false, errorKey: 'date/minAge' }
			],
			'date/unknown'
		);
	});

	it('weekday', () => {
		runCases(
			(input: unknown): ValidationResult => handler.weekday(parseUtc(input)),
			[
				{ input: '2024-01-15', pass: true },
				{ input: '2024-01-14', pass: false, errorKey: 'date/weekday' }
			],
			'date/unknown'
		);
	});

	it('weekend', () => {
		runCases(
			(input: unknown): ValidationResult => handler.weekend(parseUtc(input)),
			[
				{ input: '2024-01-14', pass: true },
				{ input: '2024-01-15', pass: false, errorKey: 'date/weekend' }
			],
			'date/unknown'
		);
	});
});

describe('DateHandler mutators and formatter', () => {
	let handler: DateHandler;

	beforeEach(() => {
		handler = new DateHandler();
		handler.configDateConverter(new Translation(DefaultCalendarText));
	});

	const parseUtc = (input: unknown): UtcDate => {
		const result = handler.date(input);
		expect(result.pass).toBe(true);
		return result.value as UtcDate;
	};

	it('addDays', () => {
		runCases(
			(input: unknown, options?: { numDays: number }): ValidationResult<string> =>
				toIsoResult(handler.addDays(parseUtc(input), options?.numDays ?? 0)),
			[
				{ input: '2024-01-15T12:00:00Z', options: { numDays: 2 }, pass: true, value: '2024-01-17T12:00:00.000Z' },
				{ input: '2024-01-15T12:00:00Z', options: { numDays: -1 }, pass: true, value: '2024-01-14T12:00:00.000Z' }
			],
			'date/unknown'
		);
	});

	it('addHours', () => {
		runCases(
			(input: unknown, options?: { numHours: number }): ValidationResult<string> =>
				toIsoResult(handler.addHours(parseUtc(input), options?.numHours ?? 0)),
			[
				{ input: '2024-01-15T12:00:00Z', options: { numHours: 5 }, pass: true, value: '2024-01-15T17:00:00.000Z' }
			],
			'date/unknown'
		);
	});

	it('addMinutes', () => {
		runCases(
			(input: unknown, options?: { numMinutes: number }): ValidationResult<string> =>
				toIsoResult(handler.addMinutes(parseUtc(input), options?.numMinutes ?? 0)),
			[
				{ input: '2024-01-15T12:00:00Z', options: { numMinutes: 30 }, pass: true, value: '2024-01-15T12:30:00.000Z' }
			],
			'date/unknown'
		);
	});

	it('addMonths', () => {
		runCases(
			(input: unknown, options?: { numMonths: number }): ValidationResult<string> =>
				toIsoResult(handler.addMonths(parseUtc(input), options?.numMonths ?? 0)),
			[
				{ input: '2024-01-15T12:00:00Z', options: { numMonths: 1 }, pass: true, value: '2024-02-15T12:00:00.000Z' }
			],
			'date/unknown'
		);
	});

	it('addYears', () => {
		runCases(
			(input: unknown, options?: { numYears: number }): ValidationResult<string> =>
				toIsoResult(handler.addYears(parseUtc(input), options?.numYears ?? 0)),
			[
				{ input: '2024-01-15T12:00:00Z', options: { numYears: 1 }, pass: true, value: '2025-01-15T12:00:00.000Z' }
			],
			'date/unknown'
		);
	});

	it('clamp', () => {
		runCases(
			(input: unknown, options?: { minDate: unknown; maxDate: unknown }): ValidationResult<string> =>
				toIsoResult(handler.clamp(parseUtc(input), options?.minDate as never, options?.maxDate as never)),
			[
				{ input: '2023-01-01T00:00:00Z', options: { minDate: '2024-01-01', maxDate: '2024-12-31' }, pass: true, value: '2024-01-01T00:00:00.000Z' },
				{ input: '2025-01-01T00:00:00Z', options: { minDate: '2024-01-01', maxDate: '2024-12-31' }, pass: true, value: '2024-12-31T00:00:00.000Z' },
				{ input: '2024-06-01T00:00:00Z', options: { minDate: '2024-01-01', maxDate: '2024-12-31' }, pass: true, value: '2024-06-01T00:00:00.000Z' },
				{ input: '2024-06-01T00:00:00Z', options: { minDate: 'bad', maxDate: '2024-12-31' }, pass: false, errorKey: 'date/base' }
			],
			'date/unknown'
		);
	});

	it('toStartOfDay', () => {
		runCases(
			(input: unknown): ValidationResult<string> => toIsoResult(handler.toStartOfDay(parseUtc(input))),
			[{ input: '2024-01-15T12:00:00Z', pass: true, value: '2024-01-15T00:00:00.000Z' }],
			'date/unknown'
		);
	});

	it('toEndOfDay', () => {
		runCases(
			(input: unknown): ValidationResult<string> => toIsoResult(handler.toEndOfDay(parseUtc(input))),
			[{ input: '2024-01-15T12:00:00Z', pass: true, value: '2024-01-15T23:59:59.999Z' }],
			'date/unknown'
		);
	});

	it('toStartOfMonth', () => {
		runCases(
			(input: unknown): ValidationResult<string> => toIsoResult(handler.toStartOfMonth(parseUtc(input))),
			[{ input: '2024-01-15T12:00:00Z', pass: true, value: '2024-01-01T00:00:00.000Z' }],
			'date/unknown'
		);
	});

	it('toEndOfMonth', () => {
		runCases(
			(input: unknown): ValidationResult<string> => toIsoResult(handler.toEndOfMonth(parseUtc(input))),
			[{ input: '2024-02-10T00:00:00Z', pass: true, value: '2024-02-29T23:59:59.999Z' }],
			'date/unknown'
		);
	});

	it('toStartOfYear', () => {
		runCases(
			(input: unknown): ValidationResult<string> => toIsoResult(handler.toStartOfYear(parseUtc(input))),
			[{ input: '2024-06-15T12:00:00Z', pass: true, value: '2024-01-01T00:00:00.000Z' }],
			'date/unknown'
		);
	});

	it('toEndOfYear', () => {
		runCases(
			(input: unknown): ValidationResult<string> => toIsoResult(handler.toEndOfYear(parseUtc(input))),
			[{ input: '2024-03-10T00:00:00Z', pass: true, value: '2024-12-31T23:59:59.999Z' }],
			'date/unknown'
		);
	});

	it('toNextDayOfWeek', () => {
		runCases(
			(input: unknown, options?: { targetDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): ValidationResult<string> =>
				toIsoResult(handler.toNextDayOfWeek(parseUtc(input), options?.targetDayOfWeek ?? 0)),
			[
				{ input: '2024-01-15T00:00:00Z', options: { targetDayOfWeek: 5 }, pass: true, value: '2024-01-19T00:00:00.000Z' },
				{ input: '2024-01-15T00:00:00Z', options: { targetDayOfWeek: 1 }, pass: true, value: '2024-01-22T00:00:00.000Z' }
			],
			'date/unknown'
		);
	});

	it('toNextWeekday', () => {
		runCases(
			(input: unknown): ValidationResult<string> => toIsoResult(handler.toNextWeekday(parseUtc(input))),
			[{ input: '2024-01-19T00:00:00Z', pass: true, value: '2024-01-22T00:00:00.000Z' }],
			'date/unknown'
		);
	});

	it('toPreviousWeekday', () => {
		runCases(
			(input: unknown): ValidationResult<string> => toIsoResult(handler.toPreviousWeekday(parseUtc(input))),
			[{ input: '2024-01-22T00:00:00Z', pass: true, value: '2024-01-19T00:00:00.000Z' }],
			'date/unknown'
		);
	});

	it('toFormat output modes', () => {
		runCases(
			(input: unknown, options?: { formatString: string | null; timeMode?: 'utc' | 'local' }): ValidationResult =>
				handler.toFormat(parseUtc(input), options?.formatString ?? null, options?.timeMode),
			[
				{ input: '2024-01-15T12:00:00Z', options: { formatString: null }, pass: true, value: '2024-01-15T12:00:00Z' },
				{ input: '2024-01-15T12:00:00Z', options: { formatString: 'timestamp' }, pass: true, value: 1705320000000 },
				{ input: '2024-01-15T12:00:00Z', options: { formatString: 'YYYY-MM-DD', timeMode: 'utc' }, pass: true, value: '2024-01-15' }
			],
			'date/unknown'
		);

		const objectResult = handler.toFormat(parseUtc('2024-01-15T12:00:00Z'), 'object');
		expect(objectResult.pass).toBe(true);
		expect(objectResult.value).toBeInstanceOf(Date);
		expect((objectResult.value as Date).toISOString()).toBe('2024-01-15T12:00:00.000Z');
	});
});
