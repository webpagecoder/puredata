'use strict';

import { GenericHandler } from '../../lib/handlers/GenericHandler.ts';
import { HandlerResult } from '../../lib/HandlerResult.ts';

// ====================================
// VALIDATORS
// ====================================

describe('GenericHandler.defined', () => {
    test('should pass when value is null', () => {
        const result = GenericHandler.defined(null);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(null);
    });

    test('should pass when value is false', () => {
        const result = GenericHandler.defined(false);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

    test('should fail when value is undefined', () => {
        const result = GenericHandler.defined(undefined);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/defined');
    });
});

describe('GenericHandler.empty', () => {
    test('should pass for null', () => {
        const result = GenericHandler.empty(null);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(null);
    });

    test('should pass for undefined', () => {
        const result = GenericHandler.empty(undefined);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(undefined);
    });

    test('should fail for zero', () => {
        const result = GenericHandler.empty(0);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/empty');
    });
});

describe('GenericHandler.equals', () => {
    test('should pass for deep-equal objects', () => {
        const value = { a: 1, b: { c: 2 } };
        const comparison = { a: 1, b: { c: 2 } };
        const result = GenericHandler.equals(value, comparison);

        expect(result.pass).toBe(true);
        expect(result.value).toBe(value);
    });

    test('should pass for equal primitive values', () => {
        const result = GenericHandler.equals('x', 'x');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('x');
    });

    test('should fail for different values', () => {
        const result = GenericHandler.equals(1, 2);

        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/equals');
        expect(errors[0].args).toEqual({ comparison: 2 });
    });
});

describe('GenericHandler.falsy', () => {
    test('should pass for empty string', () => {
        expect(GenericHandler.falsy('').pass).toBe(true);
    });

    test('should pass for 0', () => {
        expect(GenericHandler.falsy(0).pass).toBe(true);
    });

    test('should pass for null', () => {
        expect(GenericHandler.falsy(null).pass).toBe(true);
    });

    test('should fail for truthy value', () => {
        const result = GenericHandler.falsy('x');
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/falsy');
    });
});

describe('GenericHandler.notDefined', () => {
    test('should pass for undefined', () => {
        const result = GenericHandler.notDefined(undefined);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(undefined);
    });

    test('should fail for null', () => {
        const result = GenericHandler.notDefined(null);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/notDefined');
    });
});

describe('GenericHandler.notEmpty', () => {
    test('should pass for number', () => {
        expect(GenericHandler.notEmpty(0).pass).toBe(true);
    });

    test('should pass for false', () => {
        expect(GenericHandler.notEmpty(false).pass).toBe(true);
    });

    test('should fail for null', () => {
        const result = GenericHandler.notEmpty(null);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/empty');
    });

    test('should fail for undefined', () => {
        const result = GenericHandler.notEmpty(undefined);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/empty');
    });
});

describe('GenericHandler.notEquals', () => {
    test('should pass for non-equal primitive values', () => {
        const result = GenericHandler.notEquals(1, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1);
    });

    test('should pass for non-equal objects', () => {
        const result = GenericHandler.notEquals({ a: 1 }, { a: 2 });
        expect(result.pass).toBe(true);
    });

    test('should fail for deep-equal objects', () => {
        const comparison = { a: 1 };
        const result = GenericHandler.notEquals({ a: 1 }, comparison);

        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/notEquals');
        expect(errors[0].args).toEqual({ comparison });
    });
});

describe('GenericHandler.notNull', () => {
    test('should pass for undefined', () => {
        expect(GenericHandler.notNull(undefined).pass).toBe(true);
    });

    test('should pass for empty string', () => {
        expect(GenericHandler.notNull('').pass).toBe(true);
    });

    test('should fail for null', () => {
        const result = GenericHandler.notNull(null);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/notNull');
    });
});

describe('GenericHandler.notOneOf', () => {
    test('should pass when list is empty', () => {
        const result = GenericHandler.notOneOf('a', []);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('a');
    });

    test('should pass when value is not forbidden', () => {
        const result = GenericHandler.notOneOf('c', ['a', 'b']);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('c');
    });

    test('should fail when primitive value is forbidden', () => {
        const forbiddenValues = ['a', 'b'];
        const result = GenericHandler.notOneOf('a', forbiddenValues);

        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/notOneOf');
        expect(errors[0].args).toEqual({ forbiddenValues });
    });

    test('should fail when deep-equal object is forbidden', () => {
        const forbiddenValues = [{ id: 1 }, { id: 2 }];
        const result = GenericHandler.notOneOf({ id: 2 }, forbiddenValues);

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/notOneOf');
    });
});

describe('GenericHandler.null', () => {
    test('should pass for null', () => {
        const result = GenericHandler.null(null);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(null);
    });

    test('should fail for undefined', () => {
        const result = GenericHandler.null(undefined);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/null');
    });

    test('should fail for false', () => {
        const result = GenericHandler.null(false);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/null');
    });
});

describe('GenericHandler.oneOf', () => {
    test('should pass when primitive value is allowed', () => {
        const result = GenericHandler.oneOf('a', ['a', 'b']);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('a');
    });

    test('should pass when deep-equal object is allowed', () => {
        const result = GenericHandler.oneOf({ id: 1 }, [{ id: 1 }, { id: 2 }]);
        expect(result.pass).toBe(true);
    });

    test('should fail when value is not allowed', () => {
        const allowedValues = ['a', 'b'];
        const result = GenericHandler.oneOf('c', allowedValues);

        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/oneOf');
        expect(errors[0].args).toEqual({ allowedValues });
    });

    test('should fail when allowedValues list is empty', () => {
        const allowedValues = [];
        const result = GenericHandler.oneOf('a', allowedValues);

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/oneOf');
        expect([...result.errors][0].args).toEqual({ allowedValues });
    });
});

describe('GenericHandler.primitive', () => {
    test('should pass for primitive values when type is not provided', () => {
        expect(GenericHandler.primitive(1).pass).toBe(true);
        expect(GenericHandler.primitive(true).pass).toBe(true);
        expect(GenericHandler.primitive(undefined).pass).toBe(true);
    });

    test('should pass for symbol and bigint without type', () => {
        expect(GenericHandler.primitive(Symbol('x')).pass).toBe(true);
        expect(GenericHandler.primitive(1n).pass).toBe(true);
    });

    test('should fail for object value when type is not provided', () => {
        const result = GenericHandler.primitive({});
        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/primitive');
        expect(errors[0].args).toEqual({ actualType: null });
    });

    test('should pass when value matches provided primitive type', () => {
        expect(GenericHandler.primitive('abc', 'string').pass).toBe(true);
        expect(GenericHandler.primitive(false, 'boolean').pass).toBe(true);
        expect(GenericHandler.primitive(10n, 'bigint').pass).toBe(true);
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
    test('should pass for truthy string', () => {
        expect(GenericHandler.truthy('x').pass).toBe(true);
    });

    test('should pass for truthy object', () => {
        expect(GenericHandler.truthy({}).pass).toBe(true);
    });

    test('should fail for zero', () => {
        const result = GenericHandler.truthy(0);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/truthy');
    });

    test('should fail for empty string', () => {
        const result = GenericHandler.truthy('');
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/truthy');
    });
});

// ====================================
// MUTATORS
// ====================================

describe('GenericHandler.custom', () => {
    test('should pass transformed value when callback returns plain value', () => {
        const result = GenericHandler.custom(2, (value) => value * 3);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(6);
    });

    test('should return HandlerResult.fail from callback as-is', () => {
        const customResult = HandlerResult.fail('bad', 'generic/custom');
        const result = GenericHandler.custom('bad', () => customResult);

        expect(result).toBe(customResult);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/custom');
    });

    test('should return HandlerResult.pass from callback as-is', () => {
        const customResult = HandlerResult.pass({ ok: true });
        const result = GenericHandler.custom('ignored', () => customResult);

        expect(result).toBe(customResult);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ ok: true });
    });

    test('should wrap undefined callback return in pass', () => {
        const result = GenericHandler.custom('x', () => undefined);

        expect(result.pass).toBe(true);
        expect(result.value).toBe(undefined);
    });
});
