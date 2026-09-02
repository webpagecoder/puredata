'use strict';

import { BooleanHandler } from './BooleanHandler.ts';
import { AnyChain, AnyChainProps, AnyChainCtorParams } from '../any/AnyChain.ts';
import { BooleanProcessor } from './BooleanProcessor.ts';

export type BoolishPair = [truthy: unknown, falsy: unknown];

export type BooleanChainProps = AnyChainProps<BooleanHandler> & {
    boolishPairs: BoolishPair[];
    postConvert: boolean;
    transformer: (value: unknown) => unknown;
};

export type BooleanChainCtorParams = AnyChainCtorParams<BooleanChainProps>;

class BooleanChain extends AnyChain<BooleanChainProps> {

    public constructor(args: BooleanChainCtorParams) {
        super(Object.assign({ chainHandlerCtor: BooleanHandler }, args));

        const {
            boolishPairs = [],
            postConvert = true,
            transformer = x => typeof x === 'string' ? x.toLowerCase() : x
        } = args;

        const { props } = this;
        props.boolishPairs = boolishPairs;
        props.postConvert = postConvert;
        props.transformer = transformer;
    }

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
    public truthy(): this {
        return this.addHandlerStep('truthy', () => {
            return [this.props.boolishPairs.map(([truthy,]) => truthy)];
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
    public falsy(): this {
        return this.addHandlerStep('falsy', () => {
            return [this.props.boolishPairs.map(([, falsy]) => falsy)];
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
        return this.addHandlerStep('invert', () => {
            return [this.props.boolishPairs];
        });
    }

}

export { BooleanChain };