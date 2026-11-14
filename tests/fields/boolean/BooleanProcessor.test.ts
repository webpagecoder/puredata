'use strict';

import { BooleanChain } from '../../../lib/fields/boolean/BooleanChain.ts';

describe('BooleanProcessor', () => {
    describe('preProcess conversion modes', () => {
        it('passes boolean values through unchanged', () => {
            const chain = new BooleanChain({ autoConvert: 'none' });

            expect(chain.process(true).pass).toBe(true);
            expect(chain.process(true).value).toBe(true);
            expect(chain.process(false).pass).toBe(true);
            expect(chain.process(false).value).toBe(false);
        });

        it('rejects non-boolean values when autoConvert is none', () => {
            const tracker = new BooleanChain({ autoConvert: 'none' }).process('yes');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'boolean/base')).toBe(true);
        });

        it('forces JavaScript boolean conversion when autoConvert is force', () => {
            const chain = new BooleanChain({ autoConvert: 'force' });

            expect(chain.process('yes').value).toBe(true);
            expect(chain.process('').value).toBe(false);
            expect(chain.process(0).value).toBe(false);
            expect(chain.process(1).value).toBe(true);
        });

        it('uses boolishTransform and boolishPairs when autoConvert is normal', () => {
            const chain = new BooleanChain({
                boolishPairs: [['yes', 'no']],
                boolishTransform: (value: unknown) =>
                    typeof value === 'string' ? value.trim().toLowerCase() : value,
            });

            const truthyTracker = chain.process('  YES ');
            const falsyTracker = chain.process(' No  ');

            expect(truthyTracker.pass).toBe(true);
            expect(truthyTracker.value).toBe('yes');
            expect(falsyTracker.pass).toBe(true);
            expect(falsyTracker.value).toBe('no');
        });

        it('fails unknown values in normal mode when no boolish pair matches', () => {
            const tracker = new BooleanChain({
                boolishPairs: [['yes', 'no']],
            }).process('maybe');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'boolean/base')).toBe(true);
        });
    });

    describe('base preProcess interaction', () => {
        it('keeps required failures from base preProcess and skips boolean parsing', () => {
            const tracker = new BooleanChain({ autoConvert: 'none' })
                .required()
                .process(undefined);

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'any/required')).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'boolean/base')).toBe(false);
        });

        it('keeps forbidden failures from base preProcess and skips boolean parsing', () => {
            const tracker = new BooleanChain({ autoConvert: 'none' })
                .forbidden()
                .process('yes');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'any/forbidden')).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'boolean/base')).toBe(false);
        });
    });

    describe('postProcess conversion', () => {
        it('does not convert boolish values when postConvert is false', () => {
            const tracker = new BooleanChain({
                boolishPairs: [['yes', 'no']],
                postConvert: false,
            }).process('yes');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe('yes');
        });

        it('converts boolish values to booleans when postConvert is true', () => {
            const chain = new BooleanChain({
                boolishPairs: [['yes', 'no']],
                postConvert: true,
            });

            expect(chain.process('yes').value).toBe(true);
            expect(chain.process('no').value).toBe(false);
        });

        it('converts pipeline outputs with postConvert when they match boolish pairs', () => {
            const tracker = new BooleanChain({
                boolishPairs: [['yes', 'no']],
                postConvert: true,
            })
                .invert()
                .process('yes');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe(false);
        });
    });

    describe('BooleanHandler pipeline integration', () => {
        it('truthy and falsy validators use configured boolish values', () => {
            const truthyChain = new BooleanChain({ boolishPairs: [[1, 0]] }).truthy();
            const falsyChain = new BooleanChain({ boolishPairs: [[1, 0]] }).falsy();

            expect(truthyChain.process(1).pass).toBe(true);
            expect(truthyChain.process(0).fail).toBe(true);
            expect(falsyChain.process(0).pass).toBe(true);
            expect(falsyChain.process(1).fail).toBe(true);
        });

        it('invert toggles boolish values and can normalize with postConvert', () => {
            const rawTracker = new BooleanChain({
                boolishPairs: [['on', 'off']],
                postConvert: false,
            })
                .invert()
                .process('on');
            const normalizedTracker = new BooleanChain({
                boolishPairs: [['on', 'off']],
                postConvert: true,
            })
                .invert()
                .process('on');

            expect(rawTracker.pass).toBe(true);
            expect(rawTracker.value).toBe('off');
            expect(normalizedTracker.pass).toBe(true);
            expect(normalizedTracker.value).toBe(false);
        });
    });
});

