'use strict';


import { ObjectHandler } from '../../../lib/fields/object/ObjectHandler.ts';
import { Path } from '../../../lib/Path.ts';
import { runFailTests, runPassTests } from '../../helpers/runCases.ts';


describe('ObjectHandler validators', () => {
	let handler: ObjectHandler;
	let obj1: object;
	let obj2: object;

	beforeEach(() => {
		handler = new ObjectHandler();
		obj1 = {
			a_1: 2,
			b_1: {
				a_2: {
					a_3: 1,
				},
			},
			c_1: undefined,
			d_1: ['x', 'y'],
			e_1: {
				a_2: 'hello'
			}
		};
		obj2 = {
			a_1: 2,
			b_1: {
				a_2: {
					a_3: {
						a_4: true
					}
				},
			},
			c_1: {
				a_2: 'hello'
			}
		};
	});

	it('allOfButXOfPaths', () => {
		runPassTests(handler.allOfButXOfPaths.bind(handler), [
			{ input: obj1, args: [0, ['a_1', 'c_1', 'b_1/a_2/a_3']] },
			{ input: obj1, args: [1, ['a_1', 'c_1', 'x_1']] },
			{ input: obj1, args: [2, ['a_1', 'x_1', 'y_1', 'c_1']] },
			{ input: obj1, args: [3, ['x_1', 'y_1', 'z_1']] },
			{ input: obj1, args: [1, ['./a_1', '/x_1']] },
			{ input: obj1, args: [0, [new Path('/a_1'), new Path('./c_1')]] },
		]);

		runFailTests(handler.allOfButXOfPaths.bind(handler), [
			{ input: obj1, args: [0, ['a_1', 'x_1']] },
			{ input: obj1, args: [1, ['a_1', 'x_1', 'y_1']] },
			{ input: obj1, args: [1, ['a_1', 'c_1', 'b_1/a_2/a_3']] },
			{ input: obj1, args: [2, ['a_1', 'c_1']] },
			{ input: obj1, args: [0, ['./a_1', '/x_1']] },
		]);
	});


	it('allOfPaths', () => {
		runPassTests(handler.allOfPaths.bind(handler), [
			{ input: obj1, args: [['a_1', 'c_1']] },
			{ input: obj1, args: [[]] },
			{ input: obj1, args: [['b_1/a_2/a_3', 'e_1/a_2']] },
			{ input: obj1, args: [['/b_1/a_2/a_3', './a_1']] },
			{ input: obj1, args: [['d_1/0', 'd_1/1']] },
			{ input: obj1, args: [['b_1']] },
			{ input: obj1, args: [['c_1']] },

		]);

		runFailTests(handler.allOfPaths.bind(handler), [
			{ input: obj1, args: [['x_1']] },
			{ input: obj1, args: [['b_1/a_2/a_4']] },
			{ input: obj1, args: [['d_1/2']] },
			{ input: obj1, args: [['a_1/x_2']] },
			{ input: obj1, args: [['e_1/a_2/z_3']] },
			{ input: obj1, args: [['a_1', 'x_1']] },
			{ input: obj1, args: [['']] },
		]);
	});

	it('depth', () => {
		runPassTests(handler.depth.bind(handler), [
			{ input: obj1, args: [3] },
			{ input: obj2, args: [4] },
			{ input: {}, args: [1] },
		]);

		runFailTests(handler.depth.bind(handler), [
			{ input: obj1, args: [11] },
			{ input: obj1, args: [4] },
			{ input: {}, args: [0] },
		]);
	});

	it('empty', () => {
		runPassTests(handler.empty.bind(handler), [
			{ input: {} },
			{ input: Object.create(null) },
		]);

		runFailTests(handler.empty.bind(handler), [
			{ input: { a: 1 } },
			{ input: { a: undefined } },
			{ input: { nested: {} } },
		]);
	});

	it('exactlyPaths', () => {
		runPassTests(handler.exactlyPaths.bind(handler), [
			{ input: obj1, args: [['a_1', 'b_1/a_2/a_3', 'c_1', 'd_1', 'e_1/a_2']] },
			{ input: obj1, args: [['e_1/a_2', 'd_1', 'c_1', 'b_1/a_2/a_3', 'a_1']] },
			{ input: { a: 1, b: 2 }, args: [['a', 'b']] },
			{ input: { a: 1, b: 2 }, args: [['./a', './b']] },
			{ input: { a: 1, b: 2 }, args: [['/a', '/b']] },
			{ input: {}, args: [[]] },
		]);

		runFailTests(handler.exactlyPaths.bind(handler), [
			{ input: obj1, args: [['a_1', 'b_1/a_2/a_3', 'c_1', 'd_1']] },
			{ input: obj1, args: [['a_1', 'b_1/a_2/a_3', 'c_1', 'd_1', 'e_1/a_9']] },
			{ input: obj1, args: [['a_1', 'b_1/a_2/a_3', 'c_1', 'd_1', 'e_1/a_2', 'b_1/a_2']] },
		]);
	});

	it('keyCount', () => {
		runPassTests(handler.keyCount.bind(handler), [
			{ input: obj1, args: [5] },
			{ input: obj2, args: [3] },
			{ input: {}, args: [0] },
			{ input: { only: undefined }, args: [1] },
			{ input: { nested: { a: 1 }, arr: ['x'] }, args: [2] },
		]);

		runFailTests(handler.keyCount.bind(handler), [
			{ input: obj1, args: [4] },
			{ input: obj2, args: [4] },
			{ input: {}, args: [1] },
			{ input: { a: 1, b: 2 }, args: [1] },
		]);
	});

	it('keyCountRecursive', () => {
		runPassTests(handler.keyCountRecursive.bind(handler), [
			{ input: obj1, args: [8] },
			{ input: obj2, args: [7] },
			{ input: {}, args: [0] },
			{ input: Object.create(null), args: [0] },
		]);

		runFailTests(handler.keyCountRecursive.bind(handler), [
			{ input: obj1, args: [10] },
			{ input: obj2, args: [6] },
			{ input: obj1, args: [9] },
			{ input: obj2, args: [6] },
			{ input: { arr: ['x', 'y'] }, args: [3] },
			{ input: { arr: ['x', 'y'] }, args: [2] },
			{ input: { a: { b: { c: 1 } } }, args: [4] },
		]);
	});

	it('maxDepth', () => {
		runPassTests(handler.maxDepth.bind(handler), [
			{ input: { a: 1 }, args: [1] },
			{ input: { a: { b: 1 } }, args: [2] },
			{ input: { a: { b: 1 } }, args: [3] },
			{ input: obj1, args: [3] },
			{ input: obj1, args: [4] },
			{ input: obj2, args: [4] },
			{ input: obj2, args: [5] },
			{ input: {}, args: [10] },
		]);

		runFailTests(handler.maxDepth.bind(handler), [
			{ input: {}, args: [-1] },
			{ input: {}, args: [0] },
			{ input: { a: { b: 1 } }, args: [1] },
			{ input: obj1, args: [0] },
			{ input: obj1, args: [2] },
			{ input: obj2, args: [3] },
			{ input: { a: { b: { c: 1 } } }, args: [1] },
		]);
	});

	it('maxKeyCount', () => {
		runPassTests(handler.maxKeyCount.bind(handler), [
			{ input: {}, args: [0] },
			{ input: { a: 1 }, args: [1] },
			{ input: { a: 1, b: 2 }, args: [2] },
			{ input: obj1, args: [5] },
			{ input: obj1, args: [6] },
			{ input: obj2, args: [3] },
			{ input: obj2, args: [4] },
		]);

		runFailTests(handler.maxKeyCount.bind(handler), [
			{ input: { a: 1 }, args: [0] },
			{ input: { a: 1, b: 2 }, args: [1] },
			{ input: obj1, args: [4] },
			{ input: obj2, args: [0] },
			{ input: obj2, args: [2] },
			{ input: obj2, args: [2] },
		]);
	});

	it('maxKeyCountRecursive', () => {
		runPassTests(handler.maxKeyCountRecursive.bind(handler), [
			{ input: {}, args: [0] },
			{ input: { a: 1 }, args: [1] },
			{ input: obj1, args: [8] },
			{ input: obj1, args: [9] },
			{ input: obj2, args: [7] },
			{ input: obj2, args: [8] },
			{ input: { a: { b: 1 } }, args: [2] },
			{ input: { a: { b: { c: 1 } } }, args: [3] },
			{ input: { arr: ['x', 'y'] }, args: [1] },
		]);

		runFailTests(handler.maxKeyCountRecursive.bind(handler), [
			{ input: {}, args: [-1] },
			{ input: { a: 1 }, args: [0] },
			{ input: obj1, args: [7] },
			{ input: obj1, args: [3] },
			{ input: obj2, args: [6] },
			{ input: obj2, args: [5] },
			{ input: { a: { b: 1 } }, args: [0] },
			{ input: { arr: ['x', 'y'] }, args: [0] },
		]);
	});

	it('minDepth', () => {
		runPassTests(handler.minDepth.bind(handler), [
			{ input: { a: { b: 1 } }, args: [-1] },
			{ input: { a: { b: 1 } }, args: [0] },
			{ input: { a: { b: 1 } }, args: [1] },
			{ input: { a: { b: 1 } }, args: [2] },
			{ input: obj1, args: [2] },
			{ input: obj2, args: [3] },
			{ input: obj1, args: [3] },
			{ input: obj2, args: [4] },
			{ input: { a: { b: { c: { d: 1 } } } }, args: [3] },
		]);

		runFailTests(handler.minDepth.bind(handler), [
			{ input: {}, args: [2] },
			{ input: { a: 1 }, args: [2] },
			{ input: {}, args: [3] },
			{ input: { a: { b: 1 } }, args: [3] },
			{ input: obj1, args: [9] },
			{ input: obj2, args: [8] },
		]);
	});

	it('minKeyCount', () => {
		runPassTests(handler.minKeyCount.bind(handler), [
			{ input: {}, args: [0] },
			{ input: { a: 1 }, args: [0] },
			{ input: { a: 1 }, args: [1] },
			{ input: obj1, args: [5] },
			{ input: obj1, args: [4] },
			{ input: obj2, args: [2] },
			{ input: obj2, args: [3] },
			{ input: { a: 1, b: undefined }, args: [2] },
		]);

		runFailTests(handler.minKeyCount.bind(handler), [
			{ input: {}, args: [1] },
			{ input: { a: 1 }, args: [2] },
			{ input: obj1, args: [6] },
			{ input: obj2, args: [4] },
		]);
	});

	it('minKeyCountRecursive', () => {
		runPassTests(handler.minKeyCountRecursive.bind(handler), [
			{ input: {}, args: [0] },
			{ input: { a: 1 }, args: [-1] },
			{ input: { a: 1 }, args: [0] },
			{ input: { a: { b: 1 } }, args: [1] },
			{ input: obj1, args: [7] },
			{ input: obj2, args: [6] },
			{ input: obj1, args: [8] },
			{ input: obj2, args: [7] },
			{ input: { a: { b: { c: 1 } } }, args: [2] },
		]);

		runFailTests(handler.minKeyCountRecursive.bind(handler), [
			{ input: { a: 1 }, args: [2] },
			{ input: { a: { b: 1 } }, args: [3] },
			{ input: obj1, args: [9] },
			{ input: obj2, args: [8] },
			{ input: { a: { b: { c: 1 } } }, args: [4] },
		]);
	});

	it('noneOfPaths', () => {
		runPassTests(handler.noneOfPaths.bind(handler), [
			{ input: obj1, args: [['x_1', 'y_1']] },
			{ input: obj1, args: [[]] },
			{ input: obj2, args: [['z_1', 'b_1/a_2/a_3/a_5']] },
			{ input: obj1, args: [['./x_1', '/y_1']] },
			{ input: obj1, args: [[new Path('/x_1'), new Path('./y_1')]] },
		]);

		runFailTests(handler.noneOfPaths.bind(handler), [
			{ input: obj1, args: [['a_1']] },
			{ input: obj1, args: [['x_1', 'd_1']] },
			{ input: obj2, args: [['b_1/a_2/a_3/a_4']] },
			{ input: obj1, args: [['./a_1']] },
			{ input: obj2, args: [[new Path('/b_1/a_2/a_3/a_4')]] },
		]);
	});

	it('notEmpty', () => {
		runPassTests(handler.notEmpty.bind(handler), [
			{ input: obj1 },
			{ input: { a: undefined } },
			{ input: { nested: {} } },
		]);

		runFailTests(handler.notEmpty.bind(handler), [
			{ input: {} },
			{ input: Object.create(null) },
		]);
	});

	it('onlyPaths', () => {
		runPassTests(handler.onlyPaths.bind(handler), [
			{ input: obj1, args: [['a_1', 'b_1/a_2/a_3', 'c_1', 'd_1', 'e_1/a_2']] },
			{ input: obj1, args: [['a_1', 'b_1/a_2/a_3', 'c_1', 'd_1', 'e_1/a_2', 'x_1']] },
			{ input: obj1, args: [['/a_1', './b_1/a_2/a_3', '/c_1', './d_1', '/e_1/a_2']] },
			{ input: {}, args: [[]] },
		]);

		runFailTests(handler.onlyPaths.bind(handler), [
			{ input: obj1, args: [['a_1', 'b_1/a_2/a_3', 'c_1', 'd_1']] },
			{ input: obj2, args: [['a_1', 'c_1/a_2']] },
			{ input: { a: 1 }, args: [[]] },
		]);
	});

	it('pathsOtherThan', () => {
		runPassTests(handler.pathsOtherThan.bind(handler), [
			{ input: obj1, args: [['a_1', 'b_1/a_2/a_3']] },
			{ input: obj2, args: [['a_1']] },
			{ input: obj1, args: [['/a_1', './b_1/a_2/a_3']] },
		]);

		runFailTests(handler.pathsOtherThan.bind(handler), [
			{ input: obj1, args: [['a_1', 'b_1/a_2/a_3', 'c_1', 'd_1', 'e_1/a_2']] },
			{ input: {}, args: [[]] },
			{ input: {}, args: [['x']] },
			{ input: { a: 1 }, args: [['a']] },
		]);
	});

	it('pickRandom', () => {
		runPassTests(handler.pickRandom.bind(handler), [
			{
				input: { a: 1, b: 2, c: 3 },
				args: [2],
				output: (value: unknown): boolean => {
					const obj = value as Record<string, unknown>;
					const keys = Object.keys(obj);
					return keys.length === 2 && keys.every((key) => ['a', 'b', 'c'].includes(key));
				}
			},
			{
				input: { a: 1, b: 2 },
				args: [5],
				output: { a: 1, b: 2 },
			},
			{
				input: {},
				args: [1],
				output: {},
			},
		]);
	});

	it('plain', () => {
		runPassTests(handler.plain.bind(handler), [
			{ input: {} },
			{ input: obj1 },
			{ input: Object.create(null) },
		]);

		runFailTests(handler.plain.bind(handler), [
			{ input: [] },
			{ input: new Date() },
		]);
	});

	it('property', () => {
		runPassTests(handler.property.bind(handler), [
			{ input: obj1, args: ['a_1'] },
			{ input: { a: null }, args: ['a'] },
			{ input: { a: 0 }, args: ['a'] },
		]);

		runFailTests(handler.property.bind(handler), [
			{ input: obj1, args: ['c_1'] },
			{ input: { a: undefined }, args: ['a'] },
			{ input: {} as unknown as object, args: ['missing'] },
		]);
	});

	it('removeEmpties', () => {
		runPassTests(handler.removeEmpties.bind(handler), [
			{
				input: { a: 1, b: undefined, c: null, d: 0, e: '' },
				output: { a: 1, d: 0, e: '' },
			},
			{
				input: { a: false, b: null },
				args: [[null]],
				output: { a: false },
			},
			{
				input: { a: null, b: undefined },
				args: [[]],
				output: { a: null, b: undefined },
			},
		]);
	});

	it('removeEmptiesRecursive', () => {
		runPassTests(handler.removeEmptiesRecursive.bind(handler), [
			{
				input: { a: 1, b: undefined, c: null },
				output: { a: 1 },
			},
			{
				input: { nested: { a: undefined, b: 1 }, x: null },
				output: (value: unknown): boolean => {
					const out = value as Record<string, unknown>;
					return out.x === undefined && Object.prototype.hasOwnProperty.call(out, 'nested');
				}
			},
			{
				input: { nested: { keep: undefined, drop: null }, keep: undefined },
				args: [[null]],
				output: (value: unknown): boolean => {
					const out = value as Record<string, unknown>;
					const nested = out.nested as Record<string, unknown>;
					return out.keep === undefined
						&& !!nested
						&& typeof nested === 'object'
						&& Object.prototype.hasOwnProperty.call(nested, '_value');
				}
			},
		]);
	});

	it('removeKeys', () => {
		runPassTests(handler.removeKeys.bind(handler), [
			{ input: obj1, args: [['a_1', 'c_1']], output: { a_1: 2, c_1: undefined } },
			{ input: { a: 1, b: 2 }, args: [[]], output: {} },
			{ input: { a: 1 }, args: [['a', 'missing']], output: { a: 1, missing: undefined } },
		]);
	});

	it('removePaths', () => {
		runPassTests(handler.removePaths.bind(handler), [
			{
				input: { a: 1, b: { c: 2 }, d: [1, 2] },
				args: [['a', 'b/c']],
				output: { b: {}, d: [1, 2] },
			},
			{
				input: { a: 1 },
				args: [['missing']],
				output: { a: 1 },
			},
			{
				input: { a: 1, b: { c: 2 }, d: [1, 2] },
				args: [['/a', './b/c', new Path('/d/1')]],
				output: { b: {}, d: [1] },
			},
		]);
	});

	it('removeValues', () => {
		runPassTests(handler.removeValues.bind(handler), [
			{
				input: { a: 1, b: undefined, c: null, d: false },
				output: { a: 1, d: false },
			},
			{
				input: { a: 0, b: 1, c: 2 },
				args: [[0, 2]],
				output: { b: 1 },
			},
			{
				input: { a: 0, b: null },
				args: [[]],
				output: { a: 0, b: null },
			},
		]);
	});

	it('removeValuesRecursive', () => {
		runPassTests(handler.removeValuesRecursive.bind(handler), [
			{
				input: { a: 1, b: undefined, c: null },
				output: { a: 1 },
			},
			{
				input: { nested: { keep: 1, drop: null }, drop: undefined },
				output: (value: unknown): boolean => {
					const out = value as Record<string, unknown>;
					return out.drop === undefined && Object.prototype.hasOwnProperty.call(out, 'nested');
				}
			},
		]);
	});

	it('renameKeys', () => {
		runPassTests(handler.renameKeys.bind(handler), [
			{
				input: { first_name: 'Ada', last_name: 'Lovelace' },
				args: [/_name$/, '', true, true],
				output: { first: 'Ada', last: 'Lovelace' },
			},
			{
				input: { a: 1, b: 2 },
				args: ['a', 'b', false, false],
				output: { a: 1, b: 2 },
			},
			{
				input: { a: 1, b: 2 },
				args: [/[ab]/, 'x', true, false],
				output: { b: 2, x: 1 },
			},
			{
				input: { a: 1, b: 2 },
				args: [/[ab]/, 'x', true, true],
				output: { x: 2 },
			},
		]);
	});

	it('setValues', () => {
		runPassTests(handler.setValues.bind(handler), [
			{
				input: { a: 1, nested: { b: 2 } },
				args: [[['a', 9], ['nested/b', 5]]],
				output: { a: 9, nested: { b: 5 } },
			},
			{
				input: { profile: { name: 'Ada' } },
				args: [[
					['/profile/name', 'Grace'],
					['./profile/meta/active', true],
					[new Path('profile/meta/score'), 98],
				]],
				output: { profile: { name: 'Grace', meta: { active: true, score: 98 } } },
			},
			{
				input: { flags: [0, 1], tree: { left: { value: 1 } } },
				args: [[
					['/flags/1', 9],
					['./tree/left/value', 2],
					['tree/right/value', 3],
				]],
				output: { flags: [0, 9], tree: { left: { value: 2 }, right: { value: 3 } } },
			},
			{
				input: { a: 1 },
				args: [[['new/path', 3]], true, true],
				output: { a: 1, new: { path: 3 } },
			},
			{
				input: { a: 1 },
				args: [[[new Path('a'), 7]], true, false],
				output: { a: 7 },
			},
			{
				input: { a: 1 },
				args: [[['/a', 9]], false, false],
				output: { a: 1 },
			},
			{
				input: { a: 1 },
				args: [[['./new/path', 3]], true, false],
				output: { a: 1 },
			},
			{
				input: { a: { b: 1 }, c: 4 },
				args: [[
					['a/b', 99],
					['a/d/e', 77],
					['c', 10],
				], false, true],
				output: { a: { b: 1, d: { e: 77 } }, c: 4 },
			},
			{
				input: { root: { child: { leaf: 'old' } } },
				args: [[
					[new Path('/root/child/leaf'), 'new'],
					['/root/child/extra/deeper', 5],
				]],
				output: { root: { child: { leaf: 'new', extra: { deeper: 5 } } } },
			},
			{
				input: { x: { y: 1 } },
				args: [[['x/y/z', 2], ['x/new/deep', 3]], false, false],
				output: { x: { y: 1 } },
			},
		]);
	});

	it('someOfPaths', () => {
		runPassTests(handler.someOfPaths.bind(handler), [
			{ input: obj1, args: [['x_1', 'a_1']] },
			{ input: obj2, args: [['b_1/a_2/a_3/a_4', 'nope']] },
			{ input: obj1, args: [['c_1']] },
			{ input: obj1, args: [['/x_1', './a_1']] },
			{ input: obj2, args: [[new Path('/none'), new Path('./a_1')]] },
		]);

		runFailTests(handler.someOfPaths.bind(handler), [
			{ input: obj1, args: [['x_1', 'y_1']] },
			{ input: obj2, args: [[]] },
			{ input: { a: 1 }, args: [['a/b']] },
			{ input: obj1, args: [['/x_1', './y_1']] },
		]);
	});

	it('xOfPaths', () => {
		runPassTests(handler.xOfPaths.bind(handler), [
			{ input: obj1, args: [2, ['a_1', 'x_1', 'c_1']] },
			{ input: obj2, args: [1, ['missing', 'a_1']] },
			{ input: {}, args: [0, ['a']] },
			{ input: obj1, args: [2, [new Path('/a_1'), new Path('./x_1'), '/c_1']] },
		]);

		runFailTests(handler.xOfPaths.bind(handler), [
			{ input: obj1, args: [1, ['a_1', 'c_1']] },
			{ input: obj2, args: [2, ['a_1', 'missing']] },
			{ input: obj1, args: [0, ['c_1']] },
			{ input: obj1, args: [1, ['/a_1', './c_1']] },
		]);
	});




});




