'use strict';

import { NumberHandler } from './NumberHandler.ts';
import { AnyChain, AnyChainProps, AnyChainCtorParams } from '../any/AnyChain.ts';

export type NumberChainProps = AnyChainProps<NumberHandler> & {
        autoConvert: boolean;
        ensureSafe: boolean;
        ensureFinite: boolean;
        preservePrecision: boolean;
};

export type NumberChainCtorParams = AnyChainCtorParams<NumberChainProps>;

class NumberChain extends AnyChain<NumberChainProps> {

    public constructor(args: NumberChainCtorParams) {
        super(args);
        const {
            autoConvert = true,
            ensureSafe = false,
            ensureFinite = false,
            preservePrecision = false,
        } = args;

        const { props } = this;
        props.autoConvert = autoConvert;
        props.ensureSafe = ensureSafe;
        props.ensureFinite = ensureFinite;
        props.preservePrecision = preservePrecision;
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