'use strict';

import { AnyHandler } from '../../../lib/fields/any/AnyHandler.ts';
import { runCases, type ValidationResult } from '../../helpers/runCases.ts';

describe('AnyHandler validators', () => {
	let handler: AnyHandler;

	beforeEach(() => {
		handler = new AnyHandler();
	});

	describe('primitive (type)', () => {
		it('passes for all primitive values when no type is provided', () => {
			runCases<unknown, undefined, unknown>(
				(input: unknown): ValidationResult => handler.primitive(input),
				[
					{ input: 'hello', pass: true, value: 'hello' },
					{ input: 42, pass: true, value: 42 },
					{ input: true, pass: true, value: true },
					{ input: undefined, pass: true, value: undefined },
					{ input: Symbol.for('s'), pass: true, value: Symbol.for('s') },
					{ input: 12n, pass: true, value: 12n }
				],
				'generic/primitive'
			);
		});

		it('fails for non-primitive values when no type is provided', () => {
			runCases<unknown, undefined, unknown>(
				(input: unknown): ValidationResult => handler.primitive(input),
				[
					{ input: null, pass: false, errorKey: 'generic/primitive' },
					{ input: { a: 1 }, pass: false, errorKey: 'generic/primitive' },
					{ input: [1, 2], pass: false, errorKey: 'generic/primitive' },
					{ input: (): number => 1, pass: false, errorKey: 'generic/primitive' },
					{ input: new Date(), pass: false, errorKey: 'generic/primitive' }
				],
				'generic/primitive'
			);
		});

		it('supports all explicit type options', () => {
			runCases(
				(input: unknown, options?: { type: 'string' | 'number' | 'boolean' | 'undefined' | 'symbol' | 'bigint' }): ValidationResult =>
					handler.primitive(input, options?.type),
				[
					{ input: 'x', options: { type: 'string' }, pass: true, value: 'x' },
					{ input: 7, options: { type: 'number' }, pass: true, value: 7 },
					{ input: false, options: { type: 'boolean' }, pass: true, value: false },
					{ input: undefined, options: { type: 'undefined' }, pass: true, value: undefined },
					{ input: Symbol.for('type-symbol'), options: { type: 'symbol' }, pass: true, value: Symbol.for('type-symbol') },
					{ input: 9n, options: { type: 'bigint' }, pass: true, value: 9n }
				],
				'generic/primitive'
			);
		});

		it('fails when explicit type does not match value type', () => {
			runCases(
				(input: unknown, options?: { type: 'string' | 'number' | 'boolean' | 'undefined' | 'symbol' | 'bigint' }): ValidationResult =>
					handler.primitive(input, options?.type),
				[
					{ input: 1, options: { type: 'string' }, pass: false, errorKey: 'generic/primitive' },
					{ input: '1', options: { type: 'number' }, pass: false, errorKey: 'generic/primitive' },
					{ input: 0, options: { type: 'boolean' }, pass: false, errorKey: 'generic/primitive' },
					{ input: null, options: { type: 'undefined' }, pass: false, errorKey: 'generic/primitive' },
					{ input: 'sym', options: { type: 'symbol' }, pass: false, errorKey: 'generic/primitive' },
					{ input: 10, options: { type: 'bigint' }, pass: false, errorKey: 'generic/primitive' }
				],
				'generic/primitive'
			);
		});

		it('treats null type as no-type mode', () => {
			runCases(
				(input: unknown, options?: { type: null }): ValidationResult =>
					handler.primitive(input, options?.type ?? null),
				[
					{ input: 'abc', options: { type: null }, pass: true, value: 'abc' },
					{ input: 5n, options: { type: null }, pass: true, value: 5n },
					{ input: { x: 1 }, options: { type: null }, pass: false, errorKey: 'generic/primitive' }
				],
				'generic/primitive'
			);
		});
	});
});
