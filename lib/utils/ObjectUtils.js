'use strict';

import Path from '../path/Path.js';;
import StringUtils from './StringUtils.js';;

const hasOwnProperty = Object.prototype.hasOwnProperty;

class ObjectUtils {

    static clone(obj) {
        if (!ObjectUtils.isPlainObject(obj)) {
            return obj;
        }
        var clone = {};
        for (const key of Object.keys(obj)) {
            clone[key] = ObjectUtils.clone(obj[key]);
        }
        return clone;
    }

    static deepMerge(parent, child) {
        let stack = [[
            parent = ObjectUtils.clone(parent),
            ObjectUtils.clone(child)
        ]];
        while (stack.length) {
            const [parent, child] = stack.shift();
            for (const key of Object.keys(child)) {
                if (ObjectUtils.isPlainObject(parent[key]) && ObjectUtils.isPlainObject(child[key])) {
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

    static delimitedPathToArray(path, separator) {
        const trimmed = StringUtils.trim(path, separator);
        if (trimmed.length === 0) {
            return [];
        }
        const result = [];
        for (const piece of trimmed.split(separator)) {
            result.push(piece);
        }
        return result;
    }

    static removePath(obj, path) {
        const [pointer, key] = ObjectUtils.getPointerAtPath(obj, path, { create: false });
        if (pointer) {
            delete pointer[key];
            return true;
        }
        return false;
    }

    static *getAllPaths(obj, separator, {
        pathKeys = [],
        includeObjectRoots = false,
        rootsOnly = false
    } = {}) {
        const { isObject, getAllPaths } = ObjectUtils;
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

    static getAllPathsCount(obj, options = {}) {
        let count = 0;
        for (const _ of ObjectUtils.getAllPaths(obj, '', options)) {
            count++;
        }
        return count;
    }

    static getDepth(obj, maxDepth = null) {
        if (!ObjectUtils.isObject(obj)) {
            return 0;
        }
        let depth = 1;
        const { isObject, getDepth } = ObjectUtils;
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

        if (!ObjectUtils.isObject(obj)) {
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
            if (ObjectUtils.isObject(value)) {
                const childResult = ObjectUtils.getDepthAndKeyCount(value, {
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

    static getPointerAtPath(obj, path, { create = true, overwrite = false } = {}) {
        let { pathKeys } = path;
        const { isObject } = ObjectUtils;
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

    static getRecursiveKeyCount(obj, maxKeyCount = null) {
        if (!ObjectUtils.isObject(obj)) {
            return 0;
        }
        let count = 0;
        const { isObject, getRecursiveKeyCount } = ObjectUtils;
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

    static getValueAtPath(obj, path) {
        const { pathKeys } = path;
        let pointer = obj;
        if (pathKeys.length === 0) {
            return obj;
        }
        const { isObject } = ObjectUtils;
        for (const key of pathKeys) {
            if (isObject(pointer)) {
                pointer = pointer[key];
            }
            else {
                return undefined;
            }
        }
        return pointer;
    }

    static hasMoreThanXPaths(obj, count, options = {}) {
        let found = 0;
        for (const _ of ObjectUtils.getAllPaths(obj, '', options)) {
            found++;
            if (found > count) {
                return true;
            }
        }
        return false;
    }

    static hasPath(obj, path) {
        const [pointer,] = ObjectUtils.getPointerAtPath(obj, path, { create: false, overwrite: false });
        return Boolean(pointer);
    }

    static isPlainObject(obj) {
        return !!obj && obj.constructor === Object;
    }

    static isObject(obj) {
        return !!obj && typeof obj === 'object';
    }

    static setPathValue(obj, path, value, { create = true, overwrite = true } = {}) {
        const { getPointerAtPath } = ObjectUtils;
        const [objRef, key] = getPointerAtPath(obj, path, { create, overwrite });
        if (objRef && (overwrite || create && objRef[key] === undefined)) {
            objRef[key] = value;
            return true;
        }
        return false;
    }


    //todo: put a max on here?
    static unflatten(x, { separator = '/' } = {}) {
        const obj = {};
        for (const path of Object.keys(x)) {
            const value = x[path];
            let pointer = obj;
            const pieces = this.delimitedPathToArray(path, separator);
            const max = pieces.length - 1;
            for (let i = 0; i < max; i++) {
                if (!ObjectUtils.isPlainObject(pointer[pieces[i]])) {
                    pointer[pieces[i]] = {};
                }
                pointer = pointer[pieces[i]];
            }
            pointer[pieces[max]] = value;
        }
        return obj;
    }

}

export default ObjectUtils;