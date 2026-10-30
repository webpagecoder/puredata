'use strict';

import { AnyChain } from '../../../lib/fields/any/AnyChain.ts';
import { AnyHandler } from '../../../lib/fields/any/AnyHandler.ts';

describe('AnyChain', () => {
    it('uses default empties and starts with an empty pipeline', () => {
        const chain = new AnyChain();
        const emptyChain = chain.empties([1]).empty();
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

    it('uses configured empties for empty and notEmpty checks', () => {
        const chain = new AnyChain().empties([1,2,3]);

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

    it('uses the inherited default configuration for undefined values', () => {
        const tracker = new AnyChain()
            .default('fallback')
            .optional()
            .process(undefined);

        expect(tracker.value).toBe('fallback');
        expect(tracker.pass).toBe(true);
    });

    it('preserves nested plain objects used as defaults', () => {
        const defaultValue = {
            account: {
                preferences: {
                    theme: 'dark',
                    notifications: true,
                },
            },
            status: 'active',
        };
        const tracker = new AnyChain()
            .default(defaultValue)
            .optional()
            .process(undefined);

        expect(tracker.value).toEqual(defaultValue);
        expect(tracker.pass).toBe(true);
    });

    it('supports inherited field configuration methods', () => {
        const chain = new AnyChain()
            .autoConvert(false)
            .default('fallback')
            .label('Any value')
            .strip()
            .optional();

        expect(chain.config.autoConvert).toBe(false);
        expect(chain.config.defaultValue).toBe('fallback');
        expect(chain.config.label).toBe('Any value');
        expect(chain.config.strip).toBe(true);
        expect(chain.config.presence).toBe('optional');
    });

    it('supports inherited presence and error configuration methods', () => {
        const forbidden = new AnyChain().forbidden();
        const required = new AnyChain().required();
        const custom = new AnyChain()
            .notEmpty()
            .errors({ 'any/notEmpty': 'Value is required to contain something' });

        expect(forbidden.config.presence).toBe('forbidden');
        expect(forbidden.process('value').fail).toBe(true);
        expect(required.config.presence).toBe('required');
        expect(required.process(undefined).fail).toBe(true);
        expect(custom.process(null).errors.errorMessages).toEqual({
            '/': ['Value is required to contain something'],
        });
    });

    it('exposes and caches the inherited processor', () => {
        const chain = new AnyChain();

        expect(chain.processor).toBe(chain.processor);
        expect(chain.processor.field).toBe(chain);
    });

});
