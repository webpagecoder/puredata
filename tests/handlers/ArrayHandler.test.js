'use strict';

import ArrayHandler from '../../lib/handlers/ArrayHandler.js';
import Path from '../../lib/Path.js';

describe('ArrayHandler.otherThan', () => {
    
    test('should pass when no forbidden values are provided', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.otherThan(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when forbidden values array is empty', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.otherThan(array, []);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array is empty', () => {
        const array = [];
        const result = ArrayHandler.otherThan(array, [1, 2, 3]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array contains none of the forbidden values', () => {
        const array = [1, 2, 3];
        const forbidden = [4, 5, 6];
        const result = ArrayHandler.otherThan(array, forbidden);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array contains a forbidden value', () => {
        const array = [1, 2, 3];
        const forbidden = [2, 4];
        const result = ArrayHandler.otherThan(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/otherThan');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 1,
            invalidValue: 2
        });
    });

    test('should fail on first forbidden value found', () => {
        const array = [1, 2, 3, 4];
        const forbidden = [2, 3];
        const result = ArrayHandler.otherThan(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/otherThan');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 1,
            invalidValue: 2
        });
    });

    test('should work with string values', () => {
        const array = ['apple', 'banana', 'cherry'];
        const forbidden = ['banana', 'date'];
        const result = ArrayHandler.otherThan(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/otherThan');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 1,
            invalidValue: 'banana'
        });
    });

    test('should work with mixed data types', () => {
        const array = [1, 'hello', true, null];
        const forbidden = [false, 'hello'];
        const result = ArrayHandler.otherThan(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/otherThan');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 1,
            invalidValue: 'hello'
        });
    });

    test('should work with object values using Utils.areEqual', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 1, name: 'test' }; // Same as obj1
        
        const array = [obj1, obj2];
        const forbidden = [obj3]; // Should match obj1 using Utils.areEqual
        const result = ArrayHandler.otherThan(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/otherThan');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 0,
            invalidValue: obj1
        });
    });

    test('should pass with object values that are different', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 3, name: 'test3' };
        
        const array = [obj1, obj2];
        const forbidden = [obj3];
        const result = ArrayHandler.otherThan(array, forbidden);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

});

describe('ArrayHandler.allOf', () => {
    
    test('should pass when no required values are provided', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.allOf(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when required values array is empty', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.allOf(array, []);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array is empty and no required values', () => {
        const array = [];
        const result = ArrayHandler.allOf(array, []);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array contains all required values', () => {
        const array = [1, 2, 3, 4, 5];
        const required = [2, 4];
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array contains all required values with duplicates', () => {
        const array = [1, 2, 2, 3, 4, 4, 5];
        const required = [2, 4];
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when required values have duplicates', () => {
        const array = [1, 2, 3, 4, 5];
        const required = [2, 2, 4]; // Duplicate requirement
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array is missing one required value', () => {
        const array = [1, 2, 4, 5];
        const required = [2, 3, 4]; // Missing 3
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/allOf');
        expect(errors[0].args).toEqual({
            requiredValues: required,
            missingValue: 3
        });
    });

    test('should fail when array is missing multiple required values', () => {
        const array = [1, 2];
        const required = [2, 3, 4]; // Missing 3 (first missing)
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/allOf');
        expect(errors[0].args).toEqual({
            requiredValues: required,
            missingValue: 3
        });
    });

    test('should fail when array is empty but required values exist', () => {
        const array = [];
        const required = [1, 2];
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/allOf');
        expect(errors[0].args).toEqual({
            requiredValues: required,
            missingValue: 1
        });
    });

    test('should work with string values', () => {
        const array = ['apple', 'banana', 'cherry', 'date'];
        const required = ['banana', 'date'];
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with missing string values', () => {
        const array = ['apple', 'banana'];
        const required = ['banana', 'cherry'];
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/allOf');
        expect(errors[0].args).toEqual({
            requiredValues: required,
            missingValue: 'cherry'
        });
    });

    test('should work with mixed data types', () => {
        const array = [1, 'hello', true, null, { id: 1 }];
        const required = ['hello', true];
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with missing mixed data types', () => {
        const array = [1, 'hello', null];
        const required = ['hello', true];
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/allOf');
        expect(errors[0].args).toEqual({
            requiredValues: required,
            missingValue: true
        });
    });

    test('should work with object values using Utils.areEqual', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 1, name: 'test' }; // Same as obj1
        const obj4 = { id: 3, name: 'test3' };
        
        const array = [obj1, obj2, obj4];
        const required = [obj3]; // Should match obj1 using Utils.areEqual
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with missing object values', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 3, name: 'test3' };
        
        const array = [obj1, obj2];
        const required = [obj1, obj3]; // obj3 is missing
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/allOf');
        expect(errors[0].args).toEqual({
            requiredValues: required,
            missingValue: obj3
        });
    });

    test('should work with nested arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const arr3 = [1, 2]; // Same as arr1
        
        const array = [arr1, arr2, [5, 6]];
        const required = [arr3]; // Should match arr1 using Utils.areEqual
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should handle complex nested structures', () => {
        const complex1 = { users: [{ id: 1 }, { id: 2 }], meta: { count: 2 } };
        const complex2 = { users: [{ id: 1 }, { id: 2 }], meta: { count: 2 } };
        
        const array = [complex1, 'simple', 123];
        const required = [complex2]; // Should match complex1
        const result = ArrayHandler.allOf(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

});

describe('ArrayHandler.exactly', () => {
    
    test('should pass when both arrays are empty', () => {
        const array = [];
        const result = ArrayHandler.exactly(array, []);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when no required values are provided', () => {
        const array = [];
        const result = ArrayHandler.exactly(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when arrays have exactly the same values in same order', () => {
        const array = [1, 2, 3];
        const required = [1, 2, 3];
        const result = ArrayHandler.exactly(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when arrays have exactly the same values in different order', () => {
        const array = [1, 3, 2];
        const required = [2, 1, 3];
        const result = ArrayHandler.exactly(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when arrays have duplicate values', () => {
        const array = [1, 2, 2, 3];
        const required = [2, 3, 1, 2];
        const result = ArrayHandler.exactly(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array has fewer elements', () => {
        const array = [1, 2];
        const required = [1, 2, 3];
        const result = ArrayHandler.exactly(array, required);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/exactly');
        expect(errors[0].args).toEqual({
            requiredValues: required
        });
    });

    test('should fail when array has more elements', () => {
        const array = [1, 2, 3, 4];
        const required = [1, 2, 3];
        const result = ArrayHandler.exactly(array, required);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/exactly');
        expect(errors[0].args).toEqual({
            requiredValues: required
        });
    });

    test('should fail when array has different values', () => {
        const array = [1, 2, 4];
        const required = [1, 2, 3];
        const result = ArrayHandler.exactly(array, required);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/exactly');
        expect(errors[0].args).toEqual({
            requiredValues: required
        });
    });

    test('should fail when duplicate counts differ', () => {
        const array = [1, 2, 2, 3];
        const required = [1, 2, 3, 3];
        const result = ArrayHandler.exactly(array, required);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/exactly');
        expect(errors[0].args).toEqual({
            requiredValues: required
        });
    });

    test('should work with string values', () => {
        const array = ['banana', 'apple', 'cherry'];
        const required = ['apple', 'cherry', 'banana'];
        const result = ArrayHandler.exactly(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should work with mixed data types', () => {
        const array = [1, 'hello', true, null];
        const required = [null, true, 1, 'hello'];
        const result = ArrayHandler.exactly(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should work with object values using Utils.areEqual', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 1, name: 'test' }; // Same as obj1
        
        const array = [obj1, obj2];
        const required = [obj2, obj3]; // obj3 should match obj1
        const result = ArrayHandler.exactly(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should work with nested arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const arr3 = [1, 2]; // Same as arr1
        
        const array = [arr1, arr2];
        const required = [arr3, arr2];
        const result = ArrayHandler.exactly(array, required);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

});

describe('ArrayHandler.noneOf', () => {
    
    test('should pass when no forbidden values are provided', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.noneOf(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when forbidden values array is empty', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.noneOf(array, []);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array is empty', () => {
        const array = [];
        const result = ArrayHandler.noneOf(array, [1, 2, 3]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array contains none of the forbidden values', () => {
        const array = [1, 2, 3];
        const forbidden = [4, 5, 6];
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array contains one forbidden value', () => {
        const array = [1, 2, 3];
        const forbidden = [2, 4];
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/noneOf');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 1,
            invalidValue: 2
        });
    });

    test('should fail on first forbidden value found', () => {
        const array = [1, 2, 3, 4];
        const forbidden = [2, 3];
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/noneOf');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 1,
            invalidValue: 2
        });
    });

    test('should work with string values', () => {
        const array = ['apple', 'banana', 'cherry'];
        const forbidden = ['grape', 'orange'];
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with forbidden string values', () => {
        const array = ['apple', 'banana', 'cherry'];
        const forbidden = ['banana', 'grape'];
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/noneOf');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 1,
            invalidValue: 'banana'
        });
    });

    test('should work with mixed data types', () => {
        const array = [1, 'hello', true, null];
        const forbidden = [false, 'world'];
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with forbidden mixed data types', () => {
        const array = [1, 'hello', true, null];
        const forbidden = [false, 'hello'];
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/noneOf');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 1,
            invalidValue: 'hello'
        });
    });

    test('should work with object values using Utils.areEqual', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 3, name: 'test3' };
        
        const array = [obj1, obj2];
        const forbidden = [obj3];
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with forbidden object values', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 1, name: 'test' }; // Same as obj1
        
        const array = [obj1, obj2];
        const forbidden = [obj3]; // Should match obj1 using Utils.areEqual
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/noneOf');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 0,
            invalidValue: obj1
        });
    });

    test('should work with nested arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const arr3 = [5, 6];
        
        const array = [arr1, arr2];
        const forbidden = [arr3];
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with forbidden nested arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const arr3 = [1, 2]; // Same as arr1
        
        const array = [arr1, arr2];
        const forbidden = [arr3]; // Should match arr1 using Utils.areEqual
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/noneOf');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 0,
            invalidValue: arr1
        });
    });

    test('should handle duplicate values in array', () => {
        const array = [1, 2, 2, 3];
        const forbidden = [4, 5];
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail on first occurrence of forbidden duplicate', () => {
        const array = [1, 2, 2, 3];
        const forbidden = [2, 4];
        const result = ArrayHandler.noneOf(array, forbidden);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/noneOf');
        expect(errors[0].args).toEqual({
            forbiddenValues: forbidden,
            index: 1, // First occurrence of 2
            invalidValue: 2
        });
    });

});

describe('ArrayHandler.someOf', () => {
    
    test('should pass when no possible values are provided', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.someOf(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when possible values array is empty', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.someOf(array, []);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array contains at least one possible value', () => {
        const array = [1, 2, 3];
        const possible = [2, 4, 5];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array contains multiple possible values', () => {
        const array = [1, 2, 3, 4];
        const possible = [2, 3, 5];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array and possible values are identical', () => {
        const array = [1, 2, 3];
        const possible = [1, 2, 3];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array contains none of the possible values', () => {
        const array = [1, 2, 3];
        const possible = [4, 5, 6];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/someOf');
        expect(errors[0].args).toEqual({
            possibleValues: possible
        });
    });

    test('should fail when array is empty but possible values exist', () => {
        const array = [];
        const possible = [1, 2, 3];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/someOf');
        expect(errors[0].args).toEqual({
            possibleValues: possible
        });
    });

    test('should work with string values', () => {
        const array = ['apple', 'banana', 'cherry'];
        const possible = ['banana', 'grape'];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with no matching string values', () => {
        const array = ['apple', 'banana'];
        const possible = ['cherry', 'grape'];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/someOf');
        expect(errors[0].args).toEqual({
            possibleValues: possible
        });
    });

    test('should work with mixed data types', () => {
        const array = [1, 'hello', true, null];
        const possible = [false, 'hello'];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with no matching mixed data types', () => {
        const array = [1, 'hello', true];
        const possible = [false, 'world'];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/someOf');
        expect(errors[0].args).toEqual({
            possibleValues: possible
        });
    });

    test('should work with object values using Utils.areEqual', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 1, name: 'test' }; // Same as obj1
        
        const array = [obj1, obj2];
        const possible = [obj3, { id: 3 }]; // obj3 should match obj1
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with no matching object values', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 3, name: 'test3' };
        
        const array = [obj1, obj2];
        const possible = [obj3, { id: 4 }];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/someOf');
        expect(errors[0].args).toEqual({
            possibleValues: possible
        });
    });

    test('should work with nested arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const arr3 = [1, 2]; // Same as arr1
        
        const array = [arr1, arr2];
        const possible = [arr3, [5, 6]];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should handle duplicate values in array', () => {
        const array = [1, 2, 2, 3];
        const possible = [2, 4];
        const result = ArrayHandler.someOf(array, possible);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

});

describe('ArrayHandler.empty', () => {
    
    test('should pass when array is empty', () => {
        const array = [];
        const result = ArrayHandler.empty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array has one element', () => {
        const array = [1];
        const result = ArrayHandler.empty(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/empty');
        expect(errors[0].args).toEqual({
            length: 1
        });
    });

    test('should fail when array has multiple elements', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.empty(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/empty');
        expect(errors[0].args).toEqual({
            length: 3
        });
    });

    test('should fail with string elements', () => {
        const array = ['hello'];
        const result = ArrayHandler.empty(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/empty');
        expect(errors[0].args).toEqual({
            length: 1
        });
    });

    test('should fail with mixed data types', () => {
        const array = [1, 'hello', true, null, undefined];
        const result = ArrayHandler.empty(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/empty');
        expect(errors[0].args).toEqual({
            length: 5
        });
    });

    test('should fail with object elements', () => {
        const array = [{ id: 1 }, { id: 2 }];
        const result = ArrayHandler.empty(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/empty');
        expect(errors[0].args).toEqual({
            length: 2
        });
    });

    test('should fail with nested arrays', () => {
        const array = [[], [1, 2]];
        const result = ArrayHandler.empty(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/empty');
        expect(errors[0].args).toEqual({
            length: 2
        });
    });

    test('should fail even with falsy values', () => {
        const array = [null, undefined, false, 0, ''];
        const result = ArrayHandler.empty(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/empty');
        expect(errors[0].args).toEqual({
            length: 5
        });
    });

});

describe('ArrayHandler.notEmpty', () => {
    
    test('should pass when array has one element', () => {
        const array = [1];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array has multiple elements', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array is empty', () => {
        const array = [];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/notEmpty');
    });

    test('should pass with string elements', () => {
        const array = ['hello', 'world'];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with single string element', () => {
        const array = ['hello'];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with mixed data types', () => {
        const array = [1, 'hello', true, null, undefined];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with object elements', () => {
        const array = [{ id: 1 }, { id: 2 }];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with single object element', () => {
        const array = [{ id: 1, name: 'test' }];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with nested arrays', () => {
        const array = [[], [1, 2], [3, 4, 5]];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with single nested empty array', () => {
        const array = [[]];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with falsy values', () => {
        const array = [null, undefined, false, 0, ''];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with single falsy value', () => {
        const array = [null];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with boolean values', () => {
        const array = [true, false];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with function elements', () => {
        const fn1 = () => {};
        const fn2 = function() {};
        const array = [fn1, fn2];
        const result = ArrayHandler.notEmpty(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

});

describe('ArrayHandler.dimensions', () => {
    
    test('should pass for 1D array with correct length', () => {
        const array = [1, 2, 3, 4];
        const dimensions = [4];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for empty 1D array', () => {
        const array = [];
        const dimensions = [0];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail for 1D array with wrong length', () => {
        const array = [1, 2, 3];
        const dimensions = [5];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/dimensions');
        expect(errors[0].args).toEqual({ dimensions });
    });

    test('should pass for 2D array with correct dimensions', () => {
        const array = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ];
        const dimensions = [3, 3];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for rectangular 2D array', () => {
        const array = [
            ['a', 'b', 'c', 'd'],
            ['e', 'f', 'g', 'h']
        ];
        const dimensions = [2, 4];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail for 2D array with wrong outer dimension', () => {
        const array = [
            [1, 2],
            [3, 4],
            [5, 6],
            [7, 8]
        ];
        const dimensions = [3, 2];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/dimensions');
        expect(errors[0].args).toEqual({ dimensions });
    });

    test('should fail for 2D array with wrong inner dimension', () => {
        const array = [
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10]
        ];
        const dimensions = [2, 3];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/dimensions');
        expect(errors[0].args).toEqual({ dimensions });
    });

    test('should fail for jagged 2D array', () => {
        const array = [
            [1, 2, 3],
            [4, 5],
            [6, 7, 8]
        ];
        const dimensions = [3, 3];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/dimensions');
        expect(errors[0].args).toEqual({ dimensions });
    });

    test('should pass for 3D array with correct dimensions', () => {
        const array = [
            [
                [1, 2],
                [3, 4]
            ],
            [
                [5, 6],
                [7, 8]
            ]
        ];
        const dimensions = [2, 2, 2];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail for 3D array with wrong deepest dimension', () => {
        const array = [
            [
                [1, 2, 3],
                [4, 5, 6]
            ],
            [
                [7, 8, 9],
                [10, 11, 12]
            ]
        ];
        const dimensions = [2, 2, 2];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/dimensions');
        expect(errors[0].args).toEqual({ dimensions });
    });

    test('should fail when 2D array contains non-array element', () => {
        const array = [
            [1, 2, 3],
            'not an array',
            [7, 8, 9]
        ];
        const dimensions = [3, 3];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/dimensions');
        expect(errors[0].args).toEqual({ dimensions });
    });

    test('should fail when 3D array contains non-array at deep level', () => {
        const array = [
            [
                [1, 2],
                [3, 4]
            ],
            [
                [5, 6],
                'invalid element'
            ]
        ];
        const dimensions = [2, 2, 2];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/dimensions');
        expect(errors[0].args).toEqual({ dimensions });
    });

    test('should pass for 1x1 matrix', () => {
        const array = [[42]];
        const dimensions = [1, 1];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for matrix of empty arrays', () => {
        const array = [[], [], []];
        const dimensions = [3, 0];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for 4D array with correct structure', () => {
        const array = [
            [
                [
                    [1, 2],
                    [3, 4]
                ],
                [
                    [5, 6],
                    [7, 8]
                ]
            ]
        ];
        const dimensions = [1, 2, 2, 2];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail for 4D array with incorrect structure', () => {
        const array = [
            [
                [
                    [1, 2, 3, 4], // Wrong innermost length
                    [5, 6, 7, 8]
                ]
            ]
        ];
        const dimensions = [1, 1, 2, 3];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/dimensions');
        expect(errors[0].args).toEqual({ dimensions });
    });

    test('should work with mixed data types in correctly sized structure', () => {
        const array = [
            ['hello', 42, true],
            [null, {id: 1}, [1, 2, 3]]
        ];
        const dimensions = [2, 3];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should validate large multi-dimensional arrays', () => {
        // Create a 5x4x3 array
        const array = Array(5).fill(null).map(() => 
            Array(4).fill(null).map(() => 
                Array(3).fill(0)
            )
        );
        const dimensions = [5, 4, 3];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail for large array with wrong inner dimensions', () => {
        // Create a 3x3 array but expect 3x4
        const array = Array(3).fill(null).map(() => Array(3).fill(0));
        const dimensions = [3, 4];
        const result = ArrayHandler.dimensions(array, dimensions);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/dimensions');
        expect(errors[0].args).toEqual({ dimensions });
    });

});

describe('ArrayHandler.sorted', () => {
    
    test('should pass for empty array', () => {
        const array = [];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for single element array', () => {
        const array = [42];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for sorted numeric array', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for sorted string array', () => {
        const array = ['apple', 'banana', 'cherry', 'date'];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for array with equal elements', () => {
        const array = [3, 3, 3, 3];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for array with duplicates in sorted order', () => {
        const array = [1, 2, 2, 3, 4, 4, 5];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail for unsorted numeric array', () => {
        const array = [1, 3, 2, 4, 5];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/sorted');
        expect(errors[0].args).toEqual({
            index: 2,
            invalidValue: 2
        });
    });

    test('should fail for reverse sorted array', () => {
        const array = [5, 4, 3, 2, 1];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/sorted');
        expect(errors[0].args).toEqual({
            index: 1,
            invalidValue: 4
        });
    });

    test('should fail for unsorted string array', () => {
        const array = ['cherry', 'apple', 'banana'];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/sorted');
        expect(errors[0].args).toEqual({
            index: 1,
            invalidValue: 'apple'
        });
    });

    test('should work with custom comparator function', () => {
        const array = [5, 4, 3, 2, 1];
        const descendingComparator = (a, b) => b - a;
        const result = ArrayHandler.sorted(array, descendingComparator);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with custom comparator when not sorted', () => {
        const array = [1, 3, 2]; // Not descending
        const descendingComparator = (a, b) => b - a;
        const result = ArrayHandler.sorted(array, descendingComparator);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/sorted');
        expect(errors[0].args).toEqual({
            index: 2,
            invalidValue: 2
        });
    });

    test('should work with Path-based sorting', () => {
        const array = [
            { name: 'Alice', age: 25 },
            { name: 'Bob', age: 30 },
            { name: 'Charlie', age: 35 }
        ];
        const agePath = new Path('age');
        const result = ArrayHandler.sorted(array, agePath);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with Path-based sorting when not sorted', () => {
        const array = [
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 25 }, // Age is not increasing
            { name: 'Charlie', age: 35 }
        ];
        const agePath = new Path('age');
        const result = ArrayHandler.sorted(array, agePath);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/sorted');
        expect(errors[0].args).toEqual({
            index: 1,
            invalidValue: { name: 'Bob', age: 25 }
        });
    });

    test('should work with nested Path sorting', () => {
        const array = [
            { user: { profile: { score: 10 } } },
            { user: { profile: { score: 20 } } },
            { user: { profile: { score: 30 } } }
        ];
        const scorePath = Path.create('user/profile/score');
        const result = ArrayHandler.sorted(array, scorePath);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should handle mixed data types in default sort', () => {
        const array = [1, '2', 3, 'a'];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should handle null and undefined values', () => {
        const array = [null, undefined];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should work with boolean values', () => {
        const array = [false, true];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when boolean values are not sorted', () => {
        const array = [true, false];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/sorted');
        expect(errors[0].args).toEqual({
            index: 1,
            invalidValue: false
        });
    });

    test('should work with date objects', () => {
        const date1 = new Date('2020-01-01');
        const date2 = new Date('2021-01-01');
        const date3 = new Date('2022-01-01');
        const array = [date1, date2, date3];
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should handle large arrays efficiently', () => {
        const array = Array.from({ length: 1000 }, (_, i) => i);
        const result = ArrayHandler.sorted(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

});
