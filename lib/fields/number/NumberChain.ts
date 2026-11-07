'use strict';

import { NumberHandler } from './NumberHandler.ts';
import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { NumberProcessor } from './NumberProcessor.ts';
import { GlobalConfig } from '../../GlobalConfig.ts';

/** Configuration options for number chains. */
export type NumberChainConfig = AnyChainConfig & {
    safe: boolean;
    finite: boolean;
    precision: boolean;
};

/** Constructor options for a number chain. */
export type NumberChainCtorParams = AnyChainCtorParams<NumberChainConfig, NumberHandler>;

/** Chain of validators and transforms for numeric values. */
class NumberChain extends AnyChain<NumberChainCtorParams> {

    /**
     * Creates a number chain with the supplied configuration.
     *
     * @param args Initial configuration overrides for the number chain.
     */
    public constructor(args: Partial<NumberChainCtorParams> = {}) {
        super(Object.assign({
            chainHandler: new NumberHandler(),
        }, args));
        
        const {
            finite = true,
            precision = true,
            safe = true,
        } = args;

        const { config } = this;
        config.safe = safe;
        config.finite = finite;
        config.precision = precision;
    }

    // ========================================
    // Processor wiring
    // ========================================

    /**
     * Creates the processor that handles this number chain.
     *
     * @returns Processor configured for this number chain.
     */
    public override createProcessor(): NumberProcessor {
        return new NumberProcessor({
            field: this,
        });
    }

    // ========================================
    // Configurators
    // ========================================

    /**
     * Configures whether converted numbers must fit the safe integer range.
     *
     * @param safe Whether values outside JavaScript's safe integer range are rejected.
     * @returns Cloned chain with updated safe-integer enforcement.
     */
    public safe(safe = true) {
        return this.clone({ safe });
    }

    /**
     * Configures whether converted numbers must be finite.
     *
     * @param finite Whether `Infinity` and `-Infinity` are rejected.
     * @returns Cloned chain with updated finite-number enforcement.
     */
    public finite(finite = true) {
        return this.clone({ finite });
    }

    /**
     * Configures whether numeric conversion must preserve precision.
     *
     * @param precision Whether string-to-number conversion must preserve exact numeric representation.
     * @returns Cloned chain with updated precision-preservation enforcement.
     */
    public precision(precision = true) {
        return this.clone({ precision });
    }

}

export { NumberChain };