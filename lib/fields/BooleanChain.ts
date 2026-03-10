'use strict';

import { Chain } from './Chain.ts';

type BoolishPair = [truthy: unknown, falsy: unknown];
type BoolishValues = {
    allowBoolish?: boolean;
    boolishPairs?: BoolishPair[];
};

class BooleanChain extends Chain {

    // Configurators

    /**
     * Enables or disables boolish mode for accepting string/numeric boolean equivalents.
     * @param {boolean} [boolish=true] - Whether to enable boolish parsing
     * @returns {BooleanChain} Returns this chain for method chaining
     * @example
     * schema.boolean().configBoolish(true) // Accepts 'yes', 'no', 1, 0, etc.
     */
    configBoolish(allowBoolish: boolean = true, addBoolishPairs: BoolishPair[] = []): BooleanChain {
        const existingPairs = (this.getProp('boolishPairs') as BoolishPair[] | undefined) || [];
        return this.setProps({
            allowBoolish,
            boolishPairs: [...existingPairs, ...addBoolishPairs]
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
    truthy(): BooleanChain {
        return this.addStep('truthy', (function (this: any) {
            const { allowBoolish, boolishPairs = [] } = this.props as BoolishValues;
            return [allowBoolish ? boolishPairs.map(([truthy]) => truthy) : []];
        }) as unknown as any[]);
    }

    /**
     * Validates that the value is false or a falsy equivalent.
     * When boolish mode is enabled, accepts configured falsy values.
     * @returns {BooleanChain} Returns this chain for method chaining
     * @example
     * schema.boolean().falsy()
     * // With boolish: accepts 'no', 0, 'false', etc.
     */
    falsy(): BooleanChain {
        return this.addStep('falsy', (function (this: any) {
            const { allowBoolish, boolishPairs = [] } = this.props as BoolishValues;
            return [allowBoolish ? boolishPairs.map(([, falsy]) => falsy) : []];
        }) as unknown as any[]);
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
    invert(): BooleanChain {
        return this.addStep('invert', (function (this: any) {
            const { allowBoolish, boolishPairs = [] } = this.props as BoolishValues;
            return [allowBoolish ? boolishPairs : []];
        }) as unknown as any[]);
    }

}

export { BooleanChain };