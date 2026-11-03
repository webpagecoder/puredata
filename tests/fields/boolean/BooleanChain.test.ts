'use strict';

import { BooleanChain } from '../../../lib/fields/boolean/BooleanChain.ts';
import { BooleanProcessor } from '../../../lib/fields/boolean/BooleanProcessor.ts';

describe('BooleanChain configurators and boolean-specific steps', () => {
    it('createProcessor returns a BooleanProcessor instance', () => {
        expect(new BooleanChain().createProcessor()).toBeInstanceOf(BooleanProcessor);
    });

    it('truthy accepts configured truthy values and rejects falsy values', () => {
        const chain = new BooleanChain()
            .boolishPairs([['yes', 'no']])
            .truthy();

        const passing = chain.process('yes');
        const failing = chain.process('no');

        expect(passing.pass).toBe(true);
        expect(failing.fail).toBe(true);
    });

    it('falsy accepts configured falsy values and rejects truthy values', () => {
        const chain = new BooleanChain()
            .boolishPairs([['yes', 'no']])
            .falsy();

        const passing = chain.process('no');
        const failing = chain.process('yes');

        expect(passing.pass).toBe(true);
        expect(failing.fail).toBe(true);
    });

    it('invert switches boolean values', () => {
        const chain = new BooleanChain().invert();
        const truthy = chain.process(true);
        const falsy = chain.process(false);

        expect(truthy.pass).toBe(true);
        expect(truthy.value).toBe(false);
        expect(falsy.pass).toBe(true);
        expect(falsy.value).toBe(true);
    });

    it('invert switches boolish values', () => {
        const chain = new BooleanChain().invert();
        const truthy = chain.process('yes');
        const falsy = chain.process('no');

        expect(truthy.pass).toBe(true);
        expect(truthy.value).toBe('no');
        expect(falsy.pass).toBe(true);
        expect(falsy.value).toBe('yes');
    });

    it('boolishPairs configures custom boolean equivalents', () => {
        const chain = new BooleanChain().boolishPairs([['y', 'n']]);

        expect(chain.process('y').value).toBe('y');
        expect(chain.process('n').value).toBe('n');
    });

    it('addBoolishPairs appends custom pairs while retaining existing defaults', () => {
        const chain = new BooleanChain()
            .addBoolishPairs([['enabled', 'disabled']])
            .invert();

        const addedPairInverted = chain.process('enabled');
        const defaultPairInverted = chain.process('yes');

        expect(addedPairInverted.pass).toBe(true);
        expect(addedPairInverted.value).toBe('disabled');
        expect(defaultPairInverted.pass).toBe(true);
        expect(defaultPairInverted.value).toBe('no');
    });

    it('addBoolishPairs does not mutate the original chain configuration', () => {
        const baseChain = new BooleanChain().truthy();
        const extendedChain = new BooleanChain()
            .addBoolishPairs([['enabled', 'disabled']])
            .truthy();

        expect(baseChain.process('enabled').fail).toBe(true);
        expect(extendedChain.process('enabled').pass).toBe(true);
    });

    it('postConvert controls conversion after pipeline processing', () => {
        const chain = new BooleanChain()
            .boolishPairs([['y', 'n']])
            .postConvert(true)
            .invert();

        const truthy = chain.process('y');
        const falsy = chain.process('n');

        expect(truthy.pass).toBe(true);
        expect(truthy.value).toBe(false);
        expect(falsy.pass).toBe(true);
        expect(falsy.value).toBe(true);
    });

    it('transform normalizes values before boolean parsing', () => {
        const chain = new BooleanChain()
            .boolishPairs([['yes', 'no']])
            .boolishTransform(value => typeof value === 'string' ? value.trim().toLowerCase() : value);

        const tracker = chain.process(' YES ');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('yes');
    });
});
