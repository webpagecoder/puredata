'use strict';

import { RegexCache } from './RegexCache.ts';
import { Field } from './fields/Field.ts';
import { Path } from './Path.ts';

export type NestedStringRecord = {
    [key: string]: NestedStringRecord | string | undefined;
};

/**
 * @typedef RegexMatchOptions
 * @property {('loose' | 'strict')} mode - The mode in which the regex will be run.
 * @property {string} acceptableDelims - A string of characters that are considered acceptable delimiters in the string. 
 * These will be normalized to the normalizedDelim character if a match is made.
 * @property {string} normalizedDelim - The character that acceptable delimiters will be normalized to.
 * @property {string} stripDelims - Characters to clean up. Recommended to set this to any characters that are 
 * common delims - any {@link acceptableDelims}/{@link normalizedDelim} delimiters that appear in stripDelims will 
 * be ignored.
 */
export type RegexMatchOptions = {
    acceptableDelims: string;
    mode?: 'loose' | 'strict';
    normalizedDelim: string;
    stripDelims?: string;
};

export type RegexMatchResult = [string | null, string | null];

export type GetPathOptions = {
    includeRoots?: boolean;
    rootsOnly?: boolean
};

const hasOwnProperty = Object.prototype.hasOwnProperty;

class Utils {

    /****************************************************
     * General utilities
     ***************************************************/

    /**
     * Compares two values for equality.
     * @param x The first value to compare.
     * @param y The second value to compare.
     * @returns True if the values are equal, false otherwise.
     */
    public static areEqual(x: unknown, y: unknown): boolean {
        if (x === y) {
            return true;
        }

        const xIsChain = x instanceof Field;
        const yIsChain = y instanceof Field;

        if (!!xIsChain != !!yIsChain) {
            const chain = (xIsChain ? x : y) as Field;
            const value = xIsChain ? y : x;
            return (chain as any).process(value).pass;
        }

        if (Array.isArray(x)) {
            if (!Array.isArray(y) || x.length !== y.length) {
                return false;
            }
            for (let i = 0, max = x.length; i < max; i++) {
                if (!Utils.areEqual(x[i], y[i])) {
                    return false;
                }
            }
            return true;
        }

        if (!Utils.isPlainObject(x) || !Utils.isPlainObject(y)) {
            return false;
        }

        const xKeys = Object.keys(x as object);
        const yKeys = Object.keys(y as object);
        if (xKeys.length !== yKeys.length) {
            return false;
        }

        for (const key of xKeys) {
            if (
                !hasOwnProperty.call(y, key) ||
                !Utils.areEqual(
                    (x as Record<PropertyKey, unknown>)[key],
                    (y as Record<PropertyKey, unknown>)[key]
                )
            ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Creates a deep copy of the given value.
     * @param val The value to clone.
     * @returns A deep copy of the value.
     */
    public static clone<T = unknown>(val: T): T {
        if (val === null || typeof val !== 'object') {
            return val;
        }
        if (Array.isArray(val)) {
            return val.map((item) => Utils.clone(item)) as T;
        }
        const source = val as Record<PropertyKey, unknown>;
        const clone: Record<PropertyKey, unknown> = {};
        for (const key of Reflect.ownKeys(source)) {
            clone[key] = Utils.clone(source[key]);
        }
        return clone as T;
    }





    /****************************************************
     * Object-based utilities
     ***************************************************/

    /**
     * Calculates the maximum depth of an object.
     * @param obj The object to analyze.
     * @param maxDepth The maximum depth to consider.
     * @returns The maximum depth of the object, or false if it exceeds the maximum.
     */
    public static getDepth(obj: object, maxDepth: number | null = null): number | boolean {
        if (!Utils.isPlainObject(obj)) {
            return 0;
        }
        if (maxDepth !== null && maxDepth < 1) {
            return false;
        }

        let maxDepthCalculated: number | boolean = 1;

        for (const key of Object.keys(obj as object)) {
            const value = (obj as Record<PropertyKey, unknown>)[key];
            if (Utils.isObject(value)) {
                const result = Utils.getDepth(value as object, maxDepth);
                if (result === false) {
                    return false;
                }
                maxDepthCalculated = Math.max(maxDepthCalculated, 1 + (result as number));
                if (maxDepth !== null && maxDepthCalculated > maxDepth) {
                    return false;
                }
            }
        }
        return maxDepthCalculated;
    }

    /**
     * Calculates the maximum depth and key count of an object.
     * @param obj The object to analyze.
     * @param options The options for the calculation.
     * @returns A tuple of the maximum depth and key count, or false if either exceeds the maximum.
     */
    public static getDepthAndKeyCount(obj: object, {
        depth = 0,
        keyCount = 0,
        maxDepth = null,
        maxKeyCount = null,
    }: { depth?: number; keyCount?: number; maxDepth?: number | null; maxKeyCount?: number | null } = {}): false | [number, number] {

        const keys = Object.keys(obj);
        keyCount += keys.length;
        depth++;

        if (
            maxKeyCount !== null && keyCount > maxKeyCount
            || maxDepth !== null && depth > maxDepth
        ) {
            return false;
        }

        let currentMaxDepth = depth;
        for (const key of keys) {
            const value = (obj as Record<PropertyKey, unknown>)[key];
            if (Utils.isPlainObject(value)) {
                const childResult = Utils.getDepthAndKeyCount(value as object, {
                    depth,
                    keyCount,
                    maxDepth,
                    maxKeyCount,
                });

                if (childResult === false) {
                    return false;
                }
                const [childDepth, childKeyCount] = childResult;

                keyCount = childKeyCount;
                currentMaxDepth = Math.max(currentMaxDepth, childDepth);
            }
        }

        if (
            maxKeyCount !== null && keyCount > maxKeyCount
            || maxDepth !== null && currentMaxDepth > maxDepth
        ) {
            return false;
        }
        return [currentMaxDepth, keyCount];
    }

    /**
     * Calculates the total number of keys in an object and its nested objects.
     * @param obj The object to analyze.
     * @param maxKeyCount The maximum key count to consider.
     * @returns The total key count, or false if it exceeds the maximum.
     */
    public static getKeyCountRecursive(obj: object, maxKeyCount: number | null = null): number | boolean {

        const allKeys = Object.keys(obj);
        let count = allKeys.length;
        if (maxKeyCount !== null && count > maxKeyCount) {
            return false;
        }

        for (const key of allKeys) {
            const value = (obj as Record<PropertyKey, unknown>)[key];
            if (Utils.isPlainObject(value)) {
                const result = Utils.getKeyCountRecursive(value as object, maxKeyCount);
                if (result === false) {
                    return false;
                }
                count += result as number;
                if (maxKeyCount !== null && count > maxKeyCount) {
                    return false;
                }
            }
        }
        return count;
    }

    /**
     * Checks if a value is an object.
     * @param value The value to check.
     * @returns True if the value is an object, false otherwise.
     */
    public static isObject(value: unknown): boolean {
        return typeof value === 'object' && value !== null;
    }

    /**
     * Checks if a value is a plain object.
     * @param value The value to check.
     * @returns True if the value is a plain object, false otherwise.
     */
    public static isPlainObject(value: unknown): boolean {
        if (value === null || typeof value !== 'object') {
            return false;
        }
        const proto = Object.getPrototypeOf(value);
        return proto === Object.prototype || proto === null;
    }

    /**
     * Merges two objects.
     * @param parent The parent object.
     * @param child The child object.
     * @returns The merged object.
     */
    public static mergeObjects(parent: object, child: object): unknown {
        let stack: [object, object][] = [[
            parent = Utils.clone(parent),
            Utils.clone(child)
        ]];
        while (stack.length) {
            const [parentVal, childVal] = stack.shift()!;
            const parentObj = parentVal as Record<PropertyKey, unknown>;
            const childObj = childVal as Record<PropertyKey, unknown>;
            for (const key of Object.keys(childObj)) {
                if (Utils.isPlainObject(parentObj[key]) && Utils.isPlainObject(childObj[key])) {
                    stack.push([
                        parentObj[key] as object,
                        childObj[key] as object
                    ]);
                }
                else {
                    parentObj[key] = Array.isArray(childObj[key]) ? [...childObj[key] as unknown[]] : childObj[key];
                }
            }
        }
        return parent;
    }





    /****************************************************
     * Object path utilities
     ***************************************************/

    /**
     * Generates all paths in an object.
     * @param obj 
     * @param options 
     * @returns 
     */
    public static *getAllPaths(obj: object, options: GetPathOptions = {}): Generator<Path> {
        yield* Utils.getAllPathsRecursive(obj, {
            parentKeys: [],
            includeRoots: options.includeRoots ?? false,
            rootsOnly: options.rootsOnly ?? false
        });
    }

    private static *getAllPathsRecursive(obj: object, {
        parentKeys = [],
        includeRoots = false,
        rootsOnly = false
    }: GetPathOptions & { parentKeys?: string[] }): Generator<Path> {
        for (const key of Object.keys(obj)) {
            const child = (obj as Record<PropertyKey, unknown>)[key];
            if (Utils.isPlainObject(child)) {
                if (includeRoots || rootsOnly) {
                    yield new Path(parentKeys.concat(key));
                }
                yield* Utils.getAllPathsRecursive(child as object, {
                    parentKeys: parentKeys.concat(key),
                    includeRoots,
                    rootsOnly
                });
            }
            else if (!rootsOnly) {
                yield new Path(parentKeys.concat(key));
            }
        }
    }

    /**
     * Gets the number of paths in an object.
     * @param obj The object to count paths in.
     * @param options The options for counting paths.
     * @returns The number of paths in the object.
     */
    public static getPathCount(obj: object, options: GetPathOptions = {}): number {
        let count = 0;
        for (const _ of Utils.getAllPaths(obj, options)) {
            count++;
        }
        return count;
    }

    /**
     * Gets the value of a path in an object.
     * @param obj The object to search.
     * @param path The path to the value.
     * @returns The value at the specified path, or undefined if the path is not found.
     */
    public static getPathValue(obj: object, path: Path): unknown {
        const { keys } = path;
        const { isObject } = Utils;
        let pointer = obj as Record<PropertyKey, unknown>;
        if (keys.length === 0) {
            return obj;
        }
        for (const key of keys) {
            if (isObject(pointer)) {
                pointer = pointer[key] as Record<PropertyKey, unknown>;
            }
            else {
                return undefined;
            }
        }
        return pointer;
    }

    /**
     * Gets a reference to a value in an object by its path.
     * @param obj The object to search.
     * @param path The path to the value.
     * @param create Whether to create the path if it doesn't exist.
     * @param overwrite Whether to overwrite the value if it already exists.
     * @returns A tuple of the parent object and the key, or null if the path is not found.
     */
    public static getRefByPath(obj: object, path: Path, create: boolean = false, overwrite: boolean = false): [NestedStringRecord, string] | null {
        let { keys } = path;
        const { isObject } = Utils;
        if (!isObject(obj) || keys.length === 0) {
            return null;
        }

        const lastKey = keys.pop()!;
        let pointer: NestedStringRecord = obj as NestedStringRecord;

        for (const key of keys) {
            if (isObject(pointer[key])) {
                pointer = pointer[key] as NestedStringRecord;
            }
            else {
                const hasKey = hasOwnProperty.call(pointer, key);
                if (create && !hasKey || overwrite && hasKey) {
                    pointer = pointer[key] = {};
                }
                else {
                    return null;
                }
            }
        }

        if (isObject(pointer) && (overwrite || create && !hasOwnProperty.call(pointer, lastKey))) {
            pointer[lastKey] = undefined;
        }

        return isObject(pointer) && hasOwnProperty.call(pointer, lastKey) ? [pointer, lastKey] : null;
    }

    /**
     * Checks if a path exists in an object.
     * @param obj The object to search.
     * @param path The path to check.
     * @returns True if the path exists, false otherwise.
     */
    public static hasPath(obj: object, path: Path): boolean {
        return Utils.getRefByPath(obj, path, false, false) !== null;
    }

    /**
     * Removes a path from an object.
     * @param obj The object to modify.
     * @param path The path to remove.
     * @returns True if the path was removed, false otherwise.
     */
    public static removePath(obj: object, path: Path): boolean {
        const result = Utils.getRefByPath(obj, path, false, false);
        if (result === null) {
            return false;
        }
        const [pointer, key] = result;
        delete pointer[key];
        return true;
    }

    /**
     * Sets the value of a path in an object.
     * @param obj The object to modify.
     * @param path The path to the value.
     * @param value The value to set.
     * @param overwrite Whether to overwrite the value if it already exists.
     * @param create Whether to create the path if it doesn't exist.
     * @returns True if the path was set, false otherwise.
     */
    public static setPathValue(obj: object, path: Path, value: unknown, overwrite = true, create = true): boolean {
        const result = Utils.getRefByPath(obj, path, create, overwrite);
        if (result && result.length > 0) {
            const [objRef, key] = result as [unknown, string];
            const objRefRecord = objRef as Record<PropertyKey, unknown>;
            if (overwrite || create && objRefRecord[key] === undefined) {
                objRefRecord[key] = value;
                return true;
            }
        }
        return false;
    }




    /****************************************************
     * String utilities
     ***************************************************/

    /**
     * Escapes a string for use in a regular expression.
     * @param str The string to escape.
     * @returns The escaped string.
     */
    public static escapeForRegex(str: string): string {
        return str.replace(/([\\^$*+?.()\|{}\[\]-])/g, '\\$1')
    }

    /**
     * Generates a check digit for a string.
     * @param str The string to generate a check digit for.
     * @param options The options for generating the check digit.
     * @returns The generated check digit.
     */
    public static generateCheckDigit(str: string, {
        weights = [2, 1],
        alpha = {
            A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 18, J: 19, K: 20, L: 21, M: 22,
            N: 23, O: 24, P: 25, Q: 26, R: 27, S: 28, T: 29, U: 30, V: 31, W: 32, X: 33, Y: 34, Z: 35
        },
        mod = 10,
        transform = (x: number): number => x,
        reverse = false
    }: { weights?: number[]; alpha?: Record<PropertyKey, number>; mod?: number; transform?: (x: number) => number; reverse?: boolean } = {}): number {
        const values = str.toUpperCase().split('').map((ch: string): number => isNaN(+ch) ? (alpha as Record<PropertyKey, number>)[ch] : +ch);
        if (reverse) {
            values.reverse();
        }
        let sum = 0;
        const weightsLen = weights.length;
        for (let i = 0, len = values.length; i < len; i++) {
            const raw = values[i] * weights[i % weightsLen];
            sum += transform(raw);
        }
        return (mod - (sum % mod)) % mod;
    }

    /**
     * Pads a string on the left with a specified character.
     * @param str The string to pad.
     * @param length The desired length of the string.
     * @param char The character to use for padding.
     * @returns The padded string.
     */
    public static padLeft(str: unknown, length: number, char: string = ' '): string {
        let padding = '';
        const strValue = String(str);
        if (strValue.length < length) {
            padding = new Array(length - strValue.length + 1).join(char);
        }
        return padding + strValue;
    }

    /**
     * Pads a string on the right with a specified character.
     * @param str The string to pad.
     * @param length The desired length of the string.
     * @param char The character to use for padding.
     * @returns The padded string.
     */
    public static padRight(str: unknown, length: number, char: string = ' '): string {
        let padding = '';
        const strValue = String(str);
        if (strValue.length < length) {
            padding = new Array(length - strValue.length + 1).join(char);
        }
        return strValue + padding;
    }

    /**
     * Performs a regex match on a string.
     * @param str The string to perform the match on
     * @param regexParts The pieces of the regex, split on where the delims would appear
     * @param options @see RegexMatchOptions
     * @param isStrictlyDelimited If true, the string is assumed to have delims in known places
     * @returns The result of the regex match, including the normalized string, the string with all delims removed, 
     * and the a "massaged" suggestion string
     */
    public static regexMatch(
        str: string,
        regexParts: string[],
        options: RegexMatchOptions,
        isStrictlyDelimited: boolean = true
    ): RegexMatchResult {

        let {
            mode = 'strict',
            acceptableDelims = '',
            normalizedDelim = '',
            stripDelims = ' ',
        } = options;

        const normalizedDelimEscaped = Utils.escapeForRegex(normalizedDelim);
        if (mode === 'strict') {
            const match = str.match(
                new RegExp('^' + regexParts.join(normalizedDelimEscaped) + '$')
            );
            if (match) {
                // Glue matched parts together
                const normalizedStr = match.slice(1).join(normalizedDelim);
                return [
                    normalizedStr,
                    null
                ];
            }
            return [null, str];
        }

        // Non-strict matching
        let massagedStr = str;
        let matchResult;
        const allDelims = stripDelims + acceptableDelims + normalizedDelim;
        const allDelimsEscaped = Utils.escapeForRegex(allDelims);

        if (!isStrictlyDelimited) {

            // Need to track where the user indicates delims should be placed
            const delimsToDelete = new Set(stripDelims.split(''));
            const delimsToSave = new Set([...acceptableDelims.split(''), normalizedDelim]);

            // Need to do some extra work to respect user delim placement...
            if (delimsToDelete.size > 0) {

                // Remove any delimsToSave from the delimsToDelete set so they are not removed from the string entirely
                // otherwise we will lose placement of delims that the user has indicated should be preserved
                if (delimsToSave.size > 0) {
                    for (const delim of delimsToSave) {
                        delimsToDelete.delete(delim);
                    }
                }

                // Remove the remaining delimsToDelete from the string entirely
                massagedStr = massagedStr.replace(
                    RegexCache.get('[' + Utils.escapeForRegex([...delimsToDelete].join('')) + ']+', 'g'),
                    ''
                );
            }

            if (delimsToSave.size > 0) {
                // Normalize the string by replacing all delimsToSave with the indicated normalizedDelim
                massagedStr = massagedStr.replace(
                    RegexCache.get('([' + Utils.escapeForRegex([...delimsToSave].join('')) + ']+)', 'g'),
                    normalizedDelim
                );
            }

            if (normalizedDelim.length > 0) {
                // Trim *all* normalizedDelim from beginning/end of the string
                massagedStr = massagedStr.replace(
                    RegexCache.get('^[' + normalizedDelimEscaped + ']+|[' + normalizedDelimEscaped + ']+$', 'g'),
                    ''
                );
            }

            const regex = new RegExp('^' + regexParts.join(normalizedDelimEscaped) + '$');
            matchResult = massagedStr.match(regex);
        }
        else {

            // Delims are in known places, get rid of all delims and match pattern
            massagedStr = massagedStr.replace(
                RegexCache.get('[' + allDelimsEscaped + ']+', 'g'),
                ''
            );
            const regex = new RegExp('^' + regexParts.join('') + '$');
            matchResult = massagedStr.match(regex);
        }

        // At this point the string is as normalized as possible....
        if (matchResult) {
            // Glue matched parts together (delims already solved)
            const normalizedStr = matchResult.slice(1).join(normalizedDelim);
            return [
                normalizedStr,
                null
            ];
        }

        return [null, massagedStr];
    }

    /**
     * Replaces all occurrences of a set of characters in a string with a replacement string.
     * @param str The string to modify.
     * @param delims The characters to replace.
     * @param replacement The string to replace the characters with.
     * @returns The modified string.
     */
    public static replaceChars(str: string, delims: string, replacement: string = ''): string {
        return str.replace(RegexCache.get('[' + Utils.escapeForRegex(delims) + ']+', 'g'), replacement);
    }

    /**
     * Splits a string on a set of delimiters.
     * @param str The string to split.
     * @param delims The delimiters to split on.
     * @returns An array of the split strings.
     */
    public static splitOnDelims(str: string, delims: string): string[] {
        const splitter = delims.length > 0 ? RegexCache.get('[' + Utils.escapeForRegex(delims) + ']+') : '';
        const final: string[] = [];
        for (const part of str.split(splitter)) {
            if (part.length > 0) {
                final.push(part);
            }
        }
        return final;
    }

    /**
     * Validates a string with a check digit.
     * @param str The string to validate.
     * @param options The options for validation.
     * @returns True if the string is valid, false otherwise.
     */
    public static validateWithCheckDigit(str: string, {
        weights = [2, 1],
        mod = 10,
        transform = (x: number): number => x,
        reverse = false
    }: { weights?: number[]; mod?: number; transform?: (x: number) => number; reverse?: boolean } = {}): boolean {
        return str.length > 0 && Utils.generateCheckDigit(str.slice(0, -1), {
            weights,
            mod,
            transform,
            reverse
        }) === +(str.slice(-1));
    }




    /****************************************************
     * Number utilities
     ***************************************************/

    /**
     * Parses a string into a number.
     * @param value The value to parse.
     * @param options The options for parsing.
     * @returns The parsed number, or null if the value is not a valid number.
     */
    public static parseNumber(value: unknown, {
        autoConvert = true,
        ensureSafe = true,
        ensureFinite = true,
        preservePrecision = true
    }: { autoConvert?: boolean; ensureSafe?: boolean; ensureFinite?: boolean; preservePrecision?: boolean } = {}): number | null {
        const num = autoConvert ? Number(value) : value;
        return (
            (typeof num !== 'number' || Number.isNaN(num))
            || (ensureFinite && !Number.isFinite(num))
            || (ensureSafe && (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER))
            || (preservePrecision
                && typeof value === 'string'
                && String(num) !== value
                && String(num) !== value.replace(/\.0+$/, ''))
        ) ? null : num;
    }
}

export { Utils };
