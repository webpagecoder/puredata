'use strict';

import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { BooleanHandler } from './BooleanHandler.ts';
import { BooleanProcessor } from './BooleanProcessor.ts';

/** Pair of equivalent truthy and falsy values. */
export type BoolishPair = [truthy: unknown, falsy: unknown];

/** Configuration options for boolean chains. */
export type BooleanChainConfig = AnyChainConfig & {
    boolishPairs: BoolishPair[];
    postConvert: boolean;
    boolishTransform: (value: unknown) => unknown;
};

/** Constructor options for a boolean chain. */
export type BooleanChainCtorParams = AnyChainCtorParams<BooleanChainConfig, BooleanHandler>;

/** Chain of validators and transforms for boolean-like values. */
class BooleanChain extends AnyChain<BooleanChainCtorParams> {

    /**
     * Creates a boolean chain with the supplied configuration.
     *
     * @param args Initial configuration overrides for the boolean chain.
     */
    public constructor(args: Partial<BooleanChainCtorParams> = {}) {
        super(Object.assign({
            chainHandler: new BooleanHandler(),
        }, args));

        const {
            boolishPairs = [
                [1, 0],
                ['1', '0'],
                ['yes', 'no'],
                ['y', 'n'],
                ['true', 'false'],
                ['t', 'f'],
                ['on', 'off'],
            ],
            boolishTransform = (x: unknown) => typeof x === 'string' ? x.toLowerCase() : x,
            postConvert = false,
        } = args;

        const { config } = this;
        config.boolishPairs = boolishPairs;
        config.boolishTransform = boolishTransform;
        config.postConvert = postConvert;
    }

    // ========================================
    // Processor wiring
    // ========================================

    /**
     * Creates the processor that handles this boolean chain.
     *
     * @returns Processor configured for this boolean chain.
     */
    public override createProcessor(): BooleanProcessor {
        return new BooleanProcessor({
            field: this,
        });
    }

    // ========================================
    // Configurators
    // ========================================

    /**
     * Adds accepted truthy/falsy value pairs to the current set.
     *
     * @param addedPairs Pairs to append to the current boolish mapping.
     * @returns Cloned chain with merged boolish pairs.
     */
    public addBoolishPairs(addedPairs: BoolishPair[]): this {
        return this.clone({ boolishPairs: this.config.boolishPairs.concat(addedPairs) });
    }

    /**
     * Replaces accepted truthy/falsy value pairs.
     *
     * @param pairs Complete boolish mapping to use.
     * @returns Cloned chain with replaced boolish pairs.
     */
    public boolishPairs(pairs: BoolishPair[]): this {
        return this.clone({ boolishPairs: pairs });
    }

    /**
     * Configures whether recognized values are converted after the pipeline.
     *
     * @param postConvert Whether to normalize recognized boolish values to booleans after pipeline execution.
     * @returns Cloned chain with updated post-convert behavior.
     */
    public postConvert(postConvert: boolean = true): this {
        return this.clone({ postConvert });
    }

    /**
     * Configures a function that normalizes values before boolean parsing.
     *
     * @param boolishTransform Function used to normalize input before boolish matching.
     * @returns Cloned chain with updated boolish transform.
     */
    public boolishTransform(boolishTransform: (value: unknown) => unknown): this {
        return this.clone({ boolishTransform });
    }

    // ========================================
    // Validators
    // ========================================

    /**
     * Validates that the value is true or a truthy equivalent.
     * When boolish mode is enabled, accepts configured truthy values.
     *
     * @returns Cloned chain with a `truthy` validator step.
     * @example
     * schema.boolean().truthy()
     * // With boolish: accepts 'yes', 1, 'true', etc.
     */
    public override truthy(): this {
        return this.appendToPipeline('truthy', () => {
            return [this.config.boolishPairs.map(([truthy,]) => truthy)];
        });
    }

    /**
     * Validates that the value is false or a falsy equivalent.
     * When boolish mode is enabled, accepts configured falsy values.
     *
     * @returns Cloned chain with a `falsy` validator step.
     * @example
     * schema.boolean().falsy()
     * // With boolish: accepts 'no', 0, 'false', etc.
     */
    public override falsy(): this {
        return this.appendToPipeline('falsy', () => {
            return [this.config.boolishPairs.map(([, falsy]) => falsy)];
        });
    }

    // ========================================
    // Transformers
    // ========================================

    /**
     * Inverts the boolean value (true becomes false, false becomes true).
     * When boolish mode is enabled, uses configured boolish pairs for conversion.
     *
     * @returns Cloned chain with an `invert` transformer step.
     * @example
     * schema.boolean().invert()
     * // true -> false, false -> true
     * // With boolish: 'yes' -> 'no', 1 -> 0, etc.
     */
    public invert(): this {
        return this.appendToPipeline('invert', () => {
            return [this.config.boolishPairs];
        });
    }


}

export { BooleanChain };
