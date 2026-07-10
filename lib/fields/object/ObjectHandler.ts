'use strict';
//todo: the paths below need to accept both strings and actual Path
import { Utils } from '../../Utils.ts';
import { AnyHandler } from '../any/AnyHandler.ts';
import { HandlerResult } from '../HandlerResult.ts';
const { pass, fail } = HandlerResult;

class ObjectHandler extends AnyHandler { 

    // **************************************
    //              VALIDATORS
    // **************************************

    /**
     * Validates that a value is considered empty for object use-cases.
     * @param value Value being validated.
     * @param empties Values that should be treated as empty.
     * @returns Returns the original value when it is considered empty for this object check; otherwise returns a validation error.
     */
    public override empty(value: any, empties: any= [null, undefined]): HandlerResult {
        return super.empty(value, empties).pass || Object.keys(value).length === 0 ? pass(value) : fail(value, 'object/empty');
    }

    /**
     * Validates that a value is not considered empty for object use-cases.
     * @param value Value being validated.
     * @param empties Values that should be treated as empty.
     * @returns Returns the original value when it is considered not empty for this object check; otherwise returns a validation error.
     */
    public override notEmpty(value: any, empties: any= [null, undefined]): HandlerResult {
        return super.empty(value, empties).fail && Object.keys(value).length > 0 ? pass(value) : fail(value, 'object/notEmpty');
    }

    /**
     * Validates that an object has a defined value at the specified property key.
     * @param value Object to inspect.
     * @param property Property name to check.
     * @returns Returns the original object when the property exists with a defined value; otherwise returns a validation error.
     */
    public property(value: any, property: any): HandlerResult {
        if (value == null) {
            return fail(value, 'object/property', { property });
        }
        return value[property] !== undefined
            ? pass(value)
            : fail(value, 'object/property', { property });
    }

    /**
     * Validates that an object was constructed by a specific constructor.
     * @param obj Value being validated.
     * @param constructor Constructor the object must match.
     * @returns Returns the original value when its constructor matches the expected constructor; otherwise returns a validation error.
     */
    public instanceOf(obj: any, constructor: any): HandlerResult {
        return obj.constructor === constructor
            ? pass(obj)
            : fail(obj, 'object/instanceOf', { constructor });
    }

    /**
     * Validates that an object's depth does not exceed a maximum.
     * @param obj Object to inspect.
     * @param maxDepth Maximum allowed depth.
     * @returns Returns the original object when its depth is not greater than the maximum; otherwise returns a validation error.
     */
    public maxDepth(obj: any, maxDepth: any): HandlerResult {
        const actualDepth = Utils.getDepth(obj);
        return actualDepth > maxDepth
            ? fail(obj, 'object/maxDepth', { actualDepth, maxDepth })
            : pass(obj);
    }

    /**
     * Validates that an object's depth meets a minimum.
     * @param obj Object to inspect.
     * @param minDepth Minimum required depth.
     * @returns Returns the original object when its depth is at least the minimum; otherwise returns a validation error.
     */
    public minDepth(obj: any, minDepth: any): HandlerResult {
        const actualDepth = Utils.getDepth(obj);
        return actualDepth < minDepth
            ? fail(obj, 'object/minDepth', { actualDepth, minDepth })
            : pass(obj);
    }

    /**
     * Validates that an object's depth matches an exact value.
     * @param obj Object to inspect.
     * @param depth Required depth value.
     * @returns Returns the original object when its depth matches exactly; otherwise returns a validation error.
     */
    public depth(obj: any, depth: any): HandlerResult {
        const actualDepth = Utils.getDepth(obj);
        return actualDepth !== depth
            ? fail(obj, 'object/depth', { actualDepth, depth })
            : pass(obj);
    }

    /**
     * Validates that the number of top-level keys does not exceed a maximum.
     * @param obj Object to inspect.
     * @param maxKeyCount Maximum allowed top-level key count.
     * @returns Returns the original object when top-level key count is within the maximum; otherwise returns a validation error.
     */
    public maxKeyCount(obj: any, maxKeyCount: any): HandlerResult {
        const actualKeyCount = Object.keys(obj).length;
        return actualKeyCount > maxKeyCount
            ? fail(obj, 'object/maxKeyCount', { actualKeyCount, maxKeyCount })
            : pass(obj);
    }

    /**
     * Validates that the total recursive key count does not exceed a maximum.
     * @param obj Object to inspect.
     * @param maxKeyCount Maximum allowed recursive key count.
     * @returns Returns the original object when recursive key count is within the maximum; otherwise returns a validation error.
     */
    public maxKeyCountRecursive(obj: any, maxKeyCount: any): HandlerResult {
        const actualKeyCount = Utils.getRecursiveKeyCount(obj);
        return actualKeyCount > maxKeyCount
            ? fail(obj, 'object/maxKeyCountRecursive', { actualKeyCount, maxKeyCount })
            : pass(obj);
    }

    /**
     * Validates that the number of top-level keys meets a minimum.
     * @param obj Object to inspect.
     * @param minKeyCount Minimum required top-level key count.
     * @returns Returns the original object when top-level key count is at least the minimum; otherwise returns a validation error.
     */
    public minKeyCount(obj: any, minKeyCount: any): HandlerResult {
        const actualKeyCount = Object.keys(obj).length;
        return actualKeyCount < minKeyCount
            ? fail(obj, 'object/minKeyCount', { actualKeyCount, minKeyCount })
            : pass(obj);
    }

    /**
     * Validates that the total recursive key count meets a minimum.
     * @param obj Object to inspect.
     * @param minKeyCount Minimum required recursive key count.
     * @returns Returns the original object when recursive key count is at least the minimum; otherwise returns a validation error.
     */
    public minKeyCountRecursive(obj: any, minKeyCount: any): HandlerResult {
        const actualKeyCount = Utils.getRecursiveKeyCount(obj);
        return actualKeyCount < minKeyCount
            ? fail(obj, 'object/minKeyCountRecursive', { actualKeyCount, minKeyCount })
            : pass(obj);
    }

    /**
     * Validates that an object has an exact number of top-level keys.
     * @param obj Object to inspect.
     * @param keyCount Required top-level key count.
     * @returns Returns the original object when top-level key count matches exactly; otherwise returns a validation error.
     */
    public keyCount(obj: any, keyCount: any): HandlerResult {
        const actualKeyCount = Object.keys(obj).length;
        return actualKeyCount !== keyCount
            ? fail(obj, 'object/keyCount', { actualKeyCount, keyCount })
            : pass(obj);
    }

    /**
     * Validates that an object has an exact recursive key count.
     * @param obj Object to inspect.
     * @param keyCount Required recursive key count.
     * @returns Returns the original object when recursive key count matches exactly; otherwise returns a validation error.
     */
    public keyCountRecursive(obj: any, keyCount: any): HandlerResult {
        const actualKeyCount = Utils.getRecursiveKeyCount(obj);
        return actualKeyCount !== keyCount
            ? fail(obj, 'object/keyCountRecursive', { actualKeyCount, keyCount })
            : pass(obj);
    }

    /**
     * Validates that none of the provided paths exist on an object.
     * @param obj Object to inspect.
     * @param paths Paths that must all be absent.
     * @returns Returns the original object when none of the provided paths exist; otherwise returns a validation error.
     */
    public noneOfPaths(obj: any, paths: any= []): HandlerResult {
        return this.someOfPaths(obj, paths)._pass
            ? fail(obj, 'object/noneOfPaths', { paths })
            : pass(obj);
    }

    /**
     * Validates that at least one of the provided paths exists on an object.
     * @param obj Object to inspect.
     * @param paths Candidate paths where at least one must exist.
     * @returns Returns the original object when at least one provided path exists; otherwise returns a validation error.
     */
    public someOfPaths(obj: any, paths: any= []): HandlerResult {
        for (const path of paths) {
            if (Utils.hasPath(obj, path)) {
                return pass(obj);
            }
        }
        return fail(obj, 'object/someOfPaths', { paths });
    }

    /**
     * Validates that all provided paths exist on an object.
     * @param obj Object to inspect.
     * @param paths Paths that must all exist.
     * @returns Returns the original object when all provided paths exist; otherwise returns a validation error.
     */
    public allOfPaths(obj: any, paths: any= []): HandlerResult {
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
     * Validates that an object has exactly the provided paths and no extras.
     * @param obj Object to inspect.
     * @param paths Paths that must exactly match object path count and membership.
     * @returns Returns the original object when its paths exactly match the provided set; otherwise returns a validation error.
     */
    public exactlyPaths(obj: any, paths: any= []): HandlerResult {
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
     * Validates that an object's existing paths are a subset of the provided paths.
     * @param obj Object to inspect.
     * @param paths Allowed paths.
     * @returns Returns the original object when existing paths stay within the allowed set; otherwise returns a validation error.
     */
    public onlyPaths(obj: any, paths: any= []): HandlerResult {
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
     * Validates that an object has at least one path outside the provided set.
     * @param obj Object to inspect.
     * @param paths Paths that should not be the complete set of object paths.
     * @returns Returns the original object when at least one path exists outside the provided set; otherwise returns a validation error.
     */
    public pathsOtherThan(obj: any, paths: any= []): HandlerResult {
        return this.onlyPaths(obj, paths)._pass
            ? fail(obj, 'object/pathsOtherThan', { paths })
            : pass(obj);
    }

    /**
     * Validates that exactly a specific number of provided paths exist.
     * @param obj Object to inspect.
     * @param count Exact number of matching paths required.
     * @param paths Candidate paths to count.
     * @returns Returns the original object when exactly the requested number of paths are present; otherwise returns a validation error.
     */
    public xOfPaths(obj: any, count: any, paths: any= []): HandlerResult {
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
     * Validates that all but a specified number of provided paths exist.
     * @param obj Object to inspect.
     * @param count Number of paths that may be missing.
     * @param paths Candidate paths to evaluate.
     * @returns Returns the original object when all but the allowed number of paths are present; otherwise returns a validation error.
     */
    public allOfButXOfPaths(obj: any, count: any, paths: any= []): HandlerResult {
        return this.xOfPaths(obj, paths.length - count, paths)._pass
            ? pass(obj)
            : fail(obj, 'object/allOfButXOfPaths', { count, paths });
    }

    /**
     * Validates that a value is a plain object.
     * @param obj Value being validated.
     * @returns Returns the original value when it is a plain object; otherwise returns a validation error.
     */
    public plain(obj: any): HandlerResult {
        return Utils.isPlainObject(obj) ? pass(obj) : fail(obj, 'object/plain');
    }



    // **********************************************
    //                 MUTATORS
    // **********************************************

    /**
     * Returns a new object containing a random subset of keys.
     * @param obj Source object.
     * @param count Number of keys to keep in the returned object.
     * @returns Returns a new object containing up to the requested number of randomly selected keys.
     */
    public pickRandom(obj: any, count: any): HandlerResult {
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
     * Removes top-level keys whose values are in the provided empty-values list.
     * @param obj Source object.
     * @param emptyValues Values that should be removed.
     * @returns Returns a new object with top-level keys removed when their values are considered empty.
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
     * Recursively removes keys whose values are in the provided empty-values list.
     * @param obj Source object.
     * @param emptyValues Values that should be removed.
     * @returns Returns a new object with empty values removed recursively through nested plain objects.
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
     * Renames object keys using a pattern replacement.
     * @param obj Source object.
     * @param fromRegex Pattern to match in each key.
     * @param toRegex Replacement used for matched key segments.
     * @param options Rename behavior options.
     * @returns Returns a new object with keys renamed according to the provided pattern and options.
     */
    public renameKeys(obj: Object, fromRegex: RegExp, toRegex: RegExp, {
        deleteOriginalKey = true,
        overrideExistingKey = true
    } = {}): HandlerResult {
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
     * Removes all provided paths from an object in place.
     * @param obj Object to modify.
     * @param paths Paths to remove.
     * @returns Returns the same object after attempting to remove each provided path.
     */
    public removePaths(obj: any, paths: any= []): HandlerResult {
        for (const path of paths) {
            Utils.removePath(obj, path);
        }
        return pass(obj);
    }

    /**
     * Sets multiple object paths to corresponding values.
     * @param obj Object to modify.
     * @param pathValues Mapping of path strings to values.
     * @param overwrite Whether existing values may be overwritten.
     * @param create Whether missing path segments may be created.
     * @returns Returns the same object after attempting to set each provided path/value pair.
     */
    public setPaths(obj: any, pathValues: any= {}, overwrite: any= true, create: any= true): HandlerResult {
        for (const path of Object.keys(pathValues)) {
            Utils.setPathValue(obj, path as any, pathValues[path], create, overwrite);
        }
        return pass(obj);
    }

    /**
     * Returns a new object containing only the specified keys.
     * @param obj Source object.
     * @param exceptFor Keys to keep.
     * @returns Returns a new object containing only the keys listed in exceptFor.
     */
    public stripKeys(obj: any, exceptFor: any= []): HandlerResult {
        const copy: Record<string, any> = {};
        for (const key of exceptFor) {
            copy[key] = obj[key];
        }
        return pass(copy);
    }
}

export { ObjectHandler };





