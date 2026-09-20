'use strict';

import { NumberHandler } from './NumberHandler.ts';
import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { NumberProcessor } from './NumberProcessor.ts';

export type NumberChainConfig = AnyChainConfig & {
    ensureSafe: boolean;
    ensureFinite: boolean;
    preservePrecision: boolean;
};

export type NumberChainCtorParams = AnyChainCtorParams<NumberChainConfig, NumberHandler>;

class NumberChain extends AnyChain<NumberChainCtorParams> {

    public constructor(args: Partial<NumberChainCtorParams> = {}) {
        super(Object.assign({ chainHandlerCtor: NumberHandler }, args));
        
        const {
            ensureSafe = false,
            ensureFinite = false,
            preservePrecision = false,
        } = args;

        const { _config } = this;
        _config.ensureSafe = ensureSafe;
        _config.ensureFinite = ensureFinite;
        _config.preservePrecision = preservePrecision;
    }

    public override createProcessor(): NumberProcessor {
        return new NumberProcessor({
            field: this,
        });
    }

    // Configurators


    /**
     * Configure whether to ensure numbers are within safe integer range
     * @param  ensureSafe - Whether to ensure safe integer range
     * @returns {NumberChain} The chain instance for method chaining
     */
    public safe(ensureSafe = true) {
        return this.clone({ ensureSafe });
    }

    /**
     * Configure whether to ensure numbers are finite (not Infinity/-Infinity)
     * @param {boolean} ensureFinite - Whether to ensure finite values
     * @returns {NumberChain} The chain instance for method chaining
     */
    public finite(ensureFinite = true) {
        return this.clone({ ensureFinite });
    }

    /**
     * Configure whether to ensure string -> number conversion is precise
     * @param {boolean} preservePrecision - Whether to preserve precision
     * @returns {NumberChain} The chain instance for method chaining
     */
    public precision(preservePrecision = true) {
        return this.clone({ preservePrecision });
    }

}

export { NumberChain };