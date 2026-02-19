'use strict';

import GenericHandler  from '../../lib/processors/GenericHandler.js';



describe('GenericHandler.equals', () => {
    it('should pass when values are equal', () => {
        const result = GenericHandler.equals(5, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should fail when values are not equal', () => {
        const result = GenericHandler.equals(5, 10);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(5);
        expect(result.hasError('generic/equals')).toBe(true);
    });

    it('should work with objects using deep equality', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 2 } };
        const result = GenericHandler.equals(obj1, obj2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(obj1);
    });

    it('should fail for objects that are not deeply equal', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 3 } };
        const result = GenericHandler.equals(obj1, obj2);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(obj1);
    });

    it('should work with arrays', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2, 3];
        const result = GenericHandler.equals(arr1, arr2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(arr1);
    });

    it('should work with null and undefined', () => {
        expect(GenericHandler.equals(null, null).pass).toBe(true);
        expect(GenericHandler.equals(undefined, undefined).pass).toBe(true);
        expect(GenericHandler.equals(null, undefined).pass).toBe(false);
    });
});

describe('GenericHandler.notEquals', () => {
    it('should pass when values are not equal', () => {
        const result = GenericHandler.notEquals(5, 10);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(5);
    });

    it('should fail when values are equal', () => {
        const result = GenericHandler.notEquals(5, 5);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(5);
        expect(result.hasError('generic/notEquals')).toBe(true);
    });

    it('should work with objects using deep equality', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 3 } };
        const result = GenericHandler.notEquals(obj1, obj2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(obj1);
    });

    it('should fail for objects that are deeply equal', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 2 } };
        const result = GenericHandler.notEquals(obj1, obj2);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(obj1);
    });
});

describe('GenericHandler.isPrimitive (with type parameter)', () => {
    it('should pass when type matches', () => {
        const result = GenericHandler.isPrimitive('hello', 'string');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should fail when type does not match', () => {
        const result = GenericHandler.isPrimitive(123, 'string');
        expect(result.pass).toBe(false);
        expect(result.value).toBe(123);
        expect(result.hasError('generic/primitive')).toBe(true);
    });

    it('should work with different types', () => {
        expect(GenericHandler.isPrimitive(123, 'number').pass).toBe(true);
        expect(GenericHandler.isPrimitive(true, 'boolean').pass).toBe(true);
        expect(GenericHandler.isPrimitive(undefined, 'undefined').pass).toBe(true);
        expect(GenericHandler.isPrimitive(null, 'string').pass).toBe(false); // null is not a primitive type
        expect(GenericHandler.isPrimitive({}, 'object').pass).toBe(true); // typeof {} === 'object'
        expect(GenericHandler.isPrimitive([], 'object').pass).toBe(true); // typeof [] === 'object'
        expect(GenericHandler.isPrimitive(() => {}, 'function').pass).toBe(true); // typeof function === 'function'
    });
});

describe('GenericHandler.isPrimitive (without type parameter)', () => {
    it('should pass for primitive values', () => {
        expect(GenericHandler.isPrimitive('string').pass).toBe(true);
        expect(GenericHandler.isPrimitive(123).pass).toBe(true);
        expect(GenericHandler.isPrimitive(true).pass).toBe(true);
        expect(GenericHandler.isPrimitive(false).pass).toBe(true);
        expect(GenericHandler.isPrimitive(undefined).pass).toBe(true);
        expect(GenericHandler.isPrimitive(Symbol('test')).pass).toBe(true);
        expect(GenericHandler.isPrimitive(BigInt(123)).pass).toBe(true);
    });

    it('should fail for non-primitive values', () => {
        expect(GenericHandler.isPrimitive(null).pass).toBe(false); // null is not primitive
        
        const objResult = GenericHandler.isPrimitive({});
        expect(objResult.pass).toBe(false);
        expect(objResult.hasError('generic/primitive')).toBe(true);

        const arrResult = GenericHandler.isPrimitive([]);
        expect(arrResult.pass).toBe(false);
        expect(arrResult.hasError('generic/primitive')).toBe(true);

        const funcResult = GenericHandler.isPrimitive(() => {});
        expect(funcResult.pass).toBe(false);
        expect(funcResult.hasError('generic/primitive')).toBe(true);
    });
});

describe('GenericHandler.isTruthy', () => {
    it('should pass for truthy values', () => {
        expect(GenericHandler.isTruthy(true).pass).toBe(true);
        expect(GenericHandler.isTruthy(1).pass).toBe(true);
        expect(GenericHandler.isTruthy('hello').pass).toBe(true);
        expect(GenericHandler.isTruthy({}).pass).toBe(true);
        expect(GenericHandler.isTruthy([]).pass).toBe(true);
        expect(GenericHandler.isTruthy(function() {}).pass).toBe(true);
    });

    it('should fail for falsy values', () => {
        expect(GenericHandler.isTruthy(false).pass).toBe(false);
        expect(GenericHandler.isTruthy(0).pass).toBe(false);
        expect(GenericHandler.isTruthy('').pass).toBe(false);
        expect(GenericHandler.isTruthy(null).pass).toBe(false);
        expect(GenericHandler.isTruthy(undefined).pass).toBe(false);
        expect(GenericHandler.isTruthy(NaN).pass).toBe(false);
    });

    it('should have correct error type for falsy values', () => {
        const result = GenericHandler.isTruthy(false);
        expect(result.hasError('generic/truthy')).toBe(true);
    });
});

describe('GenericHandler.isFalsy', () => {
    it('should pass for falsy values', () => {
        expect(GenericHandler.isFalsy(false).pass).toBe(true);
        expect(GenericHandler.isFalsy(0).pass).toBe(true);
        expect(GenericHandler.isFalsy('').pass).toBe(true);
        expect(GenericHandler.isFalsy(null).pass).toBe(true);
        expect(GenericHandler.isFalsy(undefined).pass).toBe(true);
        expect(GenericHandler.isFalsy(NaN).pass).toBe(true);
    });

    it('should fail for truthy values', () => {
        expect(GenericHandler.isFalsy(true).pass).toBe(false);
        expect(GenericHandler.isFalsy(1).pass).toBe(false);
        expect(GenericHandler.isFalsy('hello').pass).toBe(false);
        expect(GenericHandler.isFalsy({}).pass).toBe(false);
        expect(GenericHandler.isFalsy([]).pass).toBe(false);
        expect(GenericHandler.isFalsy(function() {}).pass).toBe(false);
    });

    it('should have correct error type for truthy values', () => {
        const result = GenericHandler.isFalsy(true);
        expect(result.hasError('generic/falsy')).toBe(true);
    });
});

describe('GenericHandler.isEmpty', () => {
    it('should pass for null and undefined', () => {
        expect(GenericHandler.isEmpty(null).pass).toBe(true);
        expect(GenericHandler.isEmpty(undefined).pass).toBe(true);
    });

    it('should not pass for empty strings', () => {
        const result = GenericHandler.isEmpty('');
        expect(result.pass).toBe(false);
        expect(result.value).toBe('');
    });

    it('should fail for non-empty strings', () => {
        const result = GenericHandler.isEmpty('hello');
        expect(result.pass).toBe(false);
    });

    it('should not pass for empty arrays', () => {
        const result = GenericHandler.isEmpty([]);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual([]);
    });

    it('should fail for non-empty arrays', () => {
        const result = GenericHandler.isEmpty([1, 2, 3]);
        expect(result.pass).toBe(false);
    });

    it('should fail for non-empty objects', () => {
        const result = GenericHandler.isEmpty({ a: 1 });
        expect(result.pass).toBe(false);
    });

    it('should fail for primitive values that are not null/undefined', () => {
        expect(GenericHandler.isEmpty(0).pass).toBe(false);
        expect(GenericHandler.isEmpty(false).pass).toBe(false);
        expect(GenericHandler.isEmpty(123).pass).toBe(false);
    });
});

describe('GenericHandler.isNotEmpty', () => {
    it('should fail for null and undefined', () => {
        expect(GenericHandler.isNotEmpty(null).pass).toBe(false);
        expect(GenericHandler.isNotEmpty(undefined).pass).toBe(false);
    });

    it('should pass for empty strings', () => {
        const result = GenericHandler.isNotEmpty('');
        expect(result.pass).toBe(true);
    });

    it('should pass for non-empty strings', () => {
        const result = GenericHandler.isNotEmpty('hello');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('hello');
    });

    it('should pass for empty arrays', () => {
        const result = GenericHandler.isNotEmpty([]);
        expect(result.pass).toBe(true);
    });

    it('should pass for non-empty arrays', () => {
        const result = GenericHandler.isNotEmpty([1, 2, 3]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual([1, 2, 3]);
    });

    it('should pass for non-empty objects', () => {
        const result = GenericHandler.isNotEmpty({ a: 1 });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1 });
    });

    it('should pass for primitive values that are not null/undefined', () => {
        expect(GenericHandler.isNotEmpty(0).pass).toBe(true);
        expect(GenericHandler.isNotEmpty(false).pass).toBe(true);
        expect(GenericHandler.isNotEmpty(123).pass).toBe(true);
    });
});

// Note: GenericHandler does not have an instanceOf method
// Use ObjectHandler.instanceOf for instance checks

// Note: GenericHandler does not have a hasProperty method  
// Use ObjectHandler.hasProperty for property checks

describe('GenericHandler.isOneOf', () => {
    it('should pass when value is in allowed values', () => {
        const result = GenericHandler.isOneOf(2, [1, 2, 3]);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(2);
    });

    it('should fail when value is not in allowed values', () => {
        const result = GenericHandler.isOneOf(4, [1, 2, 3]);
        expect(result.pass).toBe(false);
        expect(result.hasError('generic/isAllowed')).toBe(true);
    });

    it('should work with objects using deep equality', () => {
        const obj = { a: 1 };
        const result = GenericHandler.isOneOf(obj, [{ a: 1 }, { b: 2 }]);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(obj);
    });

    it('should fail when object is not deeply equal to any allowed value', () => {
        const obj = { a: 2 };
        const result = GenericHandler.isOneOf(obj, [{ a: 1 }, { b: 2 }]);
        expect(result.pass).toBe(false);
    });

    it('should pass with empty allowed values for default behavior', () => {
        const result = GenericHandler.isOneOf('anything');
        expect(result.pass).toBe(false); // empty array means nothing is allowed
    });

    it('should work with mixed types', () => {
        const allowedValues = [1, 'hello', true, null, { x: 1 }];
        expect(GenericHandler.isOneOf(1, allowedValues).pass).toBe(true);
        expect(GenericHandler.isOneOf('hello', allowedValues).pass).toBe(true);
        expect(GenericHandler.isOneOf(true, allowedValues).pass).toBe(true);
        expect(GenericHandler.isOneOf(null, allowedValues).pass).toBe(true);
        expect(GenericHandler.isOneOf({ x: 1 }, allowedValues).pass).toBe(true);
        expect(GenericHandler.isOneOf('goodbye', allowedValues).pass).toBe(false);
    });
});

describe('GenericHandler.isNotOneOf', () => {
    it('should pass when value is not in forbidden values', () => {
        const result = GenericHandler.isNotOneOf(4, [1, 2, 3]);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(4);
    });

    it('should fail when value is in forbidden values', () => {
        const result = GenericHandler.isNotOneOf(2, [1, 2, 3]);
        expect(result.pass).toBe(false);
        expect(result.hasError('generic/forbidden')).toBe(true);
    });

    it('should work with objects using deep equality', () => {
        const obj = { a: 2 };
        const result = GenericHandler.isNotOneOf(obj, [{ a: 1 }, { b: 2 }]);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(obj);
    });

    it('should fail when object is deeply equal to a forbidden value', () => {
        const obj = { a: 1 };
        const result = GenericHandler.isNotOneOf(obj, [{ a: 1 }, { b: 2 }]);
        expect(result.pass).toBe(false);
    });

    it('should pass with empty forbidden values', () => {
        const result = GenericHandler.isNotOneOf('anything');
        expect(result.pass).toBe(true); // empty array means nothing is forbidden
    });

    it('should work with mixed types', () => {
        const forbiddenValues = [1, 'hello', true, null, { x: 1 }];
        expect(GenericHandler.isNotOneOf(2, forbiddenValues).pass).toBe(true);
        expect(GenericHandler.isNotOneOf('goodbye', forbiddenValues).pass).toBe(true);
        expect(GenericHandler.isNotOneOf(false, forbiddenValues).pass).toBe(true);
        expect(GenericHandler.isNotOneOf(undefined, forbiddenValues).pass).toBe(true);
        expect(GenericHandler.isNotOneOf({ x: 2 }, forbiddenValues).pass).toBe(true);
        
        expect(GenericHandler.isNotOneOf(1, forbiddenValues).pass).toBe(false);
        expect(GenericHandler.isNotOneOf('hello', forbiddenValues).pass).toBe(false);
        expect(GenericHandler.isNotOneOf(true, forbiddenValues).pass).toBe(false);
        expect(GenericHandler.isNotOneOf(null, forbiddenValues).pass).toBe(false);
        expect(GenericHandler.isNotOneOf({ x: 1 }, forbiddenValues).pass).toBe(false);
    });
});

describe('GenericHandler.isNull', () => {
    it('should pass for null values', () => {
        const result = GenericHandler.isNull(null);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(null);
    });

    it('should fail for non-null values', () => {
        expect(GenericHandler.isNull(undefined).pass).toBe(false);
        expect(GenericHandler.isNull(0).pass).toBe(false);
        expect(GenericHandler.isNull('').pass).toBe(false);
        expect(GenericHandler.isNull(false).pass).toBe(false);
        expect(GenericHandler.isNull({}).pass).toBe(false);
        expect(GenericHandler.isNull([]).pass).toBe(false);
    });

    it('should have correct error type for non-null values', () => {
        const result = GenericHandler.isNull('not null');
        expect(result.hasError('generic/null')).toBe(true);
    });
});

describe('GenericHandler.isNotNull', () => {
    it('should pass for non-null values', () => {
        expect(GenericHandler.isNotNull(undefined).pass).toBe(true);
        expect(GenericHandler.isNotNull(0).pass).toBe(true);
        expect(GenericHandler.isNotNull('').pass).toBe(true);
        expect(GenericHandler.isNotNull(false).pass).toBe(true);
        expect(GenericHandler.isNotNull({}).pass).toBe(true);
        expect(GenericHandler.isNotNull([]).pass).toBe(true);
        expect(GenericHandler.isNotNull('hello').pass).toBe(true);
    });

    it('should fail for null values', () => {
        const result = GenericHandler.isNotNull(null);
        expect(result.pass).toBe(false);
        expect(result.value).toBe(null);
    });

    it('should have correct error type for null values', () => {
        const result = GenericHandler.isNotNull(null);
        expect(result.hasError('generic/null')).toBe(true);
    });
});

describe('GenericHandler.isUndefined', () => {
    it('should pass for undefined values', () => {
        const result = GenericHandler.isUndefined(undefined);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(undefined);
    });

    it('should fail for defined values', () => {
        expect(GenericHandler.isUndefined(null).pass).toBe(false);
        expect(GenericHandler.isUndefined(0).pass).toBe(false);
        expect(GenericHandler.isUndefined('').pass).toBe(false);
        expect(GenericHandler.isUndefined(false).pass).toBe(false);
        expect(GenericHandler.isUndefined({}).pass).toBe(false);
        expect(GenericHandler.isUndefined([]).pass).toBe(false);
    });

    it('should have correct error type for defined values', () => {
        const result = GenericHandler.isUndefined('defined');
        expect(result.hasError('generic/notDefined')).toBe(true);
    });
});

describe('GenericHandler.isDefined', () => {
    it('should pass for defined values', () => {
        expect(GenericHandler.isDefined(null).pass).toBe(true);
        expect(GenericHandler.isDefined(0).pass).toBe(true);
        expect(GenericHandler.isDefined('').pass).toBe(true);
        expect(GenericHandler.isDefined(false).pass).toBe(true);
        expect(GenericHandler.isDefined({}).pass).toBe(true);
        expect(GenericHandler.isDefined([]).pass).toBe(true);
    });

    it('should fail for undefined values', () => {
        const result = GenericHandler.isDefined(undefined);
        expect(result.pass).toBe(false);
        expect(result.hasError('generic/defined')).toBe(true);
    });
});

describe('GenericHandler.isNullOrUndefined', () => {
    it('should pass for null and undefined', () => {
        const nullResult = GenericHandler.isNullOrUndefined(null);
        expect(nullResult.pass).toBe(true);
        expect(nullResult.value).toBe(null);

        const undefinedResult = GenericHandler.isNullOrUndefined(undefined);
        expect(undefinedResult.pass).toBe(true);
        expect(undefinedResult.value).toBe(undefined);
    });

    it('should fail for defined, non-null values', () => {
        expect(GenericHandler.isNullOrUndefined(0).pass).toBe(false);
        expect(GenericHandler.isNullOrUndefined('').pass).toBe(false);
        expect(GenericHandler.isNullOrUndefined(false).pass).toBe(false);
        expect(GenericHandler.isNullOrUndefined({}).pass).toBe(false);
        expect(GenericHandler.isNullOrUndefined([]).pass).toBe(false);
        expect(GenericHandler.isNullOrUndefined('hello').pass).toBe(false);
    });

    it('should have correct error type for defined, non-null values', () => {
        const result = GenericHandler.isNullOrUndefined('defined');
        expect(result.hasError('generic/nullOrUndefined')).toBe(true);
    });
});