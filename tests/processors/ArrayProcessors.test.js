'use strict';

import ArrayHandler  from '../../lib/processors/ArrayHandler.js';
import Path  from '../../lib/Path.js';
import pd  from '../../lib/pd.js';

describe('ArrayHandler.keepOnly', () => {
    it('should keep only allowed values', () => {
        const arr = [1, 2, 3, 4];
        const result = ArrayHandler.keepOnly(arr, [2, 4]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([2, 4]);
    });

    it('should return an empty array if no values are allowed', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.keepOnly(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should return the same array if all values are allowed', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.keepOnly(arr, [1, 2, 3]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });
});

describe('ArrayHandler.remove', () => {
    it('should remove forbidden values', () => {
        const arr = [1, 2, 3, 4];
        const result = ArrayHandler.remove(arr, [2, 4]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 3]);
    });

    it('should return the same array if no values are forbidden', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.remove(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    it('should return an empty array if all values are forbidden', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.remove(arr, [1, 2, 3]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });
});

describe('ArrayHandler.removeEmpties', () => {
    it('should remove null values from the array', () => {
        const arr = [1, null, 2, null, 3];
        const result = ArrayHandler.removeEmpties(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    it('should remove empty string values from the array', () => {
        const arr = [1, '', 2, '', 3];
        const result = ArrayHandler.removeEmpties(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    it('should keep non-empty values', () => {
        const arr = [{}];
        const result = ArrayHandler.removeEmpties(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{}]);
    });

    it('should return an empty array if all values are null or empty string, or empty values', () => {
        const arr = [null, '', , null, '', , ,];
        const result = ArrayHandler.removeEmpties(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should return the same array if there are no null or empty string values', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.removeEmpties(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });
});

describe('ArrayHandler.removeUndefined', () => {
    it('should remove sparse (undefined) values from the array', () => {
        // eslint-disable-next-line no-sparse-arrays
        const arr = [1, , 2, undefined, 3];
        const result = ArrayHandler.removeUndefined(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    it('should return the same array if there are no sparse values', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.removeUndefined(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    it('should return an empty array if all values are sparse', () => {
        // eslint-disable-next-line no-sparse-arrays
        const arr = [, , undefined,];
        const result = ArrayHandler.removeUndefined(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });
});

describe('ArrayHandler.removeDuplicates', () => {
    it('should filter out duplicate primitive values', () => {
        const arr = [1, 2, 2, 3, 1, 4];
        const result = ArrayHandler.removeDuplicates(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4]);
    });

    it('should filter out duplicate strings', () => {
        const arr = ['a', 'b', 'a', 'c', 'b'];
        const result = ArrayHandler.removeDuplicates(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['a', 'b', 'c']);
    });

    it('should filter out duplicate objects by value (deep)', () => {
        const arr = [{ x: 1 }, { x: 2 }, { x: 1 }, { x: 3 }];
        const result = ArrayHandler.removeDuplicates(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }]);
    });

    it('should filter out duplicate arrays by value (deep)', () => {
        const arr = [[1, 2], [2, 3], [1, 2], [4, 5]];
        const result = ArrayHandler.removeDuplicates(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([[1, 2], [2, 3], [4, 5]]);
    });

    it('should filter out duplicate objects by path', () => {
        const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 1, name: 'c' }];
        const result = ArrayHandler.removeDuplicates(arr, Path.create('id', '/'));
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ id: 1, name: 'a' }, { id: 2, name: 'b' }]);
    });

    it('should filter out duplicate nested objects by nested path', () => {
        const arr = [
            { user: { id: 1 }, value: 10 },
            { user: { id: 2 }, value: 20 },
            { user: { id: 1 }, value: 30 }
        ];
        const result = ArrayHandler.removeDuplicates(arr, Path.create('user/id', '/'));
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([
            { user: { id: 1 }, value: 10 },
            { user: { id: 2 }, value: 20 }
        ]);
    });

    it('should filter using a custom comparator', () => {
        const arr = ['a', 'A', 'b', 'B'];
        const result = ArrayHandler.removeDuplicates(arr, (a, b) => a.toLowerCase() !== b.toLowerCase());
        expect(result.pass).toBe(true);
        // Only one of each letter, case-insensitive
        expect(result.value.length).toBe(2);
        expect(result.value.map(v => v.toLowerCase()).sort()).toEqual(['a', 'b']);
    });

    it('should ignore values in the ignore list', () => {
        const arr = [1, undefined, 2, null, 3, undefined, 1];
        const result = ArrayHandler.removeDuplicates(arr, null, { ignore: [null] });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, undefined, 2, null, 3]);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.removeDuplicates(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should filter objects with arrays as properties', () => {
        const arr = [
            { x: [1, 2] },
            { x: [1, 2] },
            { x: [2, 3] }
        ];
        const result = ArrayHandler.removeDuplicates(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ x: [1, 2] }, { x: [2, 3] }]);
    });

    it('should filter objects with multiple levels of nesting', () => {
        const arr = [
            { a: { b: { c: 1 } }, d: [1, 2] },
            { a: { b: { c: 2 } }, d: [1, 2] },
            { a: { b: { c: 1 } }, d: [1, 2] }
        ];
        const result = ArrayHandler.removeDuplicates(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([
            { a: { b: { c: 1 } }, d: [1, 2] },
            { a: { b: { c: 2 } }, d: [1, 2] }
        ]);
    });

    it('should filter duplicate numbers with deep=false', () => {
        const arr = [1, 2, 1, 3, 2];
        const result = ArrayHandler.removeDuplicates(arr, null, { deep: false });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    it('should filter duplicate objects by reference with deep=false', () => {
        const obj = { x: 1 };
        const arr = [obj, obj, { x: 1 }];
        const result = ArrayHandler.removeDuplicates(arr, null, { deep: false });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([obj, { x: 1 }]);
    });

    it('should filter objects by path with deep=false', () => {
        const arr = [{ id: 1 }, { id: 2 }, { id: 1 }];
        const result = ArrayHandler.removeDuplicates(arr, 'id', { deep: false });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should filter objects with falsy values', () => {
        const arr = [{ id: 0 }, { id: false }, { id: '' }, { id: 0 }];
        const result = ArrayHandler.removeDuplicates(arr, 'id');
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ id: 0 }, { id: false }, { id: '' }]);
    });

});

describe('ArrayHandler.sliceFirst', () => {
    it('should return the first element of a non-empty array', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.sliceFirst(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1]);
    });

    it('should return undefined for an empty array', () => {
        const arr = [];
        const result = ArrayHandler.sliceFirst(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should return the first element even if it is falsy', () => {
        const arr = [0, 1, 2];
        const result = ArrayHandler.sliceFirst(arr, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([0, 1]);
    });
});

describe('ArrayHandler.sliceLast', () => {
    it('should return the last element of a non-empty array as an array', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.sliceLast(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([3]);
    });

    it('should return an empty array for an empty array', () => {
        const arr = [];
        const result = ArrayHandler.sliceLast(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should return the last n elements as an array if count is provided', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = ArrayHandler.sliceLast(arr, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([4, 5]);
    });
});

describe('ArrayHandler.pickRandom', () => {
    it('should return a single random element as an array', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = ArrayHandler.pickRandom(arr);
        expect(result.pass).toBe(true);
        expect(Array.isArray(result.value)).toBe(true);
        expect(result.value.length).toBe(1);
        expect(arr).toContain(result.value[0]);
    });

    it('should return n random elements as an array if count is provided', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = ArrayHandler.pickRandom(arr, 3);
        expect(result.pass).toBe(true);
        expect(Array.isArray(result.value)).toBe(true);
        expect(result.value.length).toBe(3);
        result.value.forEach(val => expect(arr).toContain(val));
    });

    it('should return an empty array if input array is empty', () => {
        const arr = [];
        const result = ArrayHandler.pickRandom(arr, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });
});

describe('ArrayHandler.allOf', () => {
    it('should pass when array contains all specified values', () => {
        const arr = [1, 2, 3, 4];
        const result = ArrayHandler.allOf(arr, [2, 3]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when array is missing one of the specified values', () => {
        const arr = [1, 2, 4];
        const result = ArrayHandler.allOf(arr, [2, 3]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should pass when array contains all specified values in different order', () => {
        const arr = [4, 3, 2, 1];
        const result = ArrayHandler.allOf(arr, [1, 2, 3, 4]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when array is empty and values are specified', () => {
        const arr = [];
        const result = ArrayHandler.allOf(arr, [1]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should pass when no values are specified (vacuously true)', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.allOf(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });
});

describe('ArrayHandler.noneOf', () => {
    it('should pass when array contains none of the specified values', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.noneOf(arr, [4, 5]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when array contains any of the specified values', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.noneOf(arr, [2, 4]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should pass when no values are specified', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.noneOf(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });
});

describe('ArrayHandler.exactly', () => {
    it('should pass if array has exactly the required values (same length and values)', () => {
        const arr = [1, 2, 3];
        const required = [1, 2, 3];
        const result = ArrayHandler.exactly(arr, required);
        expect(result.pass).toBe(true);
    });

    it('should fail if array has different length than required values', () => {
        const arr = [1, 2, 3];
        const required = [1, 2];
        const result = ArrayHandler.exactly(arr, required);
        expect(result.pass).toBe(false);
    });

    it('should fail if array has same length but different values', () => {
        const arr = [1, 2, 3];
        const required = [1, 2, 4];
        const result = ArrayHandler.exactly(arr, required);
        expect(result.pass).toBe(false);
    });

    it('should pass for arrays with objects that are deeply equal', () => {
        const arr = [{ a: 1 }, { b: 2 }];
        const required = [{ a: 1 }, { b: 2 }];
        const result = ArrayHandler.exactly(arr, required);
        expect(result.pass).toBe(true);
    });

    it('should fail for arrays with objects that are not deeply equal', () => {
        const arr = [{ a: 1 }, { b: 2 }];
        const required = [{ a: 1 }, { b: 3 }];
        const result = ArrayHandler.exactly(arr, required);
        expect(result.pass).toBe(false);
    });

    it('should pass for empty arrays', () => {
        const arr = [];
        const required = [];
        const result = ArrayHandler.exactly(arr, required);
        expect(result.pass).toBe(true);
    });

});

describe('ArrayHandler.only', () => {
    it('should pass when array contains only the specified values', () => {
        const arr = [2, 2, 2];
        const result = ArrayHandler.only(arr, [2]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when array contains values not in the specified list', () => {
        const arr = [2, 3, 2];
        const result = ArrayHandler.only(arr, [2]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should pass when array is empty and values is empty', () => {
        const arr = [];
        const result = ArrayHandler.only(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });
});

describe('ArrayHandler.someOf', () => {
    it('should pass when array contains at least one of the specified values', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.someOf(arr, [2, 4]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when array contains none of the specified values', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.someOf(arr, [4, 5]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should pass when array contains all of the specified values', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.someOf(arr, [1, 2, 3]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when array is empty and values are specified', () => {
        const arr = [];
        const result = ArrayHandler.someOf(arr, [1]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should pass when no values are specified (vacuously true)', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.someOf(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });
});

describe('ArrayHandler.isUnique', () => {
    it('should pass when all values are unique', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.isUnique(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when there are duplicate values', () => {
        const arr = [1, 2, 2, 3];
        const result = ArrayHandler.isUnique(arr);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should fail for two empty objects', () => {
        const a = {};
        const b = {};
        const arr = [a, b];
        const result = ArrayHandler.isUnique(arr);
        expect(result.pass).toBe(false);
    });

    it('should fail for duplicate objects by value (deep)', () => {
        const arr = [{ x: 1 }, { x: 1 }];
        const result = ArrayHandler.isUnique(arr);
        expect(result.pass).toBe(false);
    });

    it('should pass for duplicate objects by reference if deep is false', () => {
        const obj = { x: 1 };
        const arr = [obj, obj];
        const result = ArrayHandler.isUnique(arr, null, { deep: false });
        expect(result.pass).toBe(false); // same reference, so not unique
    });

    it('should use a custom comparator', () => {
        const arr = ['a', 'A', 'b'];
        const result = ArrayHandler.isUnique(arr, (a, b) => a.toLowerCase() !== b.toLowerCase());
        expect(result.pass).toBe(false);
    });

    it('should check uniqueness by path', () => {
        const arr = [{ id: 1 }, { id: 2 }, { id: 1 }];
        const result = ArrayHandler.isUnique(arr, 'id');
        expect(result.pass).toBe(false);
    });

    it('should pass for unique values by path', () => {
        const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const result = ArrayHandler.isUnique(arr, 'id');
        expect(result.pass).toBe(true);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.isUnique(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    // --- More complex object tests below ---

    it('should fail for duplicate nested objects (deep)', () => {
        const arr = [
            { a: { b: 1 }, c: [1, 2] },
            { a: { b: 1 }, c: [1, 2] }
        ];
        const result = ArrayHandler.isUnique(arr);
        expect(result.pass).toBe(false);
    });

    it('should pass for unique nested objects (deep)', () => {
        const arr = [
            { a: { b: 1 }, c: [1, 2] },
            { a: { b: 2 }, c: [1, 2] }
        ];
        const result = ArrayHandler.isUnique(arr);
        expect(result.pass).toBe(true);
    });

    it('should fail for duplicate objects with arrays as properties', () => {
        const arr = [
            { x: [1, 2, 3] },
            { x: [1, 2, 3] }
        ];
        const result = ArrayHandler.isUnique(arr);
        expect(result.pass).toBe(false);
    });

    it('should pass for objects with different arrays as properties', () => {
        const arr = [
            { x: [1, 2, 3] },
            { x: [3, 2, 1] }
        ];
        const result = ArrayHandler.isUnique(arr);
        expect(result.pass).toBe(true);
    });

    it('should check uniqueness by nested path', () => {
        const arr = [
            { user: { id: 1 } },
            { user: { id: 2 } },
            { user: { id: 1 } }
        ];
        const result = ArrayHandler.isUnique(arr, Path.create('user/id', '/'));
        expect(result.pass).toBe(false);
    });

    it('should pass for unique values by nested path', () => {
        const arr = [
            { user: { id: 1 } },
            { user: { id: 2 } },
            { user: { id: 3 } }
        ];
        const result = ArrayHandler.isUnique(arr, Path.create('user/id', '/'));
        expect(result.pass).toBe(true);
    });

    it('should not pass for similar values by nested path', () => {
        const arr = [
            { user: { id: 1 } },
            { user: { id: 2 } },
            { user: { id: 1 } }
        ];
        const result = ArrayHandler.isUnique(arr, 'user/id');
        expect(result.pass).toBe(false);
    });

    it('should handle arrays of objects with multiple levels of nesting', () => {
        const arr = [
            { a: { b: { c: 1 } }, d: [1, 2] },
            { a: { b: { c: 2 } }, d: [1, 2] },
            { a: { b: { c: 3 } }, d: [1, 2] }
        ];
        const result = ArrayHandler.isUnique(arr);
        expect(result.pass).toBe(true);
    });

    it('should fail for duplicate objects with multiple levels of nesting', () => {
        const arr = [
            { a: { b: { c: 1 } }, d: [1, 2] },
            { a: { b: { c: 1 } }, d: [1, 2] }
        ];
        const result = ArrayHandler.isUnique(arr);
        expect(result.pass).toBe(false);
    });
});

describe('ArrayHandler.hasLength', () => {

    it('should pass when array length is correct', () => {
        const arr = [1, 2, 3, 4];
        const result = ArrayHandler.hasLength(arr, 4);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when array length is not equal', () => {
        const arr = [1];
        const result = ArrayHandler.hasLength(arr, 2, 5);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

});

describe('ArrayHandler.hasMaxLength', () => {
    it('should pass when array length is less than count', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.hasMaxLength(arr, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should pass when array length is equal to count', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.hasMaxLength(arr, 3);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when array length is greater than count', () => {
        const arr = [1, 2, 3, 4];
        const result = ArrayHandler.hasMaxLength(arr, 3);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
        expect(result.hasError('array/maxLength')).toBe(true);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.hasMaxLength(arr, 0);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail for empty array if count is negative', () => {
        const arr = [];
        const result = ArrayHandler.hasMaxLength(arr, -1);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });
});

describe('ArrayHandler.hasMinLength', () => {
    it('should pass when array length is greater than count', () => {
        const arr = [1, 2, 3, 4];
        const result = ArrayHandler.hasMinLength(arr, 3);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should pass when array length is equal to count', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.hasMinLength(arr, 3);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when array length is less than count', () => {
        const arr = [1];
        const result = ArrayHandler.hasMinLength(arr, 2);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
        expect(result.hasError && result.hasError('array/minLength')).toBe(true);
    });
});

describe('ArrayHandler.sortAsc', () => {
    it('should sort numbers in ascending order', () => {
        const arr = [5, 2, 8, 1, 3];
        const result = ArrayHandler.sortAsc(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 5, 8]);
    });

    it('should sort strings in ascending order', () => {
        const arr = ['banana', 'apple', 'cherry'];
        const result = ArrayHandler.sortAsc(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should sort objects by a property path', () => {
        const arr = [{ id: 3 }, { id: 1 }, { id: 2 }];
        const result = ArrayHandler.sortAsc(arr, Path.create('id', '/'));
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('should sort using a custom comparator', () => {
        const arr = [5, 2, 8, 1, 3];
        const result = ArrayHandler.sortAsc(arr, (a, b) => a - b);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 5, 8]);
    });

    it('should return an empty array if input is empty', () => {
        const arr = [];
        const result = ArrayHandler.sortAsc(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should not mutate the original array', () => {
        const arr = [3, 1, 2];
        const arrCopy = arr.slice();
        ArrayHandler.sortAsc(arr);
        expect(arr).toEqual(arrCopy);
    });

    it('should sort objects by nested property path', () => {
        const arr = [{ a: { b: 3 } }, { a: { b: 1 } }, { a: { b: 2 } }];
        const result = ArrayHandler.sortAsc(arr, Path.create('a/b', '/'));
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ a: { b: 1 } }, { a: { b: 2 } }, { a: { b: 3 } }]);
    });
});

describe('ArrayHandler.sortDesc', () => {
    it('should sort numbers in descending order', () => {
        const arr = [5, 2, 8, 1, 3];
        const result = ArrayHandler.sortDesc(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([8, 5, 3, 2, 1]);
    });

    it('should sort strings in descending order', () => {
        const arr = ['banana', 'apple', 'cherry'];
        const result = ArrayHandler.sortDesc(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['cherry', 'banana', 'apple']);
    });

    it('should sort objects by a property path in descending order', () => {
        const arr = [{ id: 3 }, { id: 1 }, { id: 2 }];
        const result = ArrayHandler.sortDesc(arr, Path.create('id', '/'));
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ id: 3 }, { id: 2 }, { id: 1 }]);
    });

    it('should sort using a custom comparator in descending order', () => {
        const arr = [5, 2, 8, 1, 3];
        const result = ArrayHandler.sortDesc(arr, (a, b) => b - a);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([8, 5, 3, 2, 1]);
    });

    it('should return an empty array if input is empty', () => {
        const arr = [];
        const result = ArrayHandler.sortDesc(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should not mutate the original array', () => {
        const arr = [3, 1, 2];
        const arrCopy = arr.slice();
        ArrayHandler.sortDesc(arr);
        expect(arr).toEqual(arrCopy);
    });

    it('should sort objects by nested property path in descending order', () => {
        const arr = [{ a: { b: 3 } }, { a: { b: 1 } }, { a: { b: 2 } }];
        const result = ArrayHandler.sortDesc(arr, Path.create('a/b', '/'));
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ a: { b: 3 } }, { a: { b: 2 } }, { a: { b: 1 } }]);
    });
});

describe('ArrayHandler.otherThan', () => {
    it('should pass if array contains items besides those specified', () => {
        const arr = [1, 2, 3];
        const specified = [1,2];
        const result = ArrayHandler.otherThan(arr, specified);
        expect(result.pass).toBe(true);
    });

    it('should pass if abesidesarray is empty', () => {
        const arr = [1, 2, 3, 4];
        const specified = [];
        const result = ArrayHandler.otherThan(arr, specified);
        expect(result.pass).toBe(true);
    });

    it('should pass for empty array', () => {
        const arr = [4];
        const specified = [1, 2];
        const result = ArrayHandler.otherThan(arr, specified);
        expect(result.pass).toBe(true);
    });

    it('should pass for empty specified values', () => {
        const arr = [1, 2, 3];
        const specified = [];
        const result = ArrayHandler.otherThan(arr, specified);
        expect(result.pass).toBe(true);
    });

    it('should work with arrays of objects', () => {
        const arr = [{ a: 1 }, { b: 2 }];
        const specified = [{ a: 1}, { b: 2 }];
        const result = ArrayHandler.otherThan(arr, specified);
        expect(result.pass).toBe(false);

        const passResult = ArrayHandler.otherThan(arr, [{ b: 2 }]);
        expect(passResult.pass).toBe(true);
    });
});

describe('ArrayHandler.isTuple', () => {
    it('should pass for an array matching the tuple structure', () => {
        const arr = [42, 'hello', true];
        const num = pd.number();
        const str = pd.string();
        const bool = pd.boolean();
        const result = ArrayHandler.isTuple(arr, [num, str, bool]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should pass for an array matching the tuple structure', () => {
        const arr = [42];
        const num = pd.number();
        const result = ArrayHandler.isTuple(arr, [num]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should pass for an array matching the tuple structure', () => {
        const arr = [];
        const result = ArrayHandler.isTuple(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail for an array with wrong length', () => {
        const arr = [42, 'hello'];
        const num = pd.number();
        const str = pd.string();
        const bool = pd.boolean();
        const result = ArrayHandler.isTuple(arr, [num, str, bool]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should fail for an array with wrong types', () => {
        const arr = [42, 'hello', 'not a boolean'];
        const num = pd.number();
        const str = pd.string();
        const bool = pd.boolean();
        const result = ArrayHandler.isTuple(arr, [num, str, bool]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

});

describe('ArrayHandler.flatten', () => {
    it('should flatten a simple nested array', () => {
        const arr = [1, [2, 3], 4];
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4]);
    });

    it('should flatten deeply nested arrays', () => {
        const arr = [1, [2, [3, [4, 5]], 6], 7];
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should handle empty arrays', () => {
        const arr = [1, [], 2, [3, []], 4];
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4]);
    });

    it('should return empty array when input is empty', () => {
        const arr = [];
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should handle array with no nested arrays', () => {
        const arr = [1, 2, 3, 4];
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4]);
    });

    it('should handle mixed types', () => {
        const arr = ['a', [1, ['b', 2]], 'c'];
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['a', 1, 'b', 2, 'c']);
    });

    it('should handle arrays with null and undefined', () => {
        const arr = [1, [null, 2], [undefined, [3]]];
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, null, 2, undefined, 3]);
    });

    it('should handle complex nested structure', () => {
        const arr = [[1, 2], [3, [4, 5]], [[6, 7], 8]];
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should preserve object references', () => {
        const obj1 = { a: 1 };
        const obj2 = { b: 2 };
        const arr = [obj1, [obj2]];
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([obj1, obj2]);
        expect(result.value[0]).toBe(obj1); // Same reference
        expect(result.value[1]).toBe(obj2); // Same reference
    });

    it('should handle single element nested arrays', () => {
        const arr = [[[[1]]]];
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1]);
    });

    it('should handle very deeply nested arrays', () => {
        const arr = [1, [2, [3, [4, [5, [6]]]]]];
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should not modify the original array', () => {
        const arr = [1, [2, 3], 4];
        const original = JSON.parse(JSON.stringify(arr));
        const result = ArrayHandler.flatten(arr);
        expect(result.pass).toBe(true);
        expect(arr).toEqual(original); // Original unchanged
        expect(result.value).not.toBe(arr); // Different array reference
    });
});

describe('ArrayHandler.shuffle', () => {
    it('should return a shuffled array with same elements', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = ArrayHandler.shuffle(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(5);
        expect(result.value.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should not modify the original array', () => {
        const arr = [1, 2, 3, 4, 5];
        const original = [...arr];
        const result = ArrayHandler.shuffle(arr);
        expect(result.pass).toBe(true);
        expect(arr).toEqual(original);
        expect(result.value).not.toBe(arr);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.shuffle(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should handle single element array', () => {
        const arr = [42];
        const result = ArrayHandler.shuffle(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([42]);
    });

    it('should handle two element array', () => {
        const arr = [1, 2];
        const result = ArrayHandler.shuffle(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(2);
        expect(result.value.sort()).toEqual([1, 2]);
    });

    it('should preserve different data types', () => {
        const arr = ['a', 1, true, null, undefined];
        const result = ArrayHandler.shuffle(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(5);
        expect(result.value.sort()).toEqual([1, 'a', null, true, undefined]);
    });

    it('should preserve object references', () => {
        const obj1 = { a: 1 };
        const obj2 = { b: 2 };
        const arr = [obj1, obj2, 'test'];
        const result = ArrayHandler.shuffle(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(3);
        expect(result.value).toContain(obj1);
        expect(result.value).toContain(obj2);
        expect(result.value).toContain('test');
        // Check that references are preserved
        const foundObj1 = result.value.find(item => item === obj1);
        const foundObj2 = result.value.find(item => item === obj2);
        expect(foundObj1).toBe(obj1);
        expect(foundObj2).toBe(obj2);
    });

    it('should handle duplicate values', () => {
        const arr = [1, 1, 2, 2, 3];
        const result = ArrayHandler.shuffle(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(5);
        expect(result.value.sort()).toEqual([1, 1, 2, 2, 3]);
    });

    it('should produce different results on multiple calls (statistical)', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const results = [];
        
        // Generate multiple randomizations
        for (let i = 0; i < 10; i++) {
            const result = ArrayHandler.shuffle(arr);
            expect(result.pass).toBe(true);
            results.push(result.value.join(','));
        }
        
        // It's extremely unlikely all 10 results are identical for a 10-element array
        const uniqueResults = new Set(results);
        expect(uniqueResults.size).toBeGreaterThan(1);
    });

    it('should handle large arrays', () => {
        const arr = Array.from({ length: 100 }, (_, i) => i);
        const result = ArrayHandler.shuffle(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(100);
        expect(result.value.sort((a, b) => a - b)).toEqual(arr);
    });

    it('should handle arrays with nested arrays', () => {
        const arr = [[1, 2], [3, 4], 'test'];
        const result = ArrayHandler.shuffle(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(3);
        expect(result.value).toContainEqual([1, 2]);
        expect(result.value).toContainEqual([3, 4]);
        expect(result.value).toContain('test');
    });

    it('should maintain array element count with falsy values', () => {
        const arr = [0, false, '', null, undefined, NaN];
        const result = ArrayHandler.shuffle(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(6);
        expect(result.value).toContain(0);
        expect(result.value).toContain(false);
        expect(result.value).toContain('');
        expect(result.value).toContain(null);
        expect(result.value).toContain(undefined);
        expect(result.value.some(x => Number.isNaN(x))).toBe(true);
    });
});

describe('ArrayHandler.isEmpty', () => {
    it('should pass for empty array', () => {
        const arr = [];
        const result = ArrayHandler.isEmpty(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should fail for non-empty array', () => {
        const arr = [1];
        const result = ArrayHandler.isEmpty(arr);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual([1]);
    });

    it('should fail for array with multiple elements', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.isEmpty(arr);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual([1, 2, 3]);
    });
});

describe('ArrayHandler.isNotEmpty', () => {
    it('should pass for non-empty array', () => {
        const arr = [1];
        const result = ArrayHandler.isNotEmpty(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1]);
    });

    it('should pass for array with multiple elements', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.isNotEmpty(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    it('should fail for empty array', () => {
        const arr = [];
        const result = ArrayHandler.isNotEmpty(arr);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual([]);
    });
});

describe('ArrayHandler.hasLengthBetween', () => {
    it('should pass when length is within range', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.hasLengthBetween(arr, 2, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should pass when length equals min', () => {
        const arr = [1, 2];
        const result = ArrayHandler.hasLengthBetween(arr, 2, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should pass when length equals max', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = ArrayHandler.hasLengthBetween(arr, 2, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when length is less than min', () => {
        const arr = [1];
        const result = ArrayHandler.hasLengthBetween(arr, 2, 5);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should fail when length is greater than max', () => {
        const arr = [1, 2, 3, 4, 5, 6];
        const result = ArrayHandler.hasLengthBetween(arr, 2, 5);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.hasLengthBetween(arr, 0, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });
});

describe('ArrayHandler.add', () => {
    it('should add values to array', () => {
        const arr = [1, 2];
        const result = ArrayHandler.add(arr, [3, 4]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4]);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.add(arr, [1, 2]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2]);
    });

    it('should handle empty values', () => {
        const arr = [1, 2];
        const result = ArrayHandler.add(arr, []);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2]);
    });

    it('should not modify original array', () => {
        const arr = [1, 2];
        const original = [...arr];
        const result = ArrayHandler.add(arr, [3]);
        expect(arr).toEqual(original);
        expect(result.value).toEqual([1, 2, 3]);
    });
});

describe('ArrayHandler.chunk', () => {
    it('should chunk array into equal parts', () => {
        const arr = [1, 2, 3, 4, 5, 6];
        const result = ArrayHandler.chunk(arr, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    it('should handle remainder elements', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = ArrayHandler.chunk(arr, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle chunk size larger than array', () => {
        const arr = [1, 2];
        const result = ArrayHandler.chunk(arr, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2]); // Returns original array, not wrapped
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.chunk(arr, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should handle chunk size of 1', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.chunk(arr, 1);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([[1], [2], [3]]);
    });
});

describe('ArrayHandler.filter', () => {
    it('should filter array based on predicate', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = ArrayHandler.filter(arr, x => x > 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([3, 4, 5]);
    });

    it('should handle empty result', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.filter(arr, x => x > 10);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should pass all elements when predicate always true', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.filter(arr, () => true);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.filter(arr, x => x > 0);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });
});

describe('ArrayHandler.groupBy', () => {
    it('should group by simple path', () => {
        const arr = [
            { type: 'a', value: 1 },
            { type: 'b', value: 2 },
            { type: 'a', value: 3 }
        ];
        const result = ArrayHandler.groupBy(arr, Path.create('type'));
        expect(result.pass).toBe(true);
        // groupBy returns array of groups, not object
        expect(Array.isArray(result.value)).toBe(true);
        expect(result.value).toHaveLength(2);
        // Check that groups contain correct items
        const group1 = result.value.find(g => g.length === 2);
        const group2 = result.value.find(g => g.length === 1);
        expect(group1).toBeDefined();
        expect(group2).toBeDefined();
    });

    it('should group by nested path', () => {
        const arr = [
            { user: { role: 'admin' }, name: 'Alice' },
            { user: { role: 'user' }, name: 'Bob' },
            { user: { role: 'admin' }, name: 'Charlie' }
        ];
        const result = ArrayHandler.groupBy(arr, Path.create('user/role', '/'));
        expect(result.pass).toBe(true);
        expect(Array.isArray(result.value)).toBe(true);
        expect(result.value).toHaveLength(2);
        // One group should have 2 admins, one should have 1 user
        const adminGroup = result.value.find(g => g.length === 2);
        const userGroup = result.value.find(g => g.length === 1);
        expect(adminGroup).toBeDefined();
        expect(userGroup).toBeDefined();
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.groupBy(arr, Path.create('type'));
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });
});

describe('ArrayHandler.map', () => {
    it('should map array elements', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.map(arr, x => x * 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([2, 4, 6]);
    });

    it('should transform to different types', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.map(arr, x => String(x));
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['1', '2', '3']);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.map(arr, x => x * 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should not modify original array', () => {
        const arr = [1, 2, 3];
        const original = [...arr];
        const result = ArrayHandler.map(arr, x => x * 2);
        expect(arr).toEqual(original);
    });
});

describe('ArrayHandler.padEnd', () => {
    it('should pad array to target length', () => {
        const arr = [1, 2];
        const result = ArrayHandler.padEnd(arr, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, null, null, null]);
    });

    it('should use custom pad value', () => {
        const arr = [1, 2];
        const result = ArrayHandler.padEnd(arr, 4, 0);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 0, 0]);
    });

    it('should not pad if already at target length', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.padEnd(arr, 3);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    it('should not pad if longer than target', () => {
        const arr = [1, 2, 3, 4];
        const result = ArrayHandler.padEnd(arr, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4]);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.padEnd(arr, 3, 'x');
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['x', 'x', 'x']);
    });
});

describe('ArrayHandler.reverse', () => {
    it('should reverse array', () => {
        const arr = [1, 2, 3, 4];
        const result = ArrayHandler.reverse(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([4, 3, 2, 1]);
    });

    it('should handle single element', () => {
        const arr = [1];
        const result = ArrayHandler.reverse(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1]);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.reverse(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should not modify original array', () => {
        const arr = [1, 2, 3];
        const original = [...arr];
        const result = ArrayHandler.reverse(arr);
        expect(arr).toEqual(original);
        expect(result.value).toEqual([3, 2, 1]);
    });
});

describe('ArrayHandler.slice', () => {
    it('should slice array with start and end', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = ArrayHandler.slice(arr, 1, 3);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([2, 3]);
    });

    it('should slice from start to end', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = ArrayHandler.slice(arr, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([3, 4, 5]);
    });

    it('should handle negative indices', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = ArrayHandler.slice(arr, -3, -1);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([3, 4]);
    });

    it('should handle empty result', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.slice(arr, 5, 10);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should not modify original array', () => {
        const arr = [1, 2, 3];
        const original = [...arr];
        const result = ArrayHandler.slice(arr, 1, 2);
        expect(arr).toEqual(original);
    });
});

describe('ArrayHandler.isSorted', () => {
    it('should pass for sorted ascending array', () => {
        const arr = [1, 2, 3, 4, 5];
        const result = ArrayHandler.isSorted(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should pass for sorted strings', () => {
        const arr = ['a', 'b', 'c'];
        const result = ArrayHandler.isSorted(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail for unsorted array', () => {
        const arr = [1, 3, 2, 4];
        const result = ArrayHandler.isSorted(arr);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should pass for array with equal consecutive values', () => {
        const arr = [1, 2, 2, 3];
        const result = ArrayHandler.isSorted(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.isSorted(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    it('should handle single element', () => {
        const arr = [1];
        const result = ArrayHandler.isSorted(arr);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1]);
    });
});

describe('ArrayHandler.hasShape', () => {
    it('should pass for 1D array with correct length', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.hasShape(arr, [3]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail for 1D array with wrong length', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.hasShape(arr, [5]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should pass for 2D array with correct shape', () => {
        const arr = [[1, 2], [3, 4], [5, 6]];
        const result = ArrayHandler.hasShape(arr, [3, 2]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail for 2D array with wrong shape', () => {
        const arr = [[1, 2], [3, 4, 5]];
        const result = ArrayHandler.hasShape(arr, [2, 2]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should pass for 3D array', () => {
        const arr = [
            [[1, 2], [3, 4]],
            [[5, 6], [7, 8]]
        ];
        const result = ArrayHandler.hasShape(arr, [2, 2, 2]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.hasShape(arr, [0]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });
});

describe('ArrayHandler.isType', () => {
    it('should pass when all elements are in allowed values', () => {
        const arr = [1, 2, 3];
        const result = ArrayHandler.isType(arr, [1, 2, 3, 4, 5]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should fail when elements are not in allowed values', () => {
        const arr = [1, 2, 6];
        const result = ArrayHandler.isType(arr, [1, 2, 3, 4, 5]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(arr);
    });

    it('should handle string values', () => {
        const arr = ['a', 'b', 'c'];
        const result = ArrayHandler.isType(arr, ['a', 'b', 'c']);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should handle boolean values', () => {
        const arr = [true, false, true];
        const result = ArrayHandler.isType(arr, [true, false]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(arr);
    });

    it('should handle empty array', () => {
        const arr = [];
        const result = ArrayHandler.isType(arr, [1, 2, 3]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });
});

