'use strict';

import { NumberChain } from '../../../lib/fields/number/NumberChain.ts';
import { NumberProcessor } from '../../../lib/fields/number/NumberProcessor.ts';

describe('NumberChain configurators and number-specific parsing', () => {
    it('createProcessor returns a NumberProcessor instance', () => {
        expect(new NumberChain().createProcessor()).toBeInstanceOf(NumberProcessor);
    });

    it('safe rejects numbers outside the safe integer range by default', () => {
        const tracker = new NumberChain().process(9007199254740992);

        expect(tracker.fail).toBe(true);
    });

    it('safe(false) allows numbers outside the safe integer range', () => {
        const tracker = new NumberChain()
            .safe(false)
            .process(9007199254740992);

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe(9007199254740992);
    });

    it('finite(false) allows Infinity when safe range checks are disabled', () => {
        const tracker = new NumberChain()
            .safe(false)
            .finite(false)
            .process(Infinity);

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe(Infinity);
    });

    it('precision rejects lossy string-to-number conversion by default', () => {
        const tracker = new NumberChain().process('1.0000000000000001');

        expect(tracker.fail).toBe(true);
    });

    it('precision(false) allows lossy string-to-number conversion', () => {
        const tracker = new NumberChain()
            .precision(false)
            .process('1.0000000000000001');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe(1);
    });
});
