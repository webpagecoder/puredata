// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/NumberHandler.(js|ts) + lib/fields/NumberChain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface NumberChainGeneratedMethods {
        approx(comparison: any, tolerance?: any): NumberChain;

        number(): NumberChain;

        between(min: any, max: any): NumberChain;

        decimal(minDecimalPlaces?: any): NumberChain;

        equals(comparison: any): NumberChain;

        even(): NumberChain;

        factor(multiple: any): NumberChain;

        finite(): NumberChain;

        greaterThan(comparison: any): NumberChain;

        infinity(): NumberChain;

        integer(): NumberChain;

        lessThan(comparison: any): NumberChain;

        max(comparison: any): NumberChain;

        min(comparison: any): NumberChain;

        minusSign(): NumberChain;

        multiple(factor: any): NumberChain;

        negative(): NumberChain;

        notEquals(comparison: any): NumberChain;

        odd(): NumberChain;

        plusSign(): NumberChain;

        positive(): NumberChain;

        precision(precision: any): NumberChain;

        prime(): NumberChain;

        safe(): NumberChain;

        safeInteger(): NumberChain;

        signed(): NumberChain;

        unsigned(): NumberChain;

        zero(): NumberChain;

        clampBetween(min: any, max: any): NumberChain;

        constrain(min: any, max: any): NumberChain;

        negate(): NumberChain;

        round(numDecimals?: any): NumberChain;

        roundDown(): NumberChain;

        roundUp(): NumberChain;

        stripSign(): NumberChain;

        toPower(exponent: any): NumberChain;

        toScale(fromMin: any, fromMax: any, toMin: any, toMax: any): NumberChain;

        truncate(): NumberChain;

        abs(): NumberChain;

        ceil(): NumberChain;

        clamp(min: any, max: any): NumberChain;

        floor(): NumberChain;

        pow(exponent: any): NumberChain;

        scale(fromMin: any, fromMax: any, toMin: any, toMax: any): NumberChain;

}

declare module './NumberChain.ts' {
    interface NumberChain extends NumberChainGeneratedMethods {}
}

declare module './NumberChain.js' {
    interface NumberChain extends NumberChainGeneratedMethods {}
}

export { };
