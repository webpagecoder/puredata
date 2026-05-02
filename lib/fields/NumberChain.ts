'use strict';

import { NumberHandler } from '../handlers/NumberHandler.ts';
import { Chain, ChainProps } from './Chain.ts';

export type NumberChainProps = ChainProps<typeof NumberHandler> & {
    autoConvert?: boolean;
    ensureSafe?: boolean;
    ensureFinite?: boolean;
    preservePrecision?: boolean;
};

class NumberChain extends Chain {

    protected _autoConvert: boolean;
    protected _ensureSafe: boolean;
    protected _ensureFinite: boolean;
    protected _preservePrecision: boolean;

    constructor(props: NumberChainProps) {
        super(props);
        const {
            autoConvert = true,
            ensureSafe = false,
            ensureFinite = false,
            preservePrecision = false,
        } = props;

        this._autoConvert = autoConvert;
        this._ensureSafe = ensureSafe;
        this._ensureFinite = ensureFinite;
        this._preservePrecision = preservePrecision;
    }

    public override clone(props: Partial<NumberChainProps> = {}): this {
        const clone = super.clone(props);
        const {
            autoConvert = this._autoConvert,
            ensureSafe = this._ensureSafe,
            ensureFinite = this._ensureFinite,
            preservePrecision = this._preservePrecision,
        } = props;

        clone._autoConvert = autoConvert;
        clone._ensureSafe = ensureSafe;
        clone._ensureFinite = ensureFinite;
        clone._preservePrecision = preservePrecision;
        return clone;
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