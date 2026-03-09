// @ts-nocheck
'use strict';

import RegexCache from '../cache/RegexCache.ts';
import DefaultLanguage from '../config/DefaultLanguage.ts';
import Field from '../fields/Field.ts';
import Path from '../Path.ts';
import DATE_TYPES from './DateTypes.ts';

const hasOwnProperty = Object.prototype.hasOwnProperty;

class Utils {

    /****************************************************
     * General utilities
     ***************************************************/

    static areEqual(x, y) {
        if (x === y) {
            return true;
        }

        const xIsChain = x instanceof Field;
        const yIsChain = y instanceof Field;

        if (!!xIsChain != !!yIsChain) {
            const [chain, value] = (xIsChain && [x, y]) || (yIsChain && [y, x]);
            return chain.process(value).pass;
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

        const xKeys = Object.keys(x);
        const yKeys = Object.keys(y);
        if (xKeys.length !== yKeys.length) {
            return false;
        }

        for (const key of xKeys) {
            if (!hasOwnProperty.call(y, key) || !Utils.areEqual(x[key], y[key])) {
                return false;
            }
        }
        return true;
    }

    static clone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if(Array.isArray(obj)) {
            return obj.map(item => Utils.clone(item));
        }
        var clone = {};
        for (const key of Object.keys(obj)) {
            clone[key] = Utils.clone(obj[key]);
        }
        return clone;
    }


    /****************************************************
     * Object-based utilities
     ***************************************************/

    static getDepth(obj, maxDepth = null) {
        if (!Utils.isObject(obj)) {
            return 0;
        }
        let depth = 1;
        const { isObject, getDepth } = Utils;
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (isObject(value)) {
                const curDepth = 1 + getDepth(value, maxDepth);
                if (maxDepth !== null && curDepth > maxDepth) {
                    return false;
                }
                depth = Math.max(depth, curDepth);
            }
        }
        return depth;
    }

    static getDepthAndKeyCount(obj, {
        depth = 0,
        keyCount = 0,
        maxDepth = null,
        maxKeyCount = null,
    } = {}) {

        if (!Utils.isObject(obj)) {
            return false;
        }

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
            const value = obj[key];
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

    static getRecursiveKeyCount(obj, maxKeyCount = null) {
        if (!Utils.isObject(obj)) {
            return 0;
        }
        let count = 0;
        const { isObject, getRecursiveKeyCount } = Utils;
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (isObject(value)) {
                ++count;
                count += getRecursiveKeyCount(value, maxKeyCount);
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

    static isObject(obj) {
        return !!obj && typeof obj === 'object';
    }

    static isPlainObject(obj) {
        return !!obj && obj.constructor === Object;
    }

    static mergeObjects(parent, child) {
        let stack = [[
            parent = Utils.clone(parent),
            Utils.clone(child)
        ]];
        while (stack.length) {
            const [parent, child] = stack.shift();
            for (const key of Object.keys(child)) {
                if (Utils.isPlainObject(parent[key]) && Utils.isPlainObject(child[key])) {
                    stack.push([
                        parent[key],
                        child[key]
                    ]);
                }
                else {
                    parent[key] = Array.isArray(child[key]) ? [...child[key]] : child[key];
                }
            }
        }
        return parent;
    }

    /****************************************************
     * Object path utilities
     ***************************************************/

    static *getAllPaths(obj, separator, {
        keys = [],
        includeObjectRoots = false,
        rootsOnly = false
    } = {}) {
        const { isObject, getAllPaths } = Utils;
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (isObject(value)) {
                if (includeObjectRoots || rootsOnly) {
                    yield Path.fromArray(keys.concat(key), { separator });
                }
                yield* getAllPaths(value, separator, {
                    keys: keys.concat(key),
                    includeObjectRoots,
                    rootsOnly
                });
            }
            else if (!rootsOnly) {
                yield Path.fromArray(keys.concat(key), { separator });
            }
        }
    }

    static getPathCount(obj, options = {}) {
        let count = 0;
        for (const _ of Utils.getAllPaths(obj, '', options)) {
            count++;
        }
        return count;
    }

    static getPathPointer(obj, path, { create = true, overwrite = false } = {}) {
        let { keys } = path;
        const { isObject } = Utils;
        if (!isObject(obj) || keys.length === 0) {
            return [];
        }

        const lastKey = keys.pop();
        let pointer = obj;

        for (const key of keys) {
            if (isObject(pointer[key])) {
                pointer = pointer[key];
            }
            else {
                const hasKey = hasOwnProperty.call(pointer, key);
                if (create && !hasKey || overwrite && hasKey) {
                    pointer = pointer[key] = {};
                }
                else {
                    return [];
                }
            }
        }

        if (isObject(pointer) && (overwrite || create && !hasOwnProperty.call(pointer, lastKey))) {
            pointer[lastKey] = undefined;
        }

        return isObject(pointer) && hasOwnProperty.call(pointer, lastKey) ? [pointer, lastKey] : [];
    }

    static getPathValue(obj, path) {
        const { keys } = path;
        let pointer = obj;
        if (keys.length === 0) {
            return obj;
        }
        const { isObject } = Utils;
        for (const key of keys) {
            if (isObject(pointer)) {
                pointer = pointer[key];
            }
            else {
                return undefined;
            }
        }
        return pointer;
    }

    static hasPath(obj, path) {
        const [pointer,] = Utils.getPathPointer(obj, path, { create: false, overwrite: false });
        return Boolean(pointer);
    }

    static removePath(obj, path) {
        const [pointer, key] = Utils.getPathPointer(obj, path, { create: false });
        if (pointer) {
            delete pointer[key];
            return true;
        }
        return false;
    }

    static setPathValue(obj, path, value, { create = true, overwrite = true } = {}) {
        const [objRef, key] = Utils.getPathPointer(obj, path, { create, overwrite });
        if (objRef && (overwrite || create && objRef[key] === undefined)) {
            objRef[key] = value;
            return true;
        }
        return false;
    }

    /****************************************************
     * String utilities
     ***************************************************/

    static escapeForRegex(str) {
        return str.replace(/([\\\^\$\*\+\?\.\(\)\|\{\}\[\]\-])/g, '\\$1')
    }

    static generateCheckDigit(str, {
        weights = [2, 1],
        alpha = {
            A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 18, J: 19, K: 20, L: 21, M: 22,
            N: 23, O: 24, P: 25, Q: 26, R: 27, S: 28, T: 29, U: 30, V: 31, W: 32, X: 33, Y: 34, Z: 35
        },
        mod = 10,
        transform = x => x,
        reverse = false
    } = {}) {
        const values = str.toUpperCase().split('').map(ch => isNaN(ch) ? alpha[ch] : +ch);
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

    static padLeft(str, length, char = ' ') {
        let padding = '';
        if (str.length < length) {
            padding = new Array(length - str.length + 1).join(char);
        }
        return padding + str;
    }

    static padRight(str, length, char = ' ') {
        let padding = '';
        if (str.length < length) {
            padding = new Array(length - str.length + 1).join(char);
        }
        return str + padding;
    }

    static regexMatch(str, regex, options = {}) {
        const {
            allowedDelims,
            delim,
            allowLooseFormat
        } = options;

        let matchData;
        const bareStr = Utils.replaceChars(str, allowedDelims + delim);

        // Loose match
        if (allowLooseFormat) {
            matchData = Array.isArray(regex)
                ? RegexCache('^(' + regex.join(')(') + ')$', 'i').exec(bareStr)
                : regex.exec(bareStr);
        }
        else {
            matchData = Array.isArray(regex)
                ? RegexCache('^(' + regex.join(')' + Utils.escapeForRegex(delim) + '(') + ')$')
                    .exec(str)
                : regex.exec(str);
        }

        if (matchData) {
            matchData[0] = bareStr;
        }

        return matchData;
    }

    static replaceChars(str, delims, replacement = '') {
        return str.replace(RegexCache('[' + Utils.escapeForRegex(delims) + ']+', 'g'), replacement);
    }

    static splitOnDelims(str, chars) {
        const split = str.length > 0
            ? str.split(RegexCache('[' + Utils.escapeForRegex(chars) + ']+'))
            : [];
        const final = [];
        for (const part of split) {
            if (part.length > 0) {
                final.push(part);
            }
        }
        return final;
    }

    static validateWithCheckDigit(str, {
        weights = [2, 1],
        mod = 10,
        transform = x => x,
        reverse = false
    } = {}) {
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

    static areDayAndDateValid(dateParts = {}) {
        let { YYYY, MM, DD } = dateParts;
        YYYY = +YYYY || 0;
        MM = +MM || 0;
        DD = +DD || 0;
        const numDaysInMonth = [4, 6, 9, 11].indexOf(MM) > -1 && 30
            || MM === 2 && (Utils.isLeapYear(YYYY) ? 29 : 28)
            || [1, 3, 5, 7, 8, 10, 12].indexOf(MM) > -1 && 31
            || -1;
        if (YYYY && MM && DD && +DD > numDaysInMonth) {
            return false;
        }
        return true;
    }

    static isLeapYear(year) {
        return new Date(Date.UTC(+year, 1, 29)).getUTCDate() === 29;
    }

    static parseDate(value, parseTypes = []) {
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

    static parseDateFromHuman(dateString, {
        monthBeforeDay = true,
        numberSuffixes = DefaultLanguage.calendar.numberSuffixes,
        fullMonths = DefaultLanguage.calendar.months.full,
        shortMonths = DefaultLanguage.calendar.months.short
    } = {}) {
        if (typeof dateString !== 'string' || dateString.trim().length === 0) {
            return null;
        }

        const allMonths = fullMonths.concat(shortMonths).map(name => name.toLowerCase());

        const yearRegex = '(\\d{4})';
        const monthRegex = '(1[012]|0?[1-9])';
        const dayNumRegex = '(3[01]|[12]\\d|0?[1-9])(?:' + numberSuffixes.join('|') + ')?';
        const namedDayRegex = '(?:[a-z]{1,20})';
        const allMonthsRegex = '(' + allMonths.map(name => name.toLowerCase()).join('|') + ')';

        dateString = dateString
            .trim()
            .replace(/,/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/ ?([/.:-]) ?/g, '$1');

        const dateRegexes = [
            [[allMonthsRegex, dayNumRegex, yearRegex], [4, 2, 3]],
            [[dayNumRegex, allMonthsRegex, yearRegex], [4, 3, 2]],
            [[yearRegex, allMonthsRegex, dayNumRegex], [2, 3, 4]],
            [[namedDayRegex, allMonthsRegex, dayNumRegex, yearRegex], [4, 2, 3]],
            [[namedDayRegex, dayNumRegex, allMonthsRegex, yearRegex], [4, 3, 2]],
            [[yearRegex, monthRegex, dayNumRegex], [2, 3, 4]],
            monthBeforeDay
                ? [[monthRegex, dayNumRegex, yearRegex], [4, 2, 3]]
                : [[dayNumRegex, monthRegex, yearRegex], [4, 3, 2]]
        ];

        let matchResult, indexes;
        for (const [curPattern, curIndexes] of dateRegexes) {
            matchResult = RegexCache(`^(?=(${curPattern.join('[/. -]')}))\\1(.*)$`, 'i').exec(dateString);
            if (matchResult) {
                indexes = curIndexes;
                break;
            }
        }
        if (!indexes) {
            return null;
        }

        const timePortion = matchResult[Math.max(...indexes) + 1];
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

        let [YYYY, MM, DD] = indexes.map(index => matchResult[index]);

        if (MM) {
            if (!/^[0-9]/.test(MM)) {
                const monthNum = allMonths.indexOf(MM.toLowerCase());
                if (monthNum === -1) {
                    return null;
                }
                MM = monthNum % 12 + 1;
            }
            MM = +MM;
        }

        if (!Utils.areDayAndDateValid({ YYYY, MM, DD })) {
            return null;
        }

        YYYY = +YYYY;
        MM = +MM;
        DD = +DD;
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

    static parseDateFromIso(dateString) {
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

    static parseDateFromIsoOrdinal(dateString) {
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

    static parseDateFromIsoWeek(dateString) {
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

    static parseDateFromTimestamp(value) {
        if (Number.isInteger(value) && !isNaN(new Date(value))) {
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

    static getSign(x) {
        return Math.sign(+x) === -1 || 1 / +x === -Infinity ? -1 : 1;
    }

    static parseNumber(value, {
        autoConvert = true,
        ensureSafe = true,
        ensureFinite = true,
        preservePrecision = true
    } = {}) {
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

export default Utils;
