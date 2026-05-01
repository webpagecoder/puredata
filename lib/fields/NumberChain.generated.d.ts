// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/NumberHandler.(js|ts) + lib/fields/NumberChain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface NumberChainGeneratedMethods {
        /**
        * Executes the approx handler step.
        * @param {any} comparison
        * @param {any} tolerance
        * @returns {NumberChain}
        */
        approx(comparison: any, tolerance?: any): NumberChain;

        /**
        * Executes the number handler step.
        * @returns {NumberChain}
        */
        number(): NumberChain;

        /**
        * Executes the between handler step.
        * @param {any} min
        * @param {any} max
        * @returns {NumberChain}
        */
        between(min: any, max: any): NumberChain;

        /**
        * Executes the decimal handler step.
        * @param {any} param2
        * @returns {NumberChain}
        */
        decimal(minDecimalPlaces?: any): NumberChain;

        /**
        * Executes the equals handler step.
        * @param {any} comparison
        * @returns {NumberChain}
        */
        equals(comparison: any): NumberChain;

        /**
        * Executes the even handler step.
        * @returns {NumberChain}
        */
        even(): NumberChain;

        /**
        * Executes the factor handler step.
        * @param {any} multiple
        * @returns {NumberChain}
        */
        factor(multiple: any): NumberChain;

        /**
        * Executes the finite handler step.
        * @returns {NumberChain}
        */
        finite(): NumberChain;

        /**
        * Executes the greaterThan handler step.
        * @param {any} comparison
        * @returns {NumberChain}
        */
        greaterThan(comparison: any): NumberChain;

        /**
        * Executes the infinity handler step.
        * @returns {NumberChain}
        */
        infinity(): NumberChain;

        /**
        * Executes the integer handler step.
        * @returns {NumberChain}
        */
        integer(): NumberChain;

        /**
        * Executes the lessThan handler step.
        * @param {any} comparison
        * @returns {NumberChain}
        */
        lessThan(comparison: any): NumberChain;

        /**
        * Executes the max handler step.
        * @param {any} comparison
        * @returns {NumberChain}
        */
        max(comparison: any): NumberChain;

        /**
        * Executes the min handler step.
        * @param {any} comparison
        * @returns {NumberChain}
        */
        min(comparison: any): NumberChain;

        /**
        * Executes the minusSign handler step.
        * @returns {NumberChain}
        */
        minusSign(): NumberChain;

        /**
        * Executes the multiple handler step.
        * @param {any} factor
        * @returns {NumberChain}
        */
        multiple(factor: any): NumberChain;

        /**
        * Executes the negative handler step.
        * @returns {NumberChain}
        */
        negative(): NumberChain;

        /**
        * Executes the notEquals handler step.
        * @param {any} comparison
        * @returns {NumberChain}
        */
        notEquals(comparison: any): NumberChain;

        /**
        * Executes the odd handler step.
        * @returns {NumberChain}
        */
        odd(): NumberChain;

        /**
        * Executes the plusSign handler step.
        * @returns {NumberChain}
        */
        plusSign(): NumberChain;

        /**
        * Executes the positive handler step.
        * @returns {NumberChain}
        */
        positive(): NumberChain;

        /**
        * Executes the precision handler step.
        * @param {any} precision
        * @returns {NumberChain}
        */
        precision(precision: any): NumberChain;

        /**
        * Executes the prime handler step.
        * @returns {NumberChain}
        */
        prime(): NumberChain;

        /**
        * Executes the safe handler step.
        * @returns {NumberChain}
        */
        safe(): NumberChain;

        /**
        * Executes the safeInteger handler step.
        * @returns {NumberChain}
        */
        safeInteger(): NumberChain;

        /**
        * Executes the signed handler step.
        * @returns {NumberChain}
        */
        signed(): NumberChain;

        /**
        * Executes the unsigned handler step.
        * @returns {NumberChain}
        */
        unsigned(): NumberChain;

        /**
        * Executes the zero handler step.
        * @returns {NumberChain}
        */
        zero(): NumberChain;

        /**
        * Executes the clampBetween handler step.
        * @param {any} min
        * @param {any} max
        * @returns {NumberChain}
        */
        clampBetween(min: any, max: any): NumberChain;

        /**
        * Executes the constrain handler step.
        * @param {any} min
        * @param {any} max
        * @returns {NumberChain}
        */
        constrain(min: any, max: any): NumberChain;

        /**
        * Executes the negate handler step.
        * @returns {NumberChain}
        */
        negate(): NumberChain;

        /**
        * Executes the round handler step.
        * @param {any} numDecimals
        * @returns {NumberChain}
        */
        round(numDecimals?: any): NumberChain;

        /**
        * Executes the roundDown handler step.
        * @returns {NumberChain}
        */
        roundDown(): NumberChain;

        /**
        * Executes the roundUp handler step.
        * @returns {NumberChain}
        */
        roundUp(): NumberChain;

        /**
        * Executes the stripSign handler step.
        * @returns {NumberChain}
        */
        stripSign(): NumberChain;

        /**
        * Executes the toPower handler step.
        * @param {any} exponent
        * @returns {NumberChain}
        */
        toPower(exponent: any): NumberChain;

        /**
        * Executes the toScale handler step.
        * @param {any} fromMin
        * @param {any} fromMax
        * @param {any} toMin
        * @param {any} toMax
        * @returns {NumberChain}
        */
        toScale(fromMin: any, fromMax: any, toMin: any, toMax: any): NumberChain;

        /**
        * Executes the truncate handler step.
        * @returns {NumberChain}
        */
        truncate(): NumberChain;

        /**
        * Executes the abs handler step.
        * @returns {NumberChain}
        */
        abs(): NumberChain;

        /**
        * Executes the ceil handler step.
        * @returns {NumberChain}
        */
        ceil(): NumberChain;

        /**
        * Executes the clamp handler step.
        * @param {any} min
        * @param {any} max
        * @returns {NumberChain}
        */
        clamp(min: any, max: any): NumberChain;

        /**
        * Executes the floor handler step.
        * @returns {NumberChain}
        */
        floor(): NumberChain;

        /**
        * Executes the pow handler step.
        * @param {any} exponent
        * @returns {NumberChain}
        */
        pow(exponent: any): NumberChain;

        /**
        * Executes the scale handler step.
        * @param {any} fromMin
        * @param {any} fromMax
        * @param {any} toMin
        * @param {any} toMax
        * @returns {NumberChain}
        */
        scale(fromMin: any, fromMax: any, toMin: any, toMax: any): NumberChain;

}

declare module './NumberChain.ts' {
    interface NumberChain extends NumberChainGeneratedMethods {}
}

declare module './NumberChain.js' {
    interface NumberChain extends NumberChainGeneratedMethods {}
}

export { };
