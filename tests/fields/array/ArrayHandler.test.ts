'use strict';

import { Path } from '../../../lib/Path.ts';
import { ArrayHandler } from '../../../lib/fields/array/ArrayHandler.ts';
import { NumberChain } from '../../../lib/fields/number/NumberChain.ts';
import { runFailTests, runPassTests } from '../../helpers/runCases.ts';

describe('ArrayHandler validators', () => {
	let handler: ArrayHandler;
	let numChain: NumberChain;

	beforeEach(() => {
		handler = new ArrayHandler();
		numChain = new NumberChain();
	});

	it('allOf', () => {
		runPassTests(handler.allOf.bind(handler), [
			{ input: [1, 2, 3], args: [[2, 1]] },
			{ input: [1], args: [] },
			{ input: [1, 2, 3], args: [[numChain.between(1, 2)]] },
			{ input: [1, 3, 5], args: [[numChain.between(1, 2), numChain.odd()]] },
		]);

		runFailTests(handler.allOf.bind(handler), [
			{ input: [1, 2, 3], args: [[4]], errorKey: 'array/allOf' },
			{ input: [1, 3, 5], args: [[numChain.between(1, 2), numChain.even()]], errorKey: 'array/allOf' },
		]);
	});

	it('anyOf', () => {
		runPassTests(handler.anyOf.bind(handler), [
			{ input: [1, 2, 4, 3], args: [[77, 8, 4]] },
			{ input: [1, { a: 1 }, 3], args: [[{ a: 1 }]] },
			{ input: [1, 2, 3, 4], args: [[numChain.between(1, 4)]] },
		]);

		runFailTests(handler.anyOf.bind(handler), [
			{ input: [1, { a: 2 }], args: [[{ a: 1 }]], errorKey: 'array/anyOf' },
			{ input: [1, { a: 1 }], args: [[22]], errorKey: 'array/anyOf' },
			{ input: [1, { a: 1 }, [2, 3]], args: [[[2]]], errorKey: 'array/anyOf' },
			{ input: [1, 2, 3, 4], args: [[numChain.between(0, 0)]], errorKey: 'array/anyOf' },
		]);
	});

	it('dimensions', () => {
		runPassTests(handler.dimensions.bind(handler), [
			{ input: [[1, 2], [3, 4]], args: [[2, 2]] },
			{ input: [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [7, 8, 9]]], args: [[2, 2, 3]] },
		]
		);

		runFailTests(handler.dimensions.bind(handler), [
			{ input: [[1], [2]], args: [[2, 2]], errorKey: 'array/dimensions' },
			{ input: [1, 2], args: [[2, 2]], errorKey: 'array/dimensions' }
		]);
	});

	it('empty', () => {
		runPassTests(handler.empty.bind(handler), [
			{ input: [], output: [] },
		]);

		runFailTests(handler.empty.bind(handler), [
			{ input: [1], errorKey: 'array/empty' }
		]);
	});

	it('exactly', () => {
		runPassTests(handler.exactly.bind(handler), [
			{ input: [1, 2, 2], args: [[2, 1, 2]] },
			{ input: [1, 2, 2], args: [[numChain.odd(), numChain.even(), numChain.even()]] },
		]);

		runFailTests(handler.exactly.bind(handler), [
			{ input: [1, 2, 2], args: [[2, 1, 3]], errorKey: 'array/exactly' },
			{ input: [1, 2, 2], args: [[3, 1, 2]], errorKey: 'array/exactly' },
			{ input: [1, 2, 2], args: [[2, 1]], errorKey: 'array/exactly' },
			{ input: [4], args: [[numChain.odd()]], errorKey: 'array/exactly' }
		]);
	});

	it('length', () => {
		runPassTests(handler.length.bind(handler), [
			{ input: [1, 2], args: [2] },
		]);

		runFailTests(handler.length.bind(handler), [
			{ input: [1, 2], args: [3], errorKey: 'array/length' },
		]);
	});

	it('lengthBetween', () => {
		runPassTests(handler.lengthBetween.bind(handler), [
			{ input: [1, 2], args: [2, 3] },
		]);

		runFailTests(handler.lengthBetween.bind(handler), [
			{ input: [1, 2], args: [3, 4], errorKey: 'array/lengthBetween' },
			{ input: [1, 2], args: [0, 1], errorKey: 'array/lengthBetween' },
		]);
	});

	it('maxLength', () => {
		runPassTests(handler.maxLength.bind(handler), [
			{ input: [1, 2], args: [2] },
			{ input: [1], args: [2] },
		]);

		runFailTests(handler.maxLength.bind(handler), [
			{ input: [1, 2, 3], args: [2], errorKey: 'array/maxLength' },
			{ input: [1, 2], args: [0], errorKey: 'array/maxLength' }
		]);
	});

	it('minLength', () => {
		runPassTests(handler.minLength.bind(handler), [
			{ input: [1, 2], args: [2] },
			{ input: [1], args: [0] },
		]);

		runFailTests(handler.minLength.bind(handler), [
			{ input: [], args: [1], errorKey: 'array/minLength' },
			{ input: [1, 2, 3], args: [4], errorKey: 'array/minLength' }
		]);
	});

	it('noneOf', () => {
		runPassTests(handler.noneOf.bind(handler), [
			{ input: [1, 2, 3], args: [[4]] },
			{ input: [1, 2, 3], args: [[0, 6]] },
			{ input: [3, 4, 5], args: [[numChain.between(1, 2), numChain.between(6, 7)]] },
		]);

		runFailTests(handler.noneOf.bind(handler), [
			{ input: [1, { a: 1 }], args: [[{ a: 1 }]], errorKey: 'array/noneOf' },
			{ input: [1, { a: 1 }], args: [[1]], errorKey: 'array/noneOf' },
			{ input: [1, { a: 1 }, [2, 3]], args: [[[2, 3]]], errorKey: 'array/noneOf' },
			{ input: [3, 4, 5], args: [[numChain.between(3, 3)]], errorKey: 'array/noneOf' },
		]);
	});

	it('notEmpty', () => {
		runPassTests(handler.notEmpty.bind(handler), [
			{ input: [1], output: [1] },
		]);

		runFailTests(handler.notEmpty.bind(handler), [
			{ input: [], errorKey: 'array/notEmpty' }
		]);
	});

	it('only', () => {
		runPassTests(handler.only.bind(handler), [
			{ input: [1, 2, 3], args: [[1, 3, 2]] },
			{ input: [6, 6, 6, 6], args: [[6]] },
			{ input: [{ a: 1 }, { b: 2 }], args: [[{ a: 1 }, { b: 2 }]] },
			{ input: [1, 3, 5], args: [[numChain.odd()]] },
		]);

		runFailTests(handler.only.bind(handler), [
			{ input: [1, { a: 1 }], args: [[{ a: 2 }]], errorKey: 'array/only' },
			{ input: [1, { a: 1 }], args: [[1]], errorKey: 'array/only' },
			{ input: [1, { a: 1 }, [2, 3]], args: [[1, [2, 3]]], errorKey: 'array/only' },
			{ input: [2, 4, 5], args: [[numChain.even()]], errorKey: 'array/only' },
		]);
	});

	it('otherThan', () => {
		runPassTests(handler.otherThan.bind(handler), [
			{ input: [1, 2, 3], args: [[4]] },
			{ input: [1, 2, 3], args: [[0, 6]] },
			{ input: [1, 3, 5], args: [[numChain.even()]] },
		]);

		runFailTests(handler.otherThan.bind(handler), [
			{ input: [1, { a: 1 }], args: [[{ a: 1 }]], errorKey: 'array/otherThan' },
			{ input: [1, { a: 1 }], args: [[1]], errorKey: 'array/otherThan' },
			{ input: [1, { a: 1 }, [2, 3]], args: [[[2, 3]]], errorKey: 'array/otherThan' },
			{ input: [1, 3, 5], args: [[numChain.odd()]], errorKey: 'array/otherThan' },
		]);
	});

	it('sorted', () => {
		runPassTests(handler.sorted.bind(handler), [
			{ input: [1, 2, 3] },
			{
				input: [{ id: 1 }, { id: 2 }],
				args: [new Path('id')],
			},
		]);

		runFailTests(handler.sorted.bind(handler), [
			{ input: [2, 1, 3], errorKey: 'array/sorted' },
			{
				input: ['aa', 'b', 'ccc'],
				args: [(a: unknown, b: unknown): number => String(a).length - String(b).length as number],
				errorKey: 'array/sorted'
			},
			{
				input: [{ id: 2 }, { id: 1 }],
				args: [new Path('id')],
				errorKey: 'array/sorted'
			},
		]);
	});

	it('tuple', () => {
		runPassTests(handler.tuple.bind(handler), [
			{ input: [1, 'a', true], args: [[1, 'a', true]] },
			{ input: [-1, 1], args: [[numChain.negative(), numChain.positive()]] },
			{ input: [{ a: 1 }, { b: 2 }], args: [[{ a: 1 }, { b: 2 }]] },
			{ input: [[1, 2], [3, 4]], args: [[[1, 2], [3, 4]]] },
		]);

		runFailTests(handler.tuple.bind(handler), [
			{ input: [1, 'a', true], args: [[1, 'a']], errorKey: 'array/tuple' },
			{ input: [{ a: 1 }, { b: 2 }], args: [[{ a: 1 }, { b: 1 }]], errorKey: 'array/tuple' },
			{ input: [[1, 2], [3, 4]], args: [[[1, 2], [3]]], errorKey: 'array/tuple' },
			{ input: [-1, 1], args: [[numChain.positive(), numChain.negative()]], errorKey: 'array/tuple' },
		]);
	});

	it('unique', () => {
		runPassTests(handler.unique.bind(handler), [
			{ input: [1, 2, 3] },
			{ input: [{ a: 1 }, { b: 2 }] },
			{ input: [[1, 2], [3, 4]] },
		]);

		runFailTests(handler.unique.bind(handler), [
			{ input: [1, 2, 1], errorKey: 'array/unique' },
			{ input: [[2, 3], [2, 3]], errorKey: 'array/unique' },
			{
				input: [{ id: 1 }, { id: 2 }, { id: 1 }],
				args: [new Path('id')],
				errorKey: 'array/unique'
			},
			{
				input: ['A', 'a'],
				args: [(a, b) => String(a).toLowerCase() === String(b).toLowerCase()],
				errorKey: 'array/unique'
			}
		]);
	});
});

describe('ArrayHandler mutators', () => {
	let handler: ArrayHandler;
	let numChain: NumberChain;

	beforeEach(() => {
		handler = new ArrayHandler();
		numChain = new NumberChain();
	});

	it('add', () => {
		runPassTests(handler.add.bind(handler), [
			{ input: [1, 2], args: [[3, 4]], output: [1, 2, 3, 4] },
			{ input: [1, 2], output: [1, 2] }
		]);
	});

	it('chunk', () => {
		runPassTests(handler.chunk.bind(handler), [
			{ input: [1, 2, 3, 4, 5], args: [2], output: [[1, 2], [3, 4], [5]] },
			{ input: [1, 2], args: [5], output: [[1, 2]] },
			{ input: [], args: [5], output: [] }
		]);
	});

	it('filter', () => {
		runPassTests(handler.filter.bind(handler), [
			{
				input: [10, 11, 12, 13],
				args: [((_: unknown, index?: number): boolean => (index || 0) % 2 === 0)],
				output: [10, 12]
			}
		]
		);
	});

	it('flatten', () => {
		runPassTests(handler.flatten.bind(handler), [
			{ input: [1, [2, [3]], 4], output: [1, 2, 3, 4] },
			{ input: [], output: [] }
		]);
	});

	it('group', () => {
		runPassTests(handler.group.bind(handler), [
			{ input: ['a', 'b', 'a'], output: [['a', 'a'], ['b']] },
			{
				input: [{ k: 'x', v: 1 }, { k: 'y', v: 2 }, { k: 'x', v: 3 }],
				args: [new Path('k')],
				output: [
					[{ k: 'x', v: 1 }, { k: 'x', v: 3 }],
					[{ k: 'y', v: 2 }]
				]
			},
			{
				input: [{ k: 'x', v: 1 }, { k: 'y', v: 2 }, { k: 'x', v: 3 }],
				args: [new Path('z')],
				output: [[{ k: 'x', v: 1 }, { k: 'y', v: 2 }, { k: 'x', v: 3 }]],
			}
		]);
	});

	it('keep', () => {
		runPassTests(handler.keep.bind(handler), [
			{ input: [1, 2, 3, 2], args: [[2, 4]], output: [2, 2] },
			{ input: [1, 2], output: [] }
		]);

		runPassTests(handler.keep.bind(handler), [
			{ input: [1, 2, 3, 2, 7], args: [[numChain.between(2, 4)]], output: [2, 3, 2] },
			{ input: [1, 2], output: [] }
		]);
	});

	it('map', () => {
		runPassTests(handler.map.bind(handler), [
			{
				input: [1, 2, 3],
				args: [(output) => Number(output) * 10],
				output: [10, 20, 30]
			}
		]);
	});

	it('padEnd', () => {
		runPassTests(handler.padEnd.bind(handler), [
			{ input: [1], output: [1, 0, 0], args: [3, 0] },
			{ input: [1], output: [1, null, null], args: [3] },
			{ input: [1, 2, 3], args: [3, 0] }
		]
		);
	});

	it('pickRandom', () => {
		runPassTests(handler.pickRandom.bind(handler), [
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

	it('remove', () => {
		runPassTests(handler.remove.bind(handler), [
			{ input: [1, 2, 3, 2, 4], args: [[2, 4]], output: [1, 3] },
			{ input: [1, 2], args: [], output: [1, 2] }
		]);

		runPassTests(handler.remove.bind(handler), [
			{ input: [1, 2, 3, 2, 4], args: [[numChain.between(2, 3), numChain.between(4, 4)]], output: [1] },
			{ input: [2, 4, 10], args: [[numChain.even()]], output: [] }
		]);
	});

	it('removeDuplicates', () => {
		runPassTests(handler.removeDuplicates.bind(handler), [
			{ input: [1, 2, 1, 3], output: [1, 2, 3] },
			{
				input: [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }],
				args: [new Path('id')],
				output: [{ id: 1 }, { id: 2 }, { id: 3 }]
			},
			{
				input: ['A', 'a', 'B'],
				args: [(a, b) => String(a).toLowerCase() === String(b).toLowerCase()],
				output: ['A', 'B']
			}
		]
		);
	});

	it('removeEmpties', () => {
		runPassTests(handler.removeEmpties.bind(handler), [
			{ input: [null, undefined, '', 0, false], output: [0, false] },
			{ input: [0, '', false], args: [[0, '']], output: [false] }
		]
		);
	});

	it('removeUndefined', () => {
		runPassTests(handler.removeUndefined.bind(handler), [
			{ input: [1, undefined, 2], output: [1, 2] },
			{ input: [undefined, undefined], output: [] }
		]
		);
	});

	it('reverse', () => {
		runPassTests(handler.reverse.bind(handler), [
			{ input: [1, 2, 3], output: [3, 2, 1] },
			{ input: [], output: [] }
		]);
	});

	it('shuffle', () => {
		runPassTests(handler.shuffle.bind(handler), [
			{ input: [], output: [] },
			{ input: ['only'], output: ['only'] }
		]);
	});

	it('slice', () => {
		runPassTests(handler.slice.bind(handler), [
			{ input: [1, 2, 3, 4], args: [1, 3], output: [2, 3] },
			{ input: [1, 2, 3, 4], args: [2, 4], output: [3, 4] }
		]
		);
	});

	it('sliceFirst', () => {
		runPassTests(handler.sliceFirst.bind(handler), [
			{ input: [1, 2, 3], output: [1] },
			{ input: [1, 2, 3], args: [2], output: [1, 2] }
		]
		);
	});

	it('sliceLast', () => {
		runPassTests(handler.sliceLast.bind(handler), [
			{ input: [1, 2, 3], output: [3] },
			{ input: [1, 2, 3], args: [2], output: [2, 3] }
		]
		);
	});

	it('sortAsc', () => {
		runPassTests(handler.sortAsc.bind(handler), [
			{ input: [3, 1, 2], output: [1, 2, 3] },
			{
				input: [{ id: 2 }, { id: 1 }],
				args: [new Path('id')],
				output: [{ id: 1 }, { id: 2 }]
			},
			{
				input: ['aaa', 'b', 'cc'],
				args: [(a, b): number => String(a).length - String(b).length],
				output: ['b', 'cc', 'aaa']
			}
		]
		);

	});

	it('sortDesc', () => {
		runPassTests(handler.sortDesc.bind(handler), [
			{ input: [3, 1, 2], output: [3, 2, 1] },
			{
				input: [{ id: 1 }, { id: 2 }],
				args: [new Path('id')],
				output: [{ id: 2 }, { id: 1 }]
			},
			{
				input: ['aaa', 'b', 'cc'],
				args: [(a, b): number => String(b).length - String(a).length],
				output: ['aaa', 'cc', 'b']
			}
		]);
	});

	it('splice', () => {
		runPassTests(handler.splice.bind(handler), [
			{ input: [1, 2, 3], args: [1, 1, ['x', 'y']], output: [1, 'x', 'y', 3] },
			{ input: [1, 2, 3], args: [2], output: [1, 2, 3] }
		]);
	});
});
