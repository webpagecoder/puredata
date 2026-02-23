'use strict';

import ArrayHandler from '../../lib/handlers/ArrayHandler.js';
import Path from '../../lib/Path.js';

// ====================================
// VALIDATORS
// ====================================

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

describe('ArrayHandler.length', () => {
    
    test('should pass when array has exact required length', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.length(array, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when empty array has required length of 0', () => {
        const array = [];
        const result = ArrayHandler.length(array, 0);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when single element array has required length of 1', () => {
        const array = ['hello'];
        const result = ArrayHandler.length(array, 1);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for large array with exact length', () => {
        const array = Array(100).fill(0);
        const result = ArrayHandler.length(array, 100);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array is shorter than required', () => {
        const array = [1, 2];
        const result = ArrayHandler.length(array, 5);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/length');
        expect(errors[0].args).toEqual({
            length: 2,
            requiredLength: 5
        });
    });

    test('should fail when array is longer than required', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.length(array, 3);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/length');
        expect(errors[0].args).toEqual({
            length: 5,
            requiredLength: 3
        });
    });

    test('should fail when empty array but length required', () => {
        const array = [];
        const result = ArrayHandler.length(array, 5);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/length');
        expect(errors[0].args).toEqual({
            length: 0,
            requiredLength: 5
        });
    });

    test('should work with arrays containing various data types', () => {
        const array = [1, 'test', true, null, {}, []];
        const result = ArrayHandler.length(array, 6);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

});

describe('ArrayHandler.lengthBetween', () => {
    
    test('should pass when length is at minimum', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.lengthBetween(array, 3, 5);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when length is at maximum', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.lengthBetween(array, 3, 5);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when length is in middle of range', () => {
        const array = [1, 2, 3, 4];
        const result = ArrayHandler.lengthBetween(array, 2, 6);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when min and max are equal and length matches', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.lengthBetween(array, 3, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when empty array is within range', () => {
        const array = [];
        const result = ArrayHandler.lengthBetween(array, 0, 5);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for large arrays within range', () => {
        const array = Array(50).fill(0);
        const result = ArrayHandler.lengthBetween(array, 10, 100);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when length is below minimum', () => {
        const array = [1, 2];
        const result = ArrayHandler.lengthBetween(array, 3, 5);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/lengthBetween');
        expect(errors[0].args).toEqual({
            length: 2,
            min: 3,
            max: 5
        });
    });

    test('should fail when length is above maximum', () => {
        const array = [1, 2, 3, 4, 5, 6];
        const result = ArrayHandler.lengthBetween(array, 2, 5);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/lengthBetween');
        expect(errors[0].args).toEqual({
            length: 6,
            min: 2,
            max: 5
        });
    });

    test('should fail when empty array but minimum is greater than 0', () => {
        const array = [];
        const result = ArrayHandler.lengthBetween(array, 1, 5);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/lengthBetween');
        expect(errors[0].args).toEqual({
            length: 0,
            min: 1,
            max: 5
        });
    });

    test('should fail when min equals max but length does not match', () => {
        const array = [1, 2];
        const result = ArrayHandler.lengthBetween(array, 3, 3);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/lengthBetween');
        expect(errors[0].args).toEqual({
            length: 2,
            min: 3,
            max: 3
        });
    });

    test('should work with arrays containing various data types', () => {
        const array = [1, 'test', true, null];
        const result = ArrayHandler.lengthBetween(array, 2, 6);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should work with nested arrays', () => {
        const array = [[1, 2], [3, 4], [5, 6]];
        const result = ArrayHandler.lengthBetween(array, 2, 5);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

});

describe('ArrayHandler.maxLength', () => {
    
    test('should pass when array length equals max', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.maxLength(array, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array length is below max', () => {
        const array = [1, 2];
        const result = ArrayHandler.maxLength(array, 5);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when empty array with max of 0', () => {
        const array = [];
        const result = ArrayHandler.maxLength(array, 0);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when empty array with positive max', () => {
        const array = [];
        const result = ArrayHandler.maxLength(array, 10);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for large array below max', () => {
        const array = Array(50).fill(0);
        const result = ArrayHandler.maxLength(array, 100);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with single element array', () => {
        const array = ['test'];
        const result = ArrayHandler.maxLength(array, 1);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array length exceeds max', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.maxLength(array, 3);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/maxLength');
        expect(errors[0].args).toEqual({
            length: 5,
            max: 3
        });
    });

    test('should fail when array length exceeds max by one', () => {
        const array = [1, 2, 3, 4];
        const result = ArrayHandler.maxLength(array, 3);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/maxLength');
        expect(errors[0].args).toEqual({
            length: 4,
            max: 3
        });
    });

    test('should fail when non-empty array but max is 0', () => {
        const array = [1];
        const result = ArrayHandler.maxLength(array, 0);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/maxLength');
        expect(errors[0].args).toEqual({
            length: 1,
            max: 0
        });
    });

    test('should work with arrays containing various data types', () => {
        const array = [1, 'test', true, null, {}, []];
        const result = ArrayHandler.maxLength(array, 10);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should work with nested arrays', () => {
        const array = [[1, 2], [3, 4], [5, 6]];
        const result = ArrayHandler.maxLength(array, 5);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

});

describe('ArrayHandler.minLength', () => {
    
    test('should pass when array length equals min', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.minLength(array, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array length exceeds min', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.minLength(array, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when empty array with min of 0', () => {
        const array = [];
        const result = ArrayHandler.minLength(array, 0);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass for large array above min', () => {
        const array = Array(100).fill(0);
        const result = ArrayHandler.minLength(array, 50);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with single element array when min is 1', () => {
        const array = ['test'];
        const result = ArrayHandler.minLength(array, 1);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when length greatly exceeds min', () => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const result = ArrayHandler.minLength(array, 2);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array length is below min', () => {
        const array = [1, 2];
        const result = ArrayHandler.minLength(array, 5);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/minLength');
        expect(errors[0].args).toEqual({
            length: 2,
            min: 5
        });
    });

    test('should fail when array length is below min by one', () => {
        const array = [1, 2];
        const result = ArrayHandler.minLength(array, 3);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/minLength');
        expect(errors[0].args).toEqual({
            length: 2,
            min: 3
        });
    });

    test('should fail when empty array but min is greater than 0', () => {
        const array = [];
        const result = ArrayHandler.minLength(array, 1);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/minLength');
        expect(errors[0].args).toEqual({
            length: 0,
            min: 1
        });
    });

    test('should fail when empty array but min is much greater', () => {
        const array = [];
        const result = ArrayHandler.minLength(array, 10);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/minLength');
        expect(errors[0].args).toEqual({
            length: 0,
            min: 10
        });
    });

    test('should work with arrays containing various data types', () => {
        const array = [1, 'test', true, null, {}, []];
        const result = ArrayHandler.minLength(array, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should work with nested arrays', () => {
        const array = [[1, 2], [3, 4], [5, 6]];
        const result = ArrayHandler.minLength(array, 2);
        
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

describe('ArrayHandler.only', () => {
    
    test('should pass when array is empty', () => {
        const array = [];
        const allowedValues = [1, 2, 3];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when all values are in allowed list', () => {
        const array = [1, 2, 3];
        const allowedValues = [1, 2, 3, 4, 5];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass when array values match allowed values exactly', () => {
        const array = [1, 2, 3];
        const allowedValues = [1, 2, 3];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with duplicate values in array', () => {
        const array = [1, 2, 2, 3];
        const allowedValues = [1, 2, 3];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with single element from allowed list', () => {
        const array = [2];
        const allowedValues = [1, 2, 3];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array contains value not in allowed list', () => {
        const array = [1, 2, 4];
        const allowedValues = [1, 2, 3];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/only');
        expect(errors[0].args).toEqual({
            allowedValues,
            index: 2,
            invalidValue: 4
        });
    });

    test('should fail on first invalid value', () => {
        const array = [1, 5, 6];
        const allowedValues = [1, 2, 3];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/only');
        expect(errors[0].args).toEqual({
            allowedValues,
            index: 1,
            invalidValue: 5
        });
    });

    test('should fail when all values are not allowed', () => {
        const array = [7, 8, 9];
        const allowedValues = [1, 2, 3];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/only');
        expect(errors[0].args).toEqual({
            allowedValues,
            index: 0,
            invalidValue: 7
        });
    });

    test('should work with string values', () => {
        const array = ['apple', 'banana'];
        const allowedValues = ['apple', 'banana', 'cherry'];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with invalid string values', () => {
        const array = ['apple', 'grape'];
        const allowedValues = ['apple', 'banana', 'cherry'];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/only');
        expect(errors[0].args).toEqual({
            allowedValues,
            index: 1,
            invalidValue: 'grape'
        });
    });

    test('should work with mixed data types', () => {
        const array = [1, 'hello', true];
        const allowedValues = [1, 'hello', true, null];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with invalid mixed data types', () => {
        const array = [1, 'hello', false];
        const allowedValues = [1, 'hello', true];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/only');
        expect(errors[0].args).toEqual({
            allowedValues,
            index: 2,
            invalidValue: false
        });
    });

    test('should work with object values using Utils.areEqual', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 1, name: 'test' }; // Same as obj1
        
        const array = [obj1];
        const allowedValues = [obj3, obj2]; // obj3 should match obj1
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with invalid object values', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 3, name: 'test3' };
        
        const array = [obj1, obj3];
        const allowedValues = [obj1, obj2];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/only');
        expect(errors[0].args).toEqual({
            allowedValues,
            index: 1,
            invalidValue: obj3
        });
    });

    test('should work with nested arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const arr3 = [1, 2]; // Same as arr1
        
        const array = [arr1];
        const allowedValues = [arr3, arr2];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with invalid nested arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const arr3 = [5, 6];
        
        const array = [arr1, arr3];
        const allowedValues = [arr1, arr2];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/only');
        expect(errors[0].args).toEqual({
            allowedValues,
            index: 1,
            invalidValue: arr3
        });
    });

    test('should work with null and undefined in allowed values', () => {
        const array = [null, undefined, 1];
        const allowedValues = [null, undefined, 1, 2];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should handle empty allowed values list', () => {
        const array = [1];
        const allowedValues = [];
        const result = ArrayHandler.only(array, allowedValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/only');
        expect(errors[0].args).toEqual({
            allowedValues,
            index: 0,
            invalidValue: 1
        });
    });

});

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
            index: 1,
            invalidValue: 3
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

describe('ArrayHandler.tuple', () => {
    
    test('should pass when array matches tuple exactly', () => {
        const array = [1, 2, 3];
        const tupleValues = [1, 2, 3];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with empty array and empty tuple', () => {
        const array = [];
        const tupleValues = [];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with single element', () => {
        const array = [42];
        const tupleValues = [42];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array is longer than tuple', () => {
        const array = [1, 2, 3];
        const tupleValues = [1, 2];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/tuple');
        expect(errors[0].args).toEqual({ tupleValues });
    });

    test('should fail when array is shorter than tuple', () => {
        const array = [1, 2];
        const tupleValues = [1, 2, 3];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/tuple');
        expect(errors[0].args).toEqual({ tupleValues });
    });

    test('should fail when value at index does not match', () => {
        const array = [1, 2, 4];
        const tupleValues = [1, 2, 3];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/tuple');
        expect(errors[0].args).toEqual({
            tupleValues,
            index: 2,
            invalidValue: 4,
            expectedValue: 3
        });
    });

    test('should fail on first mismatch', () => {
        const array = [1, 99, 100];
        const tupleValues = [1, 2, 3];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/tuple');
        expect(errors[0].args).toEqual({
            tupleValues,
            index: 1,
            invalidValue: 99,
            expectedValue: 2
        });
    });

    test('should work with string values', () => {
        const array = ['hello', 'world'];
        const tupleValues = ['hello', 'world'];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should work with mixed data types', () => {
        const array = [1, 'hello', true, null, undefined];
        const tupleValues = [1, 'hello', true, null, undefined];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should work with object values using Utils.areEqual', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj1Copy = { id: 1, name: 'test' };
        
        const array = [obj1, obj2];
        const tupleValues = [obj1Copy, obj2];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with different object values', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 1, name: 'different' };
        
        const array = [obj1, obj2];
        const tupleValues = [obj3, obj2];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/tuple');
        expect(errors[0].args).toEqual({
            tupleValues,
            index: 0,
            invalidValue: obj1,
            expectedValue: obj3
        });
    });

    test('should work with nested arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const arr1Copy = [1, 2];
        
        const array = [arr1, arr2];
        const tupleValues = [arr1Copy, arr2];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with different nested arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const arr3 = [1, 3];
        
        const array = [arr1, arr2];
        const tupleValues = [arr3, arr2];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/tuple');
        expect(errors[0].args).toEqual({
            tupleValues,
            index: 0,
            invalidValue: arr1,
            expectedValue: arr3
        });
    });

    test('should handle large tuples', () => {
        const array = Array.from({ length: 100 }, (_, i) => i);
        const tupleValues = Array.from({ length: 100 }, (_, i) => i);
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should distinguish between similar but different values', () => {
        const array = [0, false, '', null, undefined];
        const tupleValues = [false, 0, null, '', undefined];
        const result = ArrayHandler.tuple(array, tupleValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
    });

});

describe('ArrayHandler.type', () => {
    
    test('should be an alias for only method - pass when all values in allowed list', () => {
        const array = [1, 2, 3];
        const allowedValues = [1, 2, 3, 4, 5];
        const result = ArrayHandler.type(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should be an alias for only method - fail when value not in allowed list', () => {
        const array = [1, 2, 6];
        const allowedValues = [1, 2, 3];
        const result = ArrayHandler.type(array, allowedValues);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/only');
        expect(errors[0].args).toEqual({
            allowedValues,
            index: 2,
            invalidValue: 6
        });
    });

    test('should behave exactly like only with string values', () => {
        const array = ['apple', 'banana'];
        const allowedValues = ['apple', 'banana', 'cherry'];
        const result = ArrayHandler.type(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should behave exactly like only with mixed types', () => {
        const array = [1, 'hello', true];
        const allowedValues = [1, 'hello', true, null];
        const result = ArrayHandler.type(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should work with empty array', () => {
        const array = [];
        const allowedValues = [1, 2, 3];
        const result = ArrayHandler.type(array, allowedValues);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

});

describe('ArrayHandler.unique', () => {
    
    test('should pass when all elements are unique', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with empty array', () => {
        const array = [];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should pass with single element', () => {
        const array = [42];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail when array has duplicate values', () => {
        const array = [1, 2, 3, 2, 5];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/unique');
        expect(errors[0].args).toEqual({
            index1: 1,
            index2: 3,
            duplicateValue: 2
        });
    });

    test('should fail on first duplicate found', () => {
        const array = [1, 2, 2, 3, 3];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/unique');
        expect(errors[0].args).toEqual({
            index1: 1,
            index2: 2,
            duplicateValue: 2
        });
    });

    test('should work with string values', () => {
        const array = ['apple', 'banana', 'cherry'];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with duplicate string values', () => {
        const array = ['apple', 'banana', 'apple'];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/unique');
        expect(errors[0].args).toEqual({
            index1: 0,
            index2: 2,
            duplicateValue: 'apple'
        });
    });

    test('should work with object values using Utils.areEqual', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 3, name: 'test3' };
        
        const array = [obj1, obj2, obj3];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with duplicate object values', () => {
        const obj1 = { id: 1, name: 'test' };
        const obj2 = { id: 2, name: 'test2' };
        const obj3 = { id: 1, name: 'test' }; // Same as obj1
        
        const array = [obj1, obj2, obj3];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/unique');
        expect(errors[0].args).toEqual({
            index1: 0,
            index2: 2,
            duplicateValue: obj1
        });
    });

    test('should work with nested arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const arr3 = [5, 6];
        
        const array = [arr1, arr2, arr3];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with duplicate nested arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const arr3 = [1, 2]; // Same as arr1
        
        const array = [arr1, arr2, arr3];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/unique');
        expect(errors[0].args).toEqual({
            index1: 0,
            index2: 2,
            duplicateValue: arr1
        });
    });

    test('should work with custom comparator function', () => {
        const array = [1, 2, 3, 4, 5];
        // Comparator that considers even numbers as duplicates
        const comparator = (a, b) => {
            if (a % 2 === 0 && b % 2 === 0) return false; // Not unique (duplicate)
            return a !== b;
        };
        const result = ArrayHandler.unique(array, comparator);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/unique');
        expect(errors[0].args.index1).toBe(1); // Index of 2
        expect(errors[0].args.index2).toBe(3); // Index of 4
    });

    test('should work with Path for nested property comparison', () => {
        const obj1 = { user: { id: 1 }, value: 'a' };
        const obj2 = { user: { id: 2 }, value: 'b' };
        const obj3 = { user: { id: 3 }, value: 'c' };
        
        const array = [obj1, obj2, obj3];
        const path = Path.create('user/id');
        const result = ArrayHandler.unique(array, path);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should fail with Path when nested properties are duplicate', () => {
        const obj1 = { user: { id: 1 }, value: 'a' };
        const obj2 = { user: { id: 2 }, value: 'b' };
        const obj3 = { user: { id: 1 }, value: 'c' }; // Same id as obj1
        
        const array = [obj1, obj2, obj3];
        const path = Path.create('user/id');
        const result = ArrayHandler.unique(array, path);
        
        expect(result.pass).toBe(false);
        expect(result.value).toBe(array);
        
        const errors = [...result.errors];
        expect(errors).toHaveLength(1);
        expect(errors[0].key).toBe('array/unique');
        expect(errors[0].args).toEqual({
            index1: 0,
            index2: 2,
            duplicateValue: 1
        });
    });

    test('should handle mixed data types', () => {
        const array = [1, '1', true, null, undefined];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should distinguish between falsy values', () => {
        const array = [0, false, '', null, undefined];
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

    test('should handle large arrays efficiently', () => {
        const array = Array.from({ length: 100 }, (_, i) => i);
        const result = ArrayHandler.unique(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toBe(array);
    });

});

















// ====================================
// MUTATORS 
// ====================================

describe('ArrayHandler.add', () => {
    
    test('should add values to end of array', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.add(array, [4, 5]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4, 5]);
        expect(result.value).not.toBe(array); // Should be new array
    });

    test('should work with empty values array', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.add(array, []);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    test('should work with empty source array', () => {
        const array = [];
        const result = ArrayHandler.add(array, [1, 2]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2]);
    });

    test('should work with mixed data types', () => {
        const array = [1, 'hello'];
        const result = ArrayHandler.add(array, [true, null, { id: 1 }]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 'hello', true, null, { id: 1 }]);
    });

    test('should not mutate original array', () => {
        const array = [1, 2];
        const result = ArrayHandler.add(array, [3]);
        
        expect(array).toEqual([1, 2]);
        expect(result.value).toEqual([1, 2, 3]);
    });

});

describe('ArrayHandler.chunk', () => {
    
    test('should split array into chunks of specified length', () => {
        const array = [1, 2, 3, 4, 5, 6];
        const result = ArrayHandler.chunk(array, 2);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    test('should handle chunks of 3', () => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const result = ArrayHandler.chunk(array, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    });

    test('should keep remainder in last chunk', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.chunk(array, 2);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('should return copy when chunk length >= array length', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.chunk(array, 5);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    test('should work with chunk size of 1', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.chunk(array, 1);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([[1], [2], [3]]);
    });

    test('should handle empty array', () => {
        const array = [];
        const result = ArrayHandler.chunk(array, 2);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

});

describe('ArrayHandler.filter', () => {
    
    test('should filter array based on predicate', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.filter(array, x => x > 2);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([3, 4, 5]);
    });

    test('should filter with index', () => {
        const array = ['a', 'b', 'c', 'd'];
        const result = ArrayHandler.filter(array, (x, i) => i % 2 === 0);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['a', 'c']);
    });

    test('should return empty array when no matches', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.filter(array, x => x > 10);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    test('should work with object filtering', () => {
        const array = [{ id: 1, active: true }, { id: 2, active: false }, { id: 3, active: true }];
        const result = ArrayHandler.filter(array, x => x.active);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ id: 1, active: true }, { id: 3, active: true }]);
    });

});

describe('ArrayHandler.flatten', () => {
    
    test('should flatten one level deep array', () => {
        const array = [[1, 2], [3, 4], [5, 6]];
        const result = ArrayHandler.flatten(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test('should flatten deeply nested arrays', () => {
        const array = [1, [2, [3, [4, 5]]]];
        const result = ArrayHandler.flatten(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4, 5]);
    });

    test('should handle mixed nested and non-nested elements', () => {
        const array = [1, [2, 3], 4, [5, [6, 7]]];
        const result = ArrayHandler.flatten(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    test('should handle empty arrays', () => {
        const array = [1, [], 2, [3, []]];
        const result = ArrayHandler.flatten(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    test('should work with non-nested array', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.flatten(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

});

describe('ArrayHandler.group', () => {
    
    test('should group by direct values', () => {
        const array = [1, 2, 1, 3, 2, 1];
        const result = ArrayHandler.group(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([[1, 1, 1], [2, 2], [3]]);
    });

    test('should group objects by path property', () => {
        const array = [
            { type: 'a', value: 1 },
            { type: 'b', value: 2 },
            { type: 'a', value: 3 },
            { type: 'a', value: 4 },
            { type: 'b', value: 5 }
        ];
        const path = Path.create('type');
        const result = ArrayHandler.group(array, path);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(2);
        expect(result.value[0]).toHaveLength(3); // 3 items with type 'a'
        expect(result.value[1]).toHaveLength(2); // 2 items with type 'b'
    });

    test('should group by nested path', () => {
        const array = [
            { user: { role: 'admin' }, id: 1 },
            { user: { role: 'user' }, id: 2 },
            { user: { role: 'admin' }, id: 3 }
        ];
        const path = Path.create('user/role');
        const result = ArrayHandler.group(array, path);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(2);
    });

    test('should handle empty array', () => {
        const array = [];
        const result = ArrayHandler.group(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    test('should work with string grouping', () => {
        const array = ['apple', 'apricot', 'banana', 'blueberry', 'cherry'];
        const result = ArrayHandler.group(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(5); // Each unique string forms its own group
    });

});

describe('ArrayHandler.keep', () => {
    
    test('should keep only allowed values', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.keep(array, [2, 4]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([2, 4]);
    });

    test('should work with string values', () => {
        const array = ['apple', 'banana', 'cherry', 'date'];
        const result = ArrayHandler.keep(array, ['banana', 'date']);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['banana', 'date']);
    });

    test('should keep duplicates if they are allowed', () => {
        const array = [1, 2, 2, 3, 4, 4, 4];
        const result = ArrayHandler.keep(array, [2, 4]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([2, 2, 4, 4, 4]);
    });

    test('should return empty array when nothing matches', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.keep(array, [4, 5]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

    test('should work with objects using Utils.areEqual', () => {
        const obj1 = { id: 1 };
        const obj2 = { id: 2 };
        const obj3 = { id: 3 };
        const array = [obj1, obj2, obj3];
        const result = ArrayHandler.keep(array, [{ id: 1 }, { id: 3 }]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(2);
        expect(result.value[0]).toEqual({ id: 1 });
        expect(result.value[1]).toEqual({ id: 3 });
    });

});

describe('ArrayHandler.map', () => {
    
    test('should map array values', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.map(array, x => x * 2);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([2, 4, 6]);
    });

    test('should map with index', () => {
        const array = ['a', 'b', 'c'];
        const result = ArrayHandler.map(array, (x, i) => `${x}${i}`);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['a0', 'b1', 'c2']);
    });

    test('should map objects', () => {
        const array = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const result = ArrayHandler.map(array, x => x.id);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    test('should handle empty array', () => {
        const array = [];
        const result = ArrayHandler.map(array, x => x * 2);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

});

describe('ArrayHandler.padEnd', () => {
    
    test('should pad array to target length', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.padEnd(array, 5);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, null, null]);
    });

    test('should pad with custom value', () => {
        const array = [1, 2];
        const result = ArrayHandler.padEnd(array, 5, 0);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 0, 0, 0]);
    });

    test('should return copy when already at target length', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.padEnd(array, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
        expect(result.value).not.toBe(array);
    });

    test('should return copy when longer than target length', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.padEnd(array, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4, 5]);
    });

    test('should work with string pad value', () => {
        const array = ['a', 'b'];
        const result = ArrayHandler.padEnd(array, 4, 'x');
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['a', 'b', 'x', 'x']);
    });

});

describe('ArrayHandler.pickRandom', () => {
    
    test('should pick one random element by default', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.pickRandom(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(1);
        expect(array).toContain(result.value[0]);
    });

    test('should pick specified count of random elements', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.pickRandom(array, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(3);
        result.value.forEach(val => {
            expect(array).toContain(val);
        });
    });

    test('should return all elements when count exceeds array length', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.pickRandom(array, 10);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(3);
    });

    test('should not mutate original array', () => {
        const array = [1, 2, 3, 4, 5];
        ArrayHandler.pickRandom(array, 2);
        
        expect(array).toEqual([1, 2, 3, 4, 5]);
    });

    test('should work with empty array', () => {
        const array = [];
        const result = ArrayHandler.pickRandom(array, 1);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

});

describe('ArrayHandler.remove', () => {
    
    test('should remove forbidden values', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.remove(array, [2, 4]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 3, 5]);
    });

    test('should remove all occurrences of forbidden values', () => {
        const array = [1, 2, 3, 2, 4, 2];
        const result = ArrayHandler.remove(array, [2]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 3, 4]);
    });

    test('should work with object values using Utils.areEqual', () => {
        const obj1 = { id: 1 };
        const obj2 = { id: 2 };
        const obj3 = { id: 3 };
        const array = [obj1, obj2, obj3];
        const result = ArrayHandler.remove(array, [{ id: 2 }]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(2);
        expect(result.value[0]).toEqual({ id: 1 });
        expect(result.value[1]).toEqual({ id: 3 });
    });

    test('should return copy when nothing to remove', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.remove(array, [4, 5]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    test('should work with empty forbidden values', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.remove(array, []);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

});

describe('ArrayHandler.removeDuplicates', () => {
    
    test('should remove duplicate values', () => {
        const array = [1, 2, 3, 2, 4, 1, 5];
        const result = ArrayHandler.removeDuplicates(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4, 5]);
    });

    test('should remove duplicate objects', () => {
        const array = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }];
        const result = ArrayHandler.removeDuplicates(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(3);
        expect(result.value).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    test('should work with custom comparator', () => {
        const array = [
            { id: 1, type: 'A' },
            { id: 2, type: 'B' },
            { id: 3, type: 'A' }
        ];
        // Comparator that considers objects with same type as duplicates
        const comparator = (a, b) => a.type !== b.type;
        const result = ArrayHandler.removeDuplicates(array, comparator);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(2);
        expect(result.value[0]).toEqual({ id: 1, type: 'A' });
        expect(result.value[1]).toEqual({ id: 2, type: 'B' });
    });

    test('should work with Path for nested properties', () => {
        const array = [
            { user: { id: 1 }, name: 'Alice' },
            { user: { id: 2 }, name: 'Bob' },
            { user: { id: 1 }, name: 'Charlie' }
        ];
        const path = Path.create('user/id');
        const result = ArrayHandler.removeDuplicates(array, path);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(2);
    });

    test('should handle array with no duplicates', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.removeDuplicates(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4, 5]);
    });

});

describe('ArrayHandler.removeEmpties', () => {
    
    test('should remove null, undefined, and empty string by default', () => {
        const array = [1, null, 2, undefined, 3, '', 4];
        const result = ArrayHandler.removeEmpties(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4]);
    });

    test('should work with custom empty values', () => {
        const array = [1, 0, 2, false, 3, null];
        const result = ArrayHandler.removeEmpties(array, [0, false]);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, null]);
    });

    test('should handle array with no empties', () => {
        const array = [1, 2, 3, 4];
        const result = ArrayHandler.removeEmpties(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3, 4]);
    });

    test('should keep 0 and false by default', () => {
        const array = [0, false, null, '', undefined];
        const result = ArrayHandler.removeEmpties(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([0, false]);
    });

});

describe('ArrayHandler.removeUndefined', () => {
    
    test('should remove only undefined values', () => {
        const array = [1, undefined, 2, null, 3, undefined, 4];
        const result = ArrayHandler.removeUndefined(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, null, 3, 4]);
    });

    test('should keep other falsy values', () => {
        const array = [0, false, '', null, undefined];
        const result = ArrayHandler.removeUndefined(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([0, false, '', null]);
    });

    test('should handle array with no undefined', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.removeUndefined(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

});

describe('ArrayHandler.reverse', () => {
    
    test('should reverse array', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.reverse(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([5, 4, 3, 2, 1]);
    });

    test('should not mutate original array', () => {
        const array = [1, 2, 3];
        ArrayHandler.reverse(array);
        
        expect(array).toEqual([1, 2, 3]);
    });

    test('should work with strings', () => {
        const array = ['a', 'b', 'c'];
        const result = ArrayHandler.reverse(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['c', 'b', 'a']);
    });

    test('should handle single element', () => {
        const array = [1];
        const result = ArrayHandler.reverse(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1]);
    });

    test('should handle empty array', () => {
        const array = [];
        const result = ArrayHandler.reverse(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

});

describe('ArrayHandler.shuffle', () => {
    
    test('should return array with same length', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.shuffle(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toHaveLength(5);
    });

    test('should contain all original elements', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.shuffle(array);
        
        expect(result.pass).toBe(true);
        array.forEach(val => {
            expect(result.value).toContain(val);
        });
    });

    test('should not mutate original array', () => {
        const array = [1, 2, 3, 4, 5];
        ArrayHandler.shuffle(array);
        
        expect(array).toEqual([1, 2, 3, 4, 5]);
    });

    test('should handle single element', () => {
        const array = [1];
        const result = ArrayHandler.shuffle(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1]);
    });

    test('should handle empty array', () => {
        const array = [];
        const result = ArrayHandler.shuffle(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([]);
    });

});

describe('ArrayHandler.slice', () => {
    
    test('should slice array with start and end', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.slice(array, 1, 4);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([2, 3, 4]);
    });

    test('should slice from start to end', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.slice(array, 2);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([3, 4, 5]);
    });

    test('should work with negative indices', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.slice(array, -3, -1);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([3, 4]);
    });

    test('should not mutate original array', () => {
        const array = [1, 2, 3];
        ArrayHandler.slice(array, 1, 2);
        
        expect(array).toEqual([1, 2, 3]);
    });

});

describe('ArrayHandler.sliceFirst', () => {
    
    test('should slice first element by default', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.sliceFirst(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1]);
    });

    test('should slice first n elements', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.sliceFirst(array, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    test('should return all elements when count exceeds length', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.sliceFirst(array, 10);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    test('should not mutate original array', () => {
        const array = [1, 2, 3];
        ArrayHandler.sliceFirst(array, 2);
        
        expect(array).toEqual([1, 2, 3]);
    });

});

describe('ArrayHandler.sliceLast', () => {
    
    test('should slice last element by default', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.sliceLast(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([5]);
    });

    test('should slice last n elements', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.sliceLast(array, 3);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([3, 4, 5]);
    });

    test('should return all elements when count exceeds length', () => {
        const array = [1, 2, 3];
        const result = ArrayHandler.sliceLast(array, 10);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    test('should not mutate original array', () => {
        const array = [1, 2, 3];
        ArrayHandler.sliceLast(array, 2);
        
        expect(array).toEqual([1, 2, 3]);
    });

});

describe('ArrayHandler.sortAsc', () => {
    
    test('should sort numbers in ascending order', () => {
        const array = [3, 1, 4, 1, 5, 9, 2, 6];
        const result = ArrayHandler.sortAsc(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
    });

    test('should sort strings alphabetically', () => {
        const array = ['cherry', 'apple', 'banana'];
        const result = ArrayHandler.sortAsc(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['apple', 'banana', 'cherry']);
    });

    test('should not mutate original array', () => {
        const array = [3, 1, 2];
        ArrayHandler.sortAsc(array);
        
        expect(array).toEqual([3, 1, 2]);
    });

    test('should sort with custom comparator', () => {
        const array = [1, 2, 3, 4, 5];
        const result = ArrayHandler.sortAsc(array, (a, b) => b - a); // Reverse
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([5, 4, 3, 2, 1]);
    });

    test('should sort objects by Path', () => {
        const array = [{ age: 30 }, { age: 20 }, { age: 25 }];
        const path = Path.create('age');
        const result = ArrayHandler.sortAsc(array, path);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ age: 20 }, { age: 25 }, { age: 30 }]);
    });

});

describe('ArrayHandler.sortDesc', () => {
    
    test('should sort numbers in descending order', () => {
        const array = [3, 1, 4, 1, 5, 9, 2, 6];
        const result = ArrayHandler.sortDesc(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([9, 6, 5, 4, 3, 2, 1, 1]);
    });

    test('should sort strings reverse alphabetically', () => {
        const array = ['apple', 'banana', 'cherry'];
        const result = ArrayHandler.sortDesc(array);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(['cherry', 'banana', 'apple']);
    });

    test('should not mutate original array', () => {
        const array = [3, 1, 2];
        ArrayHandler.sortDesc(array);
        
        expect(array).toEqual([3, 1, 2]);
    });

    test('should sort with custom comparator', () => {
        const array = [
            { name: 'Alice', score: 85 },
            { name: 'Bob', score: 92 },
            { name: 'Charlie', score: 78 }
        ];
        // Custom comparator: sort by score descending
        const comparator = (a, b) => b.score - a.score;
        const result = ArrayHandler.sortDesc(array, comparator);
        
        expect(result.pass).toBe(true);
        expect(result.value[0].name).toBe('Bob');
        expect(result.value[1].name).toBe('Alice');
        expect(result.value[2].name).toBe('Charlie');
    });

    test('should sort objects by Path in descending order', () => {
        const array = [{ age: 20 }, { age: 30 }, { age: 25 }];
        const path = Path.create('age');
        const result = ArrayHandler.sortDesc(array, path);
        
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([{ age: 30 }, { age: 25 }, { age: 20 }]);
    });

});

    