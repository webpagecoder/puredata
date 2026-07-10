'use strict';

import { Path } from '../../../lib/Path.ts';
import { ObjectHandler } from '../../../lib/fields/object/ObjectHandler.ts';
import { runCases, type ValidationResult } from '../../helpers/runCases.ts';

//todo: might want to look through these again ---- especially the path stuff

describe('ObjectHandler validators', () => {
	let handler: ObjectHandler;

	beforeEach(() => {
		handler = new ObjectHandler();
	});

	it('empty', () => {
		const emptyRef = { keep: false };
		runCases(
			(input: unknown, options?: { empties?: unknown[] }): ValidationResult =>
				handler.empty(input, options?.empties),
			[
				{ input: {}, pass: true, value: {} },
				{ input: null, pass: true, value: null },
				{ input: { a: 1 }, pass: false, errorKey: 'object/empty' },
				{ input: emptyRef, options: { empties: [emptyRef] }, pass: true, value: emptyRef }
			],
			'object/unknown'
		);
	});

	it('notEmpty', () => {
		runCases(
			(input: unknown, options?: { empties?: unknown[] }): ValidationResult =>
				handler.notEmpty(input, options?.empties),
			[
				{ input: { a: 1 }, pass: true, value: { a: 1 } },
				{ input: {}, pass: false, errorKey: 'object/notEmpty' },
				{ input: undefined, pass: false, errorKey: 'object/notEmpty' }
			],
			'object/unknown'
		);
	});

	it('property', () => {
		runCases(
			(input: unknown, options?: { property: string }): ValidationResult =>
				handler.property(input, options?.property),
			[
				{ input: { a: 1, b: undefined }, options: { property: 'a' }, pass: true, value: { a: 1, b: undefined } },
				{ input: { a: 1, b: undefined }, options: { property: 'b' }, pass: false, errorKey: 'object/property' },
				{ input: null, options: { property: 'a' }, pass: false, errorKey: 'object/property' }
			],
			'object/unknown'
		);
	});

	it('instanceOf', () => {
		class CustomClass {
			public x = 1;
		}
		runCases(
			(input: unknown, options?: { ctor: unknown }): ValidationResult =>
				handler.instanceOf(input, options?.ctor),
			[
				{ input: new Date(), options: { ctor: Date }, pass: true, value: expect.any(Date) as unknown },
				{ input: new CustomClass(), options: { ctor: Object }, pass: false, errorKey: 'object/instanceOf' },
				{ input: {}, options: { ctor: Object }, pass: true, value: {} }
			],
			'object/unknown'
		);
	});

	it('maxDepth', () => {
		runCases(
			(input: unknown, options?: { maxDepth: number }): ValidationResult =>
				handler.maxDepth(input, options?.maxDepth),
			[
				{ input: { a: 1 }, options: { maxDepth: 1 }, pass: true, value: { a: 1 } },
				{ input: { a: { b: 1 } }, options: { maxDepth: 1 }, pass: false, errorKey: 'object/maxDepth' }
			],
			'object/unknown'
		);
	});

	it('minDepth', () => {
		runCases(
			(input: unknown, options?: { minDepth: number }): ValidationResult =>
				handler.minDepth(input, options?.minDepth),
			[
				{ input: { a: { b: 1 } }, options: { minDepth: 2 }, pass: true, value: { a: { b: 1 } } },
				{ input: { a: 1 }, options: { minDepth: 2 }, pass: false, errorKey: 'object/minDepth' }
			],
			'object/unknown'
		);
	});

	it('depth', () => {
		runCases(
			(input: unknown, options?: { depth: number }): ValidationResult =>
				handler.depth(input, options?.depth),
			[
				{ input: { a: { b: 1 } }, options: { depth: 2 }, pass: true, value: { a: { b: 1 } } },
				{ input: { a: 1 }, options: { depth: 2 }, pass: false, errorKey: 'object/depth' }
			],
			'object/unknown'
		);
	});

	it('maxKeyCount', () => {
		runCases(
			(input: Record<string, unknown>, options?: { max: number }): ValidationResult =>
				handler.maxKeyCount(input, options?.max),
			[
				{ input: { a: 1, b: 2 }, options: { max: 2 }, pass: true, value: { a: 1, b: 2 } },
				{ input: { a: 1, b: 2, c: 3 }, options: { max: 2 }, pass: false, errorKey: 'object/maxKeyCount' }
			],
			'object/unknown'
		);
	});

	it('maxKeyCountRecursive', () => {
		runCases(
			(input: Record<string, unknown>, options?: { max: number }): ValidationResult =>
				handler.maxKeyCountRecursive(input, options?.max),
			[
				{ input: { a: 1, b: { c: 2 } }, options: { max: 3 }, pass: true, value: { a: 1, b: { c: 2 } } },
				{ input: { a: 1, b: { c: 2 } }, options: { max: 2 }, pass: false, errorKey: 'object/maxKeyCountRecursive' }
			],
			'object/unknown'
		);
	});

	it('minKeyCount', () => {
		runCases(
			(input: Record<string, unknown>, options?: { min: number }): ValidationResult =>
				handler.minKeyCount(input, options?.min),
			[
				{ input: { a: 1, b: 2 }, options: { min: 2 }, pass: true, value: { a: 1, b: 2 } },
				{ input: { a: 1 }, options: { min: 2 }, pass: false, errorKey: 'object/minKeyCount' }
			],
			'object/unknown'
		);
	});

	it('minKeyCountRecursive', () => {
		runCases(
			(input: Record<string, unknown>, options?: { min: number }): ValidationResult =>
				handler.minKeyCountRecursive(input, options?.min),
			[
				{ input: { a: 1, b: { c: 2 } }, options: { min: 3 }, pass: true, value: { a: 1, b: { c: 2 } } },
				{ input: { a: 1, b: { c: 2 } }, options: { min: 4 }, pass: false, errorKey: 'object/minKeyCountRecursive' }
			],
			'object/unknown'
		);
	});

	it('keyCount', () => {
		runCases(
			(input: Record<string, unknown>, options?: { count: number }): ValidationResult =>
				handler.keyCount(input, options?.count),
			[
				{ input: { a: 1, b: 2 }, options: { count: 2 }, pass: true, value: { a: 1, b: 2 } },
				{ input: { a: 1 }, options: { count: 2 }, pass: false, errorKey: 'object/keyCount' }
			],
			'object/unknown'
		);
	});

	it('keyCountRecursive', () => {
		runCases(
			(input: Record<string, unknown>, options?: { count: number }): ValidationResult =>
				handler.keyCountRecursive(input, options?.count),
			[
				{ input: { a: 1, b: { c: 2 } }, options: { count: 3 }, pass: true, value: { a: 1, b: { c: 2 } } },
				{ input: { a: 1, b: { c: 2 } }, options: { count: 2 }, pass: false, errorKey: 'object/keyCountRecursive' }
			],
			'object/unknown'
		);
	});

	it('noneOfPaths', () => {
		const obj = { a: { b: 1 }, c: 2 };
		runCases(
			(input: Record<string, unknown>, options?: { paths?: Path[] }): ValidationResult =>
				handler.noneOfPaths(input, options?.paths),
			[
				{ input: obj, options: { paths: [new Path('x/y')] }, pass: true, value: obj },
				{ input: obj, options: { paths: [new Path('a/b')] }, pass: false, errorKey: 'object/noneOfPaths' },
				{ input: obj, options: { paths: [] }, pass: true, value: obj }
			],
			'object/unknown'
		);
	});

	it('someOfPaths', () => {
		const obj = { a: { b: 1 }, c: 2 };
		runCases(
			(input: Record<string, unknown>, options?: { paths?: Path[] }): ValidationResult =>
				handler.someOfPaths(input, options?.paths),
			[
				{ input: obj, options: { paths: [new Path('a/b'), new Path('x/y')] }, pass: true, value: obj },
				{ input: obj, options: { paths: [new Path('x/y')] }, pass: false, errorKey: 'object/someOfPaths' },
				{ input: obj, options: { paths: [] }, pass: false, errorKey: 'object/someOfPaths' }
			],
			'object/unknown'
		);
	});

	it('allOfPaths', () => {
		const obj = { a: { b: 1 }, c: 2 };
		runCases(
			(input: Record<string, unknown>, options?: { paths?: Path[] }): ValidationResult =>
				handler.allOfPaths(input, options?.paths),
			[
				{ input: obj, options: { paths: [new Path('a/b'), new Path('c')] }, pass: true, value: obj },
				{ input: obj, options: { paths: [new Path('a/b'), new Path('x/y')] }, pass: false, errorKey: 'object/allOfPaths' },
				{ input: obj, options: { paths: [] }, pass: true, value: obj }
			],
			'object/unknown'
		);
	});

	it('exactlyPaths', () => {
		expect(() => handler.exactlyPaths({ a: { b: 1 }, c: 2 }, [new Path('a/b'), new Path('c')])).toThrow();
	});

	it('onlyPaths', () => {
		expect(() => handler.onlyPaths({ a: { b: 1 }, c: 2 }, [new Path('a/b'), new Path('c')])).toThrow();
	});

	it('pathsOtherThan', () => {
		expect(() => handler.pathsOtherThan({ a: { b: 1 }, c: 2 }, [new Path('a/b')])).toThrow();
	});

	it('xOfPaths', () => {
		const obj = { a: { b: 1 }, c: 2, d: 3 };
		runCases(
			(input: Record<string, unknown>, options?: { count: number; paths?: Path[] }): ValidationResult =>
				handler.xOfPaths(input, options?.count, options?.paths),
			[
				{ input: obj, options: { count: 2, paths: [new Path('a/b'), new Path('c'), new Path('x/y')] }, pass: true, value: obj },
				{ input: obj, options: { count: 1, paths: [new Path('a/b'), new Path('c')] }, pass: false, errorKey: 'object/xOfPaths' },
				{ input: obj, options: { count: 0, paths: [] }, pass: true, value: obj }
			],
			'object/unknown'
		);
	});

	it('allOfButXOfPaths', () => {
		const obj = { a: { b: 1 }, c: 2, d: 3 };
		runCases(
			(input: Record<string, unknown>, options?: { count: number; paths?: Path[] }): ValidationResult =>
				handler.allOfButXOfPaths(input, options?.count, options?.paths),
			[
				{ input: obj, options: { count: 1, paths: [new Path('a/b'), new Path('c'), new Path('x/y')] }, pass: true, value: obj },
				{ input: obj, options: { count: 1, paths: [new Path('a/b'), new Path('c')] }, pass: false, errorKey: 'object/allOfButXOfPaths' },
				{ input: obj, options: { count: 0, paths: [] }, pass: true, value: obj }
			],
			'object/unknown'
		);
	});

	it('plain', () => {
		runCases(handler.plain.bind(handler), [
			{ input: { a: 1 }, pass: true, value: { a: 1 } },
			{ input: Object.create(null), pass: true, value: Object.create(null) },
			{ input: [1, 2], pass: false, errorKey: 'object/plain' },
			{ input: new Date(), pass: false, errorKey: 'object/plain' }
		], 'object/unknown');
	});
});

describe('ObjectHandler mutators', () => {
	let handler: ObjectHandler;

	beforeEach(() => {
		handler = new ObjectHandler();
	});

	it('pickRandom', () => {
		runCases(
			(input: Record<string, unknown>, options?: { count: number }): ValidationResult =>
				handler.pickRandom(input, options?.count),
			[
				{ input: { a: 1, b: 2 }, options: { count: 2 }, pass: true, value: { a: 1, b: 2 } },
				{ input: { a: 1, b: 2 }, options: { count: 3 }, pass: true, value: { a: 1, b: 2 } },
				{ input: { a: 1, b: 2 }, options: { count: 0 }, pass: true, value: {} }
			],
			'object/unknown'
		);
	});

	it('removeEmpties', () => {
		runCases(
			(input: Record<string, unknown>, options?: { emptyValues?: unknown[] }): ValidationResult => ({
				pass: true,
				value: handler.removeEmpties(input, options?.emptyValues)
			}),
			[
				{
					input: { a: 1, b: null, c: undefined, d: '' },
					pass: true,
					value: { a: 1, d: '' }
				},
				{
					input: { a: 1, b: '' },
					options: { emptyValues: ['', null] },
					pass: true,
					value: { a: 1 }
				}
			],
			'object/unknown'
		);
	});

	it('removeEmptiesRecursive', () => {
		runCases(
			(input: Record<string, unknown>, options?: { emptyValues?: unknown[] }): ValidationResult => ({
				pass: true,
				value: handler.removeEmptiesRecursive(input, options?.emptyValues)
			}),
			[
				{
					input: { a: 1, b: null, c: { d: undefined, e: 2 }, f: { g: undefined } },
					pass: true,
					value: { a: 1, c: { e: 2 } }
				},
				{
					input: { nested: { value: '' }, keep: '' },
					options: { emptyValues: ['', null, undefined] },
					pass: true,
					value: {}
				}
			],
			'object/unknown'
		);
	});

	it('renameKeys', () => {
		runCases(
			(
				input: Record<string, unknown>,
				options?: {
					fromRegex: RegExp;
					toRegex: RegExp | string;
					deleteOriginalKey?: boolean;
					overrideExistingKey?: boolean;
				}
			): ValidationResult =>
				handler.renameKeys(
					input,
					options?.fromRegex ?? /^$/, 
					(options?.toRegex ?? '') as RegExp,
					{
						deleteOriginalKey: options?.deleteOriginalKey,
						overrideExistingKey: options?.overrideExistingKey
					}
				),
			[
				{
					input: { old_name: 'x' },
					options: { fromRegex: /^old_/, toRegex: 'new_' },
					pass: true,
					value: { new_name: 'x' }
				},
				{
					input: { old_name: 'x' },
					options: { fromRegex: /^old_/, toRegex: 'new_', deleteOriginalKey: false },
					pass: true,
					value: { old_name: 'x', new_name: 'x' }
				},
				{
					input: { old_name: 'x', new_name: 'keep' },
					options: { fromRegex: /^old_/, toRegex: 'new_', overrideExistingKey: false },
					pass: true,
					value: { old_name: 'x', new_name: 'keep' }
				}
			],
			'object/unknown'
		);
	});

	it('removePaths', () => {
		runCases(
			(input: Record<string, unknown>, options?: { paths: Path[] }): ValidationResult =>
				handler.removePaths(input, options?.paths),
			[
				{
					input: { a: { b: 1, c: 2 }, d: 3 },
					options: { paths: [new Path('a/b'), new Path('x/y')] },
					pass: true,
					value: { a: { c: 2 }, d: 3 }
				},
				{
					input: { a: { b: 1 } },
					options: { paths: [] },
					pass: true,
					value: { a: { b: 1 } }
				}
			],
			'object/unknown'
		);
	});

	it('setPaths', () => {
		runCases(
			(
				input: Record<string, unknown>,
				options?: {
					pathValues?: Record<string, unknown>;
					overwrite?: boolean;
					create?: boolean;
				}
			): ValidationResult =>
				handler.setPaths(input, options?.pathValues, options?.overwrite, options?.create),
			[
				{
					input: { a: { b: 1 } },
					options: { pathValues: {} },
					pass: true,
					value: { a: { b: 1 } }
				}
			],
			'object/unknown'
		);

		expect(() => handler.setPaths({ a: { b: 1 } }, { 'a/b': 2 }, true, true)).toThrow();
		expect(() => handler.setPaths({ a: {} }, { 'a/b': 2 }, true, false)).toThrow();
		expect(() => handler.setPaths({ a: { b: 1 } }, { 'a/b': 2 }, false, true)).toThrow();
	});

	it('stripKeys', () => {
		runCases(
			(input: Record<string, unknown>, options?: { exceptFor: string[] }): ValidationResult =>
				handler.stripKeys(input, options?.exceptFor),
			[
				{ input: { a: 1, b: 2, c: 3 }, options: { exceptFor: ['a', 'c'] }, pass: true, value: { a: 1, c: 3 } },
				{ input: { a: 1, b: 2 }, options: { exceptFor: [] }, pass: true, value: {} },
				{ input: { a: 1 }, options: { exceptFor: ['z'] }, pass: true, value: { z: undefined } }
			],
			'object/unknown'
		);
	});
});
