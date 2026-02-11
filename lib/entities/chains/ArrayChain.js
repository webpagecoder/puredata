'use strict';

const GenericChain = require('./GenericChain.js');
const Path = require('../../path/PathFactory.js');

class ArrayChain extends GenericChain {

    get languageKey() {
        return 'array';
    }

    // Configurators

    /**
     * Configures automatic removal of empty values from arrays during preprocessing
     * @param {boolean} [removeEmpties=true] - Whether to remove empty values from arrays
     * @param {Array} [addEmptyValues=[]] - Additional values to consider as empty beyond the default empty values
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * // Configure to remove empty values including custom empties
     * array([1, null, 2, '', 3, 'N/A']).configRemoveEmpties(true, ['N/A'])
     * // Results in: [1, 2, 3] after preprocessing
     */
    configRemoveEmpties(removeEmpties = true, addEmptyValues = []) {
        return this.setProps({
            removeEmpties,
            emptyValues: [...this.getProp('emptyValues'), ...addEmptyValues]
        });
    }

    /**
     * Configures automatic casting of single values to arrays during preprocessing
     * @param {boolean} [castSingle=true] - Whether to cast single non-array values to arrays
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * // Configure to cast single values to arrays
     * array('hello').configCastSingle(true)
     * // Input 'hello' becomes ['hello'] during preprocessing
     * 
     * // Disable automatic casting
     * array('hello').configCastSingle(false)
     * // Would fail validation since 'hello' is not an array
     */
    configCastSingle(castSingle = true) {
        return this.setProps({ castSingle });
    }


    // Validators

    /**
     * Validates that array matches specified dimensional shape
     * @param {Array<number>} dimensions - Expected dimensions [length, width, ...]
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([[1, 2], [3, 4]]).dimensions([2, 2]) // passes - 2x2 matrix
     */
    dimensions(dimensions) {
        return this.addStep('dimensions', [dimensions]);
    }

    /**
     * Validates that array is empty
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([]).empty() // passes
     * array([1]).empty() // fails
     */
    empty() {
        return this.addStep('empty');
    }

    /**
     * Validates that array contains all specified values
     * @param {Array} values - Values that must all be present in the array
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3, 4]).allOf([1, 3]) // passes
     * array([1, 2]).allOf([1, 3]) // fails
     */
    allOf(values) {
        return this.addStep('allOf', [values]);
    }

    /**
     * Validates that array contains values other than those specified
     * @param {Array} values - Values to check against
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).otherThan([1, 2]) // passes (has 3)
     * array([1, 2]).otherThan([1, 2]) // fails
     */
    otherThan(values) {
        return this.addStep('otherThan', [values]);
    }

    /**
     * Validates that array contains exactly the specified values
     * @param {Array} values - Values that must exactly match array contents
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).exactly([3, 1, 2]) // passes
     * array([1, 2, 3]).exactly([1, 2]) // fails
     */
    exactly(values) {
        return this.addStep('exactly', [values]);
    }

    /**
     * Validates that array contains none of the specified values
     * @param {Array} values - Values that must not be present
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).noneOf([4, 5]) // passes
     * array([1, 2, 3]).noneOf([2, 4]) // fails
     */
    noneOf(values) {
        return this.addStep('noneOf', [values]);
    }

    /**
     * Validates that array contains only the specified values
     * @param {Array} values - Values that are allowed in the array
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 1]).only([1, 2, 3]) // passes
     * array([1, 2, 4]).only([1, 2, 3]) // fails
     */
    only(values) {
        return this.addStep('only', [values]);
    }

    /**
     * Validates that array contains at least one of the specified values
     * @param {Array} values - Values to check for presence
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).someOf([3, 4, 5]) // passes
     * array([1, 2, 3]).someOf([4, 5, 6]) // fails
     */
    someOf(values) {
        return this.addStep('someOf', [values]);
    }

    /**
     * Validates that array has exact length
     * @param {number} length - Expected array length
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).length(3) // passes
     * array([1, 2]).length(3) // fails
     */
    length(length) {
        return this.addStep('length', [length]);
    }

    /**
     * Validates that array length is within specified range
     * @param {number} min - Minimum length (inclusive)
     * @param {number} max - Maximum length (inclusive)
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).lengthBetween(2, 4) // passes
     */
    lengthBetween(min, max) {
        return this.addStep('lengthBetween', [min, max]);
    }

    /**
     * Validates that array length does not exceed maximum
     * @param {number} max - Maximum allowed length
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2]).maxLength(3) // passes
     * array([1, 2, 3, 4]).maxLength(3) // fails
     */
    maxLength(max) {
        return this.addStep('maxLength', [max]);
    }

    /**
     * Validates that array length meets minimum requirement
     * @param {number} min - Minimum required length
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).minLength(2) // passes
     * array([1]).minLength(2) // fails
     */
    minLength(min) {
        return this.addStep('minLength', [min]);
    }

    /**
     * Validates that array is not empty
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2]).notEmpty() // passes
     * array([]).notEmpty() // fails
     */
    notEmpty() {
        return this.addStep('notEmpty');
    }

    /**
     * Validates that array is sorted in ascending order
     * @param {string|Function} [pathOrComparator] - Property path or comparator function
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).sorted() // passes
     * array([3, 1, 2]).sorted() // fails
     */
    sorted(pathOrComparator) {
        return this.addStep('sorted', [pathOrComparator]);
    }

    /**
     * Validates that array matches tuple pattern with specific values
     * @param {Array} values - Expected values in order
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 'hello', true]).tuple([pd.number(), pd.string(), pd.boolean()]) // passes
     */
    tuple(values) {
        return this.addStep('tuple', [values]);
    }

    /**
     * Validates that all array elements are of specified type
     * @param {string} type - Expected type ('string', 'number', 'object', etc.)
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).type(pd.number()) // passes
     * array([1, '2', 3]).type(pd.boolean()) // fails
     */
    type(type) {
        return this.addStep('type', [type]);
    }

    /**
     * Validates that array elements are unique
     * @param {string|Function} [pathStringOrComparator] - Property path or comparator
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).unique() // passes
     * array([1, 2, 1]).unique() // fails
     */
    unique(pathStringOrComparator) {
        const pathOrComparator = typeof pathStringOrComparator === 'string'
            //todo: check this out...create
            ? Path.create(pathStringOrComparator, this.props.delim)
            : pathStringOrComparator;
        return this.addStep('unique', [pathOrComparator]);
    }



    // Transformers

    /**
     * Adds items to end of the array
     * @param {Array} items - Items to add to the array
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2]).add([3, 4]) // [1, 2, 3, 4]
     */
    add(items) {
        return this.addStep('add', [items]);
    }

    /**
     * Splits array into chunks of specified size
     * @param {number} size - Maximum size of each chunk
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3, 4, 5]).chunk(2) // [[1, 2], [3, 4], [5]]
     */
    chunk(size) {
        return this.addStep('chunk', [size]);
    }

    /**
     * Filters array elements using a predicate function
     * @param {Function} filter - Predicate function to test each element
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3, 4]).filter(x => x > 2) // [3, 4]
     */
    filter(filter) {
        return this.addStep('filter', [filter]);
    }

    /**
     * Flattens nested arrays into a single array
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([[1, 2], [3, 4]]).flatten() // [1, 2, 3, 4]
     */
    flatten() {
        return this.addStep('flatten');
    }

    /**
     * Groups array elements by a property path or value
     * @param {string} pathString - Path to property for grouping
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([{type: 'A', val: 1}, {type: 'B', val: 2}]).group('type')
     */
    group(pathString) {
        const path = typeof pathString === 'string'
            ? Path.create(pathString, this.props.delim)
            : null;
        return this.addStep('group', [path]);
    }

    /**
     * Filters array to keep only specified values
     * @param {Array} values - Values to keep in the array
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3, 4]).keep([2, 4]) // [2, 4]
     */
    keep(values) {
        return this.addStep('keep', [values]);
    }

    /**
     * Maps array elements using a transformation function
     * @param {Function} map - Function to transform each element
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).map(x => x * 2) // [2, 4, 6]
     */
    map(map) {
        return this.addStep('map', [map]);
    }

    /**
     * Pads array to target length with specified value
     * @param {number} targetLength - Desired array length
     * @param {*} [padValue] - Value to use for padding
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2]).padEnd(4, 0) // [1, 2, 0, 0]
     */
    padEnd(targetLength, padValue) {
        return this.addStep('padEnd', [targetLength, padValue]);
    }

    /**
     * Picks random elements from array
     * @param {number} num - Number of elements to pick
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3, 4, 5]).pickRandom(2) // [3, 1] (random)
     */
    pickRandom(num) {
        return this.addStep('pickRandom', [num]);
    }

    /**
     * Removes specified values from array
     * @param {Array} values - Values to remove from the array
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3, 4]).remove([2, 4]) // [1, 3]
     */
    remove(values) {
        return this.addStep('remove', [values]);
    }

    /**
     * Removes duplicate values from array
     * @param {string|Function} [pathStringOrComparator] - Property path or comparator function
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 2, 3]).removeDuplicates() // [1, 2, 3]
     * array([{id: 1}, {id: 1}]).removeDuplicates('id') // [{id: 1}]
     */
    removeDuplicates(pathStringOrComparator) {
        const pathOrComparator = typeof pathStringOrComparator === 'string'
            ? Path.create(pathStringOrComparator, this.props.delim)
            : pathStringOrComparator;
        return this.addStep('removeDuplicates', [pathOrComparator]);
    }

    /**
     * Removes empty values from array
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, null, 2, '', 3]).removeEmpties() // [1, 2, 3]
     */
    removeEmpties() {
        return this.addStep('removeEmpties', function () {
            return [this.props.emptyValues];
        });
    }

    /**
     * Removes undefined values from array
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, ,undefined, 2, undefined, 3]).removeUndefined() // [1, 2, 3]
     */
    removeUndefined() {
        return this.addStep('removeUndefined');
    }

    /**
     * Reverses the array order
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3]).reverse() // [3, 2, 1]
     */
    reverse() {
        return this.addStep('reverse');
    }

    /**
     * Randomly shuffles array elements
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3, 4]).shuffle() // [3, 1, 4, 2] (random order)
     */
    shuffle() {
        return this.addStep('shuffle');
    }

    /**
     * Extracts a section of array
     * @param {number} startIndex - Start index (inclusive)
     * @param {number} [endIndex] - End index (exclusive)
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3, 4, 5]).slice(1, 3) // [2, 3]
     */
    slice(startIndex, endIndex) {
        return this.addStep('slice', [startIndex, endIndex]);
    }

    /**
     * Takes first N elements from array
     * @param {number} num - Number of elements to take from start
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3, 4, 5]).sliceFirst(3) // [1, 2, 3]
     */
    sliceFirst(num) {
        return this.addStep('sliceFirst', [num]);
    }

    /**
     * Takes last N elements from array
     * @param {number} num - Number of elements to take from end
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 2, 3, 4, 5]).sliceLast(3) // [3, 4, 5]
     */
    sliceLast(num) {
        return this.addStep('sliceLast', [num]);
    }

    /**
     * Sorts array in ascending order
     * @param {string|Function} [pathOrComparator] - Property path or comparator function
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([3, 1, 2]).sortAsc() // [1, 2, 3]
     * array([{age: 30}, {age: 20}]).sortAsc('age') // [{age: 20}, {age: 30}]
     */
    sortAsc(pathOrComparator) {
        return this.addStep('sortAsc', [pathOrComparator]);
    }

    /**
     * Sorts array in descending order
     * @param {string|Function} [pathOrComparator] - Property path or comparator function
     * @returns {ArrayChain} Returns this chain for method chaining
     * @example
     * array([1, 3, 2]).sortDesc() // [3, 2, 1]
     * array([{age: 20}, {age: 30}]).sortDesc('age') // [{age: 30}, {age: 20}]
     */
    sortDesc(pathOrComparator) {
        return this.addStep('sortDesc', [pathOrComparator]);
    }

}

module.exports = ArrayChain;


