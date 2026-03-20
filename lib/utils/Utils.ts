'use strict';

import { RegexCache } from '../cache/RegexCache.ts';
import { DEFAULT_LANGUAGE } from '../config/DefaultLanguage.ts';
import { Field } from '../fields/Field.ts';
import { Path } from '../Path.ts';
import { DATE_TYPES } from './DateTypes.ts';

export type NestedStringRecord = {
    [key: string]: NestedStringRecord | string | undefined;
};

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

    static clone(variable: unknown): unknown {
        if (variable === null || typeof variable !== 'object') {
            return variable;
        }
        if (Array.isArray(variable)) {
            return variable.map((item: unknown): unknown => Utils.clone(item));
        }
        const clone: Record<string, unknown> = {};
        for (const key of Object.keys(variable as object)) {
            clone[key] = Utils.clone((variable as Record<string, unknown>)[key]);
        }
        return clone;
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

    static isObject(obj: unknown): boolean {
        return !!obj && typeof obj === 'object';
    }

    static isPlainObject(obj: unknown): boolean {
        return !!obj && (obj as Record<string, unknown>).constructor === Object;
    }

    static mergeObjects(parent: unknown, child: unknown): unknown {
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

    static getRefByPath(obj: unknown, path: Path, create: boolean = false, overwrite: boolean = false): [NestedStringRecord, string] | null {
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

    static getPathValue(obj: unknown, path: Path): unknown {
        const { keys } = path;
        let pointer: unknown = obj;
        if (keys.length === 0) {
            return obj;
        }
        const { isObject } = Utils;
        for (const key of keys) {
            if (isObject(pointer)) {
                pointer = (pointer as Record<string, unknown>)[key];
            }
            else {
                return undefined;
            }
        }
        return pointer;
    }

    static hasPath(obj: unknown, path: Path): boolean {
        return Utils.getRefByPath(obj, path, false, false) !== null;
    }

    static removePath(obj: unknown, path: Path): boolean {
        const result = Utils.getRefByPath(obj, path, false, false);
        if (result === null) {
            return false;
        }
        const [pointer, key] = result;
        delete pointer[key];
        return true;
    }

    static setPathValue(obj: unknown, path: Path, value: unknown, create: boolean = true, overwrite: boolean = true): boolean {
        const result = Utils.getRefByPath(obj, path, create, overwrite);
        if (result.length > 0) {
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

    static padLeft(str: string, length: number, char: string = ' '): string {
        let padding = '';
        if (str.length < length) {
            padding = new Array(length - str.length + 1).join(char);
        }
        return padding + str;
    }

    static padRight(str: string, length: number, char: string = ' '): string {
        let padding = '';
        if (str.length < length) {
            padding = new Array(length - str.length + 1).join(char);
        }
        return str + padding;
    }

    static regexMatch(str: string, regex: RegExp | RegExp[], options: Record<string, unknown> = {}): RegExpExecArray | null {
        const {
            allowedDelims,
            delim,
            allowLooseFormat
        } = options as { allowedDelims?: string; delim?: string; allowLooseFormat?: boolean };

        let matchData: RegExpExecArray | null;
        const bareStr = Utils.replaceChars(str, (allowedDelims || '') + (delim || ''));

        // Loose match
        if (allowLooseFormat) {
            matchData = Array.isArray(regex)
                ? RegexCache('^(' + (regex as RegExp[]).map((r: RegExp): string => r.source).join(')(') + ')$', 'i').exec(bareStr)
                : (regex as RegExp).exec(bareStr);
        }
        else {
            matchData = Array.isArray(regex)
                ? RegexCache('^(' + (regex as RegExp[]).map((r: RegExp): string => r.source).join(')' + Utils.escapeForRegex(delim || '') + '(') + ')$')
                    .exec(str)
                : (regex as RegExp).exec(str);
        }

        if (matchData) {
            matchData[0] = bareStr;
        }

        return matchData;
    }

    static replaceChars(str: string, delims: string, replacement: string = ''): string {
        return str.replace(RegexCache('[' + Utils.escapeForRegex(delims) + ']+', 'g'), replacement);
    }

    static splitOnDelims(str: string, chars: string): string[] {
        const split = str.length > 0
            ? str.split(RegexCache('[' + Utils.escapeForRegex(chars) + ']+'))
            : [];
        const final: string[] = [];
        for (const part of split) {
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
     * Date utilities
     ***************************************************/

    static areDayAndDateValid(dateParts: Record<string, unknown> = {}): boolean {
        let { YYYY, MM, DD } = dateParts as { YYYY?: unknown; MM?: unknown; DD?: unknown };
        YYYY = +(YYYY as any) || 0;
        MM = +(MM as any) || 0;
        DD = +(DD as any) || 0;
        const numDaysInMonth = [4, 6, 9, 11].indexOf(MM as number) > -1 && 30
            || (MM as number) === 2 && (Utils.isLeapYear(YYYY as number) ? 29 : 28)
            || [1, 3, 5, 7, 8, 10, 12].indexOf(MM as number) > -1 && 31
            || -1;
        if ((YYYY as number) && (MM as number) && (DD as number) && +(DD as number) > numDaysInMonth) {
            return false;
        }
        return true;
    }

    static isLeapYear(year: unknown): boolean {
        return new Date(Date.UTC(+(year as any), 1, 29)).getUTCDate() === 29;
    }

    static parseDate(value: unknown, parseTypes: number[] = []): { date: Date; parsed: Record<string, unknown>; type: number } | null {
        const anyType = parseTypes.length === 0;

        if (value instanceof Date && !isNaN(value.getTime())) {
            return { date: value, parsed: {}, type: DATE_TYPES.OBJECT };
        }

        if (anyType || parseTypes.indexOf(DATE_TYPES.TIMESTAMP) > -1) {
            const result = Utils.parseDateFromTimestamp(value);
            if (result) {
                const { date, parsed } = result;
                return { date, parsed, type: DATE_TYPES.TIMESTAMP };
            }
        }

        if (anyType || parseTypes.indexOf(DATE_TYPES.ISO) > -1) {
            const result = Utils.parseDateFromIso(value);
            if (result) {
                const { date, parsed } = result;
                return { date, parsed, type: DATE_TYPES.ISO };
            }
        }

        if (anyType || parseTypes.indexOf(DATE_TYPES.HUMAN) > -1) {
            const result = Utils.parseDateFromHuman(value);
            if (result) {
                const { date, parsed } = result;
                return { date, parsed, type: DATE_TYPES.HUMAN };
            }
        }

        if (anyType || parseTypes.indexOf(DATE_TYPES.ISO_WEEK) > -1) {
            const result = Utils.parseDateFromIsoWeek(value);
            if (result) {
                const { date, parsed } = result;
                return { date, parsed, type: DATE_TYPES.ISO_WEEK };
            }
        }

        if (anyType || parseTypes.indexOf(DATE_TYPES.ISO_ORDINAL) > -1) {
            const result = Utils.parseDateFromIsoOrdinal(value);
            if (result) {
                const { date, parsed } = result;
                return { date, parsed, type: DATE_TYPES.ISO_ORDINAL };
            }
        }

        return null;
    }

    static parseDateFromHuman(dateString: unknown, {
        monthBeforeDay = true,
        numberSuffixes = DEFAULT_LANGUAGE.calendar.numberSuffixes,
        fullMonths = DEFAULT_LANGUAGE.calendar.months.full,
        shortMonths = DEFAULT_LANGUAGE.calendar.months.short
    }: { monthBeforeDay?: boolean; numberSuffixes?: string[]; fullMonths?: string[]; shortMonths?: string[] } = {}): { date: Date; parsed: Record<string, unknown> } | null {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }

        const allMonths = fullMonths.concat(shortMonths).map((name: string): string => name.toLowerCase());

        const yearRegex = '(\\d{4})';
        const monthRegex = '(1[012]|0?[1-9])';
        const dayNumRegex = '(3[01]|[12]\\d|0?[1-9])(?:' + numberSuffixes.join('|') + ')?';
        const namedDayRegex = '(?:[a-z]{1,20})';
        const allMonthsRegex = '(' + allMonths.map((name: string): string => name.toLowerCase()).join('|') + ')';

        dateString = (dateString as string)
            .trim()
            .replace(/,/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/ ?([/.:-]) ?/g, '$1');

        const dateRegexes: [string[], number[]][] = [
            [[allMonthsRegex, dayNumRegex, yearRegex], [4, 2, 3]],
            [[dayNumRegex, allMonthsRegex, yearRegex], [4, 3, 2]],
            [[yearRegex, allMonthsRegex, dayNumRegex], [2, 3, 4]],
            [[namedDayRegex, allMonthsRegex, dayNumRegex, yearRegex], [4, 2, 3]],
            [[namedDayRegex, dayNumRegex, allMonthsRegex, yearRegex], [4, 3, 2]],
            [[yearRegex, monthRegex, dayNumRegex], [2, 3, 4]],
            ...(monthBeforeDay
                ? [[[monthRegex, dayNumRegex, yearRegex], [4, 2, 3]] as [string[], number[]]]
                : [[[dayNumRegex, monthRegex, yearRegex], [4, 3, 2]] as [string[], number[]]])
        ];

        let matchResult: RegExpExecArray | null, indexes: number[] | undefined;
        for (const [curPattern, curIndexes] of dateRegexes) {
            matchResult = RegexCache(`^(?=(${(curPattern as string[]).join('[/. -]')}))\\1(.*)$`, 'i').exec(dateString);
            if (matchResult) {
                indexes = curIndexes;
                break;
            }
        }
        if (!indexes) {
            return null;
        }

        const timePortion = matchResult![Math.max(...indexes) + 1];
        let HH, mm, ss, sss, amPM, HHOffset, mmOffset;

        if (timePortion) {
            const timeRegex =
                '^(00|0?[1-9]|1[0-9]|2[0-3])' +
                '(:?)([0-5][0-9])?' +
                '(?:\\2([0-5][0-9]))?' +
                '(?:\\.(\\d{1,3}))?' +
                '\\s?' +
                '(AM|PM)?' +
                '\\s?' +
                '(?:' +
                '(?:Z|UTC|GMT)' +
                '|' +
                '(?:([+-](?:0[0-9]|1[0-9]|2[0-3]))' +
                ':?(?:(0[0-9]|[1-5][0-9]))?' +
                ')' +
                ')?' +
                '$';
            const timeMatch = RegexCache(timeRegex, 'i').exec(timePortion);
            if (!timeMatch) {
                return null;
            }
            [, HH, , mm, ss, sss, amPM, HHOffset, mmOffset] = timeMatch;

            if (amPM) {
                HH = +HH;
                if (HH > 12 || HH < 1) {
                    return null;
                }
                const amPMLower = amPM.toLowerCase();
                if (amPMLower === 'pm' && HH < 12) {
                    HH += 12;
                }
                else if (amPMLower === 'am' && HH === 12) {
                    HH = 0;
                }
            }
        }

        let [YYYY, MM, DD] = indexes.map((index: number): unknown => matchResult![index]) as (string | number | undefined)[];

        if (MM) {
            if (!/^[0-9]/.test(MM as string)) {
                const monthNum = allMonths.indexOf((MM as string).toLowerCase());
                if (monthNum === -1) {
                    return null;
                }
                MM = monthNum % 12 + 1;
            }
            MM = +(MM as string);
        }

        if (!Utils.areDayAndDateValid({ YYYY: YYYY as string, MM: MM as number, DD: DD as string })) {
            return null;
        }

        YYYY = +(YYYY as string);
        MM = +(MM as number);
        DD = +(DD as string);
        if (HH !== undefined) {
            HH = +HH;
        }
        if (mm !== undefined) {
            mm = +mm;
        }
        if (ss !== undefined) {
            ss = +ss;
        }
        if (sss !== undefined) {
            sss = +sss;
        }
        if (HHOffset !== undefined) {
            HHOffset = +HHOffset;
        }
        if (mmOffset !== undefined) {
            mmOffset = +mmOffset;
        }

        const timestamp = Date.UTC(
            YYYY,
            MM - 1,
            DD,
            HH || 0,
            mm || 0,
            ss || 0,
            sss || 0
        );

        return {
            date: new Date(
                timestamp +
                (Math.abs(HHOffset || 0) * 3600000 + (mmOffset || 0) * 60000) *
                Utils.getSign(HHOffset || 0)
            ),
            parsed: {
                YYYY,
                MM,
                DD,
                HH,
                mm,
                ss,
                sss,
                HHOffset,
                mmOffset
            }
        };
    }

    static parseDateFromIso(dateString: unknown): { date: Date; parsed: Record<string, unknown> } | null {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }

        const isoDateTimeOffsetRegex =
            '^' +
            '(?!\\d{6}$)' +
            '(?![^-]*-[^T]*T.*?[^.]\\d{3,})' +
            '(?!\\d{5,}T(?![^:]*$))' +
            '(?:(?:(?=((\\d{4})(?:(-)?(1[012]|0[1-9]))?(?:\\3(3[01]|[12]\\d|0[1-9]))?))\\1))' +
            '(?:T' +
            '(?!\\d{2}:.*?[^.]\\d{3,})' +
            '(?!\\d{3,}(?![^:]*$))' +
            '(?:(0[0-9]|1[0-9]|2[0-3])(?:(?:(:)?(0[0-9]|[1-5][0-9]))(?:(?:\\7(0[0-9]|[1-5][0-9])(?:\\.(\\d{1,3}))?)?)?)?)' +
            '(?:' +
            '(?![+-][^Z]*Z)' +
            '(?:([+-](?:0[0-9]|1[0-9]|2[0-3]))(?:(?:(:)?(0[0-9]|[1-5][0-9])))?)' +
            ')?' +
            ')?' +
            '(Z)?' +
            '$';

        const matchResult = RegexCache(isoDateTimeOffsetRegex, 'i').exec(dateString);
        if (!matchResult) {
            return null;
        }
        let [, , YYYY, dash, MM, DD, HH, , mm, ss, sss, HHOffset, , mmOffset, Z] = matchResult;

        if (!Utils.areDayAndDateValid({ YYYY, MM, DD })) {
            return null;
        }

        YYYY = +YYYY;
        MM !== undefined && (MM = +MM);
        DD !== undefined && (DD = +DD);
        HH !== undefined && (HH = +HH);
        mm !== undefined && (mm = +mm);
        ss !== undefined && (ss = +ss);
        sss !== undefined && (sss = +sss);
        HHOffset !== undefined && (HHOffset = +HHOffset);
        mmOffset !== undefined && (mmOffset = +mmOffset);

        YYYY = +YYYY;
        if (MM !== undefined) {
            MM = +MM;
        }
        if (DD !== undefined) {
            DD = +DD;
        }
        if (HH !== undefined) {
            HH = +HH;
        }
        if (mm !== undefined) {
            mm = +mm;
        }
        if (ss !== undefined) {
            ss = +ss;
        }
        if (sss !== undefined) {
            sss = +sss;
        }
        HHOffset = HHOffset === undefined ? 0 : +HHOffset;
        mmOffset = mmOffset === undefined ? 0 : +mmOffset;

        const timestamp = Date.UTC(
            YYYY,
            MM - 1,
            DD,
            HH || 0,
            mm || 0,
            ss || 0,
            sss || 0
        );

        return {
            date: new Date(
                timestamp +
                (Math.abs(HHOffset) * 3600000 + mmOffset * 60000) *
                Utils.getSign(HHOffset)
            ),
            parsed: {
                YYYY,
                MM,
                DD,
                HH,
                mm,
                ss,
                sss,
                HHOffset,
                mmOffset,
                Z,
                isExtended: !!dash
            }
        };
    }

    static parseDateFromIsoOrdinal(dateString: unknown): { date: Date; parsed: Record<string, unknown> } | null {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }
        const matchResult = RegexCache(
            '^(\\d{4})(?:(-)?(00[1-9]|0[1-9]\\d|[12]\\d{2}|3[0-5]\\d|36[0-6]))$'
        ).exec(dateString);
        if (!matchResult) {
            return null;
        }
        const [, YYYY, dash, DDD] = matchResult;
        if (+DDD === 366 && !Utils.isLeapYear(YYYY)) {
            return null;
        }

        const date = new Date(Date.UTC(YYYY, 0, 1));
        date.setUTCDate(date.getUTCDate() + DDD - 1);
        return {
            date,
            parsed: {
                YYYY: +YYYY,
                DDD: +DDD,
                dash,
                isExtended: !!dash
            }
        };
    }

    static parseDateFromIsoWeek(dateString: unknown): { date: Date; parsed: Record<string, unknown> } | null {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }

        const matchResult = RegexCache(
            '^(\\d{4})(-)?W(0[1-9]|[1-4]\\d|5[0-3])(?:\\2([1-7]))?$'
        ).exec(dateString.trim());
        if (!matchResult) {
            return null;
        }
        let [, YYYY, dash, ww, D] = matchResult;
        YYYY = +YYYY;
        ww = +ww;
        D = D ? +D : 1;

        if (ww === 53) {
            const jan1Day = (new Date(Date.UTC(YYYY, 0, 1))).getUTCDay();
            if (jan1Day !== 4 && (jan1Day !== 3 || !Utils.isLeapYear(YYYY))) {
                return null;
            }
        }

        const simple = new Date(Date.UTC(YYYY, 0, 4));
        const date = new Date(Date.UTC(YYYY, 0, 4 - (simple.getUTCDay() || 7) + 1));
        date.setUTCDate(date.getUTCDate() + (ww - 1) * 7 + (D - 1));
        return {
            date,
            parsed: {
                YYYY: +YYYY,
                ww: +ww,
                D: +(D || 1),
                dash,
                isExtended: !!dash
            }
        };
    }

    static parseDateFromTimestamp(value: unknown): { date: Date; parsed: Record<string, unknown> } | null {
        if (Number.isInteger(value) && !isNaN(new Date(value as number).getTime())) {
            return {
                date: new Date(Number(value)),
                parsed: {}
            };
        }
        return null;
    }

    /****************************************************
     * Number utilities
     ***************************************************/

    static getSign(x: unknown): number {
        const num = +(x as any);
        return Math.sign(num) === -1 || 1 / num === -Infinity ? -1 : 1;
    }

    static parseNumber(value: unknown, {
        autoConvert = true,
        ensureSafe = true,
        ensureFinite = true,
        preservePrecision = true
    }: { autoConvert?: boolean; ensureSafe?: boolean; ensureFinite?: boolean; preservePrecision?: boolean } = {}): number | null {
        const num = autoConvert && typeof value === 'string' ? Number(value) : value;
        return (
            (typeof num !== 'number' || Number.isNaN(num))
            || (ensureFinite && !Number.isFinite(num))
            || (ensureSafe && (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER))
            || (preservePrecision
                && typeof value === 'string'
                && String(num) !== value
                && String(num) !== value.replace(/\.0+$/, '')
            )
        ) ? null : num;
    }
}

export { Utils };
