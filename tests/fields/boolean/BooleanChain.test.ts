'use strict';

import { BooleanChain } from '../../../lib/fields/boolean/BooleanChain.ts';
import { BooleanProcessor } from '../../../lib/fields/boolean/BooleanProcessor.ts';

describe('BooleanChain', () => {
    describe('constructor and processor wiring', () => {
        it('applies default boolean config', () => {
            const chain = new BooleanChain();

            expect(chain.config.postConvert).toBe(false);
            expect(Array.isArray(chain.config.boolishPairs)).toBe(true);
            expect(chain.config.boolishPairs.length).toBeGreaterThan(0);
            expect(typeof chain.config.boolishTransform).toBe('function');
        });

        it('applies provided constructor config overrides', () => {
            const transform = (value: unknown): unknown => value;
            const chain = new BooleanChain({
                boolishPairs: [[true, false]],
                boolishTransform: transform,
                postConvert: true,
            });

            expect(chain.config.boolishPairs).toEqual([[true, false]]);
            expect(chain.config.boolishTransform).toBe(transform);
            expect(chain.config.postConvert).toBe(true);
        });

        it('createProcessor returns a BooleanProcessor instance', () => {
            expect(new BooleanChain().createProcessor()).toBeInstanceOf(BooleanProcessor);
        });
    });

    describe('configurators', () => {
        it('boolishPairs/addBoolishPairs/postConvert/boolishTransform clone safely', () => {
            const chain = new BooleanChain({
                boolishPairs: [[1, 0]],
                postConvert: false,
            });
            const transform = (value: unknown): unknown => value;
            const configured = chain
                .addBoolishPairs([['yes', 'no']])
                .boolishTransform(transform)
                .postConvert(true);

            expect(chain.config.boolishPairs).toEqual([[1, 0]]);
            expect(chain.config.postConvert).toBe(false);
            expect(configured.config.boolishPairs).toEqual([[1, 0], ['yes', 'no']]);
            expect(configured.config.boolishTransform).toBe(transform);
            expect(configured.config.postConvert).toBe(true);
        });
    });

    describe('pipeline steps', () => {
        it('truthy resolves truthy values from boolishPairs', () => {
            const chain = new BooleanChain({ boolishPairs: [[1, 0], ['yes', 'no']] });
            const withStep = chain.truthy();
            const step = withStep.pipeline[0];

            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsResolver!()).toEqual([[1, 'yes']]);
        });

        it('falsy resolves falsy values from boolishPairs', () => {
            const chain = new BooleanChain({ boolishPairs: [[1, 0], ['yes', 'no']] });
            const withStep = chain.falsy();
            const step = withStep.pipeline[0];

            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsResolver!()).toEqual([[0, 'no']]);
        });

        it('invert resolves full boolishPairs', () => {
            const pairs: [unknown, unknown][] = [[1, 0], ['yes', 'no']];
            const withStep = new BooleanChain({ boolishPairs: pairs }).invert();
            const step = withStep.pipeline[0];

            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsResolver!()).toEqual([pairs]);
        });
    });
});
