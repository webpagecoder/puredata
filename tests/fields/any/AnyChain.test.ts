'use strict';

import { AnyChain } from '../../../lib/fields/any/AnyChain.ts';
import { AnyHandler } from '../../../lib/fields/any/AnyHandler.ts';

describe('AnyChain', () => {
    it('uses default emptyValues and starts with an empty pipeline', () => {
        const chain = new AnyChain();
        const emptyChain = chain.emptyValues([1]).empty();
        const tracker = emptyChain.process(1);

        expect(tracker.value).toBe(1);
        expect(tracker.pass).toBe(true);
        expect(chain.pipeline).toHaveLength(0);
        expect(emptyChain.pipeline).toHaveLength(1);
    });

    it('throws when addStepToChain receives a non-handler method name', () => {
        const chain = new AnyChain();
        const addUnknownStep = (): AnyChain => chain.addStepToChain('missingMethod' as keyof AnyHandler);

        expect(addUnknownStep).toThrow("Method 'missingMethod'(...) not found in chain handler");
    });

    it('uses configured emptyValues for empty and notEmpty checks', () => {
        const chain = new AnyChain().emptyValues([1,2,3]);

        const emptyTracker = chain.empty().process(3);
        const notEmptyTracker = chain.notEmpty().process(3);

        expect(emptyTracker.pass).toBe(true);
        expect(notEmptyTracker.fail).toBe(true);
    });

    it('handles mutability properly', () => {
        const chain = new AnyChain().default(1);
        const mutable = chain.mutable();
        const immutable = chain.immutable();

        const tracker = mutable.process(2);
        const tracker2 = immutable.process(2);

        expect(tracker.value).toBe(2);
        expect(tracker2.value).toBe(1);
        expect(tracker.pass).toBe(true);
        expect(tracker2.pass).toBe(true);
    });

});
