// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/Handler.(js|ts) + lib/fields/Chain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface ChainGeneratedMethods {
        

        /**
        * Executes the equals handler step.
        * @param {any} comparison
        * @returns {Chain}
        */
        equals(comparison: any): Chain;

        /**
        * Executes the defined handler step.
        * @returns {Chain}
        */
        defined(): Chain;

        /**
        * Executes the falsy handler step.
        * @returns {Chain}
        */
        falsy(): Chain;

        /**
        * Executes the notNull handler step.
        * @returns {Chain}
        */
        notNull(): Chain;

        /**
        * Executes the notOneOf handler step.
        * @param {any} forbiddenValues
        * @returns {Chain}
        */
        notOneOf(forbiddenValues?: any): Chain;

        /**
        * Executes the null handler step.
        * @returns {Chain}
        */
        null(): Chain;

        /**
        * Executes the oneOf handler step.
        * @param {any} allowedValues
        * @returns {Chain}
        */
        oneOf(allowedValues?: any): Chain;

        /**
        * Executes the primitive handler step.
        * @param {any} type
        * @returns {Chain}
        */
        primitive(type?: any): Chain;

        /**
        * Executes the instanceOf handler step.
        * @param {any} constructor
        * @returns {Chain}
        */
        instanceOf(constructor: any): Chain;

        /**
        * Executes the truthy handler step.
        * @returns {Chain}
        */
        truthy(): Chain;

        /**
        * Executes the notDefined handler step.
        * @returns {Chain}
        */
        notDefined(): Chain;

        /**
        * Executes the nullOrUndefined handler step.
        * @returns {Chain}
        */
        nullOrUndefined(): Chain;

        /**
        * Executes the notEquals handler step.
        * @param {any} comparison
        * @returns {Chain}
        */
        notEquals(comparison: any): Chain;

        /**
        * Executes the custom handler step.
        * @param {any} filterFn
        * @returns {Chain}
        */
        custom(filterFn: any): Chain;

}

declare module './Chain.ts' {
    interface Chain extends AnyChainGeneratedMethods {}
}

declare module './Chain.js' {
    interface Chain extends AnyChainGeneratedMethods {}
}

export { };
