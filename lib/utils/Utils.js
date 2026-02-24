'use strict';

import Field from '../fields/Field.js';
import Utils from './Utils.js';
import Path from '../Path.js';

const hasOwnProperty = Object.prototype.hasOwnProperty;

class Utils {


    static clone(obj) {
        var clone = {};
        for (const key of Object.keys(obj)) {
            clone[key] = this.clone(obj[key]);
        }
        return clone;
    }

    static isPlainObject(obj) {
        return !!obj && obj.constructor === Object;
    }

    static isObject(obj) {
        return !!obj && typeof obj === 'object';
    }

    static deepMerge(parent, child) {
        let stack = [[
            parent = this.clone(parent),
            this.clone(child)
        ]];
        while (stack.length) {
            const [parent, child] = stack.shift();
            for (const key of Object.keys(child)) {
                if (this.isPlainObject(parent[key]) && this.isPlainObject(child[key])) {
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

    static *getAllPaths(obj, separator, {
        pathKeys = [],
        includeObjectRoots = false,
        rootsOnly = false
    } = {}) {
        const { isObject, getAllPaths } = this;
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (isObject(value)) {
                if (includeObjectRoots || rootsOnly) {
                    yield Path.createFromArray(pathKeys.concat(key), { separator });
                }
                yield* getAllPaths(value, separator, {
                    pathKeys: pathKeys.concat(key),
                    includeObjectRoots,
                    rootsOnly
                });
            }
            else if (!rootsOnly) {
                yield Path.createFromArray(pathKeys.concat(key), { separator });
            }
        }
    }

    static getPathCount(obj, options = {}) {
        let count = 0;
        for (const _ of this.getAllPaths(obj, '', options)) {
            count++;
        }
        return count;
    }

    static getDepth(obj, maxDepth = null) {
        if (!this.isObject(obj)) {
            return 0;
        }
        let depth = 1;
        const { isObject, getDepth } = this;
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

        if (!this.isObject(obj)) {
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
            if (this.isObject(value)) {
                const childResult = this.getDepthAndKeyCount(value, {
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
        if (!this.isObject(obj)) {
            return 0;
        }
        let count = 0;
        const { isObject, getRecursiveKeyCount } = this;
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

    static removePath(obj, path) {
        const [pointer, key] = this.getPathPointer(obj, path, { create: false });
        if (pointer) {
            delete pointer[key];
            return true;
        }
        return false;
    }

    static getPathPointer(obj, path, { create = true, overwrite = false } = {}) {
        let { pathKeys } = path;
        const { isObject } = this;
        if (!isObject(obj) || pathKeys.length === 0) {
            return [];
        }

        const lastKey = pathKeys.pop();
        let pointer = obj;

        for (const key of pathKeys) {
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
        const { isObject } = this;
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
        const [pointer,] = this.getPathPointer(obj, path, { create: false, overwrite: false });
        return Boolean(pointer);
    }

    static setPathValue(obj, path, value, { create = true, overwrite = true } = {}) {
        const { getPathPointer: getPointerAtPath } = this;
        const [objRef, key] = getPointerAtPath(obj, path, { create, overwrite });
        if (objRef && (overwrite || create && objRef[key] === undefined)) {
            objRef[key] = value;
            return true;
        }
        return false;
    }


    static xor(x, y) {
        return !!x != !!y;
    }

    static areEqual(x, y) {
        if (x === y) {
            return true;
        }

        const xIsChain = x instanceof Field;
        const yIsChain = y instanceof Field;

        if (this.xor(xIsChain, yIsChain)) {
            const [chain, value] = (xIsChain && [x, y]) || (yIsChain && [y, x]);
            return chain.process(value).pass;
        }

        if (Array.isArray(x)) {
            if (!Array.isArray(y) || x.length !== y.length) {
                return false;
            }
            for (let i = 0, max = x.length; i < max; i++) {
                if (!this.areEqual(x[i], y[i])) {
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
            if (!hasOwnProperty.call(y, key) || !this.areEqual(x[key], y[key])) {
                return false;
            }
        }
        return true;
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

}

export default Utils;


