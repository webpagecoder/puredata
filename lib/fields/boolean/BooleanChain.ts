'use strict';

import { BooleanHandler } from './BooleanHandler.ts';
import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { BooleanProcessor } from './BooleanProcessor.ts';

export type BoolishPair = [truthy: unknown, falsy: unknown];

export type BooleanChainConfig = AnyChainConfig & {
    boolishPairs: BoolishPair[];
    postConvert: boolean;
    transformer: (value: unknown) => unknown;
};

export type BooleanChainCtorParams = AnyChainCtorParams<BooleanChainConfig, BooleanHandler>;

class BooleanChain extends AnyChain<BooleanChainCtorParams> {

    public constructor(args: Partial<BooleanChainCtorParams> = {}) {
        super(Object.assign({ chainHandlerCtor: BooleanHandler }, args));

        const {
            boolishPairs = [],
            postConvert = true,
            transformer = x => typeof x === 'string' ? x.toLowerCase() : x
        } = args;

        const { _config } = this;
        _config.boolishPairs = boolishPairs;
        _config.postConvert = postConvert;
        _config.transformer = transformer;
    }

    public override createProcessor(): BooleanProcessor {
        return new BooleanProcessor({
            field: this,
        });
    }

    // Configurators

    public boolishPairs(pairs: BoolishPair[]): this {
        return this.clone({ boolishPairs: pairs });
    }

    public postConvert(postConvert: boolean = true): this {
        return this.clone({ postConvert });
    }

    public transformer(transformer: (value: unknown) => unknown): this {
        return this.clone({ transformer });
    }

    // Validators

    /**
     * Validates that the value is true or a truthy equivalent.
     * When boolish mode is enabled, accepts configured truthy values.
     * @returns {BooleanChain} Returns this chain for method chaining
     * @example
     * schema.boolean().truthy()
     * // With boolish: accepts 'yes', 1, 'true', etc.
     */
    public override truthy(): this {
        return this.addStepToChain('truthy', () => {
            return [this._config.boolishPairs.map(([truthy,]) => truthy)];
        });
    }

    /**
     * Validates that the value is false or a falsy equivalent.
     * When boolish mode is enabled, accepts configured falsy values.
     * @returns {BooleanChain} Returns this chain for method chaining
     * @example
     * schema.boolean().falsy()
     * // With boolish: accepts 'no', 0, 'false', etc.
     */
    public override falsy(): this {
        return this.addStepToChain('falsy', () => {
            return [this._config.boolishPairs.map(([, falsy]) => falsy)];
        });
    }

    // Transformers

    /**
     * Inverts the boolean value (true becomes false, false becomes true).
     * When boolish mode is enabled, uses configured boolish pairs for conversion.
     * @returns {BooleanChain} Returns this chain for method chaining
     * @example
     * schema.boolean().invert()
     * // true -> false, false -> true
     * // With boolish: 'yes' -> 'no', 1 -> 0, etc.
     */
    public invert(): this {
        return this.addStepToChain('invert', () => {
            return [this._config.boolishPairs];
        });
    }

}

export { BooleanChain };