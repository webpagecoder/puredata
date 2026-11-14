'use strict';

import { AnyChain } from '../../../lib/fields/any/AnyChain.ts';
import { AnyHandler } from '../../../lib/fields/any/AnyHandler.ts';
import { AnyProcessor } from '../../../lib/fields/any/AnyProcessor.ts';
import { jest } from '@jest/globals';

describe('AnyChain', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('constructor and accessors', () => {
        it('starts with an empty pipeline', () => {
            const chain = new AnyChain();
            expect(chain.pipeline).toHaveLength(0);
        });

        it('returns the configured chainHandler instance', () => {
            const handler = new AnyHandler();
            const chain = new AnyChain({ chainHandler: handler });

            expect(chain.chainHandler).toBe(handler);
        });

        it('applies explicit constructor args for handler, pipeline, empties, and mutability', () => {
            const handler = new AnyHandler();
            const seedStep = new AnyChain().addToPipeline('defined').pipeline[0];
            const chain = new AnyChain({
                chainHandler: handler,
                pipeline: [seedStep],
                empties: [0],
                mutable: false,
            });

            expect(chain.chainHandler).toBe(handler);
            expect(chain.pipeline).toHaveLength(1);
            expect(chain.pipeline[0]).toBe(seedStep);
            expect(chain.config.empties).toEqual([0]);
            expect(chain.config.mutable).toBe(false);
        });
    });

    describe('pipeline mechanics', () => {
        it('throws when addToPipeline receives a non-handler method name', () => {
            const chain = new AnyChain();
            const addUnknownStep = (): AnyChain => chain.addToPipeline('missingMethod' as keyof AnyHandler);
            expect(addUnknownStep).toThrow("Method 'missingMethod'(...) not found in chain handler");
        });

        it('addToPipeline appends a step using static argument arrays', () => {
            const chain = new AnyChain();
            const withStep = chain.addToPipeline('equals', ['x']);
            const step = withStep.pipeline[0];

            expect(chain.pipeline).toHaveLength(0);
            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsOrCallback!()).toEqual(['x']);
        });

        it('addToPipeline stores null resolver when no args are provided', () => {
            const withStep = new AnyChain().addToPipeline('defined');
            const step = withStep.pipeline[0];
            expect(step.argsOrCallback).toBeNull();
        });

        it('addToPipeline binds callback resolvers to the chain context', () => {
            const chain = new AnyChain().empties([1, 2, 3]);
            const withStep = chain.addToPipeline('empty', function (this: AnyChain) {
                return [this.config.empties];
            });
            const step = withStep.pipeline[0];
            expect(step.argsOrCallback!()).toEqual([[1, 2, 3]]);
        });

        it('proxy fallback maps unknown handler methods to appended pipeline steps', () => {
            const chain = new AnyChain();
            const withStep = (chain as unknown as { equals: (value: unknown) => AnyChain }).equals('x');
            const step = withStep.pipeline[0];

            expect(chain.pipeline).toHaveLength(0);
            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsOrCallback!()).toEqual(['x']);
        });

        it('clearPipeline removes steps on the clone only', () => {
            const chain = new AnyChain().addToPipeline('defined').addToPipeline('nullish');
            const cleared = chain.clearPipeline();

            expect(chain.pipeline).toHaveLength(2);
            expect(cleared.pipeline).toHaveLength(0);
        });
    });

    describe('cloning and chain configurators', () => {
        it('clone creates an independent chain with copied pipeline and config', () => {
            const chain = new AnyChain().empties([0]).empty().immutable();
            const clone = chain.clone();
            const extended = clone.notEmpty();

            expect(clone).not.toBe(chain);
            expect(clone.pipeline).toHaveLength(chain.pipeline.length);
            expect(clone.pipeline).not.toBe(chain.pipeline);
            expect(clone.config.empties).toEqual([0]);
            expect(clone.config.mutable).toBe(false);
            expect(chain.pipeline).toHaveLength(1);
            expect(extended.pipeline).toHaveLength(2);
        });

        it('clone applies explicit empties and mutability overrides', () => {
            const chain = new AnyChain().empties([1, 2]).immutable();
            const clone = chain.clone({ empties: ['x'], mutable: true });

            expect(chain.config.empties).toEqual([1, 2]);
            expect(chain.config.mutable).toBe(false);
            expect(clone.config.empties).toEqual(['x']);
            expect(clone.config.mutable).toBe(true);
        });

        it('uses default empties and starts with an empty pipeline', () => {
            const chain = new AnyChain();
            const emptyChain = chain.empties([1]).empty();
            const emptyStep = emptyChain.pipeline[0];

            expect(chain.pipeline).toHaveLength(0);
            expect(emptyChain.pipeline).toHaveLength(1);
            expect(emptyStep).toBeDefined();
            expect(emptyStep.argsOrCallback!()).toEqual([[1]]);
        });

        it('uses configured empties for empty and notEmpty checks', () => {
            const chain = new AnyChain().empties([1, 2, 3]);
            const emptyChain = chain.empty();
            const notEmptyChain = chain.notEmpty();
            const emptyStep = emptyChain.pipeline[0];
            const notEmptyStep = notEmptyChain.pipeline[0];

            expect(emptyStep.argsOrCallback!()).toEqual([[1, 2, 3]]);
            expect(notEmptyStep.argsOrCallback!()).toEqual([[1, 2, 3]]);
        });

        it('handles mutability properly', () => {
            const chain = new AnyChain().default(1);
            const mutable = chain.mutable();
            const immutable = chain.immutable();

            expect(chain.config.mutable).toBe(true);
            expect(mutable.config.mutable).toBe(true);
            expect(immutable.config.mutable).toBe(false);
        });

        it('inherited field configurators clone through the abstract/base path and preserve chain steps', () => {
            const chain = new AnyChain().empty();
            const labeled = chain.label('Any value');

            expect(labeled).toBeInstanceOf(AnyChain);
            expect(labeled).not.toBe(chain);
            expect(chain.config.label).toBe('Field');
            expect(labeled.config.label).toBe('Any value');
            expect(labeled.pipeline).toHaveLength(1);
            expect(chain.pipeline).toHaveLength(1);
        });
    });

    describe('processor wiring', () => {
        it('createProcessor returns an AnyProcessor instance', () => {
            expect(new AnyChain().createProcessor()).toBeInstanceOf(AnyProcessor);
        });

        it('processor getter caches the compiled AnyProcessor instance', () => {
            const compileSpy = jest.spyOn(AnyProcessor.prototype, 'compile');
            const chain = new AnyChain();
            const processor1 = chain.processor;
            const processor2 = chain.processor;

            expect(processor1).toBeInstanceOf(AnyProcessor);
            expect(processor1).toBe(processor2);
            expect(compileSpy).toHaveBeenCalledTimes(1);
        });

        it('processor caches are isolated per clone', () => {
            const compileSpy = jest.spyOn(AnyProcessor.prototype, 'compile');
            const chain = new AnyChain();
            const clone = chain.clone();

            const chainProcessor = chain.processor;
            const cloneProcessor = clone.processor;

            expect(chainProcessor).toBeInstanceOf(AnyProcessor);
            expect(cloneProcessor).toBeInstanceOf(AnyProcessor);
            expect(chainProcessor).not.toBe(cloneProcessor);
            expect(compileSpy).toHaveBeenCalledTimes(2);
        });

        it('field process delegates to AnyProcessor.process', () => {
            const processSpy = jest.spyOn(AnyProcessor.prototype, 'process');
            const chain = new AnyChain();

            chain.process('value');

            expect(processSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('inherited Field configurators', () => {
        it('supports inherited autoConvert and default configurators', () => {
            const chain = new AnyChain();
            const configured = chain.autoConvert('none').default('fallback');

            expect(chain.config.autoConvert).toBe('normal');
            expect(chain.config.defaultValue).toBe(undefined);
            expect(configured.config.autoConvert).toBe('none');
            expect(configured.config.defaultValue).toBe('fallback');
        });

        it('supports inherited strip configurator', () => {
            const chain = new AnyChain();
            const stripped = chain.strip();

            expect(chain.config.strip).toBe(false);
            expect(stripped.config.strip).toBe(true);
        });

        it('supports inherited optional, required, and forbidden configurators', () => {
            const chain = new AnyChain();
            const optional = chain.optional();
            const required = chain.required();
            const forbidden = chain.forbidden();

            expect(chain.config.presence).toBe('required');
            expect(optional.config.presence).toBe('optional');
            expect(required.config.presence).toBe('required');
            expect(forbidden.config.presence).toBe('forbidden');
        });

        it('supports inherited errors configurator', () => {
            const chain = new AnyChain();
            const custom = chain.errors({ '/any/notEmpty': 'Value is required to contain something' });

            expect(custom).not.toBe(chain);
            expect(custom.config.errorMessages).not.toBe(chain.config.errorMessages);
            expect(chain.config.errorMessages.getText('any/notEmpty')).toBe('Must not be empty');
            expect(custom.config.errorMessages.getText('any/notEmpty')).toBe('Value is required to contain something');
        });
    });


});
