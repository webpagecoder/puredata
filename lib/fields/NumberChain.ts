'use strict';

import { BooleanHandler } from '../handlers/BooleanHandler.ts';
import { NumberHandler } from '../handlers/NumberHandler.ts';
import { Overwrite } from '../types.ts';
import { Chain, ChainConfig, ChainConstructorParams } from './Chain.ts';

export type NumberChainConfig = Overwrite<ChainConfig<NumberHandler>, {
        autoConvert: boolean;
        ensureSafe: boolean;
        ensureFinite: boolean;
        preservePrecision: boolean;
}>;

export type NumberChainConstructorParams = ChainConstructorParams<NumberChainConfig>;

class NumberChain extends Chain<NumberChainConfig> {

    public constructor(args: NumberChainConstructorParams) {
        super(args);
        const {
            autoConvert = true,
            ensureSafe = false,
            ensureFinite = false,
            preservePrecision = false,
        } = args;

        const { _config } = this;
        _config.autoConvert = autoConvert;
        _config.ensureSafe = ensureSafe;
        _config.ensureFinite = ensureFinite;
        _config.preservePrecision = preservePrecision;
    }

    // Configurators

    /**
     * Configure whether to automatically convert string values to numbers
     * @param {boolean} autoConvert - Whether to enable automatic conversion
     * @returns {NumberChain} The chain instance for method chaining
     */
    public configAutoConvert(autoConvert = true) {
        return this.clone({ autoConvert });
    }

    /**
     * Configure whether to ensure numbers are within safe integer range
     * @param {boolean} ensureSafe - Whether to ensure safe integer range
     * @returns {NumberChain} The chain instance for method chaining
     */
    public configSafe(ensureSafe = true) {
        return this.clone({ ensureSafe });
    }

    /**
     * Configure whether to ensure numbers are finite (not Infinity/-Infinity)
     * @param {boolean} ensureFinite - Whether to ensure finite values
     * @returns {NumberChain} The chain instance for method chaining
     */
    public configFinite(ensureFinite = true) {
        return this.clone({ ensureFinite });
    }

    /**
     * Configure whether to preserve precision during number operations
     * @param {boolean} preservePrecision - Whether to preserve precision
     * @returns {NumberChain} The chain instance for method chaining
     */
    public configPreservePrecision(preservePrecision = true) {
        return this.clone({ preservePrecision });
    }

}

export { NumberChain };