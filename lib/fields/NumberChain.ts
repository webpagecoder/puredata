'use strict';

import { Chain } from './Chain.ts';

class NumberChain extends Chain {

    // Configurators

    /**
     * Configure whether to automatically convert string values to numbers
     * @param {boolean} autoConvert - Whether to enable automatic conversion
     * @returns {NumberChain} The chain instance for method chaining
     */
    configAutoConvert(autoConvert = true) {
        return this.setProps({ autoConvert });
    }

    /**
     * Configure whether to ensure numbers are within safe integer range
     * @param {boolean} ensureSafe - Whether to ensure safe integer range
     * @returns {NumberChain} The chain instance for method chaining
     */
    configSafe(ensureSafe = true) {
        return this.setProps({ ensureSafe });
    }

    /**
     * Configure whether to ensure numbers are finite (not Infinity/-Infinity)
     * @param {boolean} ensureFinite - Whether to ensure finite values
     * @returns {NumberChain} The chain instance for method chaining
     */
    configFinite(ensureFinite = true) {
        return this.setProps({ ensureFinite });
    }

    /**
     * Configure whether to preserve precision during number operations
     * @param {boolean} preservePrecision - Whether to preserve precision
     * @returns {NumberChain} The chain instance for method chaining
     */
    configPreservePrecision(preservePrecision = true) {
        return this.setProps({ preservePrecision });
    }

}

export { NumberChain };