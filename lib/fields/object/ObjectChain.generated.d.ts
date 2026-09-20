// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/fields/object/ObjectHandler.ts + lib/fields/object/ObjectChain.ts
// Run: npm run generate:chain-defs

import type { ObjectHandler } from './ObjectHandler.ts';

type DropFirst<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];

interface ObjectChainGeneratedMethods {
    /**
    * Validates that all but a specified number of provided paths exist.
    * @param count Number of paths that may be missing.
    * @param paths Candidate paths to evaluate.
    * @returns Returns the original object when all but the allowed number of paths are present; otherwise returns a validation error.
    */
    allOfButXOfPaths(...args: DropFirst<Parameters<ObjectHandler['allOfButXOfPaths']>>): ObjectChain;

    /**
    * Validates that all provided paths exist on an object.
    * @param paths Paths that must all exist.
    * @returns Returns the original object when all provided paths exist; otherwise returns a validation error.
    */
    allOfPaths(...args: DropFirst<Parameters<ObjectHandler['allOfPaths']>>): ObjectChain;

    /**
    * Validates that a value matches one of the allowed values.
    * @param allowedValues Values that are accepted.
    * @returns A passing result when a match is found; otherwise a failing result.
    */
    anyOf(...args: DropFirst<Parameters<ObjectHandler['anyOf']>>): ObjectChain;

    /**
    * Executes a user-provided handler for custom validation or transformation.
    * If the callback returns a HandlerResult, that result is used directly.
    * Otherwise, the returned value is wrapped in a passing result.
    * @param filterFn Callback that validates and/or transforms the value.
    * @returns The callback result as-is when it is a HandlerResult; otherwise a passing result.
    */
    custom(...args: DropFirst<Parameters<ObjectHandler['custom']>>): ObjectChain;

    /**
    * Validates that a value is not undefined.
    * @returns A passing result when the value is defined; otherwise a failing result.
    */
    defined(...args: DropFirst<Parameters<ObjectHandler['defined']>>): ObjectChain;

    /**
    * Validates that an object's depth matches an exact value.
    * @param depth Required depth value.
    * @returns Returns the original object when its depth matches exactly; otherwise returns a validation error.
    */
    depth(...args: DropFirst<Parameters<ObjectHandler['depth']>>): ObjectChain;

    /**
    * Validates that a value is considered empty for object use-cases.
    * @param empties Values that should be treated as empty.
    * @returns Returns the original value when it is considered empty for this object check; otherwise returns a validation error.
    */
    empty(...args: DropFirst<Parameters<ObjectHandler['empty']>>): ObjectChain;

    /**
    * Validates that a value is deeply equal to the provided comparison value.
    * @param comparison Value to compare against.
    * @returns A passing result when values are equal; otherwise a failing result.
    */
    equals(...args: DropFirst<Parameters<ObjectHandler['equals']>>): ObjectChain;

    /**
    * Validates that an object has exactly the provided paths and no extras.
    * @param paths Paths that must exactly match object path count and membership.
    * @returns Returns the original object when its paths exactly match the provided set; otherwise returns a validation error.
    */
    exactlyPaths(...args: DropFirst<Parameters<ObjectHandler['exactlyPaths']>>): ObjectChain;

    /**
    * Validates that a value is falsy.
    * @returns A passing result for falsy values; otherwise a failing result.
    */
    falsy(...args: DropFirst<Parameters<ObjectHandler['falsy']>>): ObjectChain;

    /**
    * Validates that a value is an instance of the supplied constructor.
    * @param constructor Constructor function the value must be an instance of.
    * @returns A passing result when the instance check succeeds; otherwise a failing result.
    */
    instanceOf(...args: DropFirst<Parameters<ObjectHandler['instanceOf']>>): ObjectChain;

    /**
    * Validates that an object has an exact number of top-level keys.
    * @param keyCount Required top-level key count.
    * @returns Returns the original object when top-level key count matches exactly; otherwise returns a validation error.
    */
    keyCount(...args: DropFirst<Parameters<ObjectHandler['keyCount']>>): ObjectChain;

    /**
    * Validates that an object has an exact recursive key count.
    * @param keyCount Required recursive key count.
    * @returns Returns the original object when recursive key count matches exactly; otherwise returns a validation error.
    */
    nestedKeyCount(...args: DropFirst<Parameters<ObjectHandler['nestedKeyCount']>>): ObjectChain;

    /**
    * Validates that an object's depth does not exceed a maximum.
    * @param maxDepth Maximum allowed depth.
    * @returns Returns the original object when its depth is not greater than the maximum; otherwise returns a validation error.
    */
    maxDepth(...args: DropFirst<Parameters<ObjectHandler['maxDepth']>>): ObjectChain;

    /**
    * Validates that the number of top-level keys does not exceed a maximum.
    * @param maxKeyCount Maximum allowed top-level key count.
    * @returns Returns the original object when top-level key count is within the maximum; otherwise returns a validation error.
    */
    maxKeyCount(...args: DropFirst<Parameters<ObjectHandler['maxKeyCount']>>): ObjectChain;

    /**
    * Validates that the total recursive key count does not exceed a maximum.
    * @param maxKeyCount Maximum allowed recursive key count.
    * @returns Returns the original object when recursive key count is within the maximum; otherwise returns a validation error.
    */
    maxNestedKeyCount(...args: DropFirst<Parameters<ObjectHandler['maxNestedKeyCount']>>): ObjectChain;

    /**
    * Validates that an object's depth meets a minimum.
    * @param minDepth Minimum required depth.
    * @returns Returns the original object when its depth is at least the minimum; otherwise returns a validation error.
    */
    minDepth(...args: DropFirst<Parameters<ObjectHandler['minDepth']>>): ObjectChain;

    /**
    * Validates that the number of top-level keys meets a minimum.
    * @param minKeyCount Minimum required top-level key count.
    * @returns Returns the original object when top-level key count is at least the minimum; otherwise returns a validation error.
    */
    minKeyCount(...args: DropFirst<Parameters<ObjectHandler['minKeyCount']>>): ObjectChain;

    /**
    * Validates that the total recursive key count meets a minimum.
    * @param minKeyCount Minimum required recursive key count.
    * @returns Returns the original object when recursive key count is at least the minimum; otherwise returns a validation error.
    */
    minNestedKeyCount(...args: DropFirst<Parameters<ObjectHandler['minNestedKeyCount']>>): ObjectChain;

    /**
    * Validates that a value does not match any of the forbidden values.
    * @param forbiddenValues Values that are not allowed.
    * @returns A passing result when the value is not found; otherwise a failing result.
    */
    noneOf(...args: DropFirst<Parameters<ObjectHandler['noneOf']>>): ObjectChain;

    /**
    * Validates that none of the provided paths exist on an object.
    * @param paths Paths that must all be absent.
    * @returns Returns the original object when none of the provided paths exist; otherwise returns a validation error.
    */
    noneOfPaths(...args: DropFirst<Parameters<ObjectHandler['noneOfPaths']>>): ObjectChain;

    /**
    * Validates that a value is not considered empty for object use-cases.
    * @param empties Values that should be treated as empty.
    * @returns Returns the original value when it is considered not empty for this object check; otherwise returns a validation error.
    */
    notEmpty(...args: DropFirst<Parameters<ObjectHandler['notEmpty']>>): ObjectChain;

    /**
    * Validates that a value is not deeply equal to the provided comparison value.
    * @param comparison Value to compare against.
    * @returns A passing result when values differ; otherwise a failing result.
    */
    notEquals(...args: DropFirst<Parameters<ObjectHandler['notEquals']>>): ObjectChain;

    /**
    * Validates that a value is not null.
    * @returns A passing result when the value is not null; otherwise a failing result.
    */
    notNull(...args: DropFirst<Parameters<ObjectHandler['notNull']>>): ObjectChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    notNullish(...args: DropFirst<Parameters<ObjectHandler['notNullish']>>): ObjectChain;

    /**
    * Validates that a value is null.
    * @returns A passing result when the value is null; otherwise a failing result.
    */
    null(...args: DropFirst<Parameters<ObjectHandler['null']>>): ObjectChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    nullish(...args: DropFirst<Parameters<ObjectHandler['nullish']>>): ObjectChain;

    /**
    * Validates that an object's existing paths are a subset of the provided paths.
    * @param paths Allowed paths.
    * @returns Returns the original object when existing paths stay within the allowed set; otherwise returns a validation error.
    */
    onlyPaths(...args: DropFirst<Parameters<ObjectHandler['onlyPaths']>>): ObjectChain;

    /**
    * Validates that an object has at least one path outside the provided set.
    * @param paths Paths that should not be the complete set of object paths.
    * @returns Returns the original object when at least one path exists outside the provided set; otherwise returns a validation error.
    */
    pathsOtherThan(...args: DropFirst<Parameters<ObjectHandler['pathsOtherThan']>>): ObjectChain;

    /**
    * Returns a new object containing a random subset of keys.
    * @param count Number of keys to keep in the returned object.
    * @returns Returns a new object containing up to the requested number of randomly selected keys.
    */
    pickRandom(...args: DropFirst<Parameters<ObjectHandler['pickRandom']>>): ObjectChain;

    /**
    * Validates that a value is a plain object.
    * @returns Returns the original value when it is a plain object; otherwise returns a validation error.
    */
    plain(...args: DropFirst<Parameters<ObjectHandler['plain']>>): ObjectChain;

    /**
    * Validates primitive type expectations for a value.
    * When type is provided, the value must match that primitive type exactly.
    * When type is omitted, any primitive type is accepted.
    * @param type Optional primitive type to enforce.
    * @returns A passing result when type constraints are met; otherwise a failing result.
    */
    primitive(...args: DropFirst<Parameters<ObjectHandler['primitive']>>): ObjectChain;

    /**
    * Validates that an object has a defined value at the specified property key.
    * @param property Property name to check.
    * @returns Returns the original object when the property exists with a defined value; otherwise returns a validation error.
    */
    property(...args: DropFirst<Parameters<ObjectHandler['property']>>): ObjectChain;

    /**
    * Returns a new object containing only the specified keys.
    * @param exceptFor Keys to keep.
    * @returns Returns a new object containing only the keys listed in exceptFor.
    */
    stripKeys(...args: DropFirst<Parameters<ObjectHandler['stripKeys']>>): ObjectChain;

    /**
    * Removes all provided paths from an object in place.
    * @param paths Paths to remove.
    * @returns Returns the same object after attempting to remove each provided path.
    */
    stripPaths(...args: DropFirst<Parameters<ObjectHandler['stripPaths']>>): ObjectChain;

    /**
    * Removes top-level keys whose values are in the provided values list.
    * @param values Values that should be removed.
    * @returns Returns a new object with top-level keys removed when their values are in the provided list.
    */
    stripValues(...args: DropFirst<Parameters<ObjectHandler['stripValues']>>): ObjectChain;

    /**
    * Recursively removes keys whose values are in the provided values list.
    * @param values Values that should be removed.
    * @returns Returns a new object with empty values removed recursively through nested plain objects.
    */
    stripNestedValues(...args: DropFirst<Parameters<ObjectHandler['stripNestedValues']>>): ObjectChain;

    /**
    * Renames object keys using a pattern replacement.
    * @param searchVal Pattern to match in each key.
    * @param replaceVal Replacement used for matched key segments.
    * @param deleteOriginalKey Whether to delete the original key after renaming.
    * @param overrideExistingKey Whether to overwrite an existing key if the renamed key already exists.
    * @returns Returns a new object with keys renamed according to the provided pattern and options.
    */
    renameKeys(...args: DropFirst<Parameters<ObjectHandler['renameKeys']>>): ObjectChain;

    /**
    * Sets multiple object paths to corresponding values.
    * @param pathValues Mapping of path strings to values.
    * @param overwrite Whether existing values may be overwritten.
    * @param create Whether missing path segments may be created.
    * @returns Returns the same object after attempting to set each provided path/value pair.
    */
    setValues(...args: DropFirst<Parameters<ObjectHandler['setValues']>>): ObjectChain;

    /**
    * Validates that at least one of the provided paths exists on an object.
    * @param paths Candidate paths where at least one must exist.
    * @returns Returns the original object when at least one provided path exists; otherwise returns a validation error.
    */
    someOfPaths(...args: DropFirst<Parameters<ObjectHandler['someOfPaths']>>): ObjectChain;

    /**
    * Validates that a value is truthy.
    * @returns A passing result for truthy values; otherwise a failing result.
    */
    truthy(...args: DropFirst<Parameters<ObjectHandler['truthy']>>): ObjectChain;

    /**
    * Validates that a value is undefined.
    * @returns A passing result when the value is undefined; otherwise a failing result.
    */
    undefined(...args: DropFirst<Parameters<ObjectHandler['undefined']>>): ObjectChain;

    /**
    * Validates that exactly a specific number of provided paths exist.
    * @param count Exact number of matching paths required.
    * @param paths Candidate paths to count.
    * @returns Returns the original object when exactly the requested number of paths are present; otherwise returns a validation error.
    */
    xOfPaths(...args: DropFirst<Parameters<ObjectHandler['xOfPaths']>>): ObjectChain;

}

declare module './ObjectChain.ts' {
    interface ObjectChain extends ObjectChainGeneratedMethods {}
}

declare module './ObjectChain.js' {
    interface ObjectChain extends ObjectChainGeneratedMethods {}
}

export {};
