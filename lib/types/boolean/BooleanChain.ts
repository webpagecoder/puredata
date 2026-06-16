'use strict';

import { BooleanHandler } from './BooleanHandler.ts';
import { Chain, ChainProps, ChainConstructorParams } from '../../fields/chains/Chain.ts';

type BoolishPair = [truthy: unknown, falsy: unknown];

export type BooleanChainProps = ChainProps<BooleanHandler>&{
    allowBoolish: boolean;
    boolishPairs: BoolishPair[];
    transformer: (value: unknown) => unknown;
};

export type BooleanChainConstructorParams = ChainConstructorParams<BooleanChainProps>;

class BooleanChain extends Chain<BooleanChainProps> {

    public constructor(args: BooleanChainConstructorParams) {
        super(args);
        const {
            allowBoolish = false,
            boolishPairs = [],
            transformer = x => x
        } = args;

        const {extendedProps: props} = this;
        props.allowBoolish = allowBoolish;
        props.boolishPairs = boolishPairs;
        props.transformer = transformer;
    }

    // Configurators

    /**
     * Enables or disables boolish mode for accepting string/numeric boolean equivalents.
     * @param {boolean} [boolish=true] - Whether to enable boolish parsing
     * @returns {BooleanChain} Returns this chain for method chaining
     * @example
     * schema.boolean().propsBoolish(true) // Accepts 'yes', 'no', 1, 0, etc.
     */
    public configBoolish(allowBoolish: boolean = true, addBoolishPairs: BoolishPair[] = []): this {
        return this.clone({
            allowBoolish,
            boolishPairs: [...(this.extendedProps.boolishPairs || []), ...addBoolishPairs]
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
        return this.addStep('truthy', (function (this: BooleanChain): unknown[] {
            const { allowBoolish, boolishPairs = [] } = this.extendedProps;
            return [allowBoolish ? boolishPairs.map(([truthy,]: [unknown, unknown]): unknown => truthy) : []];
        }));
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
        return this.addStep('falsy', (function (this: BooleanChain): unknown[] {
            const { allowBoolish, boolishPairs = [] } = this.extendedProps;
            return [allowBoolish ? boolishPairs.map(([, falsy]: [unknown, unknown]): unknown => falsy) : []];
        }));
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
        return this.addStep('invert', (function (this: BooleanChain): unknown[] {
            const { allowBoolish, boolishPairs = [] } = this.extendedProps;
            return [allowBoolish ? boolishPairs : []];
        }));
    }

}

export { BooleanChain };