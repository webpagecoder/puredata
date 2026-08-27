'use strict';

import { AnyHandler } from '../../../lib/fields/any/AnyHandler.ts';
import { runFailTests, runPassTests } from '../../helpers/runCases.ts';

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
			{ input: 0, args: [[false, 0]] },
			{ input: { a: { b: 1 } }, args: [[{ a: { b: 1 } }]] },
		]);

		runFailTests(handler.anyOf.bind(handler), [
			{ input: 1, args: [[4, 3, 2]] },
			{ input: false, args: [[true, true]] },
			{ input: [3, 4, 5], args: [[[3, 4], [1, 2, 3]]] },
			{ input: { a: 1 }, args: [[{ a: 21 }]] },
			{ input: 0, args: [[]] },
			{ input: '1', args: [[1, true]] },
		]);
	});


	it('defined', () => {
		runPassTests(handler.defined.bind(handler), [
			{ input: 1 },
			{ input: null },
			{ input: false },
			{ input: '' }
		]);

		runFailTests(handler.defined.bind(handler), [
			{ input: undefined },
			{ input: void 0 },
			{ input: undefined as any }
		]);
	});

	it('empty', () => {
		runPassTests(handler.empty.bind(handler), [
			{ input: null },
			{ input: undefined },
			{ input: [2], args: [[1, [2], 3]] },
			{ input: '', args: [[null, undefined, '']] },
			{ input: [], args: [[null, undefined, []]] }
		]);

		runFailTests(handler.empty.bind(handler), [
			{ input: 1 },
			{ input: [] },
			{ input: 7, args: [[1, 2]] },
			{ input: false },
			{ input: '', args: [[null, undefined]] }
		]);
	});


	it('equals', () => {
		runPassTests(handler.equals.bind(handler), [
			{ input: null, args: [null] },
			{ input: undefined, args: [undefined] },
			{ input: [1, 2, 3], args: [[1, 2, 3]] },
			{ input: { a: [1, 2, 3] }, args: [{ a: [1, 2, 3] }] },
			{ input: 0, args: [-0] },
			{ input: { a: { b: 1 } }, args: [{ a: { b: 1 } }] }
		]);

		runFailTests(handler.equals.bind(handler), [
			{ input: 1, args: [[2]] },
			{ input: [], args: [[1, 2, 3]] },
			{ input: null, args: [undefined] },
			{ input: { a: 1 }, args: [{ a: 2 }] },
		]);
	});

	it('falsy', () => {
		runPassTests(handler.falsy.bind(handler), [
			{ input: null },
			{ input: undefined },
			{ input: 0 },
			{ input: '' },
			{ input: false },
			{ input: NaN },
			{ input: -0 },
		]);

		runFailTests(handler.falsy.bind(handler), [
			{ input: 1 },
			{ input: ' ' },
			{ input: [] },
			{ input: '0' },
			{ input: {} },
		]);
	});

	it('instanceOf', () => {
		class A { }

		runPassTests(handler.instanceOf.bind(handler), [
			{ input: new Date(), args: [Date] },
			{ input: [], args: [Array] },
			{ input: new A(), args: [A] },
			{ input: /x/, args: [RegExp] },
			{ input: new Map(), args: [Map] },
		]);

		runFailTests(handler.instanceOf.bind(handler), [
			{ input: new Date(), args: [Array] },
			{ input: [], args: [Date] },
			{ input: new A(), args: [Date] },
			{ input: {}, args: [Array] },
			{ input: /x/, args: [Date] },
		]);
	});

	it('noneOf', () => {
		class A { }

		runPassTests(handler.noneOf.bind(handler), [
			{ input: 1, args: [[2, 3, 4]] },
			{ input: false, args: [[true, null]] },
			{ input: [1, 2, 3], args: [[[4, 5, 6], [7, 8, 9]]] },
			{ input: null, args: [[undefined]] },
			{ input: 0, args: [[false]] },
		]);

		runFailTests(handler.noneOf.bind(handler), [
			{ input: 1, args: [[1, 2, 3]] },
			{ input: false, args: [[false, true]] },
			{ input: [1, 2, 3], args: [[[1, 2, 3], [4, 5, 6]]] },
			{ input: null, args: [[null]] },
			{ input: { a: 1 }, args: [[{ a: 1 }]] },
		]);
	});

	it('notEmpty', () => {
		runPassTests(handler.notEmpty.bind(handler), [
			{ input: 'hello' },
			{ input: [1, 2, 3] },
			{ input: 7, args: [[1, 2]] },
			{ input: 0 },
			{ input: '', args: [[null, undefined]] }
		]);

		runFailTests(handler.notEmpty.bind(handler), [
			{ input: null },
			{ input: undefined },
			{ input: [2], args: [[1, [2], 3]] },
			{ input: '', args: [[null, undefined, '']] },
			{ input: false, args: [[null, undefined, false]] }
		]);
	});


	it('notEquals', () => {
		runPassTests(handler.notEquals.bind(handler), [
			{ input: 1, args: [[2]] },
			{ input: [], args: [[1, 2, 3]] },
			{ input: false, args: [[true]] },
			{ input: null, args: [undefined] },
			{ input: { a: 1 }, args: [{ a: 2 }] }
		]);

		runFailTests(handler.notEquals.bind(handler), [
			{ input: null, args: [null] },
			{ input: undefined, args: [undefined] },
			{ input: [1, 2, 3], args: [[1, 2, 3]] },
			{ input: { a: [1, 2, 3] }, args: [{ a: [1, 2, 3] }] },
			{ input: 0, args: [-0] },
			{ input: false, args: [false] }
		]);
	});


	it('notNull', () => {
		runPassTests(handler.notNull.bind(handler), [
			{ input: 1 },
			{ input: undefined },
			{ input: 0 },
			{ input: '' },
		]);

		runFailTests(handler.notNull.bind(handler), [
			{ input: null },
			{ input: null as any },
			{ input: null }
		]);
	});

	it('notNullish', () => {
		runPassTests(handler.notNullish.bind(handler), [
			{ input: 1 },
			{ input: [] },
			{ input: false },
			{ input: '' },
		]);

		runFailTests(handler.notNullish.bind(handler), [
			{ input: null },
			{ input: undefined },
			{ input: null as any },
			{ input: void 0 }
		]);
	});


	it('null', () => {
		runPassTests(handler.null.bind(handler), [
			{ input: null },
			{ input: null as any },
			{ input: null },
		]);

		runFailTests(handler.null.bind(handler), [
			{ input: undefined },
			{ input: 0 },
			{ input: '' }
		]);
	});

	it('nullish', () => {
		runPassTests(handler.nullish.bind(handler), [
			{ input: null },
			{ input: undefined },
			{ input: null as any },
			{ input: void 0 }
		]);

		runFailTests(handler.nullish.bind(handler), [
			{ input: 1 },
			{ input: [] },
			{ input: false },
			{ input: '' },
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
			{ input: undefined, args: ['undefined'] },
			{ input: Symbol('x') },
		]);

		runFailTests(handler.primitive.bind(handler), [
			{ input: 1, args: ['string'] },
			{ input: 'hello', args: ['number'] },
			{ input: { a: 1 } },
			{ input: Symbol('x'), args: ['string'] },
			{ input: [] },
		]);
	});

	it('truthy', () => {
		runPassTests(handler.truthy.bind(handler), [
			{ input: 'string' },
			{ input: 1 },
			{ input: true },
			{ input: [1] },
			{ input: { a: 1 } },
			{ input: '0' },
			{ input: -1 },
		]);

		runFailTests(handler.truthy.bind(handler), [
			{ input: 0 },
			{ input: false },
			{ input: '' },
			{ input: null },
			{ input: undefined },
			{ input: NaN },
			{ input: -0 },
		]);
	});

	it('undefined', () => {
		runPassTests(handler.undefined.bind(handler), [
			{ input: undefined },
			{ input: void 0 },
			{ input: undefined as any },
		]);

		runFailTests(handler.undefined.bind(handler), [
			{ input: 0 },
			{ input: null },
			{ input: '' },
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
			{ input: 5, args: [x => Number(x) * 2], output: 10 },
			{ input: { a: 1 }, args: [x => x], output: { a: 1 } },
		]);
	});

});


