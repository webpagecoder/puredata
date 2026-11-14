'use strict';

import { AnyChain } from '../../../lib/fields/any/AnyChain.ts';
import { HandlerResult } from '../../../lib/fields/HandlerResult.ts';

describe('AnyProcessor', () => {
    it('returns immutable defaults without running pipeline steps', () => {
        const chain = new AnyChain()
            .default('fixed')
            .immutable()
            .addToPipeline('custom', [() => 'changed']);

        const tracker = chain.process('input');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('fixed');
    });

    it('stops after preProcess when required values are missing', () => {
        const chain = new AnyChain()
            .required()
            .addToPipeline('custom', [() => 'changed']);

        const tracker = chain.process(undefined);

        expect(tracker.fail).toBe(true);
        expect(tracker.value).toBe(undefined);
        expect(tracker.ownErrors).toHaveLength(1);
        expect(tracker.ownErrors[0].errorKey).toBe('any/required');
    });

    it('applies mutator steps through process()', () => {
        const chain = new AnyChain().addToPipeline('custom', [
            (value: unknown) => `${String(value)}-done`
        ]);

        const tracker = chain.process('work');

        expect(tracker.pass).toBe(true);
        expect(tracker.value).toBe('work-done');
    });

    it('continues running later pipeline steps after validation failures', () => {
        const chain = new AnyChain()
            .addToPipeline('equals', ['ok'])
            .addToPipeline('custom', [() => 'after-fail']);

        const tracker = chain.process('bad');

        expect(tracker.fail).toBe(true);
        expect(tracker.value).toBe('after-fail');
        expect(tracker.ownErrors.some(error => error.errorKey === 'any/equals')).toBe(true);
    });

    it('uses configured empties for empty/notEmpty during process()', () => {
        const emptyChain = new AnyChain().empties([0, false]).empty();
        const notEmptyChain = new AnyChain().empties([0, false]).notEmpty();

        expect(emptyChain.process(0).pass).toBe(true);
        expect(emptyChain.process('').fail).toBe(true);

        expect(notEmptyChain.process('').pass).toBe(true);
        expect(notEmptyChain.process(false).fail).toBe(true);
    });

    it('mutable re-enables processing after immutable()', () => {
        const immutableChain = new AnyChain()
            .default('fixed')
            .addToPipeline('custom', [() => 'first'])
            .immutable();
        const mutableChain = immutableChain
            .mutable()
            .addToPipeline('custom', [(value: unknown) => `${String(value)}-second`]);

        expect(immutableChain.process('input').value).toBe('fixed');
        expect(mutableChain.process('input').value).toBe('first-second');
    });

    it('processes additional AnyHandler validators: truthy, primitive, and noneOf', () => {
        const chain = new AnyChain()
            .addToPipeline('truthy')
            .addToPipeline('primitive', ['string'])
            .addToPipeline('noneOf', [['blocked']]);

        expect(chain.process('allowed').pass).toBe(true);
        expect(chain.process('blocked').fail).toBe(true);
        expect(chain.process(1).fail).toBe(true);
    });

    it('processes anyOf and instanceOf validators', () => {
        const anyOfChain = new AnyChain().addToPipeline('anyOf', [['a', 'b']]);
        const instanceChain = new AnyChain().addToPipeline('instanceOf', [Date]);

        expect(anyOfChain.process('a').pass).toBe(true);
        expect(anyOfChain.process('c').fail).toBe(true);

        expect(instanceChain.process(new Date()).pass).toBe(true);
        expect(instanceChain.process({}).fail).toBe(true);
    });

    it('accumulates multiple validation errors from later failing steps', () => {
        const chain = new AnyChain()
            .addToPipeline('equals', ['first'])
            .addToPipeline('equals', ['second']);

        const tracker = chain.process('value');

        expect(tracker.fail).toBe(true);
        expect(tracker.ownErrors).toHaveLength(2);
        expect(tracker.ownErrors.map(error => error.errorKey)).toEqual(['any/equals', 'any/equals']);
    });

    it('forbidden presence fails before pipeline execution', () => {
        const chain = new AnyChain()
            .forbidden()
            .addToPipeline('custom', [() => 'mutated']);

        const tracker = chain.process('provided');

        expect(tracker.fail).toBe(true);
        expect(tracker.ownErrors[0].errorKey).toBe('any/forbidden');
        expect(tracker.value).toBe('provided');
    });

    it('custom handlers can return HandlerResult failures directly', () => {
        const chain = new AnyChain().addToPipeline('custom', [
            (value: unknown) => HandlerResult.fail(value, 'any/base')
        ]);

        const tracker = chain.process('x');

        expect(tracker.fail).toBe(true);
        expect(tracker.ownErrors[0].errorKey).toBe('any/base');
        expect(tracker.value).toBe('x');
    });

    it('resolveStepArgs handles callback and missing args', () => {
        const chain = new AnyChain().empties(['x']);
        const processor = chain.createProcessor();

        expect(processor.resolveStepArgs(undefined)).toEqual([]);
        expect(processor.resolveStepArgs(function (this: AnyChain) {
            return [this.config.empties];
        })).toEqual([['x']]);
    });


});
