'use strict';

import { Path } from '../../Path.ts';
import { ChainHandlerResult } from '../ChainHandlerResult.ts';
import { Utils } from '../../Utils.ts';
import { ChainHandler } from '../ChainHandler.ts';
const { pass, fail } = ChainHandlerResult;

type SortComparator = (a: unknown, b: unknown) => number;
type EqualityComparator = (a: unknown, b: unknown) => boolean;
type PathOrSortComparator = Path | SortComparator | null;
type PathOrEqualityComparator = Path | EqualityComparator | null;
type ArrayFilter = (value: unknown, index: number, array: unknown[]) => boolean;
type ArrayMapper = (value: unknown, index: number, array: unknown[]) => unknown;

/**
 * Compares two values using natural ordering semantics.
 * @param a Left value.
 * @param b Right value.
 * @returns 1 when a > b, -1 when a < b, otherwise 0.
 */
function compareValues(a: any, b: any): number {
    if (a > b) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    return 0;
}

/**
 * Builds a comparator for array sorting and uniqueness operations.
 * @param order Sort direction where 1 is ascending and -1 is descending.
 * @param pathOrSortComparator Optional path extractor or custom comparator.
 * If a path is provided, values at that path will be compared. 
 * If a comparator is provided, it will be used directly, ignoring the order parameter. 
 * If neither is provided, natural ordering will be used.
 * @returns Comparator function for two values.
 */
function getSorter(order: number = 1, pathOrSortComparator: PathOrSortComparator = null): SortComparator {
    if (typeof pathOrSortComparator === 'function') {
        return pathOrSortComparator;
    }
    else if (pathOrSortComparator instanceof Path) {
        return (a, b): number => {
            const aValue = Utils.getPathValue(a, pathOrSortComparator);
            const bValue = Utils.getPathValue(b, pathOrSortComparator);
            return order * compareValues(aValue, bValue);
        };
    }
    else {
        return (a, b): number => order * compareValues(a, b);
    }
}


/**
 * Recursively validates that a nested array matches the expected size at each dimension level.
 * @param arr Array to validate at the current depth.
 * @param dimensions Expected length at each dimension level.
 * @param index Current dimension index being validated.
 */
function dimensionsRecursive(arr: unknown[], dimensions: number[], index: number = 0): ChainHandlerResult {
    if (arr.length !== dimensions[index]) {
        return fail(arr, "array/dimensions", { dimensions });
    }
    ++index;
    if (index < dimensions.length) {
        for (const item of arr) {
            if (!Array.isArray(item) || dimensionsRecursive(item, dimensions, index).fail) {
                return fail(arr, "array/dimensions", { dimensions });
            }
        }
    }
    return pass(arr);
}

class ArrayHandler extends ChainHandler {

    // ====================================
    // VALIDATORS 
    // ====================================

    // public format(value: unknown): ChainHandlerResult {
    //     return Array.isArray(value) ? pass(value) : fail(value, 'array/base');
    // }

    /**
     * Validates that the array contains every required value.
     * @param arr Array being validated.
     * @param requiredValues Values that must all exist in the array.
     * @returns Pass result when all values are present, otherwise failure details.
     */
    public allOf(arr: unknown[], requiredValues: unknown[] = []): ChainHandlerResult {
        checkRequired: for (const requiredValue of requiredValues) {
            for (const entry of arr) {
                if (Utils.areEqual(entry, requiredValue)) {
                    continue checkRequired;
                }
            }
            return fail(arr, 'array/allOf', {
                requiredValues,
                missingValue: requiredValue
            });
        }
        return pass(arr);
    }

    /**
     * Validates that a nested array matches the provided dimensions.
     * @param arr Array being validated.
     * @param dimensions Expected dimensions for each array depth.
     * @returns Pass result when dimensions match, otherwise failure details.
     */
    public dimensions(arr: unknown[], dimensions: number[]): ChainHandlerResult {
        return dimensionsRecursive(arr, dimensions, 0);
    }

    /**
     * Validates that the array is empty.
     * @param arr Array being validated.
     * @returns Pass result when the array has no items.
     */
    public empty(arr: unknown[]): ChainHandlerResult {
        return arr.length === 0
            ? pass(arr)
            : fail(arr, 'array/empty', {
                length: arr.length
            });
    }

    /**
     * Validates that the array contains exactly the required values.
     * @param arr Array being validated.
     * @param requiredValues Values the array must contain, disregarding order.
     * @returns Pass result when contents match exactly.
     */
    public exactly(arr: unknown[], requiredValues: unknown[] = []): ChainHandlerResult {
        const length = arr.length;
        const expectedLength = requiredValues.length;
        if (length !== expectedLength) {
            return fail(arr, 'array/exactly', {
                requiredValues
            });
        }
        const arrCopy = [...arr];
        checkRequired: for (const requiredValue of requiredValues) {
            for (let i = 0, len = arrCopy.length; i < len; i++) {
                if (Utils.areEqual(arrCopy[i], requiredValue)) {
                    arrCopy.splice(i, 1);
                    continue checkRequired;
                }
            }
            return fail(arr, 'array/exactly', {
                requiredValues,
            });
        }
        return pass(arr);
    }

    /**
     * Validates that the array length matches the required length.
     * @param arr Array being validated.
     * @param requiredLength Exact required array length.
     * @returns Pass result when the length matches.
     */
    // @ts-expect-error Runtime API requires public method name `length`.
    public length(arr: unknown[], requiredLength: number): ChainHandlerResult {
        return arr.length === requiredLength
            ? pass(arr)
            : fail(arr, 'array/length', {
                length: arr.length,
                requiredLength
            });
    }

    /**
     * Validates that the array length falls within the provided inclusive range.
     * @param arr Array being validated.
     * @param min Inclusive minimum length.
     * @param max Inclusive maximum length.
     * @returns Pass result when the length is within range.
     */
    public lengthBetween(arr: unknown[], min: number, max: number): ChainHandlerResult {
        const length = arr.length;
        if (length < min || length > max) {
            return fail(arr, 'array/lengthBetween', {
                length,
                min,
                max
            });
        }
        return pass(arr);
    }

    /**
     * Validates that the array length does not exceed the provided maximum.
     * @param arr Array being validated.
     * @param max Maximum allowed length.
     * @returns Pass result when the array length is at most the maximum.
     */
    public maxLength(arr: unknown[], max: number): ChainHandlerResult {
        return arr.length <= max
            ? pass(arr)
            : fail(arr, 'array/maxLength', {
                length: arr.length,
                max
            });
    }

    /**
     * Validates that the array length meets the provided minimum.
     * @param arr Array being validated.
     * @param min Minimum allowed length.
     * @returns Pass result when the array length is at least the minimum.
     */
    public minLength(arr: unknown[], min: number): ChainHandlerResult {
        return arr.length >= min
            ? pass(arr)
            : fail(arr, 'array/minLength', {
                length: arr.length,
                min
            });
    }

    /**
     * Validates that the array contains none of the forbidden values.
     * @param arr Array being validated.
     * @param forbiddenValues Values that must not appear in the array.
     * @returns Pass result when no forbidden values are found.
     */
    public noneOf(arr: unknown[], forbiddenValues: unknown[] = []): ChainHandlerResult {
        for (const forbiddenValue of forbiddenValues) {
            for (let i = 0, len = arr.length; i < len; i++) {
                const value = arr[i];
                if (Utils.areEqual(value, forbiddenValue)) {
                    return fail(arr, 'array/noneOf', {
                        forbiddenValues,
                        index: i,
                        invalidValue: value
                    });
                }
            }
        }
        return pass(arr);
    }

    /**
     * Validates that the array contains at least one item.
     * @param arr Array being validated.
     * @returns Pass result when the array is not empty.
     */
    public notEmpty(arr: unknown[]): ChainHandlerResult {
        return arr.length > 0
            ? pass(arr)
            : fail(arr, 'array/notEmpty');
    }

    /**
     * Validates that every array entry belongs to the allowed set.
     * @param arr Array being validated.
     * @param allowedValues Values permitted in the array.
     * @returns Pass result when every entry is allowed.
     */
    public only(arr: unknown[], allowedValues: unknown[] = []): ChainHandlerResult {
        checkValues: for (let i = 0, len = arr.length; i < len; i++) {
            const value = arr[i];
            for (const allowedValue of allowedValues) {
                if (Utils.areEqual(value, allowedValue)) {
                    continue checkValues;
                }
            }
            return fail(arr, 'array/only', {
                allowedValues,
                index: i,
                invalidValue: value
            });
        }
        return pass(arr);
    }

    /**
     * Validates that the array contains at least one value outside the forbidden set.
     * @param arr Array being validated.
     * @param forbiddenValues Values the array must not consist exclusively of.
     * @returns Pass result when at least one entry is different.
     */
    public otherThan(arr: unknown[], forbiddenValues: unknown[] = []): ChainHandlerResult {
        if (forbiddenValues.length === 0) {
            return pass(arr);
        }
        for (const value of forbiddenValues) {
            let found = false;
            for (let i = 0, len = arr.length; i < len; i++) {
                if (Utils.areEqual(arr[i], value)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return pass(arr);
            }
        }
        return fail(arr, 'array/otherThan', {
            forbiddenValues,
        });
    }

    /**
     * Validates that the array contains at least one of the possible values.
     * @param arr Array being validated.
     * @param possibleValues Candidate values to look for.
     * @returns Pass result when any candidate value is present.
     */
    public someOf(arr: unknown[], possibleValues: unknown[] = []): ChainHandlerResult {
        if (possibleValues.length === 0) {
            return pass(arr);
        }
        for (const value of possibleValues) {
            for (const entry of arr) {
                if (Utils.areEqual(entry, value)) {
                    return pass(arr);
                }
            }
        }
        return fail(arr, 'array/someOf', { possibleValues });
    }

    /**
     * Validates that the array is sorted in ascending order.
     * @param arr Array being validated.
     * @param pathOrSortComparator Optional path or comparator to determine ordering.
     * If a path is provided, values at that path will be compared. 
 * If a comparator is provided, it will be used directly, ignoring the order parameter. 
 * If neither is provided, natural ordering will be used.
     * @returns Pass result when the array is sorted.
     */
    public sorted(arr: unknown[], pathOrSortComparator: PathOrSortComparator = null): ChainHandlerResult {
        const sorter = getSorter(1, pathOrSortComparator);
        for (let i = 1, len = arr.length; i < len; i++) {
            if (sorter(arr[i - 1], arr[i]) > 0) {
                return fail(arr, 'array/sorted', {
                    index: i,
                    invalidValue: arr[i]
                });
            }
        }
        return pass(arr);
    }

    /**
     * Validates that the array matches the provided tuple values in order.
     * @param arr Array being validated.
     * @param tupleValues Expected values at each index.
     * @returns Pass result when the tuple matches.
     */
    public tuple(arr: unknown[], tupleValues: unknown[] = []): ChainHandlerResult {
        if (arr.length !== tupleValues.length) {
            return fail(arr, 'array/tuple', { tupleValues });
        }
        for (let i = 0, len = tupleValues.length; i < len; i++) {
            const value = arr[i];
            const expectedValue = tupleValues[i];
            if (!Utils.areEqual(value, expectedValue)) {
                return fail(arr, 'array/tuple', {
                    tupleValues,
                    index: i,
                    invalidValue: value,
                    expectedValue
                });
            }
        }
        return pass(arr);
    }

    /**
     * Alias for only, preserving the same validation behavior.
     * @param arr Array being validated.
     * @param allowedValues Values the array must only contain.
     * @returns Result from the only validator.
     */
    public type(arr: unknown[], allowedValues: unknown[] = []): ChainHandlerResult {
        return this.only(arr, allowedValues);
    }

    /**
     * Validates that the array contains no duplicate values.
     * @param arr Array being validated.
     * @param pathOrEqualityComparator Optional path or comparator used to compare entries.
     * @returns Pass result when all values are unique.
     */
    public unique(arr: unknown[], pathOrEqualityComparator: PathOrEqualityComparator = null): ChainHandlerResult {
        const comparator: EqualityComparator = typeof pathOrEqualityComparator === 'function'
            ? pathOrEqualityComparator
            : (a, b): boolean => !Utils.areEqual(a, b);

        const path: Path | null = pathOrEqualityComparator instanceof Path
            ? pathOrEqualityComparator
            : null;

        for (let y = 0; y < arr.length - 1; y++) {
            const a = path
                ? Utils.getPathValue(arr[y], path)
                : arr[y];

            for (let z = y + 1; z < arr.length; z++) {
                const b = path
                    ? Utils.getPathValue(arr[z], path)
                    : arr[z];

                if (!comparator(a, b)) {
                    return fail(arr, 'array/unique', {
                        index1: y,
                        index2: z,
                        duplicateValue: a
                    });
                }
            }
        }
        return pass(arr);
    }

    // ====================================
    // MUTATORS 
    // ====================================

    /**
     * Appends values to the end of the array.
     * @param arr Source array.
     * @param values Values to append.
     * @returns Pass result containing the extended array.
     */
    public add(arr: unknown[], values: unknown[] = []): ChainHandlerResult {
        return pass([...arr, ...values]);
    }

    /**
     * Splits the array into equally sized chunks plus any partially remaining chunk.
     * @param arr Source array.
     * @param length Maximum size of each chunk.
     * @returns Pass result containing the chunked array.
     */
    public chunk(arr: unknown[], length: number): ChainHandlerResult {
        const allChunks: unknown[][] = [];
        let newChunk: unknown[] = [];
        if (length >= arr.length) {
            return pass(arr.length === 0 ? [] : [[...arr]]);
        }
        for (const item of arr) {
            newChunk.push(item);
            if (newChunk.length % length === 0) {
                allChunks.push(newChunk);
                newChunk = [];
            }
        }
        if (newChunk.length) {
            allChunks.push(newChunk);
        }
        return pass(allChunks);
    }

    /**
     * Filters the array using the provided predicate.
     * @param arr Source array.
     * @param filter Predicate function used by Array.prototype.filter.
     * @returns Pass result containing the filtered array.
     */
    public filter(arr: unknown[], filter: ArrayFilter): ChainHandlerResult {
        return pass(arr.filter(filter));
    }

    /**
     * Recursively flattens nested arrays into a single-level array.
     * @param arr Source array.
     * @returns Pass result containing the flattened array.
     */
    public flatten(arr: unknown[]): ChainHandlerResult {
        const flattened: unknown[] = [];
        for (const item of arr) {
            if (Array.isArray(item)) {
                const innerFlatten = this.flatten(item as unknown[]).value as unknown[];
                flattened.push(...innerFlatten);
            } else {
                flattened.push(item);
            }
        }
        return pass(flattened);
    }

    /**
     * Groups array entries by value or by a value at the provided path.
     * @param arr Source array.
     * @param path Optional path used to compute each group key.
     * @returns Pass result containing grouped entries.
     */
    public group(arr: unknown[], path: Path | null = null): ChainHandlerResult {
        const groups = new Map<unknown, unknown[]>();
        for (const value of arr) {
            const mapKey = path ? Utils.getPathValue(value, path) : value;
            if (!groups.has(mapKey)) {
                groups.set(mapKey, []);
            }
            groups.get(mapKey)?.push(value);
        }

        const finalGroups: unknown[][] = [];
        for (const [, group] of groups) {
            finalGroups.push(group);
        }
        return pass(finalGroups);
    }

    /**
     * Keeps only entries that match one of the allowed values.
     * @param arr Source array.
     * @param allowedValues Values to keep.
     * @returns Pass result containing the filtered array.
     */
    public keep(arr: unknown[], allowedValues: unknown[] = []): ChainHandlerResult {
        const filtered: unknown[] = [];
        for (const entry of arr) {
            for (const value of allowedValues) {
                if (Utils.areEqual(entry, value)) {
                    filtered.push(entry);
                }
            }
        }
        return pass(filtered);
    }

    /**
     * Maps array entries using the provided transform function.
     * @param arr Source array.
     * @param map Mapping function used by Array.prototype.map.
     * @returns Pass result containing the mapped array.
     */
    public map(arr: unknown[], map: ArrayMapper): ChainHandlerResult {
        return pass(arr.map(map));
    }

    /**
     * Pads the array to a target length using the provided value.
     * @param arr Source array.
     * @param targetLength Desired minimum array length.
     * @param padValue Value appended until the target length is reached.
     * @returns Pass result containing the padded array.
     */
    public padEnd(arr: unknown[], targetLength: number, padValue: unknown = null): ChainHandlerResult {
        if (arr.length >= targetLength) {
            return pass([...arr]);
        }
        const padded = [...arr];
        while (padded.length < targetLength) {
            padded.push(padValue);
        }
        return pass(padded);
    }

    /**
     * Picks a random subset of values from the array without replacement.
     * @param arr Source array.
     * @param count Number of items to pick.
     * @returns Pass result containing the randomly selected items.
     */
    public pickRandom(arr: unknown[], count: number = 1): ChainHandlerResult {
        const arrCopy = [...arr];
        const random: unknown[] = [];
        if (count > arrCopy.length) {
            count = arrCopy.length;
        }
        while (count > 0) {
            random.push(
                arrCopy.splice(
                    Math.floor(Math.random() * arrCopy.length),
                    1
                )[0]
            );
            --count;
        }
        return pass(random);
    }

    /**
     * Removes all entries that match one of the forbidden values.
     * @param arr Source array.
     * @param forbiddenValues Values to remove.
     * @returns Pass result containing the filtered array.
     */
    public remove(arr: unknown[], forbiddenValues: unknown[] = []): ChainHandlerResult {
        const filtered: unknown[] = [];
        for (const entry of arr) {
            let isAllowed = true;
            for (const value of forbiddenValues) {
                if (Utils.areEqual(entry, value)) {
                    isAllowed = false;
                    break;
                }
            }
            if (isAllowed) {
                filtered.push(entry);
            }
        }
        return pass(filtered);
    }

    /**
     * Removes duplicate array entries, optionally by path or custom comparator.
     * @param arr Source array.
     * @param pathOrSortComparator Optional path or comparator used to compare entries.
     * @returns Pass result containing the deduplicated array.
     */
    public removeDuplicates(arr: unknown[], pathOrSortComparator: PathOrEqualityComparator = null): ChainHandlerResult {
        const comparator: EqualityComparator = typeof pathOrSortComparator === 'function'
            ? pathOrSortComparator
            : (a, b): boolean => !Utils.areEqual(a, b);
        const path: Path | null = pathOrSortComparator instanceof Path
            ? pathOrSortComparator
            : null;

        const filteredArr: unknown[] = [...arr];

        for (let y = 0; y < filteredArr.length - 1; y++) {
            const a = path
                ? Utils.getPathValue(filteredArr[y], path)
                : filteredArr[y];

            for (let z = y + 1; z < filteredArr.length; z++) {
                const b = path
                    ? Utils.getPathValue(filteredArr[z], path)
                    : filteredArr[z];

                if (!comparator(a, b)) {
                    filteredArr.splice(z, 1);
                    z--;
                }
            }
        }

        return pass(filteredArr);
    }

    /**
     * Removes empty values from the array.
     * @param arr Source array.
     * @param emptyValues Values treated as empty.
     * @returns Pass result containing the filtered array.
     */
    public removeEmpties(arr: unknown[], emptyValues: unknown[] = [null, undefined, '']): ChainHandlerResult {
        return this.remove(arr, emptyValues);
    }

    /**
     * Removes undefined values from the array.
     * @param arr Source array.
     * @returns Pass result containing the filtered array.
     */
    public removeUndefined(arr: unknown[]): ChainHandlerResult {
        return this.remove(arr, [undefined]);
    }

    /**
     * Reverses the order of the array.
     * @param arr Source array.
     * @returns Pass result containing the reversed array.
     */
    public reverse(arr: unknown[]): ChainHandlerResult {
        return pass([...arr].reverse());
    }

    /**
     * Randomly shuffles the array.
     * @param arr Source array.
     * @returns Pass result containing the shuffled array.
     */
    public shuffle(arr: unknown[]): ChainHandlerResult {
        const arrCopy = [...arr];
        const random: unknown[] = [];
        while (arrCopy.length > 0) {
            random.push(
                arrCopy.splice(
                    Math.floor(Math.random() * arrCopy.length),
                    1
                )[0]
            );
        }
        return pass(random);
    }

    /**
     * Extracts a slice of the array.
     * @param arr Source array.
     * @param startIndex Inclusive start index.
     * @param endIndex Exclusive end index.
     * @returns Pass result containing the sliced array.
     */
    public slice(arr: unknown[], startIndex: number, endIndex?: number): ChainHandlerResult {
        return pass(arr.slice(startIndex, endIndex));
    }

    /**
     * Takes the first count entries from the array.
     * @param arr Source array.
     * @param count Number of items to take.
     * @returns Pass result containing the leading slice.
     */
    public sliceFirst(arr: unknown[], count: number = 1): ChainHandlerResult {
        return pass(arr.slice(0, count));
    }

    /**
     * Takes the last count entries from the array.
     * @param arr Source array.
     * @param count Number of items to take.
     * @returns Pass result containing the trailing slice.
     */
    public sliceLast(arr: unknown[], count: number = 1): ChainHandlerResult {
        return pass(arr.slice(-count));
    }

    /**
     * Splices the array by removing and optionally inserting values.
     * @param arr Source array.
     * @param startIndex Index at which to begin changes.
     * @param deleteCount Number of items to remove.
     * @param insertValues Values to insert at the start index.
     * @returns Pass result containing the spliced array.
     */
    public splice(arr: unknown[], startIndex: number, deleteCount: number = 0, insertValues: unknown[] = []): ChainHandlerResult {
        const arrCopy = [...arr];
        arrCopy.splice(startIndex, deleteCount, ...insertValues);
        return pass(arrCopy);
    }

    /**
     * Sorts the array in ascending order.
     * @param arr Source array.
     * @param pathOrSortComparator Optional path or comparator used for sorting.
     * If a path is provided, values at that path will be compared. 
     * If a comparator is provided, it will be used directly, ignoring the order parameter. 
     * If neither is provided, natural ordering will be used.
     * @returns Pass result containing the sorted array.
     */
    public sortAsc(arr: unknown[], pathOrSortComparator: PathOrSortComparator = null): ChainHandlerResult {
        return pass([...arr].sort(getSorter(1, pathOrSortComparator)));
    }

    /**
     * Sorts the array in descending order.
     * @param arr Source array.
     * @param pathOrSortComparator Optional path or comparator used for sorting.
     * If a path is provided, values at that path will be compared. 
     * If a comparator is provided, it will be used directly, ignoring the order parameter. 
     * If neither is provided, natural ordering will be used.
     * @returns Pass result containing the sorted array.
     */
    public sortDesc(arr: unknown[], pathOrSortComparator: PathOrSortComparator = null): ChainHandlerResult {
        return pass([...arr].sort(getSorter(-1, pathOrSortComparator)));
    }

}

export { ArrayHandler };


