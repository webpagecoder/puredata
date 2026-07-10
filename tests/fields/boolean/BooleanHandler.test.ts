'use strict';

import { BooleanHandler } from '../../../lib/fields/boolean/BooleanHandler.ts';
import { runCases, type ValidationResult } from '../../helpers/runCases.ts';

describe('BooleanHandler validators', () => {
	let handler: BooleanHandler;

	beforeEach(() => {
		handler = new BooleanHandler();
	});

	describe('truthy', () => {
		it('passes for true by default and supports custom truthy values', () => {
			const ref = { ok: true };
			runCases(
				(input: unknown, options?: { truthyValues?: unknown[] }): ValidationResult =>
					handler.truthy(input, options?.truthyValues),
				[
					{ input: true, pass: true, value: true },
					{ input: false, pass: false, errorKey: 'boolean/truthy' },
					{ input: 'yes', options: { truthyValues: ['yes', 1, ref] }, pass: true, value: 'yes' },
					{ input: 1, options: { truthyValues: ['yes', 1, ref] }, pass: true, value: 1 },
					{ input: ref, options: { truthyValues: ['yes', 1, ref] }, pass: true, value: ref },
					{ input: { ok: true }, options: { truthyValues: ['yes', 1, ref] }, pass: false, errorKey: 'boolean/truthy' },
					{ input: '1', options: { truthyValues: ['yes', 1, ref] }, pass: false, errorKey: 'boolean/truthy' }
				],
				'boolean/unknown'
			);
		});
	});

	describe('falsy', () => {
		it('passes for false by default and supports custom falsy values', () => {
			const ref = { no: true };
			runCases(
				(input: unknown, options?: { falsyValues?: unknown[] }): ValidationResult =>
					handler.falsy(input, options?.falsyValues),
				[
					{ input: false, pass: true, value: false },
					{ input: true, pass: false, errorKey: 'boolean/falsy' },
					{ input: 'no', options: { falsyValues: ['no', 0, ref] }, pass: true, value: 'no' },
					{ input: 0, options: { falsyValues: ['no', 0, ref] }, pass: true, value: 0 },
					{ input: ref, options: { falsyValues: ['no', 0, ref] }, pass: true, value: ref },
					{ input: { no: true }, options: { falsyValues: ['no', 0, ref] }, pass: false, errorKey: 'boolean/falsy' },
					{ input: '0', options: { falsyValues: ['no', 0, ref] }, pass: false, errorKey: 'boolean/falsy' }
				],
				'boolean/unknown'
			);
		});
	});
});

describe('BooleanHandler mutators', () => {
	let handler: BooleanHandler;

	beforeEach(() => {
		handler = new BooleanHandler();
	});

	describe('invert', () => {
		it('inverts default boolean pair and custom boolish pairs', () => {
			runCases(
				(input: unknown, options?: { boolishPairs?: Array<[unknown, unknown]> }): ValidationResult =>
					handler.invert(input, options?.boolishPairs),
				[
					{ input: true, pass: true, value: false },
					{ input: false, pass: true, value: true },
					{ input: 'Y', options: { boolishPairs: [['Y', 'N']] }, pass: true, value: 'N' },
					{ input: 'N', options: { boolishPairs: [['Y', 'N']] }, pass: true, value: 'Y' },
					{ input: 1, options: { boolishPairs: [[1, 0]] }, pass: true, value: 0 },
					{ input: 0, options: { boolishPairs: [[1, 0]] }, pass: true, value: 1 },
					{ input: 'unknown', options: { boolishPairs: [['Y', 'N']] }, pass: false, errorKey: 'boolean/invert' }
				],
				'boolean/unknown'
			);
		});

		it('prefers custom pair mapping before default pair for overlaps', () => {
			runCases(
				(input: unknown, options?: { boolishPairs?: Array<[unknown, unknown]> }): ValidationResult =>
					handler.invert(input, options?.boolishPairs),
				[
					{ input: true, options: { boolishPairs: [[true, 'NO']] }, pass: true, value: 'NO' },
					{ input: 'NO', options: { boolishPairs: [[true, 'NO']] }, pass: true, value: true }
				],
				'boolean/unknown'
			);
		});

		it('mutates provided boolishPairs by appending default pair', () => {
			const pairs: Array<[unknown, unknown]> = [['Y', 'N']];
			const result = handler.invert('Y', pairs);
			expect(result.pass).toBe(true);
			expect(pairs).toEqual([['Y', 'N'], [true, false]]);
		});
	});
});
