'use strict';

import { Path } from '../Path.ts';
import { HandlerResult } from './HandlerResult.ts';
import { Utils } from '../utils/Utils.ts';
import { Handler } from './Handler.ts';
const { pass, fail } = HandlerResult;

type ArrayValue = unknown;
type ArrayValues = ArrayValue[];
type Dimensions = number[];
type SortComparator = (a: ArrayValue, b: ArrayValue) => number;
type EqualityComparator = (a: ArrayValue, b: ArrayValue) => boolean;
type PathOrSortComparator = Path | SortComparator | null;
type PathOrEqualityComparator = Path | EqualityComparator | null;
type ArrayFilter = (value: ArrayValue, index: number, array: ArrayValues) => boolean;
type ArrayMapper = (value: ArrayValue, index: number, array: ArrayValues) => ArrayValue;

function compareValues(a: ArrayValue, b: ArrayValue): number {
    const left = a as never;
    const right = b as never;

    if (left > right) {
        return 1;
    }
    if (left < right) {
        return -1;
    }
    return 0;
}

/**
 * Builds a comparator for array sorting and uniqueness operations.
 * @param {number} [order=1] Sort direction where 1 is ascending and -1 is descending.
 * @param {Path|Function|null} [pathOrComparator=null] Optional path extractor or custom comparator.
 * @returns {Function} Comparator function for two values.
 */
function getSorter(order: any= 1, pathOrComparator: PathOrSortComparator = null): SortComparator {
    let sorter: SortComparator;
    if (typeof pathOrComparator === 'function') {
        sorter = pathOrComparator;
    }
    else if (pathOrComparator instanceof Path) {
        sorter = (a, b): number => {
            const aValue = Utils.getPathValue(a, pathOrComparator);
            const bValue = Utils.getPathValue(b, pathOrComparator);
            return order * compareValues(aValue, bValue);
        };
    }
    else {
        sorter = (a, b): number => order * compareValues(a, b);
    }
    return sorter;
}

class ArrayHandler extends Handler {

    // ====================================
    // VALIDATORS 
    // ====================================

    /**
     * Validates that the array contains every required value.
     * @param {unknown[]} arr Array being validated.
     * @param {unknown[]} [requiredValues=[]] Values that must all exist in the array.
     * @returns {HandlerResult} Pass result when all values are present, otherwise failure details.
     */
    static allOf(arr: ArrayValues, requiredValues: ArrayValues = []): HandlerResult {
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
     * @param {unknown[]} arr Array being validated.
     * @param {number[]} dimensions Expected dimensions for each array depth.
     * @param {number} [index=0] Internal recursion index for the current dimension.
     * @returns {HandlerResult} Pass result when dimensions match, otherwise failure details.
     */
    static dimensions(arr: ArrayValues, dimensions: Dimensions, index: any= 0): HandlerResult {
        if (arr.length !== dimensions[index]) {
            return fail(arr, "array/dimensions", { dimensions });
        }
        ++index;
        if (index < dimensions.length) {
            for (const item of arr) {
                if (!Array.isArray(item) || this.dimensions(item, dimensions, index).fail) {
                    return fail(arr, "array/dimensions", { dimensions });
                }
            }
        }
        return pass(arr);
    }

    /**
     * Validates that the array is empty.
     * @param {unknown[]} arr Array being validated.
     * @returns {HandlerResult} Pass result when the array has no items.
     */
    static empty(arr: ArrayValues): HandlerResult {
        return arr.length === 0
            ? pass(arr)
            : fail(arr, 'array/empty', {
                length: arr.length
            });
    }

    /**
     * Validates that the array contains exactly the required values.
     * @param {unknown[]} arr Array being validated.
     * @param {unknown[]} [requiredValues=[]] Values the array must contain, disregarding order.
     * @returns {HandlerResult} Pass result when contents match exactly.
     */
    static exactly(arr: ArrayValues, requiredValues: ArrayValues = []): HandlerResult {
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
     * @param {unknown[]} arr Array being validated.
     * @param {number} requiredLength Exact required array length.
     * @returns {HandlerResult} Pass result when the length matches.
     */
    // @ts-expect-error Runtime API requires static method name `length`.
    static length(arr: ArrayValues, requiredLength: number): HandlerResult {
        return arr.length === requiredLength
            ? pass(arr)
            : fail(arr, 'array/length', {
                length: arr.length,
                requiredLength
            });
    }

    /**
     * Validates that the array length falls within the provided inclusive range.
     * @param {unknown[]} arr Array being validated.
     * @param {number} min Inclusive minimum length.
     * @param {number} max Inclusive maximum length.
     * @returns {HandlerResult} Pass result when the length is within range.
     */
    static lengthBetween(arr: ArrayValues, min: number, max: number): HandlerResult {
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
     * @param {unknown[]} arr Array being validated.
     * @param {number} max Maximum allowed length.
     * @returns {HandlerResult} Pass result when the array length is at most the maximum.
     */
    static maxLength(arr: ArrayValues, max: number): HandlerResult {
        return arr.length <= max
            ? pass(arr)
            : fail(arr, 'array/maxLength', {
                length: arr.length,
                max
            });
    }

    /**
     * Validates that the array length meets the provided minimum.
     * @param {unknown[]} arr Array being validated.
     * @param {number} min Minimum allowed length.
     * @returns {HandlerResult} Pass result when the array length is at least the minimum.
     */
    static minLength(arr: ArrayValues, min: number): HandlerResult {
        return arr.length >= min
            ? pass(arr)
            : fail(arr, 'array/minLength', {
                length: arr.length,
                min
            });
    }

    /**
     * Validates that the array contains none of the forbidden values.
     * @param {unknown[]} arr Array being validated.
     * @param {unknown[]} [forbiddenValues=[]] Values that must not appear in the array.
     * @returns {HandlerResult} Pass result when no forbidden values are found.
     */
    static noneOf(arr: ArrayValues, forbiddenValues: ArrayValues = []): HandlerResult {
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
     * @param {unknown[]} arr Array being validated.
     * @returns {HandlerResult} Pass result when the array is not empty.
     */
    static notEmpty(arr: ArrayValues): HandlerResult {
        return arr.length > 0
            ? pass(arr)
            : fail(arr, 'array/notEmpty');
    }

    /**
     * Validates that every array entry belongs to the allowed set.
     * @param {unknown[]} arr Array being validated.
     * @param {unknown[]} [allowedValues=[]] Values permitted in the array.
     * @returns {HandlerResult} Pass result when every entry is allowed.
     */
    static only(arr: ArrayValues, allowedValues: ArrayValues = []): HandlerResult {
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
     * @param {unknown[]} arr Array being validated.
     * @param {unknown[]} [forbiddenValues=[]] Values the array must not consist exclusively of.
     * @returns {HandlerResult} Pass result when at least one entry is different.
     */
    static otherThan(arr: ArrayValues, forbiddenValues: ArrayValues = []): HandlerResult {
        if (forbiddenValues.length === 0) {
            return pass(arr);
        }
        for (let i = 0, len = arr.length; i < len; i++) {
            for (const value of forbiddenValues) {
                if (Utils.areEqual(arr[i], value)) {
                    return fail(arr, 'array/otherThan', {
                        forbiddenValues,
                        index: i,
                        invalidValue: arr[i]
                    });
                }
            }
        }
        return pass(arr);
    }

    /**
     * Validates that the array contains at least one of the possible values.
     * @param {unknown[]} arr Array being validated.
     * @param {unknown[]} [possibleValues=[]] Candidate values to look for.
     * @returns {HandlerResult} Pass result when any candidate value is present.
     */
    static someOf(arr: ArrayValues, possibleValues: ArrayValues = []): HandlerResult {
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
     * @param {unknown[]} arr Array being validated.
     * @param {Path|Function|null} [pathOrComparator=null] Optional path or comparator to determine ordering.
     * @returns {HandlerResult} Pass result when the array is sorted.
     */
    static sorted(arr: ArrayValues, pathOrComparator: PathOrSortComparator = null): HandlerResult {
        const sorter = getSorter(1, pathOrComparator);
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
     * @param {unknown[]} arr Array being validated.
     * @param {unknown[]} [tupleValues=[]] Expected values at each index.
     * @returns {HandlerResult} Pass result when the tuple matches.
     */
    static tuple(arr: ArrayValues, tupleValues: ArrayValues = []): HandlerResult {
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
     * @param {...unknown} args Arguments forwarded to only.
     * @returns {HandlerResult} Result from the only validator.
     */
    static type(arr: ArrayValues, allowedValues: ArrayValues = []): HandlerResult {
        return this.only(arr, allowedValues);
    }

    /**
     * Validates that the array contains no duplicate values.
     * @param {unknown[]} arr Array being validated.
     * @param {Path|Function|null} [pathOrComparator=null] Optional path or comparator used to compare entries.
     * @returns {HandlerResult} Pass result when all values are unique.
     */
    static unique(arr: ArrayValues, pathOrComparator: PathOrEqualityComparator = null): HandlerResult {
        const comparator: EqualityComparator = typeof pathOrComparator === 'function'
            ? pathOrComparator
            : (a, b): boolean => !Utils.areEqual(a, b);
        const path: Path | null = pathOrComparator instanceof Path
            ? pathOrComparator
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
     * @param {unknown[]} arr Source array.
     * @param {unknown[]} [values=[]] Values to append.
     * @returns {HandlerResult} Pass result containing the extended array.
     */
    static add(arr: ArrayValues, values: ArrayValues = []): HandlerResult {
        return pass([...arr, ...values]);
    }

    /**
     * Splits the array into equally sized chunks.
     * @param {unknown[]} arr Source array.
     * @param {number} length Maximum size of each chunk.
     * @returns {HandlerResult} Pass result containing the chunked array.
     */
    static chunk(arr: ArrayValues, length: number): HandlerResult {
        const allChunks: ArrayValues[] = [];
        let newChunk: ArrayValues = [];
        if (length >= arr.length) {
            return pass([...arr]);
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
     * @param {unknown[]} arr Source array.
     * @param {Function} filter Predicate function used by Array.prototype.filter.
     * @returns {HandlerResult} Pass result containing the filtered array.
     */
    static filter(arr: ArrayValues, filter: ArrayFilter): HandlerResult {
        return pass(arr.filter(filter));
    }

    /**
     * Recursively flattens nested arrays into a single-level array.
     * @param {unknown[]} arr Source array.
     * @returns {HandlerResult} Pass result containing the flattened array.
     */
    static flatten(arr: ArrayValues): HandlerResult {
        const flattened: ArrayValues = [];
        for (const item of arr) {
            if (Array.isArray(item)) {
                const innerFlatten = this.flatten(item as ArrayValues).value as ArrayValues;
                flattened.push(...innerFlatten);
            } else {
                flattened.push(item);
            }
        }
        return pass(flattened);
    }

    /**
     * Groups array entries by value or by a value at the provided path.
     * @param {unknown[]} arr Source array.
     * @param {Path|null} path Optional path used to compute each group key.
     * @returns {HandlerResult} Pass result containing grouped entries.
     */
    static group(arr: ArrayValues, path: Path | null): HandlerResult {
        const groups = new Map<unknown, ArrayValues>();
        for (const value of arr) {
            const mapKey = path ? Utils.getPathValue(value, path) : value;
            if (!groups.has(mapKey)) {
                groups.set(mapKey, []);
            }
            groups.get(mapKey)?.push(value);
        }

        const finalGroups: ArrayValues[] = [];
        for (const [_, group] of groups) {
            finalGroups.push(group);
        }
        return pass(finalGroups);
    }

    /**
     * Keeps only entries that match one of the allowed values.
     * @param {unknown[]} arr Source array.
     * @param {unknown[]} [allowedValues=[]] Values to keep.
     * @returns {HandlerResult} Pass result containing the filtered array.
     */
    static keep(arr: ArrayValues, allowedValues: ArrayValues = []): HandlerResult {
        const filtered: ArrayValues = [];
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
     * @param {unknown[]} arr Source array.
     * @param {Function} map Mapping function used by Array.prototype.map.
     * @returns {HandlerResult} Pass result containing the mapped array.
     */
    static map(arr: ArrayValues, map: ArrayMapper): HandlerResult {
        return pass(arr.map(map));
    }

    /**
     * Pads the array to a target length using the provided value.
     * @param {unknown[]} arr Source array.
     * @param {number} targetLength Desired minimum array length.
     * @param {unknown} [padValue=null] Value appended until the target length is reached.
     * @returns {HandlerResult} Pass result containing the padded array.
     */
    static padEnd(arr: ArrayValues, targetLength: number, padValue: ArrayValue = null): HandlerResult {
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
     * @param {unknown[]} arr Source array.
     * @param {number} [count=1] Number of items to pick.
     * @returns {HandlerResult} Pass result containing the randomly selected items.
     */
    static pickRandom(arr: ArrayValues, count: any= 1): HandlerResult {
        const arrCopy = [...arr];
        const random: ArrayValues = [];
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
     * @param {unknown[]} arr Source array.
     * @param {unknown[]} [forbiddenValues=[]] Values to remove.
     * @returns {HandlerResult} Pass result containing the filtered array.
     */
    static remove(arr: ArrayValues, forbiddenValues: ArrayValues = []): HandlerResult {
        const filtered: ArrayValues = [];
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
     * @param {unknown[]} arr Source array.
     * @param {Path|Function|null} [pathOrComparator=null] Optional path or comparator used to compare entries.
     * @returns {HandlerResult} Pass result containing the deduplicated array.
     */
    static removeDuplicates(arr: ArrayValues, pathOrComparator: PathOrEqualityComparator = null): HandlerResult {
        const comparator: EqualityComparator = typeof pathOrComparator === 'function'
            ? pathOrComparator
            : (a, b): boolean => !Utils.areEqual(a, b);
        const path: Path | null = pathOrComparator instanceof Path
            ? pathOrComparator
            : null;

        const filteredArr: ArrayValues = [...arr];

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
     * @param {unknown[]} arr Source array.
     * @param {unknown[]} [emptyValues=[null, undefined, '']] Values treated as empty.
     * @returns {HandlerResult} Pass result containing the filtered array.
     */
    static removeEmpties(arr: ArrayValues, emptyValues: ArrayValues = [null, undefined, '']): HandlerResult {
        return this.remove(arr, emptyValues);
    }

    /**
     * Removes undefined values from the array.
     * @param {unknown[]} arr Source array.
     * @returns {HandlerResult} Pass result containing the filtered array.
     */
    static removeUndefined(arr: ArrayValues): HandlerResult {
        return this.remove(arr, [undefined]);
    }

    /**
     * Reverses the order of the array.
     * @param {unknown[]} arr Source array.
     * @returns {HandlerResult} Pass result containing the reversed array.
     */
    static reverse(arr: ArrayValues): HandlerResult {
        return pass([...arr].reverse());
    }

    /**
     * Randomly shuffles the array.
     * @param {unknown[]} arr Source array.
     * @returns {HandlerResult} Pass result containing the shuffled array.
     */
    static shuffle(arr: ArrayValues): HandlerResult {
        const arrCopy = [...arr];
        const random: ArrayValues = [];
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
     * @param {unknown[]} arr Source array.
     * @param {number} startIndex Inclusive start index.
     * @param {number} endIndex Exclusive end index.
     * @returns {HandlerResult} Pass result containing the sliced array.
     */
    static slice(arr: ArrayValues, startIndex: number, endIndex?: number): HandlerResult {
        return pass(arr.slice(startIndex, endIndex));
    }

    /**
     * Takes the first count entries from the array.
     * @param {unknown[]} arr Source array.
     * @param {number} [count=1] Number of items to take.
     * @returns {HandlerResult} Pass result containing the leading slice.
     */
    static sliceFirst(arr: ArrayValues, count: any= 1): HandlerResult {
        return pass(arr.slice(0, count));
    }

    /**
     * Takes the last count entries from the array.
     * @param {unknown[]} arr Source array.
     * @param {number} [count=1] Number of items to take.
     * @returns {HandlerResult} Pass result containing the trailing slice.
     */
    static sliceLast(arr: ArrayValues, count: any= 1): HandlerResult {
        return pass(arr.slice(-count));
    }

    /**
     * Splices the array by removing and optionally inserting values.
     * @param {unknown[]} arr Source array.
     * @param {number} startIndex Index at which to begin changes.
     * @param {number} [deleteCount=0] Number of items to remove.
     * @param {unknown[]} [insertValues=[]] Values to insert at the start index.
     * @returns {HandlerResult} Pass result containing the spliced array.
     */
    static splice(arr: ArrayValues, startIndex: number, deleteCount: any= 0, insertValues: ArrayValues = []): HandlerResult {
        const arrCopy = [...arr];
        arrCopy.splice(startIndex, deleteCount, ...insertValues);
        return pass(arrCopy);
    }

    /**
     * Sorts the array in ascending order.
     * @param {unknown[]} arr Source array.
     * @param {Path|Function|null} [pathOrComparator=null] Optional path or comparator used for sorting.
     * @returns {HandlerResult} Pass result containing the sorted array.
     */
    static sortAsc(arr: ArrayValues, pathOrComparator: PathOrSortComparator = null): HandlerResult {
        return pass([...arr].sort(getSorter(1, pathOrComparator)));
    }

    /**
     * Sorts the array in descending order.
     * @param {unknown[]} arr Source array.
     * @param {Path|Function|null} [pathOrComparator=null] Optional path or comparator used for sorting.
     * @returns {HandlerResult} Pass result containing the sorted array.
     */
    static sortDesc(arr: ArrayValues, pathOrComparator: PathOrSortComparator = null): HandlerResult {
        return pass([...arr].sort(getSorter(-1, pathOrComparator)));
    }

};

export { ArrayHandler };


//todo: add sort