'use strict';

import ObjectUtils  from '../utils/ObjectUtils.js';
import GenericProcessors  from './GenericProcessors.js';
import { pass, fail }  from '../Result.js';

class ObjectProcessors extends GenericProcessors {

    // Validators

    static empty(value) {
        return Object.keys(value).length === 0 ? pass(value) : fail(value, 'object/empty');
    }

    static notEmpty(value) {
        return Object.keys(value).length > 0 ? pass(value) : fail(value, 'object/notEmpty');
    }

    static property(value, property) {
        if (value == null) {
            return fail(value, 'object/property', { property });
        }
        return value[property] !== undefined
            ? pass(value)
            : fail(value, 'object/property', { property });
    }

    static instanceOf(obj, constructor) {
        return obj.constructor === constructor
            ? pass(obj)
            : fail(obj, 'object/instanceOf', { constructor });
    }

    static maxDepth(obj, maxDepth) {
        const actualDepth = ObjectUtils.getDepth(obj);
        return actualDepth > maxDepth
            ? fail(obj, 'object/maxDepth', { actualDepth, maxDepth })
            : pass(obj);
    }

    static minDepth(obj, minDepth) {
        const actualDepth = ObjectUtils.getDepth(obj);
        return actualDepth < minDepth
            ? fail(obj, 'object/minDepth', { actualDepth, minDepth })
            : pass(obj);
    }

    static depth(obj, depth) {
        const actualDepth = ObjectUtils.getDepth(obj);
        return actualDepth !== depth
            ? fail(obj, 'object/depth', { actualDepth, depth })
            : pass(obj);
    }

    static maxKeyCount(obj, maxKeyCount) {
        const actualKeyCount = Object.keys(obj).length;
        return actualKeyCount > maxKeyCount
            ? fail(obj, 'object/maxKeyCount', { actualKeyCount, maxKeyCount })
            : pass(obj);
    }

    static maxKeyCountRecursive(obj, maxKeyCount) {
        const actualKeyCount = ObjectUtils.getRecursiveKeyCount(obj);
        return actualKeyCount > maxKeyCount
            ? fail(obj, 'object/maxKeyCountRecursive', { actualKeyCount, maxKeyCount })
            : pass(obj);
    }

    static minKeyCount(obj, minKeyCount) {
        const actualKeyCount = Object.keys(obj).length;
        return actualKeyCount < minKeyCount
            ? fail(obj, 'object/minKeyCount', { actualKeyCount, minKeyCount })
            : pass(obj);
    }

    static minKeyCountRecursive(obj, minKeyCount) {
        const actualKeyCount = ObjectUtils.getRecursiveKeyCount(obj);
        return actualKeyCount < minKeyCount
            ? fail(obj, 'object/minKeyCountRecursive', { actualKeyCount, minKeyCount })
            : pass(obj);
    }

    static keyCount(obj, keyCount) {
        const actualKeyCount = Object.keys(obj).length;
        return actualKeyCount !== keyCount
            ? fail(obj, 'object/keyCount', { keyCount })
            : pass(obj);
    }

    static keyCountRecursive(obj, keyCount) {
        const actualKeyCount = ObjectUtils.getRecursiveKeyCount(obj);
        return actualKeyCount !== keyCount
            ? fail(obj, 'object/keyCountRecursive', { keyCount })
            : pass(obj);
    }

    static noneOfPaths(obj, paths = []) {
        return this.prototype.someOfPaths(obj, paths).pass
            ? fail(obj, 'object/noneOfPaths', { paths })
            : pass(obj);
    }

    static someOfPaths(obj, paths = []) {
        for (const path of paths) {
            if (ObjectUtils.hasPath(obj, path)) {
                return pass(obj);
            }
        }
        return fail(obj, 'object/someOfPaths', { paths });
    }

    static allOfPaths(obj, paths = []) {
        const missingPaths = [];
        const { hasPath } = ObjectUtils;
        for (const path of paths) {
            if (!hasPath(obj, path)) {
                missingPaths.push(path);
            }
        }
        return missingPaths.length === 0
            ? pass(obj)
            : fail(obj, 'object/allOfPaths', { missingPaths });
    }

    static exactlyPaths(obj, paths = []) {
        if (ObjectUtils.hasMoreThanXPaths(obj, paths.length)) {
            return fail(obj, 'object/exactlyPaths', { paths });
        }
        for (const path of paths) {
            if (!ObjectUtils.hasPath(obj, path)) {
                return fail(obj, 'object/exactlyPaths', { paths });
            }
        }
        return pass(obj);
    }

    static onlyPaths(obj, paths = []) {
        let pathsFound = 0;
        for (const path of paths) {
            if (ObjectUtils.hasPath(obj, path)) {
                ++pathsFound;
            }
        }
        return pathsFound >= ObjectUtils.getAllPathsCount(obj)
            ? pass(obj)
            : fail(obj, 'object/onlyPaths', { paths });
    }

    static pathsOtherThan(obj, paths = []) {
        return this.prototype.onlyPaths(obj, paths).pass
            ? fail(obj, 'object/pathsOtherThan', { paths })
            : pass(obj);
    }

    static xOfPaths(obj, count, paths = []) {
        let found = 0;
        for (const path of paths) {
            if (ObjectUtils.hasPath(obj, path)) {
                found++;
                if (found > count) {
                    return fail(obj, 'object/xOfPaths', { paths, count });
                }
            }
        }
        return found === count
            ? pass(obj)
            : fail(obj, 'object/xOfPaths', { paths, count });
    }

    static allOfButXOfPaths(obj, count, paths = []) {
        return this.prototype.xOfPaths(obj, paths.length - count, paths).pass
            ? pass(obj)
            : fail(obj, 'object/allOfButXOfPaths', { count, paths });
    }

    static plain(obj) {
        return ObjectUtils.isPlainObject(obj) ? pass(obj) : fail(obj, 'object/plain');
    }


    // Transformers

    static pickRandom(obj, count) {
        const keys = Object.keys(obj);
        if (count >= keys.length) {
            return pass(Object.assign({}, obj));
        }
        const newObject = {};
        while (count > 0) {
            const randomKey = keys.splice(
                Math.floor(Math.random() * keys.length), 1
            )[0];
            newObject[randomKey] = obj[randomKey];
            --count;
        }
        return pass(newObject);
    }
    
    static removeEmpty(obj, emptyValues = [null, undefined]) {
        const newObj = {};
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (emptyValues.indexOf(value) === -1) {
                newObj[key] = value;
            }
        }
        return newObj;
    }

    static removeEmptyRecursive(obj, emptyValues = [null, undefined]) {
        const newObj = {};
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (ObjectUtils.isPlainObject(value)) {
                const cleaned = this.prototype.removeEmptyRecursive(value, emptyValues);
                if (Object.keys(cleaned).length > 0) {
                    newObj[key] = cleaned;
                }
            }
            else if (emptyValues.indexOf(value) === -1) {
                newObj[key] = value;
            }
        }
        return newObj;
    }

    static renameKey(obj, fromRegex, toRegex, {
        deleteOriginalKey = true,
        overrideExistingKey = true
    } = {}) {
        const objectCopy = Object.assign({}, obj);
        for (const originalKey of Object.keys(obj)) {
            let renamedKey = originalKey.replace(fromRegex, toRegex);
            if (objectCopy.hasOwnProperty(renamedKey) && !overrideExistingKey) {
                continue;
            }
            objectCopy[renamedKey] = objectCopy[originalKey];
            if (renamedKey !== originalKey && deleteOriginalKey) {
                delete objectCopy[originalKey];
            }
        }
        return pass(objectCopy);
    }

    static removePath(obj, paths = []) {
        for (const path of paths) {
            ObjectUtils.removePath(obj, path);
        }
        return pass(obj);
    }

    static setPath(obj, valueMap, overwrite = true, create = true) {
        for (const [path, value] of valueMap) {
            ObjectUtils.setPathValue(obj, path, value, { overwrite, create });
        }
        return pass(obj);
    }

    static stripUnknown(obj, knownKeys, { includeUndefined = false } = {}) {
        const copy = {};
        if (!includeUndefined) {
            for (const key of knownKeys) {
                if (includeUndefined || obj[key] !== undefined) {
                    copy[key] = obj[key];
                }
            }
        }
        else {
            for (const key of knownKeys) {
                copy[key] = obj[key];
            }
        }
        return pass(copy);
    }
}

export default  ObjectProcessors;





