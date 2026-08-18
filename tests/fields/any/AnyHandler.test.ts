'use strict';

import { AnyHandler } from '../../../lib/fields/any/AnyHandler.ts';
import { runFailTests, runPassTests } from '../../helpers/runCases.ts';
import { HandlerResult } from '../../../lib/fields/HandlerResult.ts';
const { pass, fail } = HandlerResult;

describe('AnyHandler validators', () => {
	let handler: AnyHandler;

	beforeEach(() => {
		handler = new AnyHandler();
	});


	it('anyOf', () => {
		runPassTests(handler.anyOf.bind(handler), [
			{ input: 1, args: [[3, 2, 1]] },
			{ input: false, args: [[true, false]] },
			{ input: false, args: [[true, false]] },
			{ input: [3, 4, 5], args: [[[3, 4, 5], [1, 2, 3]]] },
			{ input: { a: 1 }, args: [[{ a: 1 }]] },
		]);

		runFailTests(handler.anyOf.bind(handler), [
			{ input: 1, args: [[4, 3, 2]] },
			{ input: false, args: [[true, true]] },
			{ input: [3, 4, 5], args: [[[3, 4], [1, 2, 3]]] },
			{ input: { a: 1 }, args: [[{ a: 21 }]] },
		]);
	});


	it('defined', () => {
		runPassTests(handler.defined.bind(handler), [
			{ input: 1 },
			{ input: null }
		]);

		runFailTests(handler.defined.bind(handler), [
			{ input: undefined }
		]);
	});

	it('empty', () => {
		runPassTests(handler.empty.bind(handler), [
			{ input: null },
			{ input: undefined },
			{ input: [2], args: [[1, [2], 3]] }
		]);

		runFailTests(handler.empty.bind(handler), [
			{ input: 1 },
			{ input: [] },
			{ input: 7, args: [[1, 2]] }
		]);
	});


	it('equals', () => {
		runPassTests(handler.equals.bind(handler), [
			{ input: null, args: [null] },
			{ input: undefined, args: [undefined] },
			{ input: [1, 2, 3], args: [[1, 2, 3]] },
			{ input: { a: [1, 2, 3] }, args: [{ a: [1, 2, 3] }] }
		]);

		runFailTests(handler.equals.bind(handler), [
			{ input: 1, args: [[2]] },
			{ input: [], args: [[1, 2, 3]] },
		]);
	});

	it('falsy', () => {
		runPassTests(handler.falsy.bind(handler), [
			{ input: null },
			{ input: undefined },
			{ input: 0 },
			{ input: '' },
			{ input: false },
		]);

		runFailTests(handler.falsy.bind(handler), [
			{ input: 1 },
			{ input: ' ' },
			{ input: [] },
		]);
	});

	it('instanceOf', () => {
		class A { }

		runPassTests(handler.instanceOf.bind(handler), [
			{ input: new Date(), args: [Date] },
			{ input: [], args: [Array] },
			{ input: new A(), args: [A] },
		]);

		runFailTests(handler.instanceOf.bind(handler), [
			{ input: new Date(), args: [Array] },
			{ input: [], args: [Date] },
			{ input: new A(), args: [Date] },
		]);
	});

	it('noneOf', () => {
		class A { }

		runPassTests(handler.noneOf.bind(handler), [
			{ input: 1, args: [[2, 3, 4]] },
			{ input: false, args: [[true, null]] },
			{ input: [1, 2, 3], args: [[[4, 5, 6], [7, 8, 9]]] },
		]);

		runFailTests(handler.noneOf.bind(handler), [
			{ input: 1, args: [[1, 2, 3]] },
			{ input: false, args: [[false, true]] },
			{ input: [1, 2, 3], args: [[[1, 2, 3], [4, 5, 6]]] },
		]);
	});

	it('notEmpty', () => {
		runPassTests(handler.notEmpty.bind(handler), [
			{ input: 'hello' },
			{ input: [1, 2, 3] },
			{ input: 7, args: [[1, 2]] }
		]);

		runFailTests(handler.notEmpty.bind(handler), [
			{ input: null },
			{ input: undefined },
			{ input: [2], args: [[1, [2], 3]] }
		]);
	});


	it('notEquals', () => {
		runPassTests(handler.notEquals.bind(handler), [
			{ input: 1, args: [[2]] },
			{ input: [], args: [[1, 2, 3]] },
			{ input: false, args: [[true]] }
		]);

		runFailTests(handler.notEquals.bind(handler), [
			{ input: null, args: [null] },
			{ input: undefined, args: [undefined] },
			{ input: [1, 2, 3], args: [[1, 2, 3]] },
			{ input: { a: [1, 2, 3] }, args: [{ a: [1, 2, 3] }] }
		]);
	});


	it('notNull', () => {
		runPassTests(handler.notNull.bind(handler), [
			{ input: 1 },
			{ input: undefined },
		]);

		runFailTests(handler.notNull.bind(handler), [
			{ input: null }
		]);
	});

	it('notNullish', () => {
		runPassTests(handler.notNullish.bind(handler), [
			{ input: 1 },
			{ input: [] },
		]);

		runFailTests(handler.notNullish.bind(handler), [
			{ input: null },
			{ input: undefined }
		]);
	});


	it('null', () => {
		runPassTests(handler.null.bind(handler), [
			{ input: null },
		]);

		runFailTests(handler.null.bind(handler), [
			{ input: undefined }
		]);
	});

	it('nullish', () => {
		runPassTests(handler.nullish.bind(handler), [
			{ input: null },
			{ input: undefined }
		]);

		runFailTests(handler.nullish.bind(handler), [
			{ input: 1 },
			{ input: [] },
		]);
	});

	it('primitive', () => {
		runPassTests(handler.primitive.bind(handler), [
			{ input: 'string' },
			{ input: 1 },
			{ input: true },
			{ input: true, args: ['boolean'] },
			{ input: 1, args: ['number'] },
			{ input: 'hello', args: ['string'] },
		]);

		runFailTests(handler.primitive.bind(handler), [
			{ input: 1, args: ['string'] },
			{ input: 'hello', args: ['number'] },
			{ input: { a: 1 } },
		]);
	});

	it('truthy', () => {
		runPassTests(handler.truthy.bind(handler), [
			{ input: 'string' },
			{ input: 1 },
			{ input: true },
			{ input: [1] },
			{ input: { a: 1 } },
		]);

		runFailTests(handler.truthy.bind(handler), [
			{ input: 0 },
			{ input: false },
			{ input: '' },
			{ input: null },
			{ input: undefined },
		]);
	});

	it('undefined', () => {
		runPassTests(handler.undefined.bind(handler), [
			{ input: undefined },
		]);

		runFailTests(handler.undefined.bind(handler), [
			{ input: 0 },
		]);
	});

});




describe('AnyHandler mutators', () => {
	let handler: AnyHandler;

	beforeEach(() => {
		handler = new AnyHandler();
	});

	it('custom', () => {
		runPassTests(handler.custom.bind(handler), [
			{ input: [1, 2], args: [(x) => (x as number[]).concat([3, 4])], output: [1, 2, 3, 4] },
		]);
	});

});


