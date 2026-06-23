'use strict';
//todo: the paths below need to accept both strings and actual Path
import { ChainHandlerResult } from '../ChainHandlerResult.ts';
import { Utils } from '../../Utils.ts';
import { ChainHandler } from '../ChainHandler.ts';
const { pass, fail } = ChainHandlerResult;

class ObjectHandler extends ChainHandler {

    // ====================================
    // VALIDATORS
    // ====================================

    /**
     * Executes the empty handler step.
     * @param {any} value
     * @param {any} empties
     * @returns {ChainHandlerResult}
     */
    public override empty(value: any, empties: any= [null, undefined]): ChainHandlerResult {
        return super.empty(value, empties).pass || Object.keys(value).length === 0 ? pass(value) : fail(value, 'object/empty');
    }

    /**
     * Executes the notEmpty handler step.
     * @param {any} value
     * @param {any} empties
     * @returns {ChainHandlerResult}
     */
    public override notEmpty(value: any, empties: any= [null, undefined]): ChainHandlerResult {
        return super.empty(value, empties).fail && Object.keys(value).length > 0 ? pass(value) : fail(value, 'object/notEmpty');
    }

    /**
     * Executes the property handler step.
     * @param {any} value
     * @param {any} property
     * @returns {ChainHandlerResult}
     */
    public property(value: any, property: any): ChainHandlerResult {
        if (value == null) {
            return fail(value, 'object/property', { property });
        }
        return value[property] !== undefined
            ? pass(value)
            : fail(value, 'object/property', { property });
    }

    /**
     * Executes the instanceOf handler step.
     * @param {any} obj
     * @param {any} constructor
     * @returns {ChainHandlerResult}
     */
    public instanceOf(obj: any, constructor: any): ChainHandlerResult {
        return obj.constructor === constructor
            ? pass(obj)
            : fail(obj, 'object/instanceOf', { constructor });
    }

    /**
     * Executes the maxDepth handler step.
     * @param {any} obj
     * @param {any} maxDepth
     * @returns {ChainHandlerResult}
     */
    public maxDepth(obj: any, maxDepth: any): ChainHandlerResult {
        const actualDepth = Utils.getDepth(obj);
        return actualDepth > maxDepth
            ? fail(obj, 'object/maxDepth', { actualDepth, maxDepth })
            : pass(obj);
    }

    /**
     * Executes the minDepth handler step.
     * @param {any} obj
     * @param {any} minDepth
     * @returns {ChainHandlerResult}
     */
    public minDepth(obj: any, minDepth: any): ChainHandlerResult {
        const actualDepth = Utils.getDepth(obj);
        return actualDepth < minDepth
            ? fail(obj, 'object/minDepth', { actualDepth, minDepth })
            : pass(obj);
    }

    /**
     * Executes the depth handler step.
     * @param {any} obj
     * @param {any} depth
     * @returns {ChainHandlerResult}
     */
    public depth(obj: any, depth: any): ChainHandlerResult {
        const actualDepth = Utils.getDepth(obj);
        return actualDepth !== depth
            ? fail(obj, 'object/depth', { actualDepth, depth })
            : pass(obj);
    }

    /**
     * Executes the maxKeyCount handler step.
     * @param {any} obj
     * @param {any} maxKeyCount
     * @returns {ChainHandlerResult}
     */
    public maxKeyCount(obj: any, maxKeyCount: any): ChainHandlerResult {
        const actualKeyCount = Object.keys(obj).length;
        return actualKeyCount > maxKeyCount
            ? fail(obj, 'object/maxKeyCount', { actualKeyCount, maxKeyCount })
            : pass(obj);
    }

    /**
     * Executes the maxKeyCountRecursive handler step.
     * @param {any} obj
     * @param {any} maxKeyCount
     * @returns {ChainHandlerResult}
     */
    public maxKeyCountRecursive(obj: any, maxKeyCount: any): ChainHandlerResult {
        const actualKeyCount = Utils.getRecursiveKeyCount(obj);
        return actualKeyCount > maxKeyCount
            ? fail(obj, 'object/maxKeyCountRecursive', { actualKeyCount, maxKeyCount })
            : pass(obj);
    }

    /**
     * Executes the minKeyCount handler step.
     * @param {any} obj
     * @param {any} minKeyCount
     * @returns {ChainHandlerResult}
     */
    public minKeyCount(obj: any, minKeyCount: any): ChainHandlerResult {
        const actualKeyCount = Object.keys(obj).length;
        return actualKeyCount < minKeyCount
            ? fail(obj, 'object/minKeyCount', { actualKeyCount, minKeyCount })
            : pass(obj);
    }

    /**
     * Executes the minKeyCountRecursive handler step.
     * @param {any} obj
     * @param {any} minKeyCount
     * @returns {ChainHandlerResult}
     */
    public minKeyCountRecursive(obj: any, minKeyCount: any): ChainHandlerResult {
        const actualKeyCount = Utils.getRecursiveKeyCount(obj);
        return actualKeyCount < minKeyCount
            ? fail(obj, 'object/minKeyCountRecursive', { actualKeyCount, minKeyCount })
            : pass(obj);
    }

    /**
     * Executes the keyCount handler step.
     * @param {any} obj
     * @param {any} keyCount
     * @returns {ChainHandlerResult}
     */
    public keyCount(obj: any, keyCount: any): ChainHandlerResult {
        const actualKeyCount = Object.keys(obj).length;
        return actualKeyCount !== keyCount
            ? fail(obj, 'object/keyCount', { actualKeyCount, keyCount })
            : pass(obj);
    }

    /**
     * Executes the keyCountRecursive handler step.
     * @param {any} obj
     * @param {any} keyCount
     * @returns {ChainHandlerResult}
     */
    public keyCountRecursive(obj: any, keyCount: any): ChainHandlerResult {
        const actualKeyCount = Utils.getRecursiveKeyCount(obj);
        return actualKeyCount !== keyCount
            ? fail(obj, 'object/keyCountRecursive', { actualKeyCount, keyCount })
            : pass(obj);
    }

    /**
     * Executes the noneOfPaths handler step.
     * @param {any} obj
     * @param {any} paths
     * @returns {ChainHandlerResult}
     */
    public noneOfPaths(obj: any, paths: any= []): ChainHandlerResult {
        return this.someOfPaths(obj, paths)._pass
            ? fail(obj, 'object/noneOfPaths', { paths })
            : pass(obj);
    }

    /**
     * Executes the someOfPaths handler step.
     * @param {any} obj
     * @param {any} paths
     * @returns {ChainHandlerResult}
     */
    public someOfPaths(obj: any, paths: any= []): ChainHandlerResult {
        for (const path of paths) {
            if (Utils.hasPath(obj, path)) {
                return pass(obj);
            }
        }
        return fail(obj, 'object/someOfPaths', { paths });
    }

    /**
     * Executes the allOfPaths handler step.
     * @param {any} obj
     * @param {any} paths
     * @returns {ChainHandlerResult}
     */
    public allOfPaths(obj: any, paths: any= []): ChainHandlerResult {
        const missingPaths = [];
        const { hasPath } = Utils;
        for (const path of paths) {
            if (!hasPath(obj, path)) {
                missingPaths.push(path);
            }
        }
        return missingPaths.length === 0
            ? pass(obj)
            : fail(obj, 'object/allOfPaths', { missingPaths });
    }

    /**
     * Executes the exactlyPaths handler step.
     * @param {any} obj
     * @param {any} paths
     * @returns {ChainHandlerResult}
     */
    public exactlyPaths(obj: any, paths: any= []): ChainHandlerResult {
        if (Utils.getPathCount(obj) !== paths.length) {
            return fail(obj, 'object/exactlyPaths', { paths });
        }
        for (const path of paths) {
            if (!Utils.hasPath(obj, path)) {
                return fail(obj, 'object/exactlyPaths', { paths });
            }
        }
        return pass(obj);
    }

    /**
     * Executes the onlyPaths handler step.
     * @param {any} obj
     * @param {any} paths
     * @returns {ChainHandlerResult}
     */
    public onlyPaths(obj: any, paths: any= []): ChainHandlerResult {
        let pathsFound = 0;
        for (const path of paths) {
            if (Utils.hasPath(obj, path)) {
                ++pathsFound;
            }
        }
        return pathsFound >= Utils.getPathCount(obj)
            ? pass(obj)
            : fail(obj, 'object/onlyPaths', { paths });
    }

    /**
     * Executes the pathsOtherThan handler step.
     * @param {any} obj
     * @param {any} paths
     * @returns {ChainHandlerResult}
     */
    public pathsOtherThan(obj: any, paths: any= []): ChainHandlerResult {
        return this.onlyPaths(obj, paths)._pass
            ? fail(obj, 'object/pathsOtherThan', { paths })
            : pass(obj);
    }

    /**
     * Executes the xOfPaths handler step.
     * @param {any} obj
     * @param {any} count
     * @param {any} paths
     * @returns {ChainHandlerResult}
     */
    public xOfPaths(obj: any, count: any, paths: any= []): ChainHandlerResult {
        let found = 0;
        for (const path of paths) {
            if (Utils.hasPath(obj, path)) {
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

    /**
     * Executes the allOfButXOfPaths handler step.
     * @param {any} obj
     * @param {any} count
     * @param {any} paths
     * @returns {ChainHandlerResult}
     */
    public allOfButXOfPaths(obj: any, count: any, paths: any= []): ChainHandlerResult {
        return this.xOfPaths(obj, paths.length - count, paths)._pass
            ? pass(obj)
            : fail(obj, 'object/allOfButXOfPaths', { count, paths });
    }

    /**
     * Executes the plain handler step.
     * @param {any} obj
     * @returns {ChainHandlerResult}
     */
    public plain(obj: any): ChainHandlerResult {
        return Utils.isPlainObject(obj) ? pass(obj) : fail(obj, 'object/plain');
    }



    // ====================================
    // MUTATORS
    // ====================================

    /**
     * Executes the pickRandom handler step.
     * @param {any} obj
     * @param {any} count
     * @returns {ChainHandlerResult}
     */
    public pickRandom(obj: any, count: any): ChainHandlerResult {
        const keys = Object.keys(obj);
        if (count >= keys.length) {
            return pass(Object.assign({}, obj));
        }
        const newObject: Record<string, any> = {};
        while (count > 0) {
            const randomKey = keys.splice(
                Math.floor(Math.random() * keys.length), 1
            )[0];
            newObject[randomKey] = obj[randomKey];
            --count;
        }
        return pass(newObject);
    }

    /**
     * Executes the removeEmpties handler step.
     * @param {any} obj
     * @param {any} emptyValues
     * @returns {any}
     */
    public removeEmpties(obj: any, emptyValues: any= [null, undefined]): any {
        const newObj: Record<string, any> = {};
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (emptyValues.indexOf(value) === -1) {
                newObj[key] = value;
            }
        }
        return newObj;
    }

    /**
     * Executes the removeEmptiesRecursive handler step.
     * @param {any} obj
     * @param {any} emptyValues
     * @returns {any}
     */
    public removeEmptiesRecursive(obj: any, emptyValues: any= [null, undefined]): any {
        const newObj: Record<string, any> = {};
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (Utils.isPlainObject(value)) {
                const cleaned = this.removeEmptiesRecursive(value, emptyValues);
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

    /**
     * Executes the renameKeys handler step.
     * @param {any} obj
     * @param {any} fromRegex
     * @param {any} toRegex
     * @param {any} param4
     * @returns {ChainHandlerResult}
     */
    public renameKeys(obj: Object, fromRegex: RegExp, toRegex: RegExp, {
        deleteOriginalKey = true,
        overrideExistingKey = true
    } = {}): ChainHandlerResult {
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

    /**
     * Executes the removePaths handler step.
     * @param {any} obj
     * @param {any} paths
     * @returns {ChainHandlerResult}
     */
    public removePaths(obj: any, paths: any= []): ChainHandlerResult {
        for (const path of paths) {
            Utils.removePath(obj, path);
        }
        return pass(obj);
    }

    /**
     * Executes the setPaths handler step.
     * @param {any} obj
     * @param {any} pathValues
     * @param {any} overwrite
     * @param {any} create
     * @returns {ChainHandlerResult}
     */
    public setPaths(obj: any, pathValues: any= {}, overwrite: any= true, create: any= true): ChainHandlerResult {
        for (const path of Object.keys(pathValues)) {
            Utils.setPathValue(obj, path as any, pathValues[path], create, overwrite);
        }
        return pass(obj);
    }

    /**
     * Executes the stripUnknownKeys handler step.
     * @param {any} obj
     * @param {any} exceptFor
     * @returns {ChainHandlerResult}
     */
    public stripKeys(obj: any, exceptFor: any= []): ChainHandlerResult {
        const copy: Record<string, any> = {};
        for (const key of exceptFor) {
            copy[key] = obj[key];
        }
        return pass(copy);
    }
}

export { ObjectHandler };





