'use strict';

const GenericChain = require('./GenericChain.js');
const ObjectProcessors = require('../../processors/ObjectProcessors.js');
const Path = require('../../path/PathFactory.js');
const ObjectUtils = require('../../utils/ObjectUtils.js');

function getUniquePathArray(paths) {
    const uniquePaths = new Set();
    const finalPaths = [];
    for (const path of paths) {
        const pathObj = Path.create(path);
        if (!uniquePaths.has(pathObj.path)) {
            uniquePaths.add(pathObj.path);
            finalPaths.push(pathObj);
        }
    }
    return finalPaths;
}

class ObjectChain extends GenericChain {

    constructor(props = {}) {
        super(props);
        this.props.clone = false;
    }



    get languageKey() {
        return 'object';
    }



    // Configurators
    configClone(clone = true) {
        return this.setProps({ clone });
    }

    // ...........................

    // Validators

    /**
     * Validates that the object has an exact depth of nested levels.
     * @param {number} depth - The exact depth the object must have
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.depth(2) // Object must be exactly 2 levels deep
     */
    depth(depth) {
        return this.addStep('depth', [depth]);
    }

    /**
     * Validates that the object is empty (has no keys).
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.empty() // Must be {} (empty object)
     */
    empty() {
        return this.addStep('empty');
    }

    /**
     * Validates that the object is not empty (has at least one key).
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.notEmpty() // Must have at least one property
     */
    notEmpty() {
        return this.addStep('notEmpty');
    }

    /**
     * Validates that the object has all but a specific number of the specified paths.
     * @param {number} count - Number of paths that can be missing
     * @param {...string} paths - The paths to check
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.allOfButXOfPaths(1, 'user.name', 'user.email', 'user.phone') // Missing at most 1 path
     */
    allOfButXOfPaths(count, ...pathDelims) {
        return this.addStep('allOfButXOfPaths', [count, getUniquePathArray(paths)]);
    }

    /**
     * Validates that the object has all of the specified paths.
     * @param {...string} paths - The paths that must exist
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.allOfPaths('user.name', 'user.email') // Must have both paths
     */
    allOfPaths(...pathDelims) {
        return this.addStep('allOfPaths', [getUniquePathArray(paths)]);
    }

    /**
     * Validates that the object has exactly the specified paths (no more, no less).
     * @param {...string} paths - The exact paths that must exist
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.exactlyPaths('id', 'name') // Must have only these 2 paths
     */
    exactlyPaths(...pathDelims) {
        return this.addStep('exactlyPaths', [getUniquePathArray(paths)]);
    }

    /**
     * Validates that the object has none of the specified paths.
     * @param {...string} paths - The paths that must not exist
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.noneOfPaths('password', 'secret') // Must not have these paths
     */
    noneOfPaths(...pathDelims) {
        return this.addStep('noneOfPaths', [getUniquePathArray(paths)]);
    }

    /**
     * Validates that the object has only the specified paths (subset validation).
     * @param {...string} paths - The allowed paths
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.onlyPaths('id', 'name', 'email') // Can only have these paths
     */
    onlyPaths(...pathDelims) {
        return this.addStep('onlyPaths', [getUniquePathArray(paths)]);
    }

    /**
     * Validates that the object has paths that are not in the specified list.
     * @param {...string} paths - The paths to exclude
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.pathsOtherThan('temp', 'cache') // Must have paths other than these
     */
    pathsOtherThan(...pathDelims) {
        return this.addStep('pathsOtherThan', [getUniquePathArray(paths)]);
    }

    /**
     * Validates that the object has some (at least one) of the specified paths.
     * @param {...string} paths - The paths to check
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.someOfPaths('email', 'phone', 'address') // Must have at least one
     */
    someOfPaths(...pathDelims) {
        return this.addStep('someOfPaths', [getUniquePathArray(paths)]);
    }

    /**
     * Validates that the object has exactly X number of the specified paths.
     * @param {number} count - Exact number of paths that must exist
     * @param {...string} paths - The paths to check
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.xOfPaths(2, 'name', 'email', 'phone') // Must have exactly 2 of these paths
     */
    xOfPaths(count, ...pathDelims) {
        return this.addStep('xOfPaths', [count, getUniquePathArray(paths)]);
    }

    /**
     * Validates that the object is an instance of the specified constructor.
     * @param {Function} constructor - The constructor function to check against
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.instanceOf(Date) // Must be a Date instance
     * object.instanceOf(MyClass) // Must be an instance of MyClass
     */
    instanceOf(constructor) {
        return this.addStep('instanceOf', [constructor]);
    }

    /**
     * Validates that the object has an exact number of keys.
     * @param {number} keyCount - The exact number of keys required
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.keyCount(5) // Must have exactly 5 keys
     */
    keyCount(keyCount) {
        return this.addStep('keyCount', [keyCount]);
    }

    /**
     * Validates that the object has an exact number of keys recursively.
     * @param {number} keyCount - The exact number of keys required (including nested)
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.keyCountRecursive(10) // Must have exactly 10 keys including nested
     */
    keyCountRecursive(keyCount) {
        return this.addStep('keyCountRecursive', [keyCount]);
    }

    /**
     * Validates that the object does not exceed a maximum depth.
     * @param {number} maxDepth - Maximum allowed depth
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.maxDepth(3) // Must be 3 levels deep or less
     */
    maxDepth(maxDepth) {
        return this.addStep('maxDepth', [maxDepth]);
    }

    /**
     * Validates that the object does not exceed a maximum number of keys.
     * @param {number} maxKeyCount - Maximum number of keys allowed
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.maxKeyCount(10) // Must have 10 keys or fewer
     */
    maxKeyCount(maxKeyCount) {
        return this.addStep('maxKeyCount', [maxKeyCount]);
    }

    /**
     * Validates that the object does not exceed a maximum number of keys recursively.
     * @param {number} maxKeyCount - Maximum number of keys allowed (including nested)
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.maxKeyCountRecursive(50) // Must have 50 or fewer keys including nested
     */
    maxKeyCountRecursive(maxKeyCount) {
        return this.addStep('maxKeyCountRecursive', [maxKeyCount]);
    }

    /**
     * Validates that the object has at least a minimum depth.
     * @param {number} minDepth - Minimum required depth
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.minDepth(2) // Must be at least 2 levels deep
     */
    minDepth(minDepth) {
        return this.addStep('minDepth', [minDepth]);
    }

    /**
     * Validates that the object has at least a minimum number of keys.
     * @param {number} minKeyCount - Minimum number of keys required
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.minKeyCount(3) // Must have at least 3 keys
     */
    minKeyCount(minKeyCount) {
        return this.addStep('minKeyCount', [minKeyCount]);
    }

    /**
     * Validates that the object has at least a minimum number of keys recursively.
     * @param {number} minKeyCount - Minimum number of keys required (including nested)
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.minKeyCountRecursive(15) // Must have at least 15 keys including nested
     */
    minKeyCountRecursive(minKeyCount) {
        return this.addStep('minKeyCountRecursive', [minKeyCount]);
    }

    /**
     * Validates that the object is pure/plain and it's constructor is Object
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.plain({ x: 1, y: 2}) // Yes this is a plain object
     */
    plain() {
        return this.addStep('plain');
    }


    // Transformers


    /**
     * Selects a random subset of keys from the object.
     * @param {number} count - Number of random keys to select
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.pickRandom(3) // Get 3 random key-value pairs
     */
    pickRandom(count) {
        return this.addStep('pickRandom', [count]);
    }

    /**
     * Renames object keys using regular expressions.
     * @param {RegExp|string} fromRegex - Pattern to match keys for renaming
     * @param {string} toRegex - Replacement pattern for new key names
     * @param {Object} [options={}] - Renaming options
     * @param {boolean} [options.deleteOriginalKey=true] - Whether to delete original keys
     * @param {boolean} [options.overrideExistingKey=true] - Whether to override existing keys
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.renameKeys(/^old_/, 'new_') // Rename keys starting with 'old_' to 'new_'
     */
    renameKeys(fromRegex, toRegex, options = {}) {
        return this.setProps({ clone: true }).addStep('renameKeys', function () {
            return [fromRegex, toRegex, options];
        });
    }

    /**
     * Keeps only the specified known keys, removing all others.
     * @param {string[]} knownKeys - Array of keys to keep
     * @param {Object} [options={}] - Stripping options
     * @param {boolean} [options.includeUndefined=false] - Whether to include undefined values
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.stripUnknownKeys(['id', 'name', 'email']) // Keep only these keys
     */
    stripUnknownKeys(knownKeys, options = {}) {
        return this.setProps({ clone: true }).addStep('stripUnknownKeys', function () {
            return [knownKeys, options];
        });
    }

    /**
     * Removes keys with empty values (null, undefined, empty string, empty array, empty object).
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removeEmpties() // Removes keys with falsy or empty values
     */
    removeEmpties() {
        return this.setProps({ clone: true }).addStep('removeEmpties', function () {
            return [this.props.emptyValues];
        });
    }

    /**
     * Recursively removes keys with empty values throughout nested objects.
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removeEmptiesRecursive() // Deep clean of empty values in nested objects
     */
    removeEmptiesRecursive() {
        return this.setProps({ clone: true }).addStep('removeEmptiesRecursive', function () {
            return [this.props.emptyValues];
        });
    }

    /**
     * Removes paths from the Object
     * @returns {ObjectChain} Returns the chain for method chaining
     * @example
     * object.removePaths(['x/y/z', 'd']) // Removes key d and path x/y/z from object
     */
    removePaths(paths = []) {
        return this.setProps({ clone: true }).addStep('removePaths', [
            paths.map(path => Path.create(path, this.props.separator))
        ]);
    }

    setPaths(pathsAndValues = {}, overwrite = true, create = true) {
        const valueMap = new Map();
        const { separator } = this.props;
        for (const key of Object.keys(pathsAndValues)) {
            valueMap.set(Path.create(key, separator), pathsAndValues[key]);
        }
        return this.setProps({ clone: true }).addStep('setPaths', [valueMap, overwrite, create]);
    }

}

module.exports = ObjectChain;
