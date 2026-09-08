'use strict';

import { BooleanChain, BooleanChainConfig } from '../../../lib/fields/boolean/BooleanChain.ts';

describe('BooleanChain', () => {
    const configuredBoolishPairs: [truthy: unknown, falsy: unknown][] = [['yes', 'no']];
    const emptyBoolishPairs: [truthy: unknown, falsy: unknown][] = [];

    type ComboCase = {
        hasBoolishPairs: boolean;
        autoConvert: boolean;
        postConvert: boolean;
    };

    const comboCases: ComboCase[] = [
        { hasBoolishPairs: false, autoConvert: false, postConvert: false },
        { hasBoolishPairs: false, autoConvert: false, postConvert: true },
        { hasBoolishPairs: false, autoConvert: true, postConvert: false },
        { hasBoolishPairs: false, autoConvert: true, postConvert: true },
        { hasBoolishPairs: true, autoConvert: false, postConvert: false },
        { hasBoolishPairs: true, autoConvert: false, postConvert: true },
        { hasBoolishPairs: true, autoConvert: true, postConvert: false },
        { hasBoolishPairs: true, autoConvert: true, postConvert: true },
    ];

    function buildChainConfig({ hasBoolishPairs, autoConvert, postConvert }: ComboCase): Partial<BooleanChainConfig> {
        return {
            boolishPairs: hasBoolishPairs ? configuredBoolishPairs : emptyBoolishPairs,
            autoConvert,
            postConvert,
        };
    }

    describe('truthy with string boolish value', () => {
        it.each(comboCases)('hasBoolishPairs=$hasBoolishPairs autoConvert=$autoConvert postConvert=$postConvert', ({
            hasBoolishPairs,
            autoConvert,
            postConvert,
        }) => {
            const chain = new BooleanChain(buildChainConfig({ hasBoolishPairs, autoConvert, postConvert })).truthy();
            const tracker = chain.process('yes');

            if (!hasBoolishPairs) {
                expect(tracker.fail).toBe(true);
                expect(tracker.value).toBe('yes');
                return;
            }

            expect(tracker.pass).toBe(true);
            if (autoConvert || postConvert) {
                expect(tracker.value).toBe(true);
            }
            else {
                expect(tracker.value).toBe('yes');
            }
        });
    });

    describe('falsy with string boolish value', () => {
        it.each(comboCases)('hasBoolishPairs=$hasBoolishPairs autoConvert=$autoConvert postConvert=$postConvert', ({
            hasBoolishPairs,
            autoConvert,
            postConvert,
        }) => {
            const chain = new BooleanChain(buildChainConfig({ hasBoolishPairs, autoConvert, postConvert })).falsy();
            const tracker = chain.process('no');

            if (!hasBoolishPairs) {
                expect(tracker.fail).toBe(true);
                expect(tracker.value).toBe('no');
                return;
            }

            expect(tracker.pass).toBe(true);
            if (autoConvert || postConvert) {
                expect(tracker.value).toBe(false);
            }
            else {
                expect(tracker.value).toBe('no');
            }
        });
    });

    describe('base processing without validators', () => {
        it.each(comboCases)('yes: hasBoolishPairs=$hasBoolishPairs autoConvert=$autoConvert postConvert=$postConvert', ({
            hasBoolishPairs,
            autoConvert,
            postConvert,
        }) => {
            const chain = new BooleanChain(buildChainConfig({ hasBoolishPairs, autoConvert, postConvert }));
            const tracker = chain.process('yes');

            if (!hasBoolishPairs) {
                expect(tracker.fail).toBe(true);
                expect(tracker.value).toBe('yes');
                return;
            }

            expect(tracker.pass).toBe(true);
            if (autoConvert || postConvert) {
                expect(tracker.value).toBe(true);
            }
            else {
                expect(tracker.value).toBe('yes');
            }
        });

        it.each(comboCases)('no: hasBoolishPairs=$hasBoolishPairs autoConvert=$autoConvert postConvert=$postConvert', ({
            hasBoolishPairs,
            autoConvert,
            postConvert,
        }) => {
            const chain = new BooleanChain(buildChainConfig({ hasBoolishPairs, autoConvert, postConvert }));
            const tracker = chain.process('no');

            if (!hasBoolishPairs) {
                expect(tracker.fail).toBe(true);
                expect(tracker.value).toBe('no');
                return;
            }

            expect(tracker.pass).toBe(true);
            if (autoConvert || postConvert) {
                expect(tracker.value).toBe(false);
            }
            else {
                expect(tracker.value).toBe('no');
            }
        });
    });

    describe('invert', () => {
        it('inverts native booleans without boolishPairs', () => {
            const chain = new BooleanChain({ boolishPairs: [], autoConvert: false, postConvert: false }).invert();

            const trueTracker = chain.process(true);
            expect(trueTracker.pass).toBe(true);
            expect(trueTracker.value).toBe(false);

            const falseTracker = chain.process(false);
            expect(falseTracker.pass).toBe(true);
            expect(falseTracker.value).toBe(true);
        });

        it('inverts boolish values and keeps boolish output when both conversions are disabled', () => {
            const chain = new BooleanChain({ boolishPairs: configuredBoolishPairs, autoConvert: false, postConvert: false }).invert();

            const yesTracker = chain.process('yes');
            expect(yesTracker.pass).toBe(true);
            expect(yesTracker.value).toBe('no');

            const noTracker = chain.process('no');
            expect(noTracker.pass).toBe(true);
            expect(noTracker.value).toBe('yes');
        });

        it('inverts boolish values and returns booleans when autoConvert is enabled', () => {
            const chain = new BooleanChain({ boolishPairs: configuredBoolishPairs, autoConvert: true, postConvert: false }).invert();

            const yesTracker = chain.process('yes');
            expect(yesTracker.pass).toBe(true);
            expect(yesTracker.value).toBe(false);

            const noTracker = chain.process('no');
            expect(noTracker.pass).toBe(true);
            expect(noTracker.value).toBe(true);
        });

        it('inverts boolish values and post-converts to booleans when autoConvert is disabled', () => {
            const chain = new BooleanChain({ boolishPairs: configuredBoolishPairs, autoConvert: false, postConvert: true }).invert();

            const yesTracker = chain.process('yes');
            expect(yesTracker.pass).toBe(true);
            expect(yesTracker.value).toBe(false);

            const noTracker = chain.process('no');
            expect(noTracker.pass).toBe(true);
            expect(noTracker.value).toBe(true);
        });

        it('fails for non-boolish values', () => {
            const chain = new BooleanChain({ boolishPairs: configuredBoolishPairs, autoConvert: false, postConvert: false }).invert();

            const tracker = chain.process('maybe');
            expect(tracker.fail).toBe(true);
            expect(tracker.value).toBe('maybe');
        });
    });

});
