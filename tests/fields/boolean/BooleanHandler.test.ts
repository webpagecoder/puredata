'use strict';

import { BooleanHandler } from '../../../lib/fields/boolean/BooleanHandler.ts';
import { runFailTests, runPassTests } from '../../helpers/runCases.ts';

describe('BooleanHandler overrides', () => {
	let handler: BooleanHandler;

	beforeEach(() => {
		handler = new BooleanHandler();
	});

	it('falsy', () => {
		const ref = { ok: false };
		runPassTests(handler.falsy.bind(handler), [
			{ input: false, },
			{ input: 'no', args: [['no', 0]] },
			{ input: 0, args: [['no', 0]] },
			{ input: ref, args: [['no', 0, ref]] },
			{ input: { ok: false }, args: [['no', 0, ref]] },
			{ input: '', args: [['', 0, ref]] },
			{ input: null, args: [[null, 0, ref]] },
		]);

		runFailTests(handler.falsy.bind(handler), [
			{ input: true },
			{ input: '1', args: [['no', 0, ref]] },
			{ input: { ok: true }, args: [['no', 0, ref]] },
			{ input: 1, args: [['no', 0, ref]] },
			{ input: [], args: [['no', 0, ref]] },
		]);
	});

	it('truthy', () => {
		const ref = { ok: true };
		runPassTests(handler.truthy.bind(handler), [
			{ input: true, },
			{ input: 'yes', args: [['yes', 1]] },
			{ input: 1, args: [['yes', 1]] },
			{ input: ref, args: [['yes', 1, ref]] },
			{ input: { ok: true }, args: [['yes', 1, ref]] },
			{ input: 'y', args: [['yes', 1, 'y']] },
			{ input: 2, args: [['yes', 1, 2]] },
		]);

		runFailTests(handler.truthy.bind(handler), [
			{ input: false },
			{ input: '1', args: [['yes', 1, ref]] },
			{ input: { ok: false }, args: [['yes', 1, ref]] },
			{ input: 0, args: [['yes', 1, ref]] },
			{ input: null, args: [['yes', 1, ref]] },
		]);
	});

});




describe('BooleanHandler mutators', () => {
	let handler: BooleanHandler;

	beforeEach(() => {
		handler = new BooleanHandler();
	});

	it('invert', () => {
		runPassTests(handler.invert.bind(handler), [
			{ input: true, output: false },
			{ input: false, output: true },
			{ input: 'Y', args: [[['Y', 'N']]], output: 'N' },
			{ input: 'N', args: [[['Y', 'N']]], output: 'Y' },
			{ input: 1, args: [[[1, 0]]], output: 0 },
			{ input: 0, args: [[[1, 0]]], output: 1 },
			{ input: true, args: [[[true, 'NO']]], output: 'NO' },
			{ input: 'NO', args: [[[true, 'NO']]], output: true },
			{ input: false, args: [[[1, 0]]], output: true },
			{ input: 'F', args: [[['T', 'F']]], output: 'T' }
		]);

		runFailTests(handler.invert.bind(handler), [
			{ input: 'unknown', args: [[['Y', 'N']]] },
			{ input: 'y', args: [[['Y', 'N']]] },
			{ input: null, args: [[[1, 0]]] },
			{ input: {}, args: [[[1, 0]]] },
		]);
	});

});
