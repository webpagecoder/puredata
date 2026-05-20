'use strict';

import { NumberHandler } from '../handlers/NumberHandler.ts';
import { Overwrite } from '../types.ts';
import { Chain, ChainCloneParams, ChainConstructorParams } from './Chain.ts';

export type NumberChainConstructorParams =
    Overwrite<ChainConstructorParams<NumberHandler>, {
        autoConvert?: boolean;
        ensureSafe?: boolean;
        ensureFinite?: boolean;
        preservePrecision?: boolean;
    }>;

export type NumberChainCloneParams = ChainCloneParams<NumberChainConstructorParams>;

class NumberChain extends Chain<NumberChainConstructorParams> {

    protected _autoConvert: boolean;
    protected _ensureSafe: boolean;
    protected _ensureFinite: boolean;
    protected _preservePrecision: boolean;

    public constructor(args: NumberChainConstructorParams) {
        super(args);
        const {
            autoConvert = true,
            ensureSafe = false,
            ensureFinite = false,
            preservePrecision = false,
        } = args;

        this._autoConvert = autoConvert;
        this._ensureSafe = ensureSafe;
        this._ensureFinite = ensureFinite;
        this._preservePrecision = preservePrecision;
    }

    public override clone(args: NumberChainCloneParams = {}): this {
        const clone = super.clone(args);
        const {
            autoConvert = this._autoConvert,
            ensureSafe = this._ensureSafe,
            ensureFinite = this._ensureFinite,
            preservePrecision = this._preservePrecision,
        } = args;

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

    public get autoConvert() {
        return this._autoConvert;
    }

    public get ensureSafe() {
        return this._ensureSafe;
    }

    public get ensureFinite() {
        return this._ensureFinite;
    }

    public get preservePrecision() {
        return this._preservePrecision;
    }
}

export { NumberChain };