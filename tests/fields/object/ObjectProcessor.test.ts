'use strict';

import { ObjectChain } from '../../../lib/fields/object/ObjectChain.ts';

describe('ObjectProcessor', () => {
    describe('preProcess object checks', () => {
        it('rejects non-object values', () => {
            const tracker = new ObjectChain().process('x');

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'object/base')).toBe(true);
        });

        it('rejects non-plain objects when plainOnly is enabled', () => {
            const tracker = new ObjectChain({
                plainOnly: true,
                stripEmpties: false,
                stripNestedEmpties: false,
            }).process(new Date());

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'object/plain')).toBe(true);
        });

        it('allows non-plain objects when plainOnly is disabled', () => {
            const date = new Date();
            const tracker = new ObjectChain({
                plainOnly: false,
                stripEmpties: false,
                stripNestedEmpties: false,
            }).process(date);

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toBe(date);
        });

        it('enforces maxDepth and maxKeyCount via tooComplex errors', () => {
            const deepTracker = new ObjectChain({ maxDepth: 1 }).process({ a: { b: 1 } });
            const wideTracker = new ObjectChain({ maxKeyCount: 2 }).process({ a: 1, b: 2, c: 3 });

            expect(deepTracker.fail).toBe(true);
            expect(deepTracker.ownErrors.some(error => error.errorKey === 'object/tooComplex')).toBe(true);
            expect(wideTracker.fail).toBe(true);
            expect(wideTracker.ownErrors.some(error => error.errorKey === 'object/tooComplex')).toBe(true);
        });
    });

    describe('preProcess transformations', () => {
        it('clones object values when cloneValue is enabled', () => {
            const input = { nested: { value: 1 } };
            const tracker = new ObjectChain({
                cloneValue: true,
                stripEmpties: false,
                stripNestedEmpties: false,
            }).process(input);

            const result = tracker.value as { nested: { value: number } };
            expect(tracker.pass).toBe(true);
            expect(result).toEqual(input);
            expect(result).not.toBe(input);
            expect(result.nested).not.toBe(input.nested);
        });

        it('stripNestedEmpties takes precedence over stripEmpties', () => {
            const input = { top: '', nested: { inner: '' }, kept: 'x' };
            const nested = new ObjectChain({
                stripEmpties: true,
                stripNestedEmpties: true,
            }).process(input);
            const topOnly = new ObjectChain({
                stripEmpties: true,
                stripNestedEmpties: false,
            }).process(input);

            expect(nested.value).toEqual({ nested: {}, kept: 'x' });
            expect(topOnly.value).toEqual({ nested: { inner: '' }, kept: 'x' });
        });
    });

    describe('interaction with base AnyProcessor preProcess', () => {
        it('preserves required failures from base preProcess', () => {
            const tracker = new ObjectChain().required().process(undefined);

            expect(tracker.fail).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'any/required')).toBe(true);
            expect(tracker.ownErrors.some(error => error.errorKey === 'object/base')).toBe(false);
        });

        it('immutable bypasses object validation and pipeline', () => {
            const chain = new ObjectChain()
                .default({ fixed: true })
                .immutable()
                .addToPipeline('stripKeys', [['fixed']]);

            const tracker = chain.process({ fixed: false, extra: true });

            expect(tracker.pass).toBe(true);
            expect(tracker.value).toEqual({ fixed: true });
        });
    });
});

