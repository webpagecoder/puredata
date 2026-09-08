// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/fields/any/AnyHandler.ts + lib/fields/any/AnyChain.ts
// Run: npm run generate:chain-defs

import type { AnyHandler } from './AnyHandler.ts';

type DropFirst<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];

interface AnyChainGeneratedMethods {
    /**
    * Validates that a value matches one of the allowed values.
    * @param allowedValues Values that are accepted.
    * @returns A passing result when a match is found; otherwise a failing result.
    */
    anyOf(...args: DropFirst<Parameters<AnyHandler['anyOf']>>): AnyChain;

    /**
    * Executes a user-provided handler for custom validation or transformation.
    * If the callback returns a HandlerResult, that result is used directly.
    * Otherwise, the returned value is wrapped in a passing result.
    * @param filterFn Callback that validates and/or transforms the value.
    * @returns The callback result as-is when it is a HandlerResult; otherwise a passing result.
    */
    custom(...args: DropFirst<Parameters<AnyHandler['custom']>>): AnyChain;

    /**
    * Validates that a value is not undefined.
    * @returns A passing result when the value is defined; otherwise a failing result.
    */
    defined(...args: DropFirst<Parameters<AnyHandler['defined']>>): AnyChain;

    /**
    * Validates that a value is one of the configured empty values.
    * @param empties Values treated as empty. Defaults to null and undefined.
    * @returns A passing result when the value is considered empty; otherwise a failing result.
    */
    empty(...args: DropFirst<Parameters<AnyHandler['empty']>>): AnyChain;

    /**
    * Validates that a value is deeply equal to the provided comparison value.
    * @param comparison Value to compare against.
    * @returns A passing result when values are equal; otherwise a failing result.
    */
    equals(...args: DropFirst<Parameters<AnyHandler['equals']>>): AnyChain;

    /**
    * Validates that a value is falsy.
    * @returns A passing result for falsy values; otherwise a failing result.
    */
    falsy(...args: DropFirst<Parameters<AnyHandler['falsy']>>): AnyChain;

    /**
    * Validates that a value is an instance of the supplied constructor.
    * @param constructor Constructor function the value must be an instance of.
    * @returns A passing result when the instance check succeeds; otherwise a failing result.
    */
    instanceOf(...args: DropFirst<Parameters<AnyHandler['instanceOf']>>): AnyChain;

    /**
    * Validates that a value does not match any of the forbidden values.
    * @param forbiddenValues Values that are not allowed.
    * @returns A passing result when the value is not found; otherwise a failing result.
    */
    noneOf(...args: DropFirst<Parameters<AnyHandler['noneOf']>>): AnyChain;

    /**
    * Validates that a value is not one of the configured empty values.
    * @param empties Values treated as empty. Defaults to null and undefined.
    * @returns A passing result when the value is not considered empty; otherwise a failing result.
    */
    notEmpty(...args: DropFirst<Parameters<AnyHandler['notEmpty']>>): AnyChain;

    /**
    * Validates that a value is not deeply equal to the provided comparison value.
    * @param comparison Value to compare against.
    * @returns A passing result when values differ; otherwise a failing result.
    */
    notEquals(...args: DropFirst<Parameters<AnyHandler['notEquals']>>): AnyChain;

    /**
    * Validates that a value is not null.
    * @returns A passing result when the value is not null; otherwise a failing result.
    */
    notNull(...args: DropFirst<Parameters<AnyHandler['notNull']>>): AnyChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    notNullish(...args: DropFirst<Parameters<AnyHandler['notNullish']>>): AnyChain;

    /**
    * Validates that a value is null.
    * @returns A passing result when the value is null; otherwise a failing result.
    */
    null(...args: DropFirst<Parameters<AnyHandler['null']>>): AnyChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    nullish(...args: DropFirst<Parameters<AnyHandler['nullish']>>): AnyChain;

    /**
    * Validates primitive type expectations for a value.
    * When type is provided, the value must match that primitive type exactly.
    * When type is omitted, any primitive type is accepted.
    * @param type Optional primitive type to enforce.
    * @returns A passing result when type constraints are met; otherwise a failing result.
    */
    primitive(...args: DropFirst<Parameters<AnyHandler['primitive']>>): AnyChain;

    /**
    * Validates that a value is truthy.
    * @returns A passing result for truthy values; otherwise a failing result.
    */
    truthy(...args: DropFirst<Parameters<AnyHandler['truthy']>>): AnyChain;

    /**
    * Validates that a value is undefined.
    * @returns A passing result when the value is undefined; otherwise a failing result.
    */
    undefined(...args: DropFirst<Parameters<AnyHandler['undefined']>>): AnyChain;

}

declare module './AnyChain.ts' {
    interface AnyChain extends AnyChainGeneratedMethods {}
}

declare module './AnyChain.js' {
    interface AnyChain extends AnyChainGeneratedMethods {}
}

export {};
