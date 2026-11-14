'use strict';

import { ArrayChain } from '../../../lib/fields/array/ArrayChain.ts';

describe('ArrayProcessor', () => {
    describe('preProcess behavior', () => {
        it('preserves required errors from base preProcess', () => {
            const tracker = new ArrayChain().required().process(undefined);

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'any/required')).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'array/base')).toBe(false);
        });

        it('adds array/base when castSingle is disabled and input is not an array', () => {
            const tracker = new ArrayChain({ castSingle: false }).process('x');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'array/base')).toBe(true);
        });

        it('casts a single non-array value into a one-item array when castSingle is enabled', () => {
            const tracker = new ArrayChain({ castSingle: true, stripEmpties: false }).process('x');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toEqual(['x']);
        });

        it('deep-clones nested arrays when cloneValue is enabled', () => {
            const input = [[1], [2, [3]]];
            const tracker = new ArrayChain({ cloneValue: true, stripEmpties: false }).process(input);
            const value = tracker.value as unknown[];

            expect(tracker.pass).toBe(true);
            expect(value).toEqual(input);
            expect(value).not.toBe(input);
            expect(value[0]).not.toBe(input[0]);
            expect((value[1] as unknown[])[1]).not.toBe((input[1] as unknown[])[1]);
        });

        it('strips configured empty values in preProcess', () => {
            const tracker = new ArrayChain({
                stripEmpties: true,
                empties: [null, 0, ''],
            }).process([1, 0, '', 2, null]);

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toEqual([1, 2]);
        });
    });

    describe('ArrayHandler integration through pipeline', () => {
        it('supports common transform chains (filter -> map -> reverse)', () => {
            const chain = new ArrayChain()
                .addToPipeline('filter', [(value: unknown) => (value as number) % 2 === 0])
                .addToPipeline('map', [(value: unknown) => (value as number) * 10])
                .addToPipeline('reverse');

            const tracker = chain.process([1, 2, 3, 4, 5]);

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toEqual([40, 20]);
        });

        it('supports sorting and slicing transforms', () => {
            const chain = new ArrayChain()
                .addToPipeline('sortAsc')
                .addToPipeline('slice', [1, 4]);

            const tracker = chain.process([4, 1, 3, 2, 5]);

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toEqual([2, 3, 4]);
        });

        it('supports duplicate and grouping operations', () => {
            const deduped = new ArrayChain().addToPipeline('stripDuplicates').process([1, 2, 1, 3, 2]);
            const grouped = new ArrayChain().addToPipeline('group', [null]).process(['a', 'b', 'a', 'c']);

            expect(deduped.pass).toBe(true);
            expect(deduped.value).toEqual([1, 2, 3]);

            expect(grouped.pass).toBe(true);
            expect(grouped.value).toEqual([['a', 'a'], ['b'], ['c']]);
        });
    });
});

