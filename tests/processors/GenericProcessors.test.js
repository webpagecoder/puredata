'use strict';

import GenericProcessors  from '../../lib/processors/GenericProcessors.js';



describe('GenericProcessors.equals', () => {
    it('should pass when values are equal', () => {
        const result = GenericProcessors.equals(5, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should fail when values are not equal', () => {
        const result = GenericProcessors.equals(5, 10);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(5);
        expect(result.hasError('generic/equals')).toBe(true);
    });

    it('should work with objects using deep equality', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 2 } };
        const result = GenericProcessors.equals(obj1, obj2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(obj1);
    });

    it('should fail for objects that are not deeply equal', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 3 } };
        const result = GenericProcessors.equals(obj1, obj2);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(obj1);
    });

    it('should work with arrays', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2, 3];
        const result = GenericProcessors.equals(arr1, arr2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(arr1);
    });

    it('should work with null and undefined', () => {
        expect(GenericProcessors.equals(null, null).pass).toBe(true);
        expect(GenericProcessors.equals(undefined, undefined).pass).toBe(true);
        expect(GenericProcessors.equals(null, undefined).pass).toBe(false);
    });
});

describe('GenericProcessors.notEquals', () => {
    it('should pass when values are not equal', () => {
        const result = GenericProcessors.notEquals(5, 10);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should fail when values are equal', () => {
        const result = GenericProcessors.notEquals(5, 5);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(5);
        expect(result.hasError('generic/notEquals')).toBe(true);
    });

    it('should work with objects using deep equality', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 3 } };
        const result = GenericProcessors.notEquals(obj1, obj2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(obj1);
    });

    it('should fail for objects that are deeply equal', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 2 } };
        const result = GenericProcessors.notEquals(obj1, obj2);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(obj1);
    });
});

describe('GenericProcessors.isPrimitive (with type parameter)', () => {
    it('should pass when type matches', () => {
        const result = GenericProcessors.isPrimitive('hello', 'string');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should fail when type does not match', () => {
        const result = GenericProcessors.isPrimitive(123, 'string');
        expect(result.pass).toBe(false);
        expect(result.value).toBe(123);
        expect(result.hasError('generic/primitive')).toBe(true);
    });

    it('should work with different types', () => {
        expect(GenericProcessors.isPrimitive(123, 'number').pass).toBe(true);
        expect(GenericProcessors.isPrimitive(true, 'boolean').pass).toBe(true);
        expect(GenericProcessors.isPrimitive(undefined, 'undefined').pass).toBe(true);
        expect(GenericProcessors.isPrimitive(null, 'string').pass).toBe(false); // null is not a primitive type
        expect(GenericProcessors.isPrimitive({}, 'object').pass).toBe(true); // typeof {} === 'object'
        expect(GenericProcessors.isPrimitive([], 'object').pass).toBe(true); // typeof [] === 'object'
        expect(GenericProcessors.isPrimitive(() => {}, 'function').pass).toBe(true); // typeof function === 'function'
    });
});

describe('GenericProcessors.isPrimitive (without type parameter)', () => {
    it('should pass for primitive values', () => {
        expect(GenericProcessors.isPrimitive('string').pass).toBe(true);
        expect(GenericProcessors.isPrimitive(123).pass).toBe(true);
        expect(GenericProcessors.isPrimitive(true).pass).toBe(true);
        expect(GenericProcessors.isPrimitive(false).pass).toBe(true);
        expect(GenericProcessors.isPrimitive(undefined).pass).toBe(true);
        expect(GenericProcessors.isPrimitive(Symbol('test')).pass).toBe(true);
        expect(GenericProcessors.isPrimitive(BigInt(123)).pass).toBe(true);
    });

    it('should fail for non-primitive values', () => {
        expect(GenericProcessors.isPrimitive(null).pass).toBe(false); // null is not primitive
        
        const objResult = GenericProcessors.isPrimitive({});
        expect(objResult.pass).toBe(false);
        expect(objResult.hasError('generic/primitive')).toBe(true);

        const arrResult = GenericProcessors.isPrimitive([]);
        expect(arrResult.pass).toBe(false);
        expect(arrResult.hasError('generic/primitive')).toBe(true);

        const funcResult = GenericProcessors.isPrimitive(() => {});
        expect(funcResult.pass).toBe(false);
        expect(funcResult.hasError('generic/primitive')).toBe(true);
    });
});

describe('GenericProcessors.isTruthy', () => {
    it('should pass for truthy values', () => {
        expect(GenericProcessors.isTruthy(true).pass).toBe(true);
        expect(GenericProcessors.isTruthy(1).pass).toBe(true);
        expect(GenericProcessors.isTruthy('hello').pass).toBe(true);
        expect(GenericProcessors.isTruthy({}).pass).toBe(true);
        expect(GenericProcessors.isTruthy([]).pass).toBe(true);
        expect(GenericProcessors.isTruthy(function() {}).pass).toBe(true);
    });

    it('should fail for falsy values', () => {
        expect(GenericProcessors.isTruthy(false).pass).toBe(false);
        expect(GenericProcessors.isTruthy(0).pass).toBe(false);
        expect(GenericProcessors.isTruthy('').pass).toBe(false);
        expect(GenericProcessors.isTruthy(null).pass).toBe(false);
        expect(GenericProcessors.isTruthy(undefined).pass).toBe(false);
        expect(GenericProcessors.isTruthy(NaN).pass).toBe(false);
    });

    it('should have correct error type for falsy values', () => {
        const result = GenericProcessors.isTruthy(false);
        expect(result.hasError('generic/truthy')).toBe(true);
    });
});

describe('GenericProcessors.isFalsy', () => {
    it('should pass for falsy values', () => {
        expect(GenericProcessors.isFalsy(false).pass).toBe(true);
        expect(GenericProcessors.isFalsy(0).pass).toBe(true);
        expect(GenericProcessors.isFalsy('').pass).toBe(true);
        expect(GenericProcessors.isFalsy(null).pass).toBe(true);
        expect(GenericProcessors.isFalsy(undefined).pass).toBe(true);
        expect(GenericProcessors.isFalsy(NaN).pass).toBe(true);
    });

    it('should fail for truthy values', () => {
        expect(GenericProcessors.isFalsy(true).pass).toBe(false);
        expect(GenericProcessors.isFalsy(1).pass).toBe(false);
        expect(GenericProcessors.isFalsy('hello').pass).toBe(false);
        expect(GenericProcessors.isFalsy({}).pass).toBe(false);
        expect(GenericProcessors.isFalsy([]).pass).toBe(false);
        expect(GenericProcessors.isFalsy(function() {}).pass).toBe(false);
    });

    it('should have correct error type for truthy values', () => {
        const result = GenericProcessors.isFalsy(true);
        expect(result.hasError('generic/falsy')).toBe(true);
    });
});

describe('GenericProcessors.isEmpty', () => {
    it('should pass for null and undefined', () => {
        expect(GenericProcessors.isEmpty(null).pass).toBe(true);
        expect(GenericProcessors.isEmpty(undefined).pass).toBe(true);
    });

    it('should not pass for empty strings', () => {
        const result = GenericProcessors.isEmpty('');
        expect(result.pass).toBe(false);
        expect(result.value).toBe('');
    });

    it('should fail for non-empty strings', () => {
        const result = GenericProcessors.isEmpty('hello');
        expect(result.pass).toBe(false);
    });

    it('should not pass for empty arrays', () => {
        const result = GenericProcessors.isEmpty([]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual([]);
    });

    it('should fail for non-empty arrays', () => {
        const result = GenericProcessors.isEmpty([1, 2, 3]);
        expect(result.pass).toBe(false);
    });

    it('should fail for non-empty objects', () => {
        const result = GenericProcessors.isEmpty({ a: 1 });
        expect(result.pass).toBe(false);
    });

    it('should fail for primitive values that are not null/undefined', () => {
        expect(GenericProcessors.isEmpty(0).pass).toBe(false);
        expect(GenericProcessors.isEmpty(false).pass).toBe(false);
        expect(GenericProcessors.isEmpty(123).pass).toBe(false);
    });
});

describe('GenericProcessors.isNotEmpty', () => {
    it('should fail for null and undefined', () => {
        expect(GenericProcessors.isNotEmpty(null).pass).toBe(false);
        expect(GenericProcessors.isNotEmpty(undefined).pass).toBe(false);
    });

    it('should pass for empty strings', () => {
        const result = GenericProcessors.isNotEmpty('');
        expect(result.pass).toBe(true);
    });

    it('should pass for non-empty strings', () => {
        const result = GenericProcessors.isNotEmpty('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should pass for empty arrays', () => {
        const result = GenericProcessors.isNotEmpty([]);
        expect(result.pass).toBe(true);
    });

    it('should pass for non-empty arrays', () => {
        const result = GenericProcessors.isNotEmpty([1, 2, 3]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    it('should pass for non-empty objects', () => {
        const result = GenericProcessors.isNotEmpty({ a: 1 });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1 });
    });

    it('should pass for primitive values that are not null/undefined', () => {
        expect(GenericProcessors.isNotEmpty(0).pass).toBe(true);
        expect(GenericProcessors.isNotEmpty(false).pass).toBe(true);
        expect(GenericProcessors.isNotEmpty(123).pass).toBe(true);
    });
});

// Note: GenericProcessors does not have an instanceOf method
// Use ObjectProcessors.instanceOf for instance checks

// Note: GenericProcessors does not have a hasProperty method  
// Use ObjectProcessors.hasProperty for property checks

describe('GenericProcessors.isOneOf', () => {
    it('should pass when value is in allowed values', () => {
        const result = GenericProcessors.isOneOf(2, [1, 2, 3]);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(2);
    });

    it('should fail when value is not in allowed values', () => {
        const result = GenericProcessors.isOneOf(4, [1, 2, 3]);
        expect(result.pass).toBe(false);
        expect(result.hasError('generic/isAllowed')).toBe(true);
    });

    it('should work with objects using deep equality', () => {
        const obj = { a: 1 };
        const result = GenericProcessors.isOneOf(obj, [{ a: 1 }, { b: 2 }]);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(obj);
    });

    it('should fail when object is not deeply equal to any allowed value', () => {
        const obj = { a: 2 };
        const result = GenericProcessors.isOneOf(obj, [{ a: 1 }, { b: 2 }]);
        expect(result.pass).toBe(false);
    });

    it('should pass with empty allowed values for default behavior', () => {
        const result = GenericProcessors.isOneOf('anything');
        expect(result.pass).toBe(false); // empty array means nothing is allowed
    });

    it('should work with mixed types', () => {
        const allowedValues = [1, 'hello', true, null, { x: 1 }];
        expect(GenericProcessors.isOneOf(1, allowedValues).pass).toBe(true);
        expect(GenericProcessors.isOneOf('hello', allowedValues).pass).toBe(true);
        expect(GenericProcessors.isOneOf(true, allowedValues).pass).toBe(true);
        expect(GenericProcessors.isOneOf(null, allowedValues).pass).toBe(true);
        expect(GenericProcessors.isOneOf({ x: 1 }, allowedValues).pass).toBe(true);
        expect(GenericProcessors.isOneOf('goodbye', allowedValues).pass).toBe(false);
    });
});

describe('GenericProcessors.isNotOneOf', () => {
    it('should pass when value is not in forbidden values', () => {
        const result = GenericProcessors.isNotOneOf(4, [1, 2, 3]);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(4);
    });

    it('should fail when value is in forbidden values', () => {
        const result = GenericProcessors.isNotOneOf(2, [1, 2, 3]);
        expect(result.pass).toBe(false);
        expect(result.hasError('generic/forbidden')).toBe(true);
    });

    it('should work with objects using deep equality', () => {
        const obj = { a: 2 };
        const result = GenericProcessors.isNotOneOf(obj, [{ a: 1 }, { b: 2 }]);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(obj);
    });

    it('should fail when object is deeply equal to a forbidden value', () => {
        const obj = { a: 1 };
        const result = GenericProcessors.isNotOneOf(obj, [{ a: 1 }, { b: 2 }]);
        expect(result.pass).toBe(false);
    });

    it('should pass with empty forbidden values', () => {
        const result = GenericProcessors.isNotOneOf('anything');
        expect(result.pass).toBe(true); // empty array means nothing is forbidden
    });

    it('should work with mixed types', () => {
        const forbiddenValues = [1, 'hello', true, null, { x: 1 }];
        expect(GenericProcessors.isNotOneOf(2, forbiddenValues).pass).toBe(true);
        expect(GenericProcessors.isNotOneOf('goodbye', forbiddenValues).pass).toBe(true);
        expect(GenericProcessors.isNotOneOf(false, forbiddenValues).pass).toBe(true);
        expect(GenericProcessors.isNotOneOf(undefined, forbiddenValues).pass).toBe(true);
        expect(GenericProcessors.isNotOneOf({ x: 2 }, forbiddenValues).pass).toBe(true);
        
        expect(GenericProcessors.isNotOneOf(1, forbiddenValues).pass).toBe(false);
        expect(GenericProcessors.isNotOneOf('hello', forbiddenValues).pass).toBe(false);
        expect(GenericProcessors.isNotOneOf(true, forbiddenValues).pass).toBe(false);
        expect(GenericProcessors.isNotOneOf(null, forbiddenValues).pass).toBe(false);
        expect(GenericProcessors.isNotOneOf({ x: 1 }, forbiddenValues).pass).toBe(false);
    });
});

describe('GenericProcessors.isNull', () => {
    it('should pass for null values', () => {
        const result = GenericProcessors.isNull(null);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(null);
    });

    it('should fail for non-null values', () => {
        expect(GenericProcessors.isNull(undefined).pass).toBe(false);
        expect(GenericProcessors.isNull(0).pass).toBe(false);
        expect(GenericProcessors.isNull('').pass).toBe(false);
        expect(GenericProcessors.isNull(false).pass).toBe(false);
        expect(GenericProcessors.isNull({}).pass).toBe(false);
        expect(GenericProcessors.isNull([]).pass).toBe(false);
    });

    it('should have correct error type for non-null values', () => {
        const result = GenericProcessors.isNull('not null');
        expect(result.hasError('generic/null')).toBe(true);
    });
});

describe('GenericProcessors.isNotNull', () => {
    it('should pass for non-null values', () => {
        expect(GenericProcessors.isNotNull(undefined).pass).toBe(true);
        expect(GenericProcessors.isNotNull(0).pass).toBe(true);
        expect(GenericProcessors.isNotNull('').pass).toBe(true);
        expect(GenericProcessors.isNotNull(false).pass).toBe(true);
        expect(GenericProcessors.isNotNull({}).pass).toBe(true);
        expect(GenericProcessors.isNotNull([]).pass).toBe(true);
        expect(GenericProcessors.isNotNull('hello').pass).toBe(true);
    });

    it('should fail for null values', () => {
        const result = GenericProcessors.isNotNull(null);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(null);
    });

    it('should have correct error type for null values', () => {
        const result = GenericProcessors.isNotNull(null);
        expect(result.hasError('generic/null')).toBe(true);
    });
});

describe('GenericProcessors.isUndefined', () => {
    it('should pass for undefined values', () => {
        const result = GenericProcessors.isUndefined(undefined);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(undefined);
    });

    it('should fail for defined values', () => {
        expect(GenericProcessors.isUndefined(null).pass).toBe(false);
        expect(GenericProcessors.isUndefined(0).pass).toBe(false);
        expect(GenericProcessors.isUndefined('').pass).toBe(false);
        expect(GenericProcessors.isUndefined(false).pass).toBe(false);
        expect(GenericProcessors.isUndefined({}).pass).toBe(false);
        expect(GenericProcessors.isUndefined([]).pass).toBe(false);
    });

    it('should have correct error type for defined values', () => {
        const result = GenericProcessors.isUndefined('defined');
        expect(result.hasError('generic/notDefined')).toBe(true);
    });
});

describe('GenericProcessors.isDefined', () => {
    it('should pass for defined values', () => {
        expect(GenericProcessors.isDefined(null).pass).toBe(true);
        expect(GenericProcessors.isDefined(0).pass).toBe(true);
        expect(GenericProcessors.isDefined('').pass).toBe(true);
        expect(GenericProcessors.isDefined(false).pass).toBe(true);
        expect(GenericProcessors.isDefined({}).pass).toBe(true);
        expect(GenericProcessors.isDefined([]).pass).toBe(true);
    });

    it('should fail for undefined values', () => {
        const result = GenericProcessors.isDefined(undefined);
        expect(result.pass).toBe(false);
        expect(result.hasError('generic/defined')).toBe(true);
    });
});

describe('GenericProcessors.isNullOrUndefined', () => {
    it('should pass for null and undefined', () => {
        const nullResult = GenericProcessors.isNullOrUndefined(null);
        expect(nullResult.pass).toBe(true);
        expect(nullResult.value).toBe(null);

        const undefinedResult = GenericProcessors.isNullOrUndefined(undefined);
        expect(undefinedResult.pass).toBe(true);
        expect(undefinedResult.value).toBe(undefined);
    });

    it('should fail for defined, non-null values', () => {
        expect(GenericProcessors.isNullOrUndefined(0).pass).toBe(false);
        expect(GenericProcessors.isNullOrUndefined('').pass).toBe(false);
        expect(GenericProcessors.isNullOrUndefined(false).pass).toBe(false);
        expect(GenericProcessors.isNullOrUndefined({}).pass).toBe(false);
        expect(GenericProcessors.isNullOrUndefined([]).pass).toBe(false);
        expect(GenericProcessors.isNullOrUndefined('hello').pass).toBe(false);
    });

    it('should have correct error type for defined, non-null values', () => {
        const result = GenericProcessors.isNullOrUndefined('defined');
        expect(result.hasError('generic/nullOrUndefined')).toBe(true);
    });
});