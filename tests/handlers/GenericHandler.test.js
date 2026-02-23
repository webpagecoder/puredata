'use strict';

import GenericHandler from '../../lib/handlers/GenericHandler.js';
import ProcessResult from '../../lib/ProcessResult.js';


// ====================================
// VALIDATORS
// ====================================

describe('GenericHandler.defined', () => {
    test('should pass when value is defined', () => {
        expect(GenericHandler.defined(null).pass).toBe(true);
    });

    test('should fail when value is undefined', () => {
        const result = GenericHandler.defined(undefined);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/defined');
    });
});

describe('GenericHandler.empty', () => {
    test('should pass for null and undefined', () => {
        expect(GenericHandler.empty(null).pass).toBe(true);
        expect(GenericHandler.empty(undefined).pass).toBe(true);
    });

    test('should fail for non-empty value', () => {
        const result = GenericHandler.empty(0);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/empty');
    });
});

describe('GenericHandler.equals', () => {
    test('should pass when values are equal', () => {
        expect(GenericHandler.equals({ a: 1 }, { a: 1 }).pass).toBe(true);
    });

    test('should fail when values differ', () => {
        const result = GenericHandler.equals(1, 2);
        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/equals');
        expect(errors[0].args).toEqual({ comparison: 2 });
    });
});

describe('GenericHandler.falsy', () => {
    test('should pass for falsy value', () => {
        expect(GenericHandler.falsy('').pass).toBe(true);
    });

    test('should fail for truthy value', () => {
        const result = GenericHandler.falsy('x');
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/falsy');
    });
});

describe('GenericHandler.notDefined', () => {
    test('should pass when value is undefined', () => {
        expect(GenericHandler.notDefined(undefined).pass).toBe(true);
    });

    test('should fail when value is defined', () => {
        const result = GenericHandler.notDefined(null);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/notDefined');
    });
});

describe('GenericHandler.notEmpty', () => {
    test('should pass when value is not null/undefined', () => {
        expect(GenericHandler.notEmpty(0).pass).toBe(true);
    });

    test('should fail for null', () => {
        const result = GenericHandler.notEmpty(null);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/empty');
    });
});

describe('GenericHandler.notEquals', () => {
    test('should pass for different values', () => {
        expect(GenericHandler.notEquals(1, 2).pass).toBe(true);
    });

    test('should fail for equal values', () => {
        const result = GenericHandler.notEquals(2, 2);
        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/notEquals');
        expect(errors[0].args).toEqual({ comparison: 2 });
    });
});

describe('GenericHandler.notNull', () => {
    test('should pass for non-null value', () => {
        expect(GenericHandler.notNull(undefined).pass).toBe(true);
    });

    test('should fail for null', () => {
        const result = GenericHandler.notNull(null);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/notNull');
    });
});

describe('GenericHandler.notOneOf', () => {
    test('should pass when value is not forbidden', () => {
        expect(GenericHandler.notOneOf('c', ['a', 'b']).pass).toBe(true);
    });

    test('should fail when value is forbidden', () => {
        const forbiddenValues = ['a', 'b'];
        const result = GenericHandler.notOneOf('a', forbiddenValues);
        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/notOneOf');
        expect(errors[0].args).toEqual({ forbiddenValues });
    });
});

describe('GenericHandler.null', () => {
    test('should pass for null', () => {
        expect(GenericHandler.null(null).pass).toBe(true);
    });

    test('should fail for non-null', () => {
        const result = GenericHandler.null(undefined);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/null');
    });
});

describe('GenericHandler.oneOf', () => {
    test('should pass when value is allowed', () => {
        expect(GenericHandler.oneOf('a', ['a', 'b']).pass).toBe(true);
    });

    test('should fail when value is not allowed', () => {
        const allowedValues = ['a', 'b'];
        const result = GenericHandler.oneOf('c', allowedValues);
        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/oneOf');
        expect(errors[0].args).toEqual({ allowedValues });
    });
});

describe('GenericHandler.primitive', () => {
    test('should pass for primitive values when type is not provided', () => {
        expect(GenericHandler.primitive(1).pass).toBe(true);
        expect(GenericHandler.primitive(true).pass).toBe(true);
    });

    test('should fail for object value when type is not provided', () => {
        const result = GenericHandler.primitive({});
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/primitive');
    });

    test('should pass when value matches provided primitive type', () => {
        expect(GenericHandler.primitive('abc', 'string').pass).toBe(true);
    });

    test('should fail when value does not match provided primitive type', () => {
        const result = GenericHandler.primitive(1, 'string');
        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/primitive');
        expect(errors[0].args).toEqual({ actualType: 'number' });
    });
});

describe('GenericHandler.truthy', () => {
    test('should pass for truthy value', () => {
        expect(GenericHandler.truthy('x').pass).toBe(true);
    });

    test('should fail for falsy value', () => {
        const result = GenericHandler.truthy(0);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/truthy');
    });
});






// ====================================
// MUTATORS 
// ====================================

describe('GenericHandler.custom', () => {
    test('should pass transformed value when filter returns plain value', () => {
        const result = GenericHandler.custom(2, (value) => value * 3);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(6);
    });

    test('should return ProcessResult from filter as-is', () => {
        const customResult = ProcessResult.fail('bad', 'generic/custom');
        const result = GenericHandler.custom('bad', () => customResult);
        expect(result).toBe(customResult);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/custom');
    });
});
