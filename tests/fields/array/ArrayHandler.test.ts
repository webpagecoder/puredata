'use strict';

import { Path } from '../../../lib/Path.ts';
import { ArrayHandler } from '../../../lib/fields/array/ArrayHandler.ts';
import { NumberChain } from '../../../lib/fields/number/NumberChain.ts';
import { runCases, runFailTests, runPassTests, type ValidationResult } from '../../helpers/runCases.ts';

describe('ArrayHandler validators', () => {
	let handler: ArrayHandler;
	let numChain: NumberChain;

	beforeEach(() => {
		handler = new ArrayHandler();
		numChain = new NumberChain();
	});

	// 	it('allOf', () => {
	// 		runCases(handler.allOf.bind(handler), [
	// 			{ input: [1, 2, 3], options: [2, 1], pass: true, value: [1, 2, 3] },
	// 			{ input: [1, 2, 3], options: [4], pass: false, errorKey: 'array/allOf' },
	// 			{ input: [1], options: [], pass: true, value: [1] }
	// 		]);
	// 	});

	// 	it('dimensions', () => {
	// 		runCases(
	// 			(input: unknown[], options?: { dimensions: number[] }): ValidationResult =>
	// 				handler.dimensions(input, options?.dimensions ?? []),
	// 			[
	// 				{ input: [[1, 2], [3, 4]], options: { dimensions: [2, 2] }, pass: true, value: [[1, 2], [3, 4]] },
	// 				{ input: [[1], [2]], options: { dimensions: [2, 2] }, pass: false, errorKey: 'array/dimensions' },
	// 				{ input: [1, 2], options: { dimensions: [2, 2] }, pass: false, errorKey: 'array/dimensions' }
	// 			]
	// 		);
	// 	});

	// 	it('empty', () => {
	// 		runCases(handler.empty.bind(handler), [
	// 			{ input: [], pass: true, value: [] },
	// 			{ input: [1], pass: false, errorKey: 'array/empty' }
	// 		]);
	// 	});

	// 	it('notEmpty', () => {
	// 		runCases(handler.notEmpty.bind(handler), [
	// 			{ input: [1], pass: true, value: [1] },
	// 			{ input: [], pass: false, errorKey: 'array/notEmpty' }
	// 		]);
	// 	});

	// 	it('exactly', () => {
	// 		runCases(handler.exactly.bind(handler), [
	// 			{ input: [1, 2, 2], options: [2, 1, 2], pass: true, value: [1, 2, 2] },
	// 			{ input: [1, 2], options: [1, 2, 3], pass: false, errorKey: 'array/exactly' },
	// 			{ input: [1, 2, 2], options: [1, 2, 3], pass: false, errorKey: 'array/exactly' }
	// 		]);
	// 	});

	// 	it('length', () => {
	// 		runCases(
	// 			(input: unknown[], options?: { requiredLength: number }): ValidationResult =>
	// 				handler.length(input, options?.requiredLength ?? 0),
	// 			[
	// 				{ input: [1, 2], options: { requiredLength: 2 }, pass: true, value: [1, 2] },
	// 				{ input: [1, 2], options: { requiredLength: 3 }, pass: false, errorKey: 'array/length' }
	// 			]
	// 		);
	// 	});

	// 	it('lengthBetween', () => {
	// 		runCases(
	// 			(input: unknown[], options?: { min: number; max: number }): ValidationResult =>
	// 				handler.lengthBetween(input, options?.min ?? 0, options?.max ?? 0),
	// 			[
	// 				{ input: [1, 2], options: { min: 2, max: 3 }, pass: true, value: [1, 2] },
	// 				{ input: [1], options: { min: 2, max: 3 }, pass: false, errorKey: 'array/lengthBetween' },
	// 				{ input: [1, 2, 3, 4], options: { min: 2, max: 3 }, pass: false, errorKey: 'array/lengthBetween' }
	// 			]
	// 		);
	// 	});

	// 	it('maxLength', () => {
	// 		runCases(
	// 			(input: unknown[], options?: { max: number }): ValidationResult =>
	// 				handler.maxLength(input, options?.max ?? 0),
	// 			[
	// 				{ input: [1, 2], options: { max: 2 }, pass: true, value: [1, 2] },
	// 				{ input: [1, 2, 3], options: { max: 2 }, pass: false, errorKey: 'array/maxLength' }
	// 			]
	// 		);
	// 	});

	// 	it('minLength', () => {
	// 		runCases(
	// 			(input: unknown[], options?: { min: number }): ValidationResult =>
	// 				handler.minLength(input, options?.min ?? 0),
	// 			[
	// 				{ input: [1, 2], options: { min: 2 }, pass: true, value: [1, 2] },
	// 				{ input: [1], options: { min: 2 }, pass: false, errorKey: 'array/minLength' }
	// 			]
	// 		);
	// 	});

	// 	it('noneOf', () => {
	// 		runCases(handler.noneOf.bind(handler), [
	// 			{ input: [1, 2, 3], options: [4], pass: true, value: [1, 2, 3] },
	// 			{ input: [1, { a: 1 }], options: [{ a: 1 }], pass: false, errorKey: 'array/noneOf' }
	// 		]);
	// 	});

	// 	it('only', () => {
	// 		runCases(handler.only.bind(handler), [
	// 			{ input: [1, 2, 1], options: [1, 2], pass: true, value: [1, 2, 1] },
	// 			{ input: [1, 3], options: [1, 2], pass: false, errorKey: 'array/only' }
	// 		]);
	// 	});

	// 	it('otherThan', () => {
	// 		runCases(handler.otherThan.bind(handler), [
	// 			{ input: [1, 2], options: [1], pass: false, errorKey: 'array/otherThan' },
	// 			{ input: [1, 2], options: [1, 2], pass: false, errorKey: 'array/otherThan' },
	// 			{ input: [1, 2], options: [1, 3], pass: true, value: [1, 2] },
	// 			{ input: [1, 2], options: [], pass: true, value: [1, 2] }
	// 		]);
	// 	});

	// 	it('someOf', () => {
	// 		runCases(handler.someOf.bind(handler), [
	// 			{ input: [1, 2], options: [3, 2], pass: true, value: [1, 2] },
	// 			{ input: [1, 2], options: [3, 4], pass: false, errorKey: 'array/someOf' },
	// 			{ input: [1, 2], options: [], pass: true, value: [1, 2] }
	// 		]);
	// 	});

	// 	it('sorted', () => {
	// 		runCases(
	// 			(input: unknown[], options?: { comparator: Path | ((a: unknown, b: unknown) => number) | null }): ValidationResult =>
	// 				handler.sorted(input, options?.comparator ?? null),
	// 			[
	// 				{ input: [1, 2, 3], pass: true, value: [1, 2, 3] },
	// 				{ input: [2, 1, 3], pass: false, errorKey: 'array/sorted' },
	// 				{
	// 					input: [{ id: 1 }, { id: 2 }],
	// 					options: { comparator: new Path('id') },
	// 					pass: true,
	// 					value: [{ id: 1 }, { id: 2 }]
	// 				},
	// 				{
	// 					input: ['aa', 'b', 'ccc'],
	// 					options: { comparator: (a: unknown, b: unknown): number => String(a).length - String(b).length },
	// 					pass: false,
	// 					errorKey: 'array/sorted'
	// 				}
	// 			]
	// 		);
	// 	});

	// 	it('tuple', () => {
	// 		runCases(handler.tuple.bind(handler), [
	// 			{ input: [1, 'a', true], options: [1, 'a', true], pass: true, value: [1, 'a', true] },
	// 			{ input: [1, 'a'], options: [1, 'a', true], pass: false, errorKey: 'array/tuple' },
	// 			{ input: [1, 'b', true], options: [1, 'a', true], pass: false, errorKey: 'array/tuple' }
	// 		]);
	// 	});

	// 	it('type', () => {
	// 		runCases(handler.type.bind(handler), [
	// 			{ input: ['a', 'b'], options: ['a', 'b', 'c'], pass: true, value: ['a', 'b'] },
	// 			{ input: ['a', 'd'], options: ['a', 'b', 'c'], pass: false, errorKey: 'array/only' }
	// 		]);

	// 		runCases(handler.type.bind(handler), [
	// 			{ input: [3, 5, 7], options: [numChain.between(1, 10)], pass: true },
	// 		]);

	// 		runCases(handler.type.bind(handler), [
	// 			{ input: [3, 5, 7], options: [numChain.between(1, 6)], pass: false, errorKey: 'array/only' },
	// 		]);


	// 		// runCases(handler.type.bind(handler), [
	// 		// 	{ input: [3,5,7], options: [numChain.between(1, 2)], pass: false },
	// 		// ]);
	// 	});

	// 	it('unique', () => {
	// 		runCases(
	// 			(input: unknown[], options?: { comparator: Path | ((a: unknown, b: unknown) => boolean) | null }): ValidationResult =>
	// 				handler.unique(input, options?.comparator ?? null),
	// 			[
	// 				{ input: [1, 2, 3], pass: true, value: [1, 2, 3] },
	// 				{ input: [1, 2, 1], pass: false, errorKey: 'array/unique' },
	// 				{
	// 					input: [{ id: 1 }, { id: 2 }, { id: 1 }],
	// 					options: { comparator: new Path('id') },
	// 					pass: false,
	// 					errorKey: 'array/unique'
	// 				},
	// 				{
	// 					input: ['A', 'a'],
	// 					options: { comparator: (a: unknown, b: unknown): boolean => String(a).toLowerCase() !== String(b).toLowerCase() },
	// 					pass: false,
	// 					errorKey: 'array/unique'
	// 				}
	// 			]
	// 		);
	// 	});
	// });

	// describe('ArrayHandler mutators', () => {
	// 	let handler: ArrayHandler;

	// 	beforeEach(() => {
	// 		handler = new ArrayHandler();
	// 	});

	// 	it('add', () => {
	// 		runCases(handler.add.bind(handler), [
	// 			{ input: [1, 2], options: [3, 4], pass: true, value: [1, 2, 3, 4] },
	// 			{ input: [1, 2], options: [], pass: true, value: [1, 2] }
	// 		]);
	// 	});

	// 	it('chunk', () => {
	// 		runCases(
	// 			(input: unknown[], options?: { length: number }): ValidationResult =>
	// 				handler.chunk(input, options?.length ?? 1),
	// 			[
	// 				{ input: [1, 2, 3, 4, 5], options: { length: 2 }, pass: true, value: [[1, 2], [3, 4], [5]] },
	// 				{ input: [1, 2], options: { length: 5 }, pass: true, value: [[1, 2]] },
	// 				{ input: [], options: { length: 5 }, pass: true, value: [] }
	// 			]
	// 		);
	// 	});

	// 	it('filter', () => {
	// 		runCases(
	// 			(input: unknown[], options?: { filter: (value: unknown, index: number, array: unknown[]) => boolean }): ValidationResult =>
	// 				handler.filter(input, options?.filter ?? (() => true)),
	// 			[
	// 				{
	// 					input: [10, 11, 12, 13],
	// 					options: { filter: (_value: unknown, index: number): boolean => index % 2 === 0 },
	// 					pass: true,
	// 					value: [10, 12]
	// 				}
	// 			]
	// 		);
	// 	});

	// 	it('map', () => {
	// 		runCases(
	// 			(input: unknown[], options?: { map: (value: unknown, index: number, array: unknown[]) => unknown }): ValidationResult =>
	// 				handler.map(input, options?.map ?? ((value: unknown): unknown => value)),
	// 			[
	// 				{
	// 					input: [1, 2, 3],
	// 					options: { map: (value: unknown): unknown => Number(value) * 10 },
	// 					pass: true,
	// 					value: [10, 20, 30]
	// 				}
	// 			]
	// 		);
	// 	});

	// 	it('flatten', () => {
	// 		runCases(handler.flatten.bind(handler), [
	// 			{ input: [1, [2, [3]], 4], pass: true, value: [1, 2, 3, 4] },
	// 			{ input: [], pass: true, value: [] }
	// 		]);
	// 	});

	// 	it('group', () => {
	// 		runCases(
	// 			(input: unknown[], options?: { path: Path | null }): ValidationResult =>
	// 				handler.group(input, options?.path ?? null),
	// 			[
	// 				{ input: ['a', 'b', 'a'], pass: true, value: [['a', 'a'], ['b']] },
	// 				{
	// 					input: [{ k: 'x', v: 1 }, { k: 'y', v: 2 }, { k: 'x', v: 3 }],
	// 					options: { path: new Path('k') },
	// 					pass: true,
	// 					value: [
	// 						[{ k: 'x', v: 1 }, { k: 'x', v: 3 }],
	// 						[{ k: 'y', v: 2 }]
	// 					]
	// 				}
	// 			]
	// 		);
	// 	});

	// 	it('keep', () => {
	// 		runCases(handler.keep.bind(handler), [
	// 			{ input: [1, 2, 3, 2], options: [2, 4], pass: true, value: [2, 2] },
	// 			{ input: [1, 2], options: [], pass: true, value: [] }
	// 		]);
	// 	});

	// 	it('remove', () => {
	// 		runCases(handler.remove.bind(handler), [
	// 			{ input: [1, 2, 3, 2], options: [2], pass: true, value: [1, 3] },
	// 			{ input: [1, 2], options: [], pass: true, value: [1, 2] }
	// 		]);
	// 	});

	it('padEnd', () => {
		runPassTests(
			handler.padEnd.bind(handler),
			[
				{ input: [1], output: [1, 0, 0], args: [3, 0] },
				{ input: [1], output: [1, null, null], args: [3] },
				{ input: [1, 2, 3], args: [3, 0] }
			]
		);
	});

	it('pickRandom', () => {
		runPassTests(
			handler.pickRandom.bind(handler),
			[
				{ input: ['only'], output: ['only'], args: [1] },
				{
					input: [1, 2, 3],
					output: val => val.indexOf(1) !== -1 && val.indexOf(2) !== -1 && val.indexOf(3) !== -1,
					args: [3]
				},
				{
					input: [1, 2, 3],
					output: val => val.indexOf(1) !== -1 || val.indexOf(2) !== -1 || val.indexOf(3) !== -1,
					args: [1]
				},
			]
		);
	});

	// it('removeDuplicates variants', () => {
	// 	runCases(
	// 		(input: unknown[], options?: { comparator: Path | ((a: unknown, b: unknown) => boolean) | null }): ValidationResult =>
	// 			handler.removeDuplicates(input, options?.comparator ?? null),
	// 		[
	// 			{ input: [1, 2, 1, 3], pass: true, value: [1, 2, 3] },
	// 			{
	// 				input: [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }],
	// 				options: { comparator: new Path('id') },
	// 				pass: true,
	// 				value: [{ id: 1 }, { id: 2 }, { id: 3 }]
	// 			},
	// 			{
	// 				input: ['A', 'a', 'B'],
	// 				options: { comparator: (a: unknown, b: unknown): boolean => String(a).toLowerCase() !== String(b).toLowerCase() },
	// 				pass: true,
	// 				value: ['A', 'B']
	// 			}
	// 		]
	// 	);
	// });

	// it('removeEmpties', () => {
	// 	runCases(handler.removeEmpties.bind(handler), [
	// 		{ input: [null, undefined, '', 0, false], pass: true, value: [0, false] },
	// 		{ input: [0, '', false], options: [0, ''], pass: true, value: [false] }
	// 	]);
	// });

	// it('removeUndefined', () => {
	// 	runCases(handler.removeUndefined.bind(handler), [
	// 		{ input: [1, undefined, 2], pass: true, value: [1, 2] },
	// 		{ input: [undefined, undefined], pass: true, value: [] }
	// 	]);
	// });

	// it('reverse', () => {
	// 	runCases(handler.reverse.bind(handler), [
	// 		{ input: [1, 2, 3], pass: true, value: [3, 2, 1] },
	// 		{ input: [], pass: true, value: [] }
	// 	]);
	// });

	// it('shuffle', () => {
	// 	runCases(handler.shuffle.bind(handler), [
	// 		{ input: [], pass: true, value: [] },
	// 		{ input: ['only'], pass: true, value: ['only'] }
	// 	]);
	// });

	// it('slice', () => {
	// 	runCases(
	// 		(input: unknown[], options?: { startIndex: number; endIndex?: number }): ValidationResult =>
	// 			handler.slice(input, options?.startIndex ?? 0, options?.endIndex),
	// 		[
	// 			{ input: [1, 2, 3, 4], options: { startIndex: 1, endIndex: 3 }, pass: true, value: [2, 3] },
	// 			{ input: [1, 2, 3, 4], options: { startIndex: 2 }, pass: true, value: [3, 4] }
	// 		]
	// 	);
	// });

	// it('sliceFirst', () => {
	// 	runCases(
	// 		(input: unknown[], options?: { count?: number }): ValidationResult =>
	// 			handler.sliceFirst(input, options?.count),
	// 		[
	// 			{ input: [1, 2, 3], pass: true, value: [1] },
	// 			{ input: [1, 2, 3], options: { count: 2 }, pass: true, value: [1, 2] }
	// 		]
	// 	);
	// });

	// it('sliceLast', () => {
	// 	runCases(
	// 		(input: unknown[], options?: { count?: number }): ValidationResult =>
	// 			handler.sliceLast(input, options?.count),
	// 		[
	// 			{ input: [1, 2, 3], pass: true, value: [3] },
	// 			{ input: [1, 2, 3], options: { count: 2 }, pass: true, value: [2, 3] }
	// 		]
	// 	);
	// });

	// it('sortAsc', () => {
	// 	runCases(
	// 		(
	// 			input: unknown[],
	// 			options?: { comparator: Path | ((a: unknown, b: unknown) => number) | null }
	// 		): ValidationResult =>
	// 			handler.sortAsc(input, options?.comparator ?? null),
	// 		[
	// 			{ input: [3, 1, 2], pass: true, value: [1, 2, 3] },
	// 			{
	// 				input: [{ id: 2 }, { id: 1 }],
	// 				options: { comparator: new Path('id') },
	// 				pass: true,
	// 				value: [{ id: 1 }, { id: 2 }]
	// 			},
	// 			{
	// 				input: ['aaa', 'b', 'cc'],
	// 				options: { comparator: (a: unknown, b: unknown): number => String(a).length - String(b).length },
	// 				pass: true,
	// 				value: ['b', 'cc', 'aaa']
	// 			}
	// 		]
	// 	);

	// });

	// it('sortDesc', () => {
	// 	runCases(
	// 		(
	// 			input: unknown[],
	// 			options?: { comparator: Path | ((a: unknown, b: unknown) => number) | null }
	// 		): ValidationResult =>
	// 			handler.sortDesc(input, options?.comparator ?? null),
	// 		[
	// 			{ input: [3, 1, 2], pass: true, value: [3, 2, 1] },
	// 			{
	// 				input: [{ id: 1 }, { id: 2 }],
	// 				options: { comparator: new Path('id') },
	// 				pass: true,
	// 				value: [{ id: 2 }, { id: 1 }]
	// 			},
	// 			{
	// 				input: ['aaa', 'b', 'cc'],
	// 				options: { comparator: (a: unknown, b: unknown): number => String(b).length - String(a).length },
	// 				pass: true,
	// 				value: ['aaa', 'cc', 'b']
	// 			}
	// 		]
	// 	);
	// });

	// it('splice', () => {
	// 	runCases(
	// 		(
	// 			input: unknown[],
	// 			options?: { startIndex: number; deleteCount?: number; insertValues?: unknown[] }
	// 		): ValidationResult =>
	// 			handler.splice(input, options?.startIndex ?? 0, options?.deleteCount, options?.insertValues),
	// 		[
	// 			{ input: [1, 2, 3], options: { startIndex: 1, deleteCount: 1, insertValues: ['x', 'y'] }, pass: true, value: [1, 'x', 'y', 3] },
	// 			{ input: [1, 2, 3], options: { startIndex: 2 }, pass: true, value: [1, 2, 3] }
	// 		]
	// 	);
	// });
});
