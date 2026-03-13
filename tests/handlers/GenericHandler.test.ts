'use strict';

import { Handler } from '../../lib/handlers/Handler.ts';
import { HandlerResult } from '../../lib/HandlerResult.ts';

// ====================================
// VALIDATORS
// ====================================

describe('Handler.defined', () => {
    test('should pass when value is null', () => {
        const result = Handler.defined(null);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(null);
    });

    test('should pass when value is false', () => {
        const result = Handler.defined(false);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(false);
    });

    test('should fail when value is undefined', () => {
        const result = Handler.defined(undefined);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/defined');
    });
});

describe('Handler.empty', () => {
    test('should pass for null', () => {
        const result = Handler.empty(null);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(null);
    });

    test('should pass for undefined', () => {
        const result = Handler.empty(undefined);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(undefined);
    });

    test('should fail for zero', () => {
        const result = Handler.empty(0);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/empty');
    });
});

describe('Handler.equals', () => {
    test('should pass for deep-equal objects', () => {
        const value = { a: 1, b: { c: 2 } };
        const comparison = { a: 1, b: { c: 2 } };
        const result = Handler.equals(value, comparison);

        expect(result.pass).toBe(true);
        expect(result.value).toBe(value);
    });

    test('should pass for equal primitive values', () => {
        const result = Handler.equals('x', 'x');
        expect(result.pass).toBe(true);
        expect(result.value).toBe('x');
    });

    test('should fail for different values', () => {
        const result = Handler.equals(1, 2);

        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/equals');
        expect(errors[0].args).toEqual({ comparison: 2 });
    });
});

describe('Handler.falsy', () => {
    test('should pass for empty string', () => {
        expect(Handler.falsy('').pass).toBe(true);
    });

    test('should pass for 0', () => {
        expect(Handler.falsy(0).pass).toBe(true);
    });

    test('should pass for null', () => {
        expect(Handler.falsy(null).pass).toBe(true);
    });

    test('should fail for truthy value', () => {
        const result = Handler.falsy('x');
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/falsy');
    });
});

describe('Handler.notDefined', () => {
    test('should pass for undefined', () => {
        const result = Handler.notDefined(undefined);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(undefined);
    });

    test('should fail for null', () => {
        const result = Handler.notDefined(null);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/notDefined');
    });
});

describe('Handler.notEmpty', () => {
    test('should pass for number', () => {
        expect(Handler.notEmpty(0).pass).toBe(true);
    });

    test('should pass for false', () => {
        expect(Handler.notEmpty(false).pass).toBe(true);
    });

    test('should fail for null', () => {
        const result = Handler.notEmpty(null);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/empty');
    });

    test('should fail for undefined', () => {
        const result = Handler.notEmpty(undefined);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/empty');
    });
});

describe('Handler.notEquals', () => {
    test('should pass for non-equal primitive values', () => {
        const result = Handler.notEquals(1, 2);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(1);
    });

    test('should pass for non-equal objects', () => {
        const result = Handler.notEquals({ a: 1 }, { a: 2 });
        expect(result.pass).toBe(true);
    });

    test('should fail for deep-equal objects', () => {
        const comparison = { a: 1 };
        const result = Handler.notEquals({ a: 1 }, comparison);

        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/notEquals');
        expect(errors[0].args).toEqual({ comparison });
    });
});

describe('Handler.notNull', () => {
    test('should pass for undefined', () => {
        expect(Handler.notNull(undefined).pass).toBe(true);
    });

    test('should pass for empty string', () => {
        expect(Handler.notNull('').pass).toBe(true);
    });

    test('should fail for null', () => {
        const result = Handler.notNull(null);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/notNull');
    });
});

describe('Handler.notOneOf', () => {
    test('should pass when list is empty', () => {
        const result = Handler.notOneOf('a', []);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('a');
    });

    test('should pass when value is not forbidden', () => {
        const result = Handler.notOneOf('c', ['a', 'b']);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('c');
    });

    test('should fail when primitive value is forbidden', () => {
        const forbiddenValues = ['a', 'b'];
        const result = Handler.notOneOf('a', forbiddenValues);

        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/notOneOf');
        expect(errors[0].args).toEqual({ forbiddenValues });
    });

    test('should fail when deep-equal object is forbidden', () => {
        const forbiddenValues = [{ id: 1 }, { id: 2 }];
        const result = Handler.notOneOf({ id: 2 }, forbiddenValues);

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/notOneOf');
    });
});

describe('Handler.null', () => {
    test('should pass for null', () => {
        const result = Handler.null(null);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(null);
    });

    test('should fail for undefined', () => {
        const result = Handler.null(undefined);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/null');
    });

    test('should fail for false', () => {
        const result = Handler.null(false);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/null');
    });
});

describe('Handler.oneOf', () => {
    test('should pass when primitive value is allowed', () => {
        const result = Handler.oneOf('a', ['a', 'b']);
        expect(result.pass).toBe(true);
        expect(result.value).toBe('a');
    });

    test('should pass when deep-equal object is allowed', () => {
        const result = Handler.oneOf({ id: 1 }, [{ id: 1 }, { id: 2 }]);
        expect(result.pass).toBe(true);
    });

    test('should fail when value is not allowed', () => {
        const allowedValues = ['a', 'b'];
        const result = Handler.oneOf('c', allowedValues);

        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/oneOf');
        expect(errors[0].args).toEqual({ allowedValues });
    });

    test('should fail when allowedValues list is empty', () => {
        const allowedValues = [];
        const result = Handler.oneOf('a', allowedValues);

        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/oneOf');
        expect([...result.errors][0].args).toEqual({ allowedValues });
    });
});

describe('Handler.primitive', () => {
    test('should pass for primitive values when type is not provided', () => {
        expect(Handler.primitive(1).pass).toBe(true);
        expect(Handler.primitive(true).pass).toBe(true);
        expect(Handler.primitive(undefined).pass).toBe(true);
    });

    test('should pass for symbol and bigint without type', () => {
        expect(Handler.primitive(Symbol('x')).pass).toBe(true);
        expect(Handler.primitive(1n).pass).toBe(true);
    });

    test('should fail for object value when type is not provided', () => {
        const result = Handler.primitive({});
        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/primitive');
        expect(errors[0].args).toEqual({ actualType: null });
    });

    test('should pass when value matches provided primitive type', () => {
        expect(Handler.primitive('abc', 'string').pass).toBe(true);
        expect(Handler.primitive(false, 'boolean').pass).toBe(true);
        expect(Handler.primitive(10n, 'bigint').pass).toBe(true);
    });

    test('should fail when value does not match provided primitive type', () => {
        const result = Handler.primitive(1, 'string');
        expect(result.pass).toBe(false);

        const errors = [...result.errors];
        expect(errors[0].key).toBe('generic/primitive');
        expect(errors[0].args).toEqual({ actualType: 'number' });
    });
});

describe('Handler.truthy', () => {
    test('should pass for truthy string', () => {
        expect(Handler.truthy('x').pass).toBe(true);
    });

    test('should pass for truthy object', () => {
        expect(Handler.truthy({}).pass).toBe(true);
    });

    test('should fail for zero', () => {
        const result = Handler.truthy(0);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/truthy');
    });

    test('should fail for empty string', () => {
        const result = Handler.truthy('');
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/truthy');
    });
});

// ====================================
// MUTATORS
// ====================================

describe('Handler.custom', () => {
    test('should pass transformed value when callback returns plain value', () => {
        const result = Handler.custom(2, (value) => value * 3);
        expect(result.pass).toBe(true);
        expect(result.value).toBe(6);
    });

    test('should return HandlerResult.fail from callback as-is', () => {
        const customResult = HandlerResult.fail('bad', 'generic/custom');
        const result = Handler.custom('bad', () => customResult);

        expect(result).toBe(customResult);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('generic/custom');
    });

    test('should return HandlerResult.pass from callback as-is', () => {
        const customResult = HandlerResult.pass({ ok: true });
        const result = Handler.custom('ignored', () => customResult);

        expect(result).toBe(customResult);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ ok: true });
    });

    test('should wrap undefined callback return in pass', () => {
        const result = Handler.custom('x', () => undefined);

        expect(result.pass).toBe(true);
        expect(result.value).toBe(undefined);
    });
});
