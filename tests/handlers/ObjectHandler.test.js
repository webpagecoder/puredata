'use strict';

import ObjectHandler from '../../lib/handlers/ObjectHandler.js';

const path = (...pathKeys) => ({ pathKeys });

// ====================================
// VALIDATORS
// ====================================

describe('ObjectHandler.allOfPaths', () => {
    test('should pass when all paths are present', () => {
        const obj = { user: { profile: { name: 'Ana' } }, settings: { theme: 'dark' } };
        const paths = [path('user', 'profile', 'name'), path('settings', 'theme')];

        const result = ObjectHandler.allOfPaths(obj, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail with missingPaths when any path is absent', () => {
        const obj = { user: { profile: { name: 'Ana' } } };
        const paths = [path('user', 'profile', 'name'), path('settings', 'theme')];

        const result = ObjectHandler.allOfPaths(obj, paths);
        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('object/allOfPaths');
        expect(errors[0].args.missingPaths).toHaveLength(1);
    });
});

describe('ObjectHandler.depth', () => {
    test('should pass when depth matches', () => {
        const result = ObjectHandler.depth({ a: { b: 1 } }, 2);
        expect(result.pass).toBe(true);
    });

    test('should fail when depth differs', () => {
        const result = ObjectHandler.depth({ a: { b: 1 } }, 3);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/depth');
    });
});

describe('ObjectHandler.empty', () => {
    test('should pass for empty object', () => {
        expect(ObjectHandler.empty({}).pass).toBe(true);
    });

    test('should fail for non-empty object', () => {
        const result = ObjectHandler.empty({ a: 1 });
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/empty');
    });
});

describe('ObjectHandler.instanceOf', () => {
    test('should pass when object constructor matches', () => {
        const d = new Date();
        expect(ObjectHandler.instanceOf(d, Date).pass).toBe(true);
    });

    test('should fail when object constructor does not match', () => {
        const result = ObjectHandler.instanceOf([], Object);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/instanceOf');
    });
});

describe('ObjectHandler.keyCount', () => {
    test('should pass when key count matches', () => {
        expect(ObjectHandler.keyCount({ a: 1, b: 2 }, 2).pass).toBe(true);
    });

    test('should fail when key count differs', () => {
        const result = ObjectHandler.keyCount({ a: 1 }, 2);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/keyCount');
    });
});

describe('ObjectHandler.keyCountRecursive', () => {
    test('should pass when recursive key count matches', () => {
        expect(ObjectHandler.keyCountRecursive({ a: { b: 1 } }, 2).pass).toBe(true);
    });

    test('should fail when recursive key count differs', () => {
        const result = ObjectHandler.keyCountRecursive({ a: { b: 1 } }, 3);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/keyCountRecursive');
    });
});

describe('ObjectHandler.maxDepth', () => {
    test('should pass when depth is within maxDepth', () => {
        expect(ObjectHandler.maxDepth({ a: { b: 1 } }, 2).pass).toBe(true);
    });

    test('should fail when depth exceeds maxDepth', () => {
        const result = ObjectHandler.maxDepth({ a: { b: { c: 1 } } }, 2);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/maxDepth');
    });
});

describe('ObjectHandler.maxKeyCount', () => {
    test('should pass when key count is within max', () => {
        expect(ObjectHandler.maxKeyCount({ a: 1 }, 1).pass).toBe(true);
    });

    test('should fail when key count exceeds max', () => {
        const result = ObjectHandler.maxKeyCount({ a: 1, b: 2 }, 1);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/maxKeyCount');
    });
});

describe('ObjectHandler.maxKeyCountRecursive', () => {
    test('should pass when recursive key count is within max', () => {
        expect(ObjectHandler.maxKeyCountRecursive({ a: { b: 1 } }, 2).pass).toBe(true);
    });

    test('should fail when recursive key count exceeds max', () => {
        const result = ObjectHandler.maxKeyCountRecursive({ a: { b: 1 } }, 1);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/maxKeyCountRecursive');
    });
});

describe('ObjectHandler.minDepth', () => {
    test('should pass when depth meets minDepth', () => {
        expect(ObjectHandler.minDepth({ a: { b: 1 } }, 2).pass).toBe(true);
    });

    test('should fail when depth is below minDepth', () => {
        const result = ObjectHandler.minDepth({ a: 1 }, 2);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/minDepth');
    });
});

describe('ObjectHandler.minKeyCount', () => {
    test('should pass when key count meets min', () => {
        expect(ObjectHandler.minKeyCount({ a: 1, b: 2 }, 2).pass).toBe(true);
    });

    test('should fail when key count is below min', () => {
        const result = ObjectHandler.minKeyCount({ a: 1 }, 2);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/minKeyCount');
    });
});

describe('ObjectHandler.minKeyCountRecursive', () => {
    test('should pass when recursive key count meets min', () => {
        expect(ObjectHandler.minKeyCountRecursive({ a: { b: 1 } }, 2).pass).toBe(true);
    });

    test('should fail when recursive key count is below min', () => {
        const result = ObjectHandler.minKeyCountRecursive({ a: { b: 1 } }, 3);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/minKeyCountRecursive');
    });
});

describe('ObjectHandler.noneOfPaths', () => {
    test('should pass when no paths are present', () => {
        const obj = { user: { profile: { name: 'Ana' } } };
        const paths = [path('settings', 'theme')];

        const result = ObjectHandler.noneOfPaths(obj, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail when any path is present', () => {
        const obj = { user: { profile: { name: 'Ana' } } };
        const paths = [path('user', 'profile', 'name')];

        const result = ObjectHandler.noneOfPaths(obj, paths);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/noneOfPaths');
    });
});

describe('ObjectHandler.notEmpty', () => {
    test('should pass for non-empty object', () => {
        expect(ObjectHandler.notEmpty({ a: 1 }).pass).toBe(true);
    });

    test('should fail for empty object', () => {
        const result = ObjectHandler.notEmpty({});
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/notEmpty');
    });
});

describe('ObjectHandler.plain', () => {
    test('should pass for plain object', () => {
        expect(ObjectHandler.plain({ a: 1 }).pass).toBe(true);
    });

    test('should fail for non-plain object', () => {
        const result = ObjectHandler.plain(new Date());
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/plain');
    });
});

describe('ObjectHandler.property', () => {
    test('should pass when property exists', () => {
        expect(ObjectHandler.property({ a: 1 }, 'a').pass).toBe(true);
    });

    test('should fail when property does not exist', () => {
        const result = ObjectHandler.property({ a: 1 }, 'b');
        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('object/property');
        expect(errors[0].args).toEqual({ property: 'b' });
    });

    test('should fail when object is null', () => {
        const result = ObjectHandler.property(null, 'a');
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/property');
    });
});

describe('ObjectHandler.someOfPaths', () => {
    test('should pass when any path is present', () => {
        const obj = { user: { profile: { name: 'Ana' } } };
        const paths = [path('settings', 'theme'), path('user', 'profile', 'name')];

        const result = ObjectHandler.someOfPaths(obj, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail when none of the paths are present', () => {
        const obj = { user: { profile: { name: 'Ana' } } };
        const paths = [path('settings', 'theme'), path('settings', 'locale')];

        const result = ObjectHandler.someOfPaths(obj, paths);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/someOfPaths');
    });
});

describe('ObjectHandler.xOfPaths', () => {
    test('should pass when exactly X paths are present', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const paths = [path('a'), path('b'), path('d')];

        const result = ObjectHandler.xOfPaths(obj, 2, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail when more than X paths are present', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const paths = [path('a'), path('b'), path('c')];

        const result = ObjectHandler.xOfPaths(obj, 2, paths);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/xOfPaths');
    });
});

describe('ObjectHandler.allOfButXOfPaths', () => {
    test('should pass when all but X paths are present', () => {
        const obj = { a: 1, b: 2 };
        const paths = [path('a'), path('b'), path('c')];

        const result = ObjectHandler.allOfButXOfPaths(obj, 1, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail when constraint is not met', () => {
        const obj = { a: 1 };
        const paths = [path('a'), path('b'), path('c')];

        const result = ObjectHandler.allOfButXOfPaths(obj, 1, paths);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/allOfButXOfPaths');
    });
});

// ====================================
// MUTATORS
// ====================================

describe('ObjectHandler.pickRandom', () => {
    test('should return all keys when count is >= key length', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectHandler.pickRandom(obj, 3);

        expect(result.pass).toBe(true);
        expect(Object.keys(result.value)).toHaveLength(2);
    });

    test('should return requested number of keys', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = ObjectHandler.pickRandom(obj, 2);

        expect(result.pass).toBe(true);
        expect(Object.keys(result.value)).toHaveLength(2);
    });
});

describe('ObjectHandler.removeEmpty', () => {
    test('should remove null and undefined keys', () => {
        const result = ObjectHandler.removeEmpty({ a: 1, b: null, c: undefined, d: '' });
        expect(result).toEqual({ a: 1, d: '' });
    });
});

describe('ObjectHandler.removeEmptyRecursive', () => {
    test('should recursively remove empty values and empty nested objects', () => {
        const result = ObjectHandler.removeEmptyRecursive({
            a: 1,
            b: null,
            c: {
                d: undefined,
                e: 2
            },
            f: {
                g: null
            }
        });

        expect(result).toEqual({ a: 1, c: { e: 2 } });
    });
});

describe('ObjectHandler.removePath', () => {
    test('should remove paths in-place', () => {
        const obj = { a: 1, b: { c: 2, d: 3 } };
        const result = ObjectHandler.removePath(obj, [path('b', 'c')]);

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, b: { d: 3 } });
    });
});

describe('ObjectHandler.renameKey', () => {
    test('should rename matching keys', () => {
        const result = ObjectHandler.renameKey({ old_name: 1 }, /old_/, 'new_');
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ new_name: 1 });
    });

    test('should keep original key when deleteOriginalKey is false', () => {
        const result = ObjectHandler.renameKey(
            { old_name: 1 },
            /old_/,
            'new_',
            { deleteOriginalKey: false }
        );

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ old_name: 1, new_name: 1 });
    });
});

describe('ObjectHandler.setPath', () => {
    test('should set values at paths', () => {
        const obj = { a: 1 };
        const valueMap = new Map([
            [path('b', 'c'), 2],
            [path('d'), 3]
        ]);

        const result = ObjectHandler.setPath(obj, valueMap);

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, b: { c: 2 }, d: 3 });
    });
});

describe('ObjectHandler.stripUnknown', () => {
    test('should keep only known keys and omit undefined by default', () => {
        const result = ObjectHandler.stripUnknown(
            { a: 1, b: undefined, c: 3 },
            ['a', 'b']
        );

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1 });
    });

    test('should include undefined keys when includeUndefined is true', () => {
        const result = ObjectHandler.stripUnknown(
            { a: 1, b: undefined, c: 3 },
            ['a', 'b'],
            { includeUndefined: true }
        );

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, b: undefined });
    });
});
