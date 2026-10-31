'use strict';

import { BooleanHandler } from './BooleanHandler.ts';
import { AnyChain, AnyChainConfig, AnyChainCtorParams } from '../any/AnyChain.ts';
import { BooleanProcessor } from './BooleanProcessor.ts';
import { GlobalConfig } from '../../GlobalConfig.ts';
import { DefaultErrorText } from '../../text/DefaultErrorText.ts';
import { Translation } from '../../Translation.ts';

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

    /** Creates a boolean chain with the supplied configuration. */
    public constructor(args: Partial<BooleanChainCtorParams> = {}) {
        const finalArgs = Object.assign(
            {},
            GlobalConfig.general,
            GlobalConfig.fields.boolean,
            args
        ) as BooleanChainCtorParams;

        super(finalArgs);

        const {
            boolishPairs,
            postConvert,
            boolishTransform
        } = finalArgs;

        const { config } = this;
        config.boolishPairs = boolishPairs;
        config.postConvert = postConvert;
        config.boolishTransform = boolishTransform;
    }

    /** Creates the processor that handles this boolean chain. */
    public override createProcessor(): BooleanProcessor {
        return new BooleanProcessor({
            field: this,
        });
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
            return [this.config.boolishPairs.map(([truthy,]) => truthy)];
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
            return [this.config.boolishPairs.map(([, falsy]) => falsy)];
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
            return [this.config.boolishPairs];
        });
    }


    // Configurators

    /** Configures accepted truthy and falsy value pairs. */
    public boolishPairs(pairs: BoolishPair[]): this {
        return this.clone({ boolishPairs: pairs });
    }

    /** Configures whether recognized values are converted after the pipeline. */
    public postConvert(postConvert: boolean = true): this {
        return this.clone({ postConvert });
    }

    /** Configures a function that normalizes values before boolean parsing. */
    public boolishTransform(boolishTransform: (value: unknown) => unknown): this {
        return this.clone({ boolishTransform });
    }


}

export { BooleanChain };