// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: lib/fields/array/ArrayHandler.ts + lib/fields/array/ArrayChain.ts
// Run: npm run generate:chain-defs

import type { ArrayHandler } from './ArrayHandler.ts';

type DropFirst<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];

interface ArrayChainGeneratedMethods {
    /**
    * Appends values to the end of the array.
    * @param values Values to append.
    * @returns Returns the extended array.
    */
    add(...args: DropFirst<Parameters<ArrayHandler['add']>>): ArrayChain;

    /**
    * Validates that the array contains every required value.
    * @param requiredValues Values that must all exist in the array.
    * @returns Returns the original array when all values are present, otherwise failure details.
    */
    allOf(...args: DropFirst<Parameters<ArrayHandler['allOf']>>): ArrayChain;

    /**
    * Validates that the array contains at least one of the possible values.
    * @param possibleValues Candidate values to look for.
    * @returns Returns the original array when any candidate value is present.
    */
    anyOf(...args: DropFirst<Parameters<ArrayHandler['anyOf']>>): ArrayChain;

    /**
    * Splits the array into equally sized chunks plus any partially remaining chunk.
    * @param length Maximum size of each chunk.
    * @returns Returns the chunked array.
    */
    chunk(...args: DropFirst<Parameters<ArrayHandler['chunk']>>): ArrayChain;

    /**
    * Executes a user-provided handler for custom validation or transformation.
    * If the callback returns a HandlerResult, that result is used directly.
    * Otherwise, the returned value is wrapped in a passing result.
    * @param filterFn Callback that validates and/or transforms the value.
    * @returns The callback result as-is when it is a HandlerResult; otherwise a passing result.
    */
    custom(...args: DropFirst<Parameters<ArrayHandler['custom']>>): ArrayChain;

    /**
    * Validates that a value is not undefined.
    * @returns A passing result when the value is defined; otherwise a failing result.
    */
    defined(...args: DropFirst<Parameters<ArrayHandler['defined']>>): ArrayChain;

    /**
    * Validates that a nested array matches the provided dimensions.
    * @param dimensions Expected dimensions for each array depth.
    * @returns Returns the original array when dimensions match, otherwise failure details.
    */
    dimensions(...args: DropFirst<Parameters<ArrayHandler['dimensions']>>): ArrayChain;

    /**
    * Validates that the array is empty.
    * @returns Returns the original array when the array has no items.
    */
    empty(...args: DropFirst<Parameters<ArrayHandler['empty']>>): ArrayChain;

    /**
    * Validates that a value is deeply equal to the provided comparison value.
    * @param comparison Value to compare against.
    * @returns A passing result when values are equal; otherwise a failing result.
    */
    equals(...args: DropFirst<Parameters<ArrayHandler['equals']>>): ArrayChain;

    /**
    * Validates that the array contains exactly the required values.
    * @param requiredValues Values the array must contain, disregarding order.
    * @returns Returns the original array when contents match exactly.
    */
    exactly(...args: DropFirst<Parameters<ArrayHandler['exactly']>>): ArrayChain;

    /**
    * Validates that a value is falsy.
    * @returns A passing result for falsy values; otherwise a failing result.
    */
    falsy(...args: DropFirst<Parameters<ArrayHandler['falsy']>>): ArrayChain;

    /**
    * Filters the array using the provided predicate.
    * @param filter Filter function used by Array.prototype.filter.
    * @returns Returns the filtered array.
    */
    filter(...args: DropFirst<Parameters<ArrayHandler['filter']>>): ArrayChain;

    /**
    * Recursively flattens nested arrays into a single-level array.
    * @returns Returns the flattened array.
    */
    flatten(...args: DropFirst<Parameters<ArrayHandler['flatten']>>): ArrayChain;

    /**
    * Validates that a value is an instance of the supplied constructor.
    * @param constructor Constructor function the value must be an instance of.
    * @returns A passing result when the instance check succeeds; otherwise a failing result.
    */
    instanceOf(...args: DropFirst<Parameters<ArrayHandler['instanceOf']>>): ArrayChain;

    /**
    * Keeps only entries that match one of the allowed values.
    * @param allowedValues Values to keep.
    * @returns Returns the filtered array.
    */
    keep(...args: DropFirst<Parameters<ArrayHandler['keep']>>): ArrayChain;

    /**
    * Validates that the array length matches the required length.
    * @param requiredLength Exact required array length.
    * @returns Returns the original array when the length matches.
    */
    length(...args: DropFirst<Parameters<ArrayHandler['length']>>): ArrayChain;

    /**
    * Validates that the array length falls within the provided inclusive range.
    * @param min Inclusive minimum length.
    * @param max Inclusive maximum length.
    * @returns Returns the original array when the length is within range.
    */
    lengthBetween(...args: DropFirst<Parameters<ArrayHandler['lengthBetween']>>): ArrayChain;

    /**
    * Maps array entries using the provided transform function.
    * @param map Mapping function used by Array.prototype.map.
    * @returns Returns the mapped array.
    */
    map(...args: DropFirst<Parameters<ArrayHandler['map']>>): ArrayChain;

    /**
    * Validates that the array length does not exceed the provided maximum.
    * @param max Maximum allowed length.
    * @returns Returns the original array when the array length is at most the maximum.
    */
    maxLength(...args: DropFirst<Parameters<ArrayHandler['maxLength']>>): ArrayChain;

    /**
    * Validates that the array length meets the provided minimum.
    * @param min Minimum allowed length.
    * @returns Returns the original array when the array length is at least the minimum.
    */
    minLength(...args: DropFirst<Parameters<ArrayHandler['minLength']>>): ArrayChain;

    /**
    * Validates that the array contains none of the forbidden values.
    * @param forbiddenValues Values that must not appear in the array.
    * @returns Returns the original array when no forbidden values are found.
    */
    noneOf(...args: DropFirst<Parameters<ArrayHandler['noneOf']>>): ArrayChain;

    /**
    * Validates that the array contains at least one item.
    * @returns Returns the original array when the array is not empty.
    */
    notEmpty(...args: DropFirst<Parameters<ArrayHandler['notEmpty']>>): ArrayChain;

    /**
    * Validates that a value is not deeply equal to the provided comparison value.
    * @param comparison Value to compare against.
    * @returns A passing result when values differ; otherwise a failing result.
    */
    notEquals(...args: DropFirst<Parameters<ArrayHandler['notEquals']>>): ArrayChain;

    /**
    * Validates that a value is not null.
    * @returns A passing result when the value is not null; otherwise a failing result.
    */
    notNull(...args: DropFirst<Parameters<ArrayHandler['notNull']>>): ArrayChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    notNullish(...args: DropFirst<Parameters<ArrayHandler['notNullish']>>): ArrayChain;

    /**
    * Validates that a value is null.
    * @returns A passing result when the value is null; otherwise a failing result.
    */
    null(...args: DropFirst<Parameters<ArrayHandler['null']>>): ArrayChain;

    /**
    * Validates that a value is null or undefined.
    * @returns A passing result when the value is nullish; otherwise a failing result.
    */
    nullish(...args: DropFirst<Parameters<ArrayHandler['nullish']>>): ArrayChain;

    /**
    * Validates that every array entry belongs to the allowed set.
    * @param allowedValues Values permitted in the array.
    * @returns Returns the original array when every entry is allowed.
    */
    only(...args: DropFirst<Parameters<ArrayHandler['only']>>): ArrayChain;

    /**
    * Validates that the array contains at least one value outside the forbidden set.
    * @param forbiddenValues Values the array must not consist exclusively of.
    * @returns Returns the original array when at least one entry is different.
    */
    otherThan(...args: DropFirst<Parameters<ArrayHandler['otherThan']>>): ArrayChain;

    /**
    * Pads the array to a target length using the provided value.
    * @param targetLength Desired minimum array length.
    * @param padValue Value appended until the target length is reached.
    * @returns Returns the padded array.
    */
    padEnd(...args: DropFirst<Parameters<ArrayHandler['padEnd']>>): ArrayChain;

    /**
    * Picks a random subset of values from the array without replacement.
    * @param count Number of items to pick.
    * @returns Returns the randomly selected items.
    */
    pickRandom(...args: DropFirst<Parameters<ArrayHandler['pickRandom']>>): ArrayChain;

    /**
    * Validates primitive type expectations for a value.
    * When type is provided, the value must match that primitive type exactly.
    * When type is omitted, any primitive type is accepted.
    * @param type Optional primitive type to enforce.
    * @returns A passing result when type constraints are met; otherwise a failing result.
    */
    primitive(...args: DropFirst<Parameters<ArrayHandler['primitive']>>): ArrayChain;

    /**
    * Removes all entries that match one of the forbidden values.
    * @param forbiddenValues Values to remove.
    * @returns Returns the filtered array.
    */
    remove(...args: DropFirst<Parameters<ArrayHandler['strip']>>): ArrayChain;

    /**
    * Removes undefined values from the array.
    * @returns Returns the filtered array.
    */
    removeUndefined(...args: DropFirst<Parameters<ArrayHandler['stripUndefined']>>): ArrayChain;

    /**
    * Reverses the order of the array.
    * @returns Returns the reversed array.
    */
    reverse(...args: DropFirst<Parameters<ArrayHandler['reverse']>>): ArrayChain;

    /**
    * Randomly shuffles the array.
    * @returns Returns the shuffled array.
    */
    shuffle(...args: DropFirst<Parameters<ArrayHandler['shuffle']>>): ArrayChain;

    /**
    * Extracts a slice of the array.
    * @param startIndex Inclusive start index.
    * @param endIndex Exclusive end index.
    * @returns Returns the sliced array.
    */
    slice(...args: DropFirst<Parameters<ArrayHandler['slice']>>): ArrayChain;

    /**
    * Takes the first count entries from the array.
    * @param count Number of items to take.
    * @returns Returns the leading slice.
    */
    sliceFirst(...args: DropFirst<Parameters<ArrayHandler['sliceFirst']>>): ArrayChain;

    /**
    * Takes the last count entries from the array.
    * @param count Number of items to take.
    * @returns Returns the trailing slice.
    */
    sliceLast(...args: DropFirst<Parameters<ArrayHandler['sliceLast']>>): ArrayChain;

    /**
    * Sorts the array in ascending order.
    * @param pathOrSortComparator Optional path or comparator used for sorting.
    * If a path is provided, values at that path will be compared. 
    * If a comparator is provided, it will be used directly, ignoring the order parameter. 
    * If neither is provided, natural ordering will be used.
    * @returns Returns the sorted array.
    */
    sortAsc(...args: DropFirst<Parameters<ArrayHandler['sortAsc']>>): ArrayChain;

    /**
    * Sorts the array in descending order.
    * @param pathOrSortComparator Optional path or comparator used for sorting.
    * If a path is provided, values at that path will be compared. 
    * If a comparator is provided, it will be used directly, ignoring the order parameter. 
    * If neither is provided, natural ordering will be used.
    * @returns Returns the sorted array.
    */
    sortDesc(...args: DropFirst<Parameters<ArrayHandler['sortDesc']>>): ArrayChain;

    /**
    * Validates that the array is sorted in ascending order.
    * @param pathOrSortComparator Optional path or comparator to determine ordering.
    * If a path is provided, values at that path will be compared. 
    * If a comparator is provided, it will be used directly, ignoring the order parameter. 
    * If neither is provided, natural ordering will be used.
    * @returns Returns the original array when the array is sorted.
    */
    sorted(...args: DropFirst<Parameters<ArrayHandler['sorted']>>): ArrayChain;

    /**
    * Splices the array by removing and optionally inserting values.
    * @param startIndex Index at which to begin changes.
    * @param deleteCount Number of items to remove.
    * @param insertValues Values to insert at the start index.
    * @returns Returns the spliced array.
    */
    splice(...args: DropFirst<Parameters<ArrayHandler['splice']>>): ArrayChain;

    /**
    * Validates that a value is truthy.
    * @returns A passing result for truthy values; otherwise a failing result.
    */
    truthy(...args: DropFirst<Parameters<ArrayHandler['truthy']>>): ArrayChain;

    /**
    * Validates that the array matches the provided tuple values in order.
    * @param tupleValues Expected values at each index.
    * @returns Returns the original array when the tuple matches.
    */
    tuple(...args: DropFirst<Parameters<ArrayHandler['tuple']>>): ArrayChain;

    /**
    * Alias for only, preserving the same validation behavior.
    * @param allowedValues Values the array must only contain.
    * @returns Returns the same outcome as the only validator.
    */
    type(...args: DropFirst<Parameters<ArrayHandler['type']>>): ArrayChain;

    /**
    * Validates that a value is undefined.
    * @returns A passing result when the value is undefined; otherwise a failing result.
    */
    undefined(...args: DropFirst<Parameters<ArrayHandler['undefined']>>): ArrayChain;

}

declare module './ArrayChain.ts' {
    interface ArrayChain extends ArrayChainGeneratedMethods {}
}

declare module './ArrayChain.js' {
    interface ArrayChain extends ArrayChainGeneratedMethods {}
}

export {};
