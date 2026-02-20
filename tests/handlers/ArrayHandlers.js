'use strict';

import ArrayHandler from '../../lib/handlers/ArrayHandler.js';

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
