'use strict';

import { NumberHandler } from '../../../lib/fields/number/NumberHandler.ts';
import { runCases, type ValidationResult } from '../../helpers/runCases.ts';

describe('NumberHandler validators', () => {
	let handler: NumberHandler;

	beforeEach(() => {
		handler = new NumberHandler();
	});

	it('number', () => {
		runCases(handler.number.bind(handler), [
			{ input: 123, pass: true, value: 123 },
			{ input: 0, pass: true, value: 0 },
			{ input: NaN, pass: false, errorKey: 'number/base' },
			{ input: '123', pass: false, errorKey: 'number/base' }
		]);
	});

	it('approx', () => {
		runCases(
			(input: unknown, options?: { comparison: number; tolerance?: number }): ValidationResult =>
				handler.approx(input, options?.comparison, options?.tolerance),
			[
				{ input: 1 + Number.EPSILON / 2, options: { comparison: 1 }, pass: true, value: 1 + Number.EPSILON / 2 },
				{ input: 1.1, options: { comparison: 1, tolerance: 0.2 }, pass: true, value: 1.1 },
				{ input: 1.3, options: { comparison: 1, tolerance: 0.2 }, pass: false, errorKey: 'number/approx' }
			]);
	});

	it('between', () => {
		runCases(
			(input: unknown, options?: { min: number; max: number }): ValidationResult =>
				handler.between(input, options?.min, options?.max),
			[
				{ input: 5, options: { min: 1, max: 5 }, pass: true, value: 5 },
				{ input: 0, options: { min: 1, max: 5 }, pass: false, errorKey: 'number/between' }
			]);
	});

	it('greaterThan', () => {
		runCases(
			(input: unknown, options?: { comparison: number }): ValidationResult =>
				handler.greaterThan(input, options?.comparison),
			[
				{ input: 6, options: { comparison: 5 }, pass: true, value: 6 },
				{ input: 5, options: { comparison: 5 }, pass: false, errorKey: 'number/greaterThan' }
			]);
	});

	it('lessThan', () => {
		runCases(
			(input: unknown, options?: { comparison: number }): ValidationResult =>
				handler.lessThan(input, options?.comparison),
			[
				{ input: 4, options: { comparison: 5 }, pass: true, value: 4 },
				{ input: 5, options: { comparison: 5 }, pass: false, errorKey: 'number/lessThan' }
			]);
	});

	it('max', () => {
		runCases(
			(input: unknown, options?: { comparison: number }): ValidationResult =>
				handler.max(input, options?.comparison),
			[
				{ input: 5, options: { comparison: 5 }, pass: true, value: 5 },
				{ input: 6, options: { comparison: 5 }, pass: false, errorKey: 'number/max' }
			]);
	});

	it('min', () => {
		runCases(
			(input: unknown, options?: { comparison: number }): ValidationResult =>
				handler.min(input, options?.comparison),
			[
				{ input: 5, options: { comparison: 5 }, pass: true, value: 5 },
				{ input: 4, options: { comparison: 5 }, pass: false, errorKey: 'number/min' }
			]);
	});

	it('equals', () => {
		runCases(
			(input: unknown, options?: { comparison: unknown }): ValidationResult =>
				handler.equals(input, options?.comparison),
			[
				{ input: 5, options: { comparison: 5 }, pass: true, value: 5 },
				{ input: 5, options: { comparison: '5' }, pass: false, errorKey: 'number/equals' }
			]);
	});

	it('notEquals', () => {
		runCases(
			(input: unknown, options?: { comparison: unknown }): ValidationResult =>
				handler.notEquals(input, options?.comparison),
			[
				{ input: 5, options: { comparison: 6 }, pass: true, value: 5 },
				{ input: 5, options: { comparison: 5 }, pass: false, errorKey: 'number/notEquals' }
			]);
	});

	it('even', () => {
		runCases(handler.even.bind(handler), [
			{ input: 4, pass: true, value: 4 },
			{ input: 5, pass: false, errorKey: 'number/even' }
		]);
	});

	it('odd', () => {
		runCases(handler.odd.bind(handler), [
			{ input: 5, pass: true, value: 5 },
			{ input: 4, pass: false, errorKey: 'number/odd' }
		]);
	});

	it('multiple', () => {
		runCases(
			(input: unknown, options?: { factor: number }): ValidationResult =>
				handler.multiple(input, options?.factor),
			[
				{ input: 12, options: { factor: 3 }, pass: true, value: 12 },
				{ input: 10, options: { factor: 3 }, pass: false, errorKey: 'number/multiple' }
			]);
	});

	it('factor', () => {
		runCases(
			(input: unknown, options?: { multiple: number }): ValidationResult =>
				handler.factor(input, options?.multiple),
			[
				{ input: 3, options: { multiple: 12 }, pass: true, value: 3 },
				{ input: 5, options: { multiple: 12 }, pass: false, errorKey: 'number/factor' }
			]);
	});

	it('decimal', () => {
		runCases(
			(input: unknown, options?: { minDecimalPlaces?: number; maxDecimalPlaces?: number }): ValidationResult =>
				handler.decimal(input, options),
			[
				{ input: 1.23, pass: true, value: 1.23 },
				{ input: 5, pass: false, errorKey: 'number/decimal' },
				{ input: 1.2, options: { minDecimalPlaces: 2 }, pass: false, errorKey: 'number/decimal' },
				{ input: 1.23, options: { minDecimalPlaces: 2, maxDecimalPlaces: 2 }, pass: true, value: 1.23 },
				{ input: 1.234, options: { maxDecimalPlaces: 2 }, pass: false, errorKey: 'number/decimal' }
			]);
	});

	it('precision', () => {
		runCases(
			(input: unknown, options?: { precision: number }): ValidationResult =>
				handler.precision(input, options?.precision),
			[
				{ input: 1.23, options: { precision: 2 }, pass: true, value: 1.23 },
				{ input: 1.234, options: { precision: 2 }, pass: false, errorKey: 'number/precision' }
			]);
	});

	it('finite', () => {
		runCases(handler.finite.bind(handler), [
			{ input: 12, pass: true, value: 12 },
			{ input: Infinity, pass: false, errorKey: 'number/finite' }
		]);
	});

	it('infinity', () => {
		runCases(handler.infinity.bind(handler), [
			{ input: Infinity, pass: true, value: Infinity },
			{ input: -Infinity, pass: true, value: -Infinity },
			{ input: 10, pass: false, errorKey: 'number/infinity' }
		]);
	});

	it('integer', () => {
		runCases(handler.integer.bind(handler), [
			{ input: 10, pass: true, value: 10 },
			{ input: 10.5, pass: false, errorKey: 'number/integer' }
		]);
	});

	it('negative', () => {
		runCases(handler.negative.bind(handler), [
			{ input: -1, pass: true, value: -1 },
			{ input: 0, pass: false, errorKey: 'number/negative' }
		]);
	});

	it('positive', () => {
		runCases(handler.positive.bind(handler), [
			{ input: 1, pass: true, value: 1 },
			{ input: 0, pass: false, errorKey: 'number/positive' }
		]);
	});

	it('zero', () => {
		runCases(handler.zero.bind(handler), [
			{ input: 0, pass: true, value: 0 },
			{ input: -0, pass: true, value: -0 },
			{ input: 1, pass: false, errorKey: 'number/zero' }
		]);
	});

	it('prime', () => {
		runCases(handler.prime.bind(handler), [
			{ input: 2, pass: true, value: 2 },
			{ input: 13, pass: true, value: 13 },
			{ input: 1, pass: false, errorKey: 'number/prime' },
			{ input: 12, pass: false, errorKey: 'number/prime' },
			{ input: 2.5, pass: false, errorKey: 'number/prime' }
		]);
	});

	it('safe', () => {
		runCases(handler.safe.bind(handler), [
			{ input: Number.MAX_SAFE_INTEGER, pass: true, value: Number.MAX_SAFE_INTEGER },
			{ input: Number.MAX_SAFE_INTEGER + 1, pass: false, errorKey: 'number/safe' }
		]);
	});

	it('safeInteger', () => {
		runCases(handler.safeInteger.bind(handler), [
			{ input: Number.MAX_SAFE_INTEGER, pass: true, value: Number.MAX_SAFE_INTEGER },
			{ input: Number.MAX_SAFE_INTEGER + 1, pass: false, errorKey: 'number/safeInteger' },
			{ input: 2.5, pass: false, errorKey: 'number/safeInteger' }
		]);
	});

	it('minusSign', () => {
		runCases(handler.minusSign.bind(handler), [
			{ input: -5, pass: true, value: -5 },
			{ input: 5, pass: false, errorKey: 'number/minusSign' }
		]);
	});

	it('plusSign', () => {
		runCases(handler.plusSign.bind(handler), [
			{ input: '+5', pass: true, value: '+5' },
			{ input: 5, pass: false, errorKey: 'number/plusSign' }
		]);
	});

	it('signed', () => {
		runCases(handler.signed.bind(handler), [
			{ input: -5, pass: true, value: -5 },
			{ input: '+5', pass: true, value: '+5' },
			{ input: 5, pass: false, errorKey: 'number/signed' }
		]);
	});

	it('unsigned', () => {
		runCases(handler.unsigned.bind(handler), [
			{ input: 5, pass: true, value: 5 },
			{ input: -5, pass: false, errorKey: 'number/unsigned' },
			{ input: '+5', pass: false, errorKey: 'number/unsigned' }
		]);
	});
});

describe('NumberHandler mutators', () => {
	let handler: NumberHandler;

	beforeEach(() => {
		handler = new NumberHandler();
	});

	it('clampBetween', () => {
		runCases(
			(input: unknown, options?: { min: number; max: number }): ValidationResult =>
				handler.clampBetween(input, options?.min, options?.max),
			[
				{ input: 5, options: { min: 1, max: 10 }, pass: true, value: 5 },
				{ input: -1, options: { min: 1, max: 10 }, pass: true, value: 1 },
				{ input: 12, options: { min: 1, max: 10 }, pass: true, value: 10 }
			]);
	});

	it('constrain', () => {
		runCases(
			(input: unknown, options?: { min: number; max: number }): ValidationResult =>
				handler.constrain(input, options?.min, options?.max),
			[
				{ input: 5, options: { min: 1, max: 10 }, pass: true, value: 5 },
				{ input: -1, options: { min: 1, max: 10 }, pass: true, value: 1 },
				{ input: 12, options: { min: 1, max: 10 }, pass: true, value: 10 }
			]);
	});

	it('clamp', () => {
		runCases(
			(input: unknown, options?: { min: number; max: number }): ValidationResult =>
				handler.clamp(input, options?.min, options?.max),
			[
				{ input: -5, options: { min: 0, max: 2 }, pass: true, value: 0 },
				{ input: 3, options: { min: 0, max: 2 }, pass: true, value: 2 }
			]);
	});

	it('negate', () => {
		runCases(handler.negate.bind(handler), [
			{ input: 5, pass: true, value: -5 },
			{ input: -5, pass: true, value: 5 }
		]);
	});

	it('round', () => {
		runCases(
			(input: unknown, options?: { numDecimals?: number }): ValidationResult =>
				handler.round(input, options?.numDecimals),
			[
				{ input: 1.234, pass: true, value: 1 },
				{ input: 1.234, options: { numDecimals: 2 }, pass: true, value: 1.23 },
				{ input: 1.235, options: { numDecimals: 2 }, pass: true, value: 1.24 }
			]);
	});

	it('roundDown', () => {
		runCases(handler.roundDown.bind(handler), [
			{ input: 1.9, pass: true, value: 1 },
			{ input: -1.1, pass: true, value: -2 }
		]);
	});

	it('roundUp', () => {
		runCases(handler.roundUp.bind(handler), [
			{ input: 1.1, pass: true, value: 2 },
			{ input: -1.9, pass: true, value: -1 }
		]);
	});

	it('stripSign', () => {
		runCases(handler.stripSign.bind(handler), [
			{ input: -7, pass: true, value: 7 },
			{ input: 7, pass: true, value: 7 }
		]);
	});

	it('abs', () => {
		runCases(handler.abs.bind(handler), [
			{ input: -7, pass: true, value: 7 },
			{ input: 7, pass: true, value: 7 }
		]);
	});

	it('ceil', () => {
		runCases(handler.ceil.bind(handler), [
			{ input: 1.1, pass: true, value: 2 },
			{ input: -1.9, pass: true, value: -1 }
		]);
	});

	it('floor', () => {
		runCases(handler.floor.bind(handler), [
			{ input: 1.9, pass: true, value: 1 },
			{ input: -1.1, pass: true, value: -2 }
		]);
	});

	it('truncate', () => {
		runCases(handler.truncate.bind(handler), [
			{ input: 1.9, pass: true, value: 1 },
			{ input: -1.9, pass: true, value: -1 }
		]);
	});

	it('toPower', () => {
		runCases(
			(input: unknown, options?: { exponent: number }): ValidationResult =>
				handler.toPower(input, options?.exponent),
			[
				{ input: 2, options: { exponent: 3 }, pass: true, value: 8 },
				{ input: 9, options: { exponent: 0.5 }, pass: true, value: 3 }
			]);
	});

	it('pow', () => {
		runCases(
			(input: unknown, options?: { exponent: number }): ValidationResult =>
				handler.pow(input, options?.exponent),
			[
				{ input: 2, options: { exponent: 3 }, pass: true, value: 8 }
			]);
	});

	it('toScale', () => {
		runCases(
			(input: unknown, options?: { fromMin: number; fromMax: number; toMin: number; toMax: number }): ValidationResult =>
				handler.toScale(input, options?.fromMin, options?.fromMax, options?.toMin, options?.toMax),
			[
				{ input: 5, options: { fromMin: 0, fromMax: 10, toMin: 0, toMax: 100 }, pass: true, value: 50 },
				{ input: 0.5, options: { fromMin: 0, fromMax: 1, toMin: 10, toMax: 20 }, pass: true, value: 15 }
			]);
	});

	it('scale', () => {
		runCases(
			(input: unknown, options?: { fromMin: number; fromMax: number; toMin: number; toMax: number }): ValidationResult =>
				handler.scale(input, options?.fromMin, options?.fromMax, options?.toMin, options?.toMax),
			[
				{ input: 5, options: { fromMin: 0, fromMax: 10, toMin: 0, toMax: 100 }, pass: true, value: 50 }
			]);
	});
});
