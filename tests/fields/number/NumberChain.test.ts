'use strict';

import { NumberChain } from '../../../lib/fields/number/NumberChain.ts';
import { NumberProcessor } from '../../../lib/fields/number/NumberProcessor.ts';

describe('NumberChain', () => {
    describe('constructor and processor wiring', () => {
        it('applies default number config', () => {
            const chain = new NumberChain();

            expect(chain.config.safe).toBe(true);
            expect(chain.config.finite).toBe(true);
            expect(chain.config.precision).toBe(true);
        });

        it('applies provided constructor config overrides', () => {
            const chain = new NumberChain({
                safe: false,
                finite: false,
                precision: false,
            });

            expect(chain.config.safe).toBe(false);
            expect(chain.config.finite).toBe(false);
            expect(chain.config.precision).toBe(false);
        });

        it('createProcessor returns a NumberProcessor instance', () => {
            expect(new NumberChain().createProcessor()).toBeInstanceOf(NumberProcessor);
        });
    });

    describe('configurators', () => {
        it('safe/finite/precision clone safely without mutating source', () => {
            const chain = new NumberChain();
            const configured = chain.safe(false).finite(false).precision(false);

            expect(chain.config.safe).toBe(true);
            expect(chain.config.finite).toBe(true);
            expect(chain.config.precision).toBe(true);
            expect(configured.config.safe).toBe(false);
            expect(configured.config.finite).toBe(false);
            expect(configured.config.precision).toBe(false);
        });
    });
});
