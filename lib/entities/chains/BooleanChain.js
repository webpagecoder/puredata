'use strict';

import GenericChain  from './GenericChain.js';

class BooleanChain extends GenericChain {

    get languageKey() {
        return 'boolean';
    }

    // Configurators

    /**
     * Enables or disables boolish mode for accepting string/numeric boolean equivalents.
     * @param {boolean} [boolish=true] - Whether to enable boolish parsing
     * @returns {BooleanChain} Returns this chain for method chaining
     * @example
     * schema.boolean().configBoolish(true) // Accepts 'yes', 'no', 1, 0, etc.
     */
    configBoolish(allowBoolish = true, addBoolishPairs = []) {
        return this.setProps({
            allowBoolish,
            boolishPairs: [...this.getProp('boolishPairs'), ...addBoolishPairs]
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
    truthy() {
        return this.addStep('truthy', function () {
            const { allowBoolish, boolishPairs } = this.props;
            return [allowBoolish ? boolishPairs.map(([truthy, _]) => truthy) : []];
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
    falsy() {
        return this.addStep('falsy', function () {
            const { allowBoolish, boolishPairs } = this.props;
            return [allowBoolish ? boolishPairs.map(([_, falsy]) => falsy) : []];
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
    invert() {
        return this.addStep('invert', function () {
            const { allowBoolish, boolishPairs } = this.props;
            return [allowBoolish ? boolishPairs : []];
        });
    }

}

export default  BooleanChain;