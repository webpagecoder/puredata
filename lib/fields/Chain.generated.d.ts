// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/handlers/Handler.(js|ts) + lib/fields/Chain.ts
// Run: tsx ./generator/generate-arraychain-definitions.ts

interface ChainGeneratedMethods {
        equals(comparison: any): Chain;

        defined(): Chain;

        falsy(): Chain;

        notNull(): Chain;

        notOneOf(forbiddenValues?: any): Chain;

        null(): Chain;

        oneOf(allowedValues?: any): Chain;

        primitive(type?: any): Chain;

        instanceOf(constructor: any): Chain;

        truthy(): Chain;

        notDefined(): Chain;

        nullOrUndefined(): Chain;

        notEquals(comparison: any): Chain;

        custom(filterFn: any): Chain;

}

declare module './Chain.ts' {
    interface Chain extends ChainGeneratedMethods {}
}

declare module './Chain.js' {
    interface Chain extends ChainGeneratedMethods {}
}

export { };
