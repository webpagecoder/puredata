// AUTO-GENERATED TEST FILE
// Source: lib/handlers/BooleanHandler.js
// Purpose: provide static editor autocomplete/hover for handler-backed methods.

// import type BooleanChain from './BooleanChain.js';

declare module './BooleanChain.js' {
    interface BooleanChain {
        /**
         * Validates that the value is false or a falsy equivalent.
         * When boolish mode is enabled, accepts configured falsy values.
         * @returns {BooleanChain} Returns this chain for method chaining
         * @example
         * schema.boolean().falsy()
         * // With boolish: accepts 'no', 0, 'false', etc.
         */
        falsy(...args: any[]): BooleanChain;

        /**
         * Validates that the value is true or a truthy equivalent.
         * When boolish mode is enabled, accepts configured truthy values.
         * @returns {BooleanChain} Returns this chain for method chaining
         * @example
         * schema.boolean().truthy()
         * // With boolish: accepts 'yes', 1, 'true', etc.
         */
        truthy(...args: any[]): BooleanChain;

        /**
         * Inverts the boolean value (true becomes false, false becomes true).
         * When boolish mode is enabled, uses configured boolish pairs for conversion.
         * @returns {BooleanChain} Returns this chain for method chaining
         * @example
         * schema.boolean().invert()
         * // true -> false, false -> true
         * // With boolish: 'yes' -> 'no', 1 -> 0, etc.
         */
        invert(...args: any[]): BooleanChain;
    }
}

export { };
