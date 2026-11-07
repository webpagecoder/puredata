'use strict';

import { AnyChain } from '../../../lib/fields/any/AnyChain.ts';
import { ReferenceField } from '../../../lib/fields/schema/reference/ReferenceField.ts';
import { ValueTracker } from '../../../lib/tracker/ValueTracker.ts';

describe('AnyProcessor', () => {
    it('returns immutable defaults without running pipeline steps', () => {
        const chain = new AnyChain()
            .default('fixed')
            .immutable()
            .appendToPipeline('custom', [() => 'changed']);

        const tracker = chain.process('input');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('fixed');
    });

    it('stops after preProcess when required values are missing', () => {
        const chain = new AnyChain()
            .required()
            .appendToPipeline('custom', [() => 'changed']);

        const tracker = chain.process(undefined);

        expect(tracker.fail).toBe(true);
        expect(tracker.value).toBe(undefined);
        expect(tracker.ownErrors).toHaveLength(1);
        expect(tracker.ownErrors[0].errorKey).toBe('any/required');
    });

    it('applies mutator steps through process()', () => {
        const chain = new AnyChain().appendToPipeline('custom', [
            (value: unknown) => `${String(value)}-done`
        ]);

        const tracker = chain.process('work');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('work-done');
    });

    it('continues running later pipeline steps after validation failures', () => {
        const chain = new AnyChain()
            .appendToPipeline('equals', ['ok'])
            .appendToPipeline('custom', [() => 'after-fail']);

        const tracker = chain.process('bad');

        expect(tracker.fail).toBe(true);
        expect(tracker.value).toBe('after-fail');
        expect(tracker.ownErrors.some(error => error.errorKey === 'any/equals')).toBe(true);
    });

    it('resolves ReferenceField step arguments from sibling trackers', () => {
        const chain = new AnyChain().appendToPipeline('equals', [
            new ReferenceField({ pathStr: '/expected' })
        ]);
        const root = new ValueTracker(new AnyChain(), {});
        root.createChild(new AnyChain(), 'expected', 10);
        const target = root.createChild(chain, 'target', 10);

        chain.processor.process(target);

        expect(target.pass).toBe(true);
        expect(target.value).toBe(10);
    });

    it('resolves ReferenceField defaults during preProcess for undefined values', () => {
        const chain = new AnyChain().default(
            new ReferenceField({ pathStr: '/fallback', defaultOrCallback: 'none' })
        );
        const root = new ValueTracker(new AnyChain(), {});
        root.createChild(new AnyChain(), 'fallback', 'from-parent');
        const target = root.createChild(chain, 'target', undefined);

        chain.processor.process(target);

        expect(target.pass).toBe(true);
        expect(target.value).toBe('from-parent');
    });
});

