'use strict';

import { Path } from '../../../lib/Path.ts';
import { ArrayChain } from '../../../lib/fields/array/ArrayChain.ts';
import { ArrayProcessor } from '../../../lib/fields/array/ArrayProcessor.ts';

describe('ArrayChain', () => {
    describe('constructor and processor wiring', () => {
        it('applies default array config', () => {
            const chain = new ArrayChain();

            expect(chain.config.castSingle).toBe(true);
            expect(chain.config.stripEmpties).toBe(true);
        });

        it('applies provided constructor config overrides', () => {
            const chain = new ArrayChain({
                castSingle: false,
                stripEmpties: false,
            });

            expect(chain.config.castSingle).toBe(false);
            expect(chain.config.stripEmpties).toBe(false);
        });

        it('createProcessor returns an ArrayProcessor instance', () => {
            expect(new ArrayChain().createProcessor()).toBeInstanceOf(ArrayProcessor);
        });
    });

    describe('configurators', () => {
        it('castSingle and stripEmpties clone without mutating the source', () => {
            const chain = new ArrayChain();
            const configured = chain.castSingle(false).stripEmpties(false);

            expect(chain.config.castSingle).toBe(true);
            expect(chain.config.stripEmpties).toBe(true);
            expect(configured.config.castSingle).toBe(false);
            expect(configured.config.stripEmpties).toBe(false);
        });
    });

    describe('pipeline steps', () => {
        const comparator = (a: unknown, b: unknown): -1 | 0 | 1 => {
            if (a === b) {
                return 0;
            }
            return a > b ? 1 : -1;
        };

        it('pipeline step methods clone without mutating the source', () => {
            const chain = new ArrayChain();

            const uniqueChain = chain.unique();
            expect(chain.pipeline).toHaveLength(0);
            expect(uniqueChain.pipeline).toHaveLength(1);

            const groupChain = chain.group(null);
            expect(chain.pipeline).toHaveLength(0);
            expect(groupChain.pipeline).toHaveLength(1);

            const stripDuplicatesChain = chain.stripDuplicates();
            expect(chain.pipeline).toHaveLength(0);
            expect(stripDuplicatesChain.pipeline).toHaveLength(1);
        });

        it('unique stores a path selector when given a string', () => {
            const withStep = new ArrayChain().unique('/id/value');
            const step = withStep.pipeline[0];

            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsResolver!()[0]).toBeInstanceOf(Path);
        });

        it('unique stores comparator callbacks without wrapping as paths', () => {
            const withStep = new ArrayChain().unique(comparator);
            const step = withStep.pipeline[0];

            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsResolver!()).toEqual([comparator]);
        });

        it('unique stores undefined when called without args', () => {
            const withStep = new ArrayChain().unique();
            const step = withStep.pipeline[0];

            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsResolver!()).toEqual([undefined]);
        });

        it('group stores a path selector when given a string', () => {
            const withStep = new ArrayChain().group('/id/value');
            const step = withStep.pipeline[0];

            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsResolver!()[0]).toBeInstanceOf(Path);
        });

        it('group stores a null path when given null', () => {
            const withStep = new ArrayChain().group(null);
            const step = withStep.pipeline[0];

            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsResolver!()).toEqual([null]);
        });

        it('stripDuplicates stores a path selector when given a string', () => {
            const withStep = new ArrayChain().stripDuplicates('/id/value');
            const step = withStep.pipeline[0];

            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsResolver!()[0]).toBeInstanceOf(Path);
        });

        it('stripDuplicates stores comparator callbacks without wrapping as paths', () => {
            const withStep = new ArrayChain().stripDuplicates(comparator);
            const step = withStep.pipeline[0];

            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsResolver!()).toEqual([comparator]);
        });

        it('stripDuplicates stores undefined when called without args', () => {
            const withStep = new ArrayChain().stripDuplicates();
            const step = withStep.pipeline[0];

            expect(withStep.pipeline).toHaveLength(1);
            expect(step.argsResolver!()).toEqual([undefined]);
        });
    });
});
