'use strict';

import { StringChain } from '../../../lib/fields/string/StringChain.ts';

describe('StringProcessor', () => {
    describe('preProcess conversion and trimming', () => {
        it('passes through existing string values', () => {
            const tracker = new StringChain().process('hello');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe('hello');
        });

        it('rejects non-string values when autoConvert is none', () => {
            const chain = new StringChain({ autoConvert: 'none' });

            expect(chain.process(123).fail).toBe(true);
            expect(chain.process({ a: 1 }).fail).toBe(true);
            expect(chain.process(123).ownErrors[0].errorKey).toBe('string/base');
        });

        it('converts non-string values when autoConvert is normal', () => {
            const chain = new StringChain({ autoConvert: 'normal', trim: false });

            expect(chain.process(123).value).toBe('123');
            expect(chain.process(false).value).toBe('false');
            expect(chain.process(null).value).toBe('null');
        });

        it('converts non-string values when autoConvert is force', () => {
            const chain = new StringChain({ autoConvert: 'force', trim: false });

            expect(chain.process(123).value).toBe('123');
            expect(chain.process(null).value).toBe('null');
            expect(chain.process(undefined).value).toBe(undefined);
        });

        it('trims string values when trim is enabled', () => {
            const tracker = new StringChain({ trim: true }).process('  hello world  ');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe('hello world');
        });

        it('does not trim when trim is disabled', () => {
            const tracker = new StringChain({ trim: false }).process('  hello world  ');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe('  hello world  ');
        });
    });

    describe('interaction with base AnyProcessor preProcess', () => {
        it('keeps required failures from base preProcess', () => {
            const tracker = new StringChain({ autoConvert: 'force' })
                .required()
                .process(undefined);

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'any/required')).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'string/base')).toBe(false);
        });

        it('keeps forbidden failures from base preProcess', () => {
            const tracker = new StringChain({ autoConvert: 'force' })
                .forbidden()
                .process('value');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'any/forbidden')).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'string/base')).toBe(false);
        });

        it('immutable bypasses conversion and pipeline processing', () => {
            const chain = new StringChain()
                .default('fixed')
                .immutable()
                .addToPipeline('toUpperCase');

            const tracker = chain.process('hello');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe('fixed');
        });
    });

    describe('StringHandler pipeline integration', () => {
        it('runs mutator chain methods after preprocessing', () => {
            const tracker = new StringChain({ autoConvert: 'normal', trim: true })
                .addToPipeline('toUpperCase')
                .addToPipeline('slice', [0, 4])
                .process('  hello  ');

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe('HELL');
        });

        it('continues running later mutators after validator failure', () => {
            const tracker = new StringChain()
                .addToPipeline('startsWith', ['xyz'])
                .addToPipeline('toUpperCase')
                .process('abc');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'string/startsWith')).toBe(true);
            expect(tracker.value).toBe('ABC');
        });

        it('supports common validator+transform combinations', () => {
            const passTracker = new StringChain()
                .addToPipeline('contains', ['foo'])
                .addToPipeline('toLowerCase')
                .process('foobar');
            const failTracker = new StringChain()
                .addToPipeline('contains', ['foo'])
                .addToPipeline('toLowerCase')
                .process('BAR');

            expect(passTracker.pass).toBe(true);
            expect(passTracker.value).toBe('foobar');
            expect(failTracker.fail).toBe(true);
            expect(failTracker.ownErrors.some(error => error.errorKey === 'string/contains')).toBe(true);
            expect(failTracker.value).toBe('bar');
        });
    });
});
