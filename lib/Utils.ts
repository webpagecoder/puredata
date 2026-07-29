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

const hasOwnProperty = Object.prototype.hasOwnProperty;

class Utils {

    /****************************************************
     * General utilities
     ***************************************************/

    static areEqual(x: unknown, y: unknown): boolean {
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
            if (!hasOwnProperty.call(y, key) || !Utils.areEqual((x as Record<string, unknown>)[key], (y as Record<string, unknown>)[key])) {
                return false;
            }
        }
        return true;
    }

    static clone<T = unknown>(variable: T): T {
        if (variable === null || typeof variable !== 'object') {
            return variable;
        }
        if (Array.isArray(variable)) {
            return variable.map((item) => Utils.clone(item)) as T;
        }
        const clone: Record<string, unknown> = {};
        for (const key of Object.keys(variable as object)) {
            clone[key] = Utils.clone((variable as Record<string, unknown>)[key]);
        }
        return clone as T;
    }


    /****************************************************
     * Object-based utilities
     ***************************************************/

    static getDepth(obj: unknown, maxDepth: number | null = null): number | boolean {
        if (!Utils.isObject(obj)) {
            return 0;
        }
        let depth = 1;
        const { isObject, getDepth } = Utils;
        for (const key of Object.keys(obj as object)) {
            const value = (obj as Record<string, unknown>)[key];
            if (isObject(value)) {
                const curDepth = 1 + (getDepth(value, maxDepth) as number);
                if (maxDepth !== null && curDepth > maxDepth) {
                    return false;
                }
                depth = Math.max(depth, curDepth);
            }
        }
        return depth;
    }

    static getDepthAndKeyCount(obj: unknown, {
        depth = 0,
        keyCount = 0,
        maxDepth = null,
        maxKeyCount = null,
    }: { depth?: number; keyCount?: number; maxDepth?: number | null; maxKeyCount?: number | null } = {}): false | [number, number] {

        if (!Utils.isObject(obj)) {
            return false;
        }

        const keys = Object.keys(obj as object);
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
            const value = (obj as Record<string, unknown>)[key];
            if (Utils.isObject(value)) {
                const childResult = Utils.getDepthAndKeyCount(value, {
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

    static getRecursiveKeyCount(obj: unknown, maxKeyCount: number | null = null): number | boolean {
        if (!Utils.isObject(obj)) {
            return 0;
        }
        let count = 0;
        const { isObject, getRecursiveKeyCount } = Utils;
        for (const key of Object.keys(obj as object)) {
            const value = (obj as Record<string, unknown>)[key];
            if (isObject(value)) {
                ++count;
                count += getRecursiveKeyCount(value, maxKeyCount) as number;
                if (maxKeyCount !== null && count > maxKeyCount) {
                    return false;
                }
            }
            else {
                ++count;
            }
        }
        return count;
    }

    static isObject(value: unknown): boolean {
        return typeof value === 'object' && value !== null;
    }

    static isPlainObject(value: unknown): boolean {
        if (value === null || typeof value !== 'object') {
            return false;
        }
        const proto = Object.getPrototypeOf(value);
        return proto === Object.prototype || proto === null;
    }

    static mergeObjects(parent: Record<string, unknown>, child: Record<string, unknown>): unknown {
        let stack: [unknown, unknown][] = [[
            parent = Utils.clone(parent),
            Utils.clone(child)
        ]];
        while (stack.length) {
            const [parentVal, childVal] = stack.shift()!;
            const parentObj = parentVal as Record<string, unknown>;
            const childObj = childVal as Record<string, unknown>;
            for (const key of Object.keys(childObj)) {
                if (Utils.isPlainObject(parentObj[key]) && Utils.isPlainObject(childObj[key])) {
                    stack.push([
                        parentObj[key],
                        childObj[key]
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

    static *getAllPaths(obj: unknown, separator: string, {
        keys = [],
        includeObjectRoots = false,
        rootsOnly = false
    }: { keys?: string[]; includeObjectRoots?: boolean; rootsOnly?: boolean } = {}): Generator<Path> {
        const { isObject, getAllPaths } = Utils;
        // Store original separator and set to provided one
        const originalSeparator = Path.separator;
        Path.separator = separator;

        try {
            for (const key of Object.keys(obj as object)) {
                const value = (obj as Record<string, unknown>)[key];
                if (isObject(value)) {
                    if (includeObjectRoots || rootsOnly) {
                        yield Path.fromArray(keys.concat(key));
                    }
                    yield* getAllPaths(value, separator, {
                        keys: keys.concat(key),
                        includeObjectRoots,
                        rootsOnly
                    });
                }
                else if (!rootsOnly) {
                    yield Path.fromArray(keys.concat(key));
                }
            }
        } finally {
            Path.separator = originalSeparator;
        }
    }

    static getPathCount(obj: unknown, options: Record<string, unknown> = {}): number {
        let count = 0;
        for (const _ of Utils.getAllPaths(obj, '', options as { keys?: string[]; includeObjectRoots?: boolean; rootsOnly?: boolean })) {
            count++;
        }
        return count;
    }

    static getRefByPath(obj: Record<string, unknown>, path: Path, create: boolean = false, overwrite: boolean = false): [NestedStringRecord, string] | null {
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

    static getPathValue(obj: Record<string, unknown>, path: Path): unknown {
        const { keys } = path;
        const { isObject } = Utils;
        let pointer: Record<string, unknown> = obj;
        if (keys.length === 0) {
            return obj;
        }
        for (const key of keys) {
            if (isObject(pointer)) {
                pointer = pointer[key] as Record<string, unknown>;
            }
            else {
                return undefined;
            }
        }
        return pointer;
    }

    static hasPath(obj: Record<string, unknown>, path: Path): boolean {
        return Utils.getRefByPath(obj, path, false, false) !== null;
    }

    static removePath(obj: Record<string, unknown>, path: Path): boolean {
        const result = Utils.getRefByPath(obj, path, false, false);
        if (result === null) {
            return false;
        }
        const [pointer, key] = result;
        delete pointer[key];
        return true;
    }

    static setPathValue(obj: Record<string, unknown>, path: Path, value: unknown, create = true, overwrite = true): boolean {
        const result = Utils.getRefByPath(obj, path, create, overwrite);
        if (result && result.length > 0) {
            const [objRef, key] = result as [unknown, string];
            const objRefRecord = objRef as Record<string, unknown>;
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

    static escapeForRegex(str: string): string {
        return str.replace(/([\\^$*+?.()\|{}\[\]-])/g, '\\$1')
    }

    static generateCheckDigit(str: string, {
        weights = [2, 1],
        alpha = {
            A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 18, J: 19, K: 20, L: 21, M: 22,
            N: 23, O: 24, P: 25, Q: 26, R: 27, S: 28, T: 29, U: 30, V: 31, W: 32, X: 33, Y: 34, Z: 35
        },
        mod = 10,
        transform = (x: number): number => x,
        reverse = false
    }: { weights?: number[]; alpha?: Record<string, number>; mod?: number; transform?: (x: number) => number; reverse?: boolean } = {}): number {
        const values = str.toUpperCase().split('').map((ch: string): number => isNaN(+ch) ? (alpha as Record<string, number>)[ch] : +ch);
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

    static padLeft(str: unknown, length: number, char: string = ' '): string {
        let padding = '';
        const strValue = String(str);
        if (strValue.length < length) {
            padding = new Array(length - strValue.length + 1).join(char);
        }
        return padding + strValue;
    }

    static padRight(str: unknown, length: number, char: string = ' '): string {
        let padding = '';
        const strValue = String(str);
        if (strValue.length < length) {
            padding = new Array(length - strValue.length + 1).join(char);
        }
        return strValue + padding;
    }

    /**
     * 
     * @param str The string to perform the match on
     * @param regexParts The pieces of the regex, split on where the delims would appear
     * @param options @see RegexMatchOptions
     * @param isStrictlyDelimited If true, the string is assumed to have delims in known places
     * @returns The result of the regex match, including the normalized string, the string with all delims removed, 
     * and the a "massaged" suggestion string
     */
    static regexMatch(
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

    static replaceChars(str: string, delims: string, replacement: string = ''): string {
        return str.replace(RegexCache.get('[' + Utils.escapeForRegex(delims) + ']+', 'g'), replacement);
    }

    static splitOnDelims(str: string, delims: string): string[] {
        const splitter = delims.length > 0 ? RegexCache.get('[' + Utils.escapeForRegex(delims) + ']+') : '';
        const final: string[] = [];
        for (const part of str.split(splitter)) {
            if (part.length > 0) {
                final.push(part);
            }
        }
        return final;
    }

    static validateWithCheckDigit(str: string, {
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

    static parseNumber(value: unknown, {
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
