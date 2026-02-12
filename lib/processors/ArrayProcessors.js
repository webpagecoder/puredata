'use strict';

const Utils = require('../utils/Utils.js');
const ObjectUtils = require('../utils/ObjectUtils.js');
const GenericProcessors = require('./GenericProcessors.js');
const { pass, fail } = require('../Result.js');
const Path = require('../path/PathFactory.js');

function getSorter(arr, order = 1, pathOrComparator = null) {
    let sorter;
    if (typeof pathOrComparator === 'function') {
        sorter = pathOrComparator;
    }
    else if (pathOrComparator instanceof Path) {
        sorter = (a, b) => {
            const aValue = ObjectUtils.getValueAtPath(a, pathOrComparator);
            const bValue = ObjectUtils.getValueAtPath(b, pathOrComparator);
            return order * (aValue > bValue && 1 || aValue < bValue && -1 || 0);
        };
    }
    else {
        sorter = (a, b) => order * (a > b && 1 || a < b && -1 || 0);
    }
    return sorter;
}

class ArrayProcessors extends GenericProcessors {

    // Validators

    static otherThan(arr, besidesValues = []) {
        if (besidesValues.length === 0) {
            return pass(arr);
        }
        for (let i = 0, len = arr.length; i < len; i++) {
            const arrValue = arr[i];
            let found = false;
            for (const value of besidesValues) {
                if (Utils.areEqual(arrValue, value)) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                return pass(arr);
            }
        }
        return fail(arr, 'array/otherThan', {
            values: besidesValues
        });
    }

    static allOf(arr, requiredValues = []) {
        for (const requiredValue of requiredValues) {
            let found = false;
            for (const entry of arr) {
                if (Utils.areEqual(entry, requiredValue)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return fail(arr, 'array/allOf', {
                    requiredValues,
                    missingValue: requiredValue
                });
            }
        }
        return pass(arr);
    }

    static exactly(arr, requiredValues = []) {
        const length = arr.length;
        const expectedLength = requiredValues.length;
        if (length !== expectedLength) {
            return fail(arr, 'array/exactly', {
                requiredValues
            });
        }
        const arrCopy = [...arr];
        for (const requiredValue of requiredValues) {
            let found = false;
            for (let i = 0, len = arrCopy.length; i < len; i++) {
                if (Utils.areEqual(arrCopy[i], requiredValue)) {
                    arrCopy.splice(i, 1);
                    found = true;
                    break;
                }
            }
            if (!found) {
                return fail(arr, 'array/exactly', {
                    requiredValues,
                });
            }
        }
        return pass(arr);
    }

    static noneOf(arr, forbiddenValues = []) {
        for (const forbiddenValue of forbiddenValues) {
            for (let i = 0, len = arr.length; i < len; i++) {
                const value = arr[i];
                if (Utils.areEqual(value, forbiddenValue)) {
                    return fail(arr, 'array/noneOf', {
                        forbiddenValues,
                        index: i,
                        invalidValue: value
                    });
                }
            }
        }
        return pass(arr);
    }

    static only(arr, allowed = []) {
        for (let i = 0, len = arr.length; i < len; i++) {
            const value = arr[i];
            let foundValue = false;
            for (const allowedValue of allowed) {
                if (Utils.areEqual(value, allowedValue)) {
                    foundValue = true;
                    break;
                }
            }
            if (!foundValue) {
                return fail(arr, 'array/only', {
                    allowed,
                    index: i,
                    invalidValue: value
                });
            }
        }
        return pass(arr);
    }

    static someOf(arr, possibleValues = []) {
        if (possibleValues.length === 0) {
            return pass(arr);
        }
        for (const value of possibleValues) {
            for (const entry of arr) {
                if (Utils.areEqual(entry, value)) {
                    return pass(arr);
                }
            }
        }
        return fail(arr, 'array/someOf', { possibleValues });
    }
    
    static empty(arr) {
        return arr.length === 0
            ? pass(arr)
            : fail(arr, 'array/empty', {
                length: arr.length
            });
    }

    static notEmpty(arr) {
        return arr.length > 0
            ? pass(arr)
            : fail(arr, 'array/notEmpty', {
                length: arr.length
            });
    }

    static dimensions(arr, dimensions, index = 0, originalArr = arr) {
        if (arr.length !== dimensions[index]) {
            return fail(originalArr, "array/dimensions", { dimensions });
        }
        ++index;
        if (index < dimensions.length) {
            for (const item of arr) {
                if (!Array.isArray(item) || self.dimensions(item, dimensions, index, originalArr).fail) {
                    return fail(originalArr, "array/dimensions", { dimensions });
                }
            }
        }
        return pass(arr);
    }

    static sorted(arr, pathOrComparator = null) {
        const sorter = getSorter(arr, 1, pathOrComparator);
        for (let i = 1, len = arr.length; i < len; i++) {
            if (sorter(arr[i - 1], arr[i]) > 0) {
                return fail(arr, 'array/sorted', { pathOrComparator });
            }
        }
        return pass(arr);
    }

    static tuple(arr, tupleValues = []) {
        if (arr.length !== tupleValues.length) {
            return fail(arr, 'array/tuple', { tupleValues });
        }
        for (let i = 0, len = tupleValues.length; i < len; i++) {
            const value = arr[i];
            const expectedValue = tupleValues[i];
            if (!Utils.areEqual(value, expectedValue)) {
                return fail(arr, 'array/tuple', {
                    tupleValues,
                    index: i,
                    invalidValue: value,
                    expectedValue
                });
            }
        }
        return pass(arr);
    }

    static type(...args) {
        return self.only(...args);
    }

    static unique(arr, pathOrComparator = null) {
        const comparator = typeof pathOrComparator === 'function'
            ? pathOrComparator
            : (a, b) => !Utils.areEqual(a, b);
        const path = pathOrComparator instanceof Path
            ? pathOrComparator
            : null;

        for (let y = 0; y < arr.length - 1; y++) {
            const a = path
                ? ObjectUtils.getValueAtPath(arr[y], path)
                : arr[y];

            for (let z = y + 1; z < arr.length; z++) {
                const b = path
                    ? ObjectUtils.getValueAtPath(arr[z], path)
                    : arr[z];

                if (!comparator.apply({}, [a, b])) {
                    return fail(arr, 'array/unique', {
                        index1: y,
                        index2: z,
                        duplicateValue: a
                    });
                }
            }
        }
        return pass(arr);
    }

    static length(arr, requiredLength) {
        return arr.length === requiredLength
            ? pass(arr)
            : fail(arr, 'array/length', {
                length: arr.length,
                requiredLength
            });
    }

    static lengthBetween(arr, min, max) {
        const length = arr.length;
        if (length < min || length > max) {
            return fail(arr, 'array/lengthBetween', {
                length,
                min,
                max
            });
        }
        return pass(arr);
    }

    static maxLength(arr, max) {
        return arr.length <= max
            ? pass(arr)
            : fail(arr, 'array/maxLength', {
                length: arr.length,
                max
            });
    }

    static minLength(arr, min) {
        return arr.length >= min
            ? pass(arr)
            : fail(arr, 'array/minLength', {
                length: arr.length,
                min
            });
    }
    

    // Transformers

    static add(arr, values = []) {
        return pass([...arr, ...values]);
    }

    static chunk(arr, length) {
        let allChunks = [];
        let newChunk = [];
        if (length >= arr.length) {
            return pass([...arr]);
        }
        for (const item of arr) {
            newChunk.push(item);
            if (newChunk.length % length === 0) {
                allChunks.push(newChunk);
                newChunk = [];
            }
        }
        if (newChunk.length) {
            allChunks.push(newChunk);
        }
        return pass(allChunks);
    }

    static filter(arr, filter) {
        return pass(arr.filter(filter));
    }

    static flatten(arr) {
        const flattened = [];
        for (const item of arr) {
            if (Array.isArray(item)) {
                const innerFlatten = self.flatten(item).value;
                flattened.push(...innerFlatten);
            } else {
                flattened.push(item);
            }
        }
        return pass(flattened);
    }

    static group(arr, path) {
        const groups = new Map();
        for (const value of arr) {
            const mapKey = path ? ObjectUtils.getValueAtPath(value, path) : value;
            if (!groups.has(mapKey)) {
                groups.set(mapKey, []);
            }
            groups.get(mapKey).push(value);
        }

        const finalGroups = [];
        for (const [_, group] of groups) {
            finalGroups.push(group);
        }
        return pass(finalGroups);
    }

    static keep(arr, allowedValues = []) {
        const filtered = [];
        for (const entry of arr) {
            for (const value of allowedValues) {
                if (Utils.areEqual(entry, value)) {
                    filtered.push(entry);
                }
            }
        }
        return pass(filtered);
    }

    static map(arr, map) {
        return pass(arr.map(map));
    }

    static padEnd(arr, targetLength, padValue = null) {
        if (arr.length >= targetLength) {
            return pass([...arr]);
        }
        const padded = [...arr];
        while (padded.length < targetLength) {
            padded.push(padValue);
        }
        return pass(padded);
    }

    static pickRandom(arr, count = 1) {
        const arrCopy = [...arr];
        const random = [];
        if (count > arrCopy.length) {
            count = arrCopy.length;
        }
        while (count > 0) {
            random.push(
                arrCopy.splice(
                    Math.floor(Math.random() * arrCopy.length),
                    1
                )[0]
            );
            --count;
        }
        return pass(random);
    }

    static remove(arr, forbiddenValues = []) {
        const filtered = [];
        for (const entry of arr) {
            let isAllowed = true;
            for (const value of forbiddenValues) {
                if (Utils.areEqual(entry, value)) {
                    isAllowed = false;
                    break;
                }
            }
            if (isAllowed) {
                filtered.push(entry);
            }
        }
        return pass(filtered);
    }

    static removeDuplicates(arr, pathOrComparator = null) {
        const comparator = typeof pathOrComparator === 'function'
            ? pathOrComparator
            : (a, b) => !Utils.areEqual(a, b);
        const path = pathOrComparator instanceof Path
            ? pathOrComparator
            : null;

        let filteredArr = [...arr];

        for (let y = 0; y < filteredArr.length - 1; y++) {
            const a = path
                ? ObjectUtils.getValueAtPath(filteredArr[y], path)
                : filteredArr[y];

            for (let z = y + 1; z < filteredArr.length; z++) {
                const b = path
                    ? ObjectUtils.getValueAtPath(filteredArr[z], path)
                    : filteredArr[z];

                if (!comparator.apply({}, [a, b])) {
                    filteredArr.splice(z, 1);
                }
            }
        }

        return pass(filteredArr);
    }

    static removeEmpties(arr, emptyValues = [null, undefined, '']) {
        return self.remove(arr, emptyValues);
    }

    static removeUndefined(arr) {
        return self.remove(arr, [undefined]);
    }

    static reverse(arr) {
        return pass([...arr].reverse());
    }

    static shuffle(arr) {
        const arrCopy = [...arr];
        const random = [];
        while (arrCopy.length > 0) {
            random.push(
                arrCopy.splice(
                    Math.floor(Math.random() * arrCopy.length),
                    1
                )[0]
            );
        }
        return pass(random);
    }

    static slice(arr, startIndex, endIndex) {
        return pass(arr.slice(startIndex, endIndex));
    }

    static sliceFirst(arr, count = 1) {
        return pass(arr.slice(0, count));
    }

    static sliceLast(arr, count = 1) {
        return pass(arr.slice(-count));
    }

    static sortAsc(arr, pathOrComparator = null) {
        return pass([...arr].sort(getSorter(arr, 1, pathOrComparator)));
    }

    static sortDesc(arr, pathOrComparator = null) {
        return pass([...arr].sort(getSorter(arr, -1, pathOrComparator)));
    }
};

const self = module.exports = ArrayProcessors;