'use strict';

import { ArrayChain } from '../../../lib/fields/array/ArrayChain.ts';
import { ArrayProcessor } from '../../../lib/fields/array/ArrayProcessor.ts';

describe('ArrayChain configurators and array-specific steps', () => {
    it('createProcessor returns an ArrayProcessor instance', () => {
        expect(new ArrayChain().createProcessor()).toBeInstanceOf(ArrayProcessor);
    });

    it('castSingle defaults to true and casts scalar input into a one-item array', () => {
        const tracker = new ArrayChain().process(7);

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toEqual([7]);
    });

    it('castSingle(false) rejects scalar input as non-array', () => {
        const tracker = new ArrayChain().castSingle(false).process(7);

        expect(tracker.fail).toBe(true);
    });

    it('stripEmpties defaults to true during preprocessing', () => {
        const tracker = new ArrayChain().process([1, null, undefined, '', 2, false]);

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toEqual([1, 2, false]);
    });

    it('stripEmpties(false) keeps configured empty values', () => {
        const tracker = new ArrayChain()
            .stripEmpties(false)
            .process([1, null, undefined, '', 2, false]);

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toEqual([1, null, undefined, '', 2, false]);
    });

    it('unique supports long slash-delimited path selectors through ArrayChain', () => {
        const passing = new ArrayChain().unique('/id/id2/id3').process([
            { id: { id2: { id3: 1 } } },
            { id: { id2: { id3: 2 } } },
        ]);
        const failing = new ArrayChain().unique('/id/id2/id3').process([
            { id: { id2: { id3: 1 } } },
            { id: { id2: { id3: 1 } } },
        ]);

        expect(passing.pass).toBe(true);
        expect(failing.fail).toBe(true);
    });

    it('group supports long slash-delimited path selectors through ArrayChain', () => {
        const tracker = new ArrayChain().group('/id/id2/id3').process([
            { id: { id2: { id3: 'x' } }, v: 1 },
            { id: { id2: { id3: 'y' } }, v: 2 },
            { id: { id2: { id3: 'x' } }, v: 3 },
        ]);

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toEqual([
            [
                { id: { id2: { id3: 'x' } }, v: 1 },
                { id: { id2: { id3: 'x' } }, v: 3 },
            ],
            [
                { id: { id2: { id3: 'y' } }, v: 2 },
            ],
        ]);
    });

    it('stripDuplicates supports long slash-delimited path selectors through ArrayChain', () => {
        const tracker = new ArrayChain().stripDuplicates('/id/id2/id3').process([
            { id: { id2: { id3: 1 } }, v: 'a' },
            { id: { id2: { id3: 2 } }, v: 'b' },
            { id: { id2: { id3: 1 } }, v: 'c' },
        ]);

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toEqual([
            { id: { id2: { id3: 1 } }, v: 'a' },
            { id: { id2: { id3: 2 } }, v: 'b' },
        ]);
    });
});
