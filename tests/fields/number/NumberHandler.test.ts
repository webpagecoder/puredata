'use strict';

import { NumberHandler } from '../../../lib/fields/number/NumberHandler.ts';
import { runFailTests, runPassTests } from '../../helpers/runCases.ts';


describe('NumberHandler validators', () => {
	let handler: NumberHandler;

	beforeEach(() => {
		handler = new NumberHandler();
	});

	it('approx', () => {
		runPassTests(handler.approx.bind(handler), [
			{ input: 1 + Number.EPSILON / 2, args: [1], output: 1 + Number.EPSILON / 2 },
			{ input: 1.1, args: [1, 0.2], output: 1.1 },
			{ input: 0.9999999999999999, args: [1, 1e-12], output: 0.9999999999999999 },
			{ input: -10, args: [-10, Number.EPSILON * 2], output: -10 },
		]);

		runFailTests(handler.approx.bind(handler), [
			{ input: 1.3, args: [1, 0.2] },
			{ input: 1, args: [1, 0] },
			{ input: 1.2000001, args: [1, 0.2] }
		]);
	});

	it('between', () => {
		runPassTests(handler.between.bind(handler), [
			{ input: 5, args: [1, 5], output: 5 },
			{ input: 1, args: [1, 5], output: 1 },
			{ input: 3, args: [1, 5], output: 3 },
		]);

		runFailTests(handler.between.bind(handler), [
			{ input: 0, args: [1, 5] },
			{ input: 0.9999, args: [1, 5] },
			{ input: 5.0001, args: [1, 5] }
		]);
	});

	it('decimal', () => {
		runPassTests(handler.decimal.bind(handler), [
			{ input: 1.23, output: 1.23 },
			{ input: 1.23, args: [{ minDecimalPlaces: 2, maxDecimalPlaces: 2 }], output: 1.23 },
			{ input: 0.0001, args: [{ minDecimalPlaces: 1, maxDecimalPlaces: 4 }], output: 0.0001 },
			{ input: -1.5, args: [{ minDecimalPlaces: 1, maxDecimalPlaces: 1 }], output: -1.5 },
		]);

		runFailTests(handler.decimal.bind(handler), [
			{ input: 5 },
			{ input: 1.2, args: [{ minDecimalPlaces: 2, maxDecimalPlaces: 2 }] },
			{ input: 1.234, args: [{ minDecimalPlaces: undefined, maxDecimalPlaces: 2 }] },
			{ input: 1.23, args: [{ minDecimalPlaces: 3, maxDecimalPlaces: 5 }] },
			{ input: 1.23, args: [{ minDecimalPlaces: 0, maxDecimalPlaces: 1 }] }
		]);
	});

	it('equals', () => {
		runPassTests(handler.equals.bind(handler), [
			{ input: 5, args: [5], output: 5 },
			{ input: 0, args: [-0], output: 0 },
			{ input: Infinity, args: [Infinity], output: Infinity },
		]);

		runFailTests(handler.equals.bind(handler), [
			{ input: 5, args: ['5' as any] },
			{ input: NaN, args: [NaN] },
			{ input: 0, args: [false as any] }
		]);
	});

	it('even', () => {
		runPassTests(handler.even.bind(handler), [
			{ input: 4, output: 4 },
			{ input: 0, output: 0 },
			{ input: -2, output: -2 },
		]);

		runFailTests(handler.even.bind(handler), [
			{ input: 5 },
			{ input: -3 },
			{ input: 2.5 }
		]);
	});

	it('factor', () => {
		runPassTests(handler.factor.bind(handler), [
			{ input: 3, args: [12], output: 3 },
			{ input: 4, args: [16], output: 4 },
			{ input: -3, args: [12], output: -3 },
		]);

		runFailTests(handler.factor.bind(handler), [
			{ input: 5, args: [12] },
			{ input: 0, args: [12] },
			{ input: 2.5, args: [9] }
		]);
	});

	it('finite', () => {
		runPassTests(handler.finite.bind(handler), [
			{ input: 12, output: 12 },
			{ input: Number.MAX_VALUE, output: Number.MAX_VALUE },
			{ input: Number.MIN_VALUE, output: Number.MIN_VALUE },
		]);

		runFailTests(handler.finite.bind(handler), [
			{ input: Infinity },
			{ input: -Infinity },
			{ input: NaN }
		]);
	});

	it('greaterThan', () => {
		runPassTests(handler.greaterThan.bind(handler), [
			{ input: 6, args: [5], output: 6 },
			{ input: 5.0000001, args: [5], output: 5.0000001 },
			{ input: -4, args: [-5], output: -4 },
		]);

		runFailTests(handler.greaterThan.bind(handler), [
			{ input: 5, args: [5] },
			{ input: -5, args: [-5] },
			{ input: -6, args: [-5] }
		]);
	});

	it('infinity', () => {
		runPassTests(handler.infinity.bind(handler), [
			{ input: Infinity, output: Infinity },
			{ input: -Infinity, output: -Infinity },
			{ input: 1 / 0, output: Infinity },
			{ input: -1 / 0, output: -Infinity },
		]);

		runFailTests(handler.infinity.bind(handler), [
			{ input: 10 },
			{ input: Number.MAX_VALUE },
			{ input: NaN }
		]);
	});

	it('integer', () => {
		runPassTests(handler.integer.bind(handler), [
			{ input: 10, output: 10 },
			{ input: -10, output: -10 },
			{ input: 0, output: 0 },
		]);

		runFailTests(handler.integer.bind(handler), [
			{ input: 10.5 },
			{ input: Infinity },
			{ input: NaN }
		]);
	});

	it('lessThan', () => {
		runPassTests(handler.lessThan.bind(handler), [
			{ input: 4, args: [5], output: 4 },
			{ input: 4.9999, args: [5], output: 4.9999 },
			{ input: -6, args: [-5], output: -6 },
		]);

		runFailTests(handler.lessThan.bind(handler), [
			{ input: 5, args: [5] },
			{ input: -5, args: [-5] },
			{ input: -4, args: [-5] }
		]);
	});

	it('max', () => {
		runPassTests(handler.max.bind(handler), [
			{ input: 5, args: [5], output: 5 },
			{ input: -10, args: [-5], output: -10 },
			{ input: -5, args: [-5], output: -5 },
		]);

		runFailTests(handler.max.bind(handler), [
			{ input: 6, args: [5] },
			{ input: 5.1, args: [5] },
			{ input: 0, args: [-1] }
		]);
	});

	it('min', () => {
		runPassTests(handler.min.bind(handler), [
			{ input: 5, args: [5], output: 5 },
			{ input: -1, args: [-5], output: -1 },
			{ input: -5, args: [-5], output: -5 },
		]);

		runFailTests(handler.min.bind(handler), [
			{ input: 4, args: [5] },
			{ input: 4.9, args: [5] },
			{ input: -6, args: [-5] }
		]);
	});

	it('minusSign', () => {
		runPassTests(handler.minusSign.bind(handler), [
			{ input: -5, output: -5 },
			{ input: -123, output: -123 },
			{ input: -Infinity, output: -Infinity },
		]);

		runFailTests(handler.minusSign.bind(handler), [
			{ input: 5 },
			{ input: 0 },
			{ input: '+5' as any }
		]);
	});

	it('multiple', () => {
		runPassTests(handler.multiple.bind(handler), [
			{ input: 12, args: [3], output: 12 },
			{ input: 0, args: [5], output: 0 },
			{ input: -9, args: [3], output: -9 },
		]);

		runFailTests(handler.multiple.bind(handler), [
			{ input: 10, args: [3] },
			{ input: 10, args: [4] },
			{ input: 1, args: [0] }
		]);
	});

	it('negative', () => {
		runPassTests(handler.negative.bind(handler), [
			{ input: -1, output: -1 },
			{ input: -100, output: -100 },
			{ input: -Number.MIN_VALUE, output: -Number.MIN_VALUE },
		]);

		runFailTests(handler.negative.bind(handler), [
			{ input: 0 },
			{ input: 1 },
			{ input: Number.MIN_VALUE }
		]);
	});

	it('notEquals', () => {
		runPassTests(handler.notEquals.bind(handler), [
			{ input: 5, args: [6], output: 5 },
			{ input: 5, args: ['5' as any], output: 5 },
			{ input: NaN, args: [NaN], output: NaN },
		]);

		runFailTests(handler.notEquals.bind(handler), [
			{ input: 5, args: [5] },
			{ input: 6, args: [6] },
			{ input: 0, args: [-0] }
		]);
	});

	it('number', () => {
		runPassTests(handler.number.bind(handler), [
			{ input: 123, output: 123 },
			{ input: 0, output: 0 },
			{ input: -123, output: -123 },
			{ input: Number.MIN_VALUE, output: Number.MIN_VALUE }
		]);

		runFailTests(handler.number.bind(handler), [
			{ input: NaN },
			{ input: '123e' as any },
			{ input: null as any },
			{ input: true as any },
		]);
	});

	it('odd', () => {
		runPassTests(handler.odd.bind(handler), [
			{ input: 5, output: 5 },
			{ input: -3, output: -3 },
			{ input: 1, output: 1 },
		]);

		runFailTests(handler.odd.bind(handler), [
			{ input: 4 },
			{ input: 0 },
			{ input: 8 }
		]);
	});

	it('plusSign', () => {
		runPassTests(handler.plusSign.bind(handler), [
			{ input: '+5', output: '+5' },
			{ input: '+0' as any, output: '+0' as any },
			{ input: '+Infinity' as any, output: '+Infinity' as any },
		]);

		runFailTests(handler.plusSign.bind(handler), [
			{ input: 5 },
			{ input: '-5' as any },
			{ input: '5' as any }
		]);
	});

	it('positive', () => {
		runPassTests(handler.positive.bind(handler), [
			{ input: 1, output: 1 },
			{ input: Number.MIN_VALUE, output: Number.MIN_VALUE },
			{ input: 10, output: 10 },
		]);

		runFailTests(handler.positive.bind(handler), [
			{ input: 0 },
			{ input: -1 },
			{ input: -Number.MIN_VALUE }
		]);
	});


	it('precision', () => {
		runPassTests(handler.precision.bind(handler), [
			{ input: 1.23, args: [2], output: 1.23 },
			{ input: 1.2, args: [1], output: 1.2 },
			{ input: -1.234, args: [3], output: -1.234 },
		]);

		runFailTests(handler.precision.bind(handler), [
			{ input: 1.234, args: [2] },
			{ input: 1.23, args: [1] },
			{ input: -1.2345, args: [3] }
		]);
	});


	it('prime', () => {
		runPassTests(handler.prime.bind(handler), [
			{ input: 2, output: 2 },
			{ input: 13, output: 13 },
			{ input: 17, output: 17 },
			{ input: 7919, output: 7919 },
		]);

		runFailTests(handler.prime.bind(handler), [
			{ input: 1 },
			{ input: 12 },
			{ input: 2.5 },
			{ input: 0 },
			{ input: -3 }
		]);
	});

	it('safe', () => {
		runPassTests(handler.safe.bind(handler), [
			{ input: Number.MAX_SAFE_INTEGER, output: Number.MAX_SAFE_INTEGER },
			{ input: Number.MIN_SAFE_INTEGER, output: Number.MIN_SAFE_INTEGER },
			{ input: 1.5, output: 1.5 },
		]);

		runFailTests(handler.safe.bind(handler), [
			{ input: Number.MAX_SAFE_INTEGER + 1 },
			{ input: Number.MIN_SAFE_INTEGER - 1 },
			{ input: Number.MAX_VALUE }
		]);
	});

	it('safeInteger', () => {
		runPassTests(handler.safeInteger.bind(handler), [
			{ input: Number.MAX_SAFE_INTEGER, output: Number.MAX_SAFE_INTEGER },
			{ input: Number.MIN_SAFE_INTEGER, output: Number.MIN_SAFE_INTEGER },
			{ input: 0, output: 0 },
		]);

		runFailTests(handler.safeInteger.bind(handler), [
			{ input: Number.MAX_SAFE_INTEGER + 1 },
			{ input: 2.5 },
			{ input: Number.MAX_SAFE_INTEGER + 0.5 },
			{ input: Infinity }
		]);
	});

	it('signed', () => {
		runPassTests(handler.signed.bind(handler), [
			{ input: -5, output: -5 },
			{ input: '+5' as any, output: '+5' as any },
			{ input: '-0' as any, output: '-0' as any },
			{ input: '+0' as any, output: '+0' as any },
		]);

		runFailTests(handler.signed.bind(handler), [
			{ input: 5 },
			{ input: 0 },
			{ input: '0' as any }
		]);
	});

	it('unsigned', () => {
		runPassTests(handler.unsigned.bind(handler), [
			{ input: 5, output: 5 },
			{ input: 0, output: 0 },
			{ input: '5' as any, output: '5' as any },
		]);

		runFailTests(handler.unsigned.bind(handler), [
			{ input: -5 },
			{ input: '+5' as any },
			{ input: '-0' as any },
			{ input: '+0' as any }
		]);
	});

	it('zero', () => {
		runPassTests(handler.zero.bind(handler), [
			{ input: 0, output: 0 },
			{ input: -0, output: -0 },
			{ input: 0.0, output: 0.0 },
			{ input: -0.0, output: -0.0 },
		]);

		runFailTests(handler.zero.bind(handler), [
			{ input: 1 },
			{ input: Number.MIN_VALUE },
			{ input: -Number.MIN_VALUE }
		]);
	});

});








describe('NumberHandler mutators', () => {
	let handler: NumberHandler;

	beforeEach(() => {
		handler = new NumberHandler();
	});

	it('abs', () => {
		runPassTests(handler.abs.bind(handler), [
			{ input: -7, output: 7 },
			{ input: 7, output: 7 },
			{ input: -123.456, output: 123.456 },
			{ input: Number.MIN_VALUE, output: Number.MIN_VALUE }
		]);
	});

	it('ceil', () => {
		runPassTests(handler.ceil.bind(handler), [
			{ input: 1.1, output: 2 },
			{ input: -1.9, output: -1 },
			{ input: 2, output: 2 },
			{ input: 0.0001, output: 1 }
		]);
	});

	it('clamp', () => {
		runPassTests(handler.clamp.bind(handler), [
			{ input: -5, args: [0, 2], output: 0 },
			{ input: 3, args: [0, 2], output: 2 },
			{ input: 1, args: [0, 2], output: 1 },
			{ input: 0, args: [0, 2], output: 0 }
		]);
	});

	it('clampBetween', () => {
		runPassTests(handler.clampBetween.bind(handler), [
			{ input: 5, args: [1, 10], output: 5 },
			{ input: -1, args: [1, 10], output: 1 },
			{ input: 12, args: [1, 10], output: 10 },
			{ input: 1, args: [1, 10], output: 1 },
			{ input: 10, args: [1, 10], output: 10 }
		]);
	});

	it('constrain', () => {
		runPassTests(handler.constrain.bind(handler), [
			{ input: 5, args: [1, 10], output: 5 },
			{ input: -1, args: [1, 10], output: 1 },
			{ input: 12, args: [1, 10], output: 10 },
			{ input: 1, args: [1, 10], output: 1 },
			{ input: 10, args: [1, 10], output: 10 }
		]);
	});

	it('floor', () => {
		runPassTests(handler.floor.bind(handler), [
			{ input: 1.9, output: 1 },
			{ input: -1.1, output: -2 },
			{ input: 0.1, output: 0 },
			{ input: -0.1, output: -1 }
		]);
	});

	it('negate', () => {
		runPassTests(handler.negate.bind(handler), [
			{ input: 5, output: -5 },
			{ input: -5, output: 5 },
			{ input: 0, output: -0 },
			{ input: Number.MIN_VALUE, output: -Number.MIN_VALUE }
		]);
	});

	it('pow', () => {
		runPassTests(handler.pow.bind(handler), [
			{ input: 2, args: [3], output: 8 },
			{ input: 9, args: [0.5], output: 3 },
			{ input: -2, args: [3], output: -8 },
			{ input: 4, args: [-1], output: 0.25 }
		]);
	});

	it('round', () => {
		runPassTests(handler.round.bind(handler), [
			{ input: 1.234, output: 1 },
			{ input: 1.234, args: [2], output: 1.23 },
			{ input: 1.235, args: [2], output: 1.24 },
			{ input: -1.235, args: [2], output: -1.24 },
			{ input: 5.5, output: 6 }
		]);
	});

	it('roundDown', () => {
		runPassTests(handler.roundDown.bind(handler), [
			{ input: 1.9, output: 1 },
			{ input: -1.1, output: -2 },
			{ input: 0.1, output: 0 },
			{ input: -0.1, output: -1 }
		]);
	});

	it('roundUp', () => {
		runPassTests(handler.roundUp.bind(handler), [
			{ input: 1.1, output: 2 },
			{ input: -1.9, output: -1 },
			{ input: 0.1, output: 1 },
			{ input: -0.1, output: -0 }
		]);
	});

	it('scale', () => {
		runPassTests(handler.scale.bind(handler), [
			{ input: 5, args: [0, 10, 0, 100], output: 50 },
			{ input: 0, args: [0, 10, 0, 100], output: 0 },
			{ input: 10, args: [0, 10, 0, 100], output: 100 },
			{ input: 0.5, args: [0, 1, 10, 20], output: 15 }
		]);
	});

	it('stripSign', () => {
		runPassTests(handler.stripSign.bind(handler), [
			{ input: -7, output: 7 },
			{ input: 7, output: 7 },
			{ input: -123.45, output: 123.45 },
			{ input: Number.MIN_VALUE, output: Number.MIN_VALUE }
		]);
	});

	it('toPower', () => {
		runPassTests(handler.toPower.bind(handler), [
			{ input: 2, args: [3], output: 8 },
			{ input: 9, args: [0.5], output: 3 },
			{ input: -2, args: [2], output: 4 },
			{ input: 4, args: [-1], output: 0.25 }
		]);
	});

	it('toScale', () => {
		runPassTests(handler.toScale.bind(handler), [
			{ input: 5, args: [0, 10, 0, 100], output: 50 },
			{ input: 0.5, args: [0, 1, 10, 20], output: 15 },
			{ input: 0, args: [0, 10, 0, 100], output: 0 },
			{ input: 10, args: [0, 10, 0, 100], output: 100 }
		]);
	});

	it('truncate', () => {
		runPassTests(handler.truncate.bind(handler), [
			{ input: 1.9, output: 1 },
			{ input: -1.9, output: -1 },
			{ input: 0.9, output: 0 },
			{ input: -0.9, output: -0 }
		]);
	});

});
