'use strict';

import { NumberChain } from '../../../lib/fields/number/NumberChain.ts';

describe('NumberProcessor', () => {
    describe('preProcess conversion behavior', () => {
        it('passes through numeric values unchanged', () => {
            const tracker = new NumberChain().process(12.5);

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe(12.5);
        });

        it('converts valid decimal strings in normal mode', () => {
            const chain = new NumberChain({ autoConvert: 'normal' });

            expect(chain.process('42').value).toBe(42);
            expect(chain.process('  -3.5 ').value).toBe(-3.5);
        });

        it('precision should not reject valid decimal strings in normal mode', () => {
            const strict = new NumberChain({ autoConvert: 'normal', precision: true, safe: false });
            const loose = new NumberChain({ autoConvert: 'normal', precision: false, safe: false });

            expect(strict.process('.25').pass).toBe(true);
            expect(strict.process('.25').value).toBe(0.25);
            expect(loose.process('.25').value).toBe(0.25);
        });

        it('rejects invalid strings in normal mode', () => {
            const chain = new NumberChain({ autoConvert: 'normal' });

            const empty = chain.process('   ');
            const scientific = chain.process('1e3');
            const alpha = chain.process('abc');

            expect(empty.fail).toBe(true);
            expect(scientific.fail).toBe(true);
            expect(alpha.fail).toBe(true);
            expect(empty.ownErrors[0].errorKey).toBe('number/base');
            expect(scientific.ownErrors[0].errorKey).toBe('number/base');
            expect(alpha.ownErrors[0].errorKey).toBe('number/base');
        });

        it('rejects non-number values when autoConvert is none', () => {
            const chain = new NumberChain({ autoConvert: 'none' });

            expect(chain.process('5').fail).toBe(true);
            expect(chain.process(true).fail).toBe(true);
        });

        it('forces conversion for arbitrary values when autoConvert is force', () => {
            const chain = new NumberChain({ autoConvert: 'force', safe: false });

            expect(chain.process(true).value).toBe(1);
            expect(chain.process(false).value).toBe(0);
            expect(chain.process(null).value).toBe(0);
        });
    });

    describe('finite/safe/precision guards', () => {
        it('rejects Infinity when finite is enabled', () => {
            const tracker = new NumberChain({
                autoConvert: 'force',
                finite: true,
                safe: false,
            }).process('Infinity');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors[0].errorKey).toBe('number/base');
        });

        it('allows Infinity when finite is disabled and safe is disabled', () => {
            const tracker = new NumberChain({
                autoConvert: 'force',
                finite: false,
                safe: false,
            }).process('Infinity');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe(Infinity);
        });

        it('rejects unsafe integers when safe is enabled', () => {
            const tracker = new NumberChain({
                autoConvert: 'normal',
                safe: true,
            }).process('9007199254740993');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors[0].errorKey).toBe('number/base');
        });

        it('precision guard rejects lossy string conversions', () => {
            const tracker = new NumberChain({
                autoConvert: 'normal',
                safe: false,
                precision: true,
            }).process('9007199254740993');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors[0].errorKey).toBe('number/base');
        });

        it('precision-disabled mode allows lossy string conversions', () => {
            const tracker = new NumberChain({
                autoConvert: 'normal',
                safe: false,
                precision: false,
            }).process('9007199254740993');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe(9007199254740992);
        });

        it('precision guard rejects values that stringify to scientific notation', () => {
            const strict = new NumberChain({
                autoConvert: 'normal',
                safe: false,
                precision: true,
            }).process('1000000000000000000000');
            const loose = new NumberChain({
                autoConvert: 'normal',
                safe: false,
                precision: false,
            }).process('1000000000000000000000');

            expect(strict.fail).toBe(true);
            expect(strict.ownErrors[0].errorKey).toBe('number/base');
            expect(loose.pass).toBe(true);
            expect(loose.value).toBe(1e21);
        });

        it('precision guard still allows equivalent trailing-zero forms', () => {
            const tracker = new NumberChain({
                autoConvert: 'normal',
                precision: true,
                safe: true,
            }).process('1000000.0');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe(1000000);
        });
    });

    describe('interaction with base AnyProcessor preProcess', () => {
        it('keeps required failures from base preProcess', () => {
            const tracker = new NumberChain({ autoConvert: 'force' })
                .required()
                .process(undefined);

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'any/required')).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'number/base')).toBe(false);
        });

        it('keeps forbidden failures from base preProcess', () => {
            const tracker = new NumberChain({ autoConvert: 'force' })
                .forbidden()
                .process('9');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'any/forbidden')).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'number/base')).toBe(false);
        });
    });

    describe('NumberHandler pipeline integration', () => {
        it('runs validator and mutator steps after numeric conversion', () => {
            const tracker = new NumberChain({ autoConvert: 'normal' })
                .addToPipeline('between', [1, 10])
                .addToPipeline('ceil')
                .process('4.2');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe(5);
        });

        it('continues to later steps after validator failures', () => {
            const tracker = new NumberChain({ autoConvert: 'normal' })
                .addToPipeline('greaterThan', [10])
                .addToPipeline('abs')
                .process('-2');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'number/greaterThan')).toBe(true);
            expect(tracker.value).toBe(2);
        });
    });
});
