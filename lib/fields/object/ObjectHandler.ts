'use strict';

import { Path } from '../../Path.ts';
import { Utils } from '../../Utils.ts';
import { AnyHandler } from '../any/AnyHandler.ts';
import { HandlerResult } from '../HandlerResult.ts';
const { pass, fail } = HandlerResult;

class ObjectHandler extends AnyHandler {

    /**
     * Validates that all provided paths exist on an object.
     * @param obj Object to inspect.
     * @param paths Paths that must all exist.
     * @returns Returns the original object when all provided paths exist; otherwise returns a validation error.
     */
    public allOfPaths(obj: object, paths: (string | Path)[] = []): HandlerResult {
        const finalPaths = [];
        for (const path of paths) {
            finalPaths.push(new Path(path));
        }
        const missingPaths = [];
        const { hasPath } = Utils;
        for (const path of finalPaths) {
            if (!hasPath(obj, path)) {
                missingPaths.push(path);
            }
        }
        return missingPaths.length === 0
            ? pass(obj)
            : fail(obj, 'object/allOfPaths', { missingPaths });
    }

    /**
     * Validates that all but a specified number of provided paths exist.
     * @param obj Object to inspect.
     * @param count Number of paths that may be missing.
     * @param paths Candidate paths to evaluate.
     * @returns Returns the original object when all but the allowed number of paths are present; otherwise returns a validation error.
     */
    public allOfButXOfPaths(obj: object, count: number, paths: (string | Path)[] = []): HandlerResult {
        return this.xOfPaths(obj, paths.length - count, paths).pass
            ? pass(obj)
            : fail(obj, 'object/allOfButXOfPaths', { count, paths });
    }

    /**
     * Validates that an object's depth matches an exact value.
     * @param obj Object to inspect.
     * @param depth Required depth value.
     * @returns Returns the original object when its depth matches exactly; otherwise returns a validation error.
     */
    public depth(obj: object, depth: number): HandlerResult {
        const actualDepth = Utils.getDepth(obj, depth - 1);
        return actualDepth === false || actualDepth as number !== depth
            ? fail(obj, 'object/depth', { actualDepth, depth })
            : pass(obj);
    }

    /**
     * Validates that a value is considered empty for object use-cases.
     * @param obj Value being validated.
     * @param empties Values that should be treated as empty.
     * @returns Returns the original value when it is considered empty for this object check; otherwise returns a validation error.
     */
    public override empty(obj: object): HandlerResult {
        return Object.keys(obj).length === 0 ? pass(obj) : fail(obj, 'object/empty');
    }

    /**
     * Validates that an object has exactly the provided paths and no extras.
     * @param obj Object to inspect.
     * @param paths Paths that must exactly match object path count and membership.
     * @returns Returns the original object when its paths exactly match the provided set; otherwise returns a validation error.
     */
    public exactlyPaths(obj: object, paths: (string | Path)[] = []): HandlerResult {
        if (Utils.getPathCount(obj) !== paths.length) {
            return fail(obj, 'object/exactlyPaths', { paths });
        }
        for (const path of paths) {
            if (!Utils.hasPath(obj, new Path(path))) {
                return fail(obj, 'object/exactlyPaths', { paths });
            }
        }
        return pass(obj);
    }

    /**
     * Validates that an object has an exact number of top-level keys.
     * @param obj Object to inspect.
     * @param keyCount Required top-level key count.
     * @returns Returns the original object when top-level key count matches exactly; otherwise returns a validation error.
     */
    public keyCount(obj: object, keyCount: number): HandlerResult {
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
    public keyCountRecursive(obj: object, keyCount: number): HandlerResult {
        const actualKeyCount = Utils.getRecursiveKeyCount(obj, keyCount - 1);
        return actualKeyCount === false || actualKeyCount as number !== keyCount
            ? fail(obj, 'object/keyCountRecursive', { actualKeyCount, keyCount })
            : pass(obj);
    }

    /**
     * Validates that an object's depth does not exceed a maximum.
     * @param obj Object to inspect.
     * @param maxDepth Maximum allowed depth.
     * @returns Returns the original object when its depth is not greater than the maximum; otherwise returns a validation error.
     */
    public maxDepth(obj: object, maxDepth: number): HandlerResult {
        const actualDepth = Utils.getDepth(obj, maxDepth + 1);
        return actualDepth === false
            ? fail(obj, 'object/maxDepth', { actualDepth, maxDepth })
            : pass(obj);
    }

    /**
     * Validates that the number of top-level keys does not exceed a maximum.
     * @param obj Object to inspect.
     * @param maxKeyCount Maximum allowed top-level key count.
     * @returns Returns the original object when top-level key count is within the maximum; otherwise returns a validation error.
     */
    public maxKeyCount(obj: object, maxKeyCount: number): HandlerResult {
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
    public maxKeyCountRecursive(obj: object, maxKeyCount: number): HandlerResult {
        const actualKeyCount = Utils.getRecursiveKeyCount(obj, maxKeyCount + 1);
        return actualKeyCount === false
            ? fail(obj, 'object/maxKeyCountRecursive', { actualKeyCount, maxKeyCount })
            : pass(obj);
    }

    /**
     * Validates that an object's depth meets a minimum.
     * @param obj Object to inspect.
     * @param minDepth Minimum required depth.
     * @returns Returns the original object when its depth is at least the minimum; otherwise returns a validation error.
     */
    public minDepth(obj: object, minDepth: number): HandlerResult {
        const actualDepth = Utils.getDepth(obj, minDepth + 1);
        return actualDepth === false
            ? pass(obj)
            : fail(obj, 'object/minDepth', { actualDepth, minDepth })
    }

    /**
     * Validates that the number of top-level keys meets a minimum.
     * @param obj Object to inspect.
     * @param minKeyCount Minimum required top-level key count.
     * @returns Returns the original object when top-level key count is at least the minimum; otherwise returns a validation error.
     */
    public minKeyCount(obj: object, minKeyCount: number): HandlerResult {
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
    public minKeyCountRecursive(obj: object, minKeyCount: number): HandlerResult {
        const actualKeyCount = Utils.getRecursiveKeyCount(obj, minKeyCount + 1);
        return actualKeyCount === false
            ? pass(obj)
            : fail(obj, 'object/minKeyCountRecursive', { actualKeyCount, minKeyCount });
    }

    /**
     * Validates that none of the provided paths exist on an object.
     * @param obj Object to inspect.
     * @param paths Paths that must all be absent.
     * @returns Returns the original object when none of the provided paths exist; otherwise returns a validation error.
     */
    public noneOfPaths(obj: object, paths: (string | Path)[] = []): HandlerResult {
        return this.someOfPaths(obj, paths).pass
            ? fail(obj, 'object/noneOfPaths', { paths })
            : pass(obj);
    }

    /**
     * Validates that a value is not considered empty for object use-cases.
     * @param obj Value being validated.
     * @param empties Values that should be treated as empty.
     * @returns Returns the original value when it is considered not empty for this object check; otherwise returns a validation error.
     */
    public override notEmpty(obj: object): HandlerResult {
        return Object.keys(obj).length > 0 ? pass(obj) : fail(obj, 'object/notEmpty');
    }

    /**
     * Validates that an object's existing paths are a subset of the provided paths.
     * @param obj Object to inspect.
     * @param paths Allowed paths.
     * @returns Returns the original object when existing paths stay within the allowed set; otherwise returns a validation error.
     */
    public onlyPaths(obj: object, paths: (string | Path)[] = []): HandlerResult {
        let pathsFound = 0;
        for (const path of paths) {
            if (Utils.hasPath(obj, new Path(path))) {
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
    public pathsOtherThan(obj: object, paths: (string | Path)[] = []): HandlerResult {
        return this.onlyPaths(obj, paths).pass
            ? fail(obj, 'object/pathsOtherThan', { paths })
            : pass(obj);
    }

    /**
     * Validates that a value is a plain object.
     * @param obj Value being validated.
     * @returns Returns the original value when it is a plain object; otherwise returns a validation error.
     */
    public plain(obj: object): HandlerResult {
        return Utils.isPlainObject(obj) ? pass(obj) : fail(obj, 'object/plain');
    }

    /**
     * Validates that an object has a defined value at the specified property key.
     * @param obj Object to inspect.
     * @param property Property name to check.
     * @returns Returns the original object when the property exists with a defined value; otherwise returns a validation error.
     */
    public property(obj: object, property: PropertyKey): HandlerResult {
        if (obj == null) {
            return fail(obj, 'object/property', { property });
        }
        return (obj as Record<PropertyKey, unknown>)[property] !== undefined
            ? pass(obj)
            : fail(obj, 'object/property', { property });
    }

    /**
     * Validates that at least one of the provided paths exists on an object.
     * @param obj Object to inspect.
     * @param paths Candidate paths where at least one must exist.
     * @returns Returns the original object when at least one provided path exists; otherwise returns a validation error.
     */
    public someOfPaths(obj: object, paths: (string | Path)[] = []): HandlerResult {
        for (const path of paths) {
            if (Utils.hasPath(obj, new Path(path))) {
                return pass(obj);
            }
        }
        return fail(obj, 'object/someOfPaths', { paths });
    }

    /**
     * Validates that exactly a specific number of provided paths exist.
     * @param obj Object to inspect.
     * @param count Exact number of matching paths required.
     * @param paths Candidate paths to count.
     * @returns Returns the original object when exactly the requested number of paths are present; otherwise returns a validation error.
     */
    public xOfPaths(obj: object, count: number, paths: (string | Path)[] = []): HandlerResult {
        let found = 0;
        for (const path of paths) {
            if (Utils.hasPath(obj, new Path(path))) {
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






    // **********************************************
    //                 MUTATORS
    // **********************************************

    /**
     * Returns a new object containing a random subset of keys.
     * @param obj Source object.
     * @param count Number of keys to keep in the returned object.
     * @returns Returns a new object containing up to the requested number of randomly selected keys.
     */
    public pickRandom(obj: object, count: number): HandlerResult {
        const keys = Object.keys(obj);
        if (count >= keys.length) {
            return pass(Object.assign({}, obj));
        }
        const newObject: Record<PropertyKey, unknown> = {};
        while (count > 0) {
            const randomKey = keys.splice(Math.floor(Math.random() * keys.length), 1)[0];
            newObject[randomKey] = (obj as Record<PropertyKey, unknown>)[randomKey];
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
    public removeEmpties(obj: object, emptyValues: unknown[] = [null, undefined]): HandlerResult {
        return this.removeValues(obj, emptyValues);
    }

    /**
     * Recursively removes keys whose values are in the provided empty-values list.
     * @param obj Source object.
     * @param emptyValues Values that should be removed.
     * @returns Returns a new object with empty values removed recursively through nested plain objects.
     */
    public removeEmptiesRecursive(obj: object, emptyValues: unknown[] = [null, undefined]): HandlerResult {
        return this.removeValuesRecursive(obj, emptyValues);
    }

    /**
     * Returns a new object containing only the specified keys.
     * @param obj Source object.
     * @param exceptFor Keys to keep.
     * @returns Returns a new object containing only the keys listed in exceptFor.
     */
    public removeKeys(obj: object, exceptFor: PropertyKey[] = []): HandlerResult {
        const newObj: Record<PropertyKey, unknown> = {};
        for (const key of exceptFor) {
            newObj[key] = (obj as Record<PropertyKey, unknown>)[key];
        }
        return pass(newObj);
    }

    /**
     * Removes all provided paths from an object in place.
     * @param obj Object to modify.
     * @param paths Paths to remove.
     * @returns Returns the same object after attempting to remove each provided path.
     */
    public removePaths(obj: object, paths: (string | Path)[] = []): HandlerResult {
        for (const path of paths) {
            Utils.removePath(obj, new Path(path));
        }
        return pass(obj);
    }

    /**
     * Removes top-level keys whose values are in the provided values list.
     * @param obj Source object.
     * @param values Values that should be removed.
     * @returns Returns a new object with top-level keys removed when their values are in the provided list.
     */
    public removeValues(obj: object, values: unknown[] = [null, undefined]): HandlerResult {
        const newObj: Record<PropertyKey, unknown> = {};
        for (const key of Object.keys(obj)) {
            const value = (obj as Record<PropertyKey, unknown>)[key];
            if (values.indexOf(value) === -1) {
                newObj[key] = value;
            }
        }
        return pass(newObj);
    }

    /**
     * Recursively removes keys whose values are in the provided values list.
     * @param obj Source object.
     * @param values Values that should be removed.
     * @returns Returns a new object with empty values removed recursively through nested plain objects.
     */
    public removeValuesRecursive(obj: object, values: unknown[] = [null, undefined]): HandlerResult {
        const newObj: Record<PropertyKey, unknown> = {};
        for (const key of Object.keys(obj)) {
            const value = (obj as Record<PropertyKey, unknown>)[key];
            if (Utils.isPlainObject(value)) {
                const cleaned = this.removeValuesRecursive(value as object, values);
                if (Object.keys(cleaned).length > 0) {
                    newObj[key] = cleaned;
                }
            }
            else if (values.indexOf(value) === -1) {
                newObj[key] = value;
            }
        }
        return pass(newObj);
    }

    /**
     * Renames object keys using a pattern replacement.
     * @param obj Source object.
     * @param fromRegex Pattern to match in each key.
     * @param toRegex Replacement used for matched key segments.
     * @param options Rename behavior options.
     * @returns Returns a new object with keys renamed according to the provided pattern and options.
     */
    public renameKeys(obj: Object, fromRegex: RegExp, toRegex: RegExp, deleteOriginalKey = true, overrideExistingKey = true): HandlerResult {
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
     * Sets multiple object paths to corresponding values.
     * @param obj Object to modify.
     * @param pathValues Mapping of path strings to values.
     * @param overwrite Whether existing values may be overwritten.
     * @param create Whether missing path segments may be created.
     * @returns Returns the same object after attempting to set each provided path/value pair.
     */
    public setPaths(obj: object, pathValues: any = {}, overwrite = true, create = true): HandlerResult {
        for (const path of Object.keys(pathValues)) {
            Utils.setPathValue(obj, path as any, pathValues[path], create, overwrite);
        }
        return pass(obj);
    }


}

export { ObjectHandler };





