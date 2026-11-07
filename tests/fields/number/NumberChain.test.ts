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

        it('safe/finite/precision default args set values to true', () => {
            const chain = new NumberChain({
                safe: false,
                finite: false,
                precision: false,
            });

            const withSafeDefault = chain.safe();
            const withFiniteDefault = chain.finite();
            const withPrecisionDefault = chain.precision();

            expect(withSafeDefault.config.safe).toBe(true);
            expect(withSafeDefault.config.finite).toBe(false);
            expect(withSafeDefault.config.precision).toBe(false);

            expect(withFiniteDefault.config.safe).toBe(false);
            expect(withFiniteDefault.config.finite).toBe(true);
            expect(withFiniteDefault.config.precision).toBe(false);

            expect(withPrecisionDefault.config.safe).toBe(false);
            expect(withPrecisionDefault.config.finite).toBe(false);
            expect(withPrecisionDefault.config.precision).toBe(true);
        });

        it('constructor uses per-flag defaults when only some overrides are provided', () => {
            const onlySafe = new NumberChain({ safe: false });
            const onlyFinite = new NumberChain({ finite: false });
            const onlyPrecision = new NumberChain({ precision: false });

            expect(onlySafe.config.safe).toBe(false);
            expect(onlySafe.config.finite).toBe(true);
            expect(onlySafe.config.precision).toBe(true);

            expect(onlyFinite.config.safe).toBe(true);
            expect(onlyFinite.config.finite).toBe(false);
            expect(onlyFinite.config.precision).toBe(true);

            expect(onlyPrecision.config.safe).toBe(true);
            expect(onlyPrecision.config.finite).toBe(true);
            expect(onlyPrecision.config.precision).toBe(false);
        });

        it('configurator clones preserve inherited field config', () => {
            const chain = new NumberChain({
                autoConvert: 'force',
                label: 'Amount',
                presence: 'optional',
                strip: true,
            });

            const configured = chain.safe(false).finite(false).precision(false);

            expect(configured.config.autoConvert).toBe('force');
            expect(configured.config.label).toBe('Amount');
            expect(configured.config.presence).toBe('optional');
            expect(configured.config.strip).toBe(true);
        });
    });
});
