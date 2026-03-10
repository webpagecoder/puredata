'use strict';

import { ObjectHandler } from '../../lib/handlers/ObjectHandler.ts';
import { Path } from '../../lib/Path.ts';

// ====================================
// VALIDATORS
// ====================================

describe('ObjectHandler.allOfPaths', () => {
    test('should pass when all paths are present', () => {
        const obj = { user: { profile: { name: 'Ana' } }, settings: { theme: 'dark' } };
        const paths = [Path.fromArray(['user', 'profile', 'name']), Path.fromArray(['settings', 'theme'])];

        const result = ObjectHandler.allOfPaths(obj, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail with missingPaths when any path is absent', () => {
        const obj = { user: { profile: { name: 'Ana' } } };
        const paths = [Path.fromArray(['user', 'profile', 'name']), Path.fromArray(['settings', 'theme'])];

        const result = ObjectHandler.allOfPaths(obj, paths);
        expect(result.pass).toBe(false);
        const errors = [...result.errors];
        expect(errors[0].key).toBe('object/allOfPaths');
        expect(errors[0].args.missingPaths).toHaveLength(1);
        expect(errors[0].args.missingPaths[0].keys).toEqual(['settings', 'theme']);
    });

    test('should pass for empty paths list', () => {
        const obj = { user: { profile: { name: 'Ana' } } };

        const result = ObjectHandler.allOfPaths(obj, []);
        expect(result.pass).toBe(true);
    });

    test('should pass for deep nested paths', () => {
        const obj = {
            user: {
                profile: {
                    contact: {
                        email: 'ana@example.com'
                    }
                }
            }
        };
        const paths = [Path.fromArray(['user', 'profile', 'contact', 'email'])];

        const result = ObjectHandler.allOfPaths(obj, paths);
        expect(result.pass).toBe(true);
    });
});

describe('ObjectHandler.exactlyPaths', () => {
    test('should pass when object contains exactly the provided leaf paths', () => {
        const obj = { user: { name: 'Ana' }, meta: { active: true } };
        const paths = [Path.fromArray(['user', 'name']), Path.fromArray(['meta', 'active'])];

        const result = ObjectHandler.exactlyPaths(obj, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail when path count does not match', () => {
        const obj = { user: { name: 'Ana' }, meta: { active: true } };
        const paths = [Path.fromArray(['user', 'name'])];

        const result = ObjectHandler.exactlyPaths(obj, paths);
        expect(result.pass).toBe(false);
        const [error] = [...result.errors];
        expect(error.key).toBe('object/exactlyPaths');
        expect(error.args.paths).toHaveLength(1);
    });

    test('should fail when any provided path is not present', () => {
        const obj = { user: { name: 'Ana' }, meta: { active: true } };
        const paths = [Path.fromArray(['user', 'name']), Path.fromArray(['meta', 'role'])];

        const result = ObjectHandler.exactlyPaths(obj, paths);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/exactlyPaths');
    });

    test('should pass with deep object that has exact deep leaf paths', () => {
        const obj = {
            org: {
                team: {
                    lead: {
                        id: 10
                    }
                }
            },
            app: {
                config: {
                    locale: 'en-US'
                }
            }
        };
        const paths = [
            Path.fromArray(['org', 'team', 'lead', 'id']),
            Path.fromArray(['app', 'config', 'locale'])
        ];

        const result = ObjectHandler.exactlyPaths(obj, paths);
        expect(result.pass).toBe(true);
    });
});

describe('ObjectHandler.onlyPaths', () => {
    test('should pass when all object paths are included in provided paths', () => {
        const obj = { user: { name: 'Ana' }, meta: { active: true } };
        const paths = [
            Path.fromArray(['user', 'name']),
            Path.fromArray(['meta', 'active']),
            Path.fromArray(['ignored', 'extra'])
        ];

        const result = ObjectHandler.onlyPaths(obj, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail when object has paths outside the provided set', () => {
        const obj = { user: { name: 'Ana' }, meta: { active: true } };
        const paths = [Path.fromArray(['user', 'name'])];

        const result = ObjectHandler.onlyPaths(obj, paths);
        expect(result.pass).toBe(false);
        const [error] = [...result.errors];
        expect(error.key).toBe('object/onlyPaths');
        expect(error.args.paths).toHaveLength(1);
    });
});

describe('ObjectHandler.pathsOtherThan', () => {
    test('should pass when object has at least one path outside provided paths', () => {
        const obj = { user: { name: 'Ana' }, meta: { active: true } };
        const paths = [Path.fromArray(['user', 'name'])];

        const result = ObjectHandler.pathsOtherThan(obj, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail when object contains only provided paths', () => {
        const obj = { user: { name: 'Ana' } };
        const paths = [Path.fromArray(['user', 'name'])];

        const result = ObjectHandler.pathsOtherThan(obj, paths);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/pathsOtherThan');
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

    test('should pass for four-level nested object', () => {
        const obj = { a: { b: { c: { d: 1 } } } };
        const result = ObjectHandler.depth(obj, 4);

        expect(result.pass).toBe(true);
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

    test('should pass with deep recursive key count', () => {
        const obj = { a: { b: { c: { d: 1 } } }, e: 2 };
        const result = ObjectHandler.keyCountRecursive(obj, 5);

        expect(result.pass).toBe(true);
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

    test('should pass when deep object depth equals maxDepth', () => {
        const obj = { a: { b: { c: { d: 1 } } } };
        const result = ObjectHandler.maxDepth(obj, 4);

        expect(result.pass).toBe(true);
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

    test('should pass when deep object depth is above minDepth', () => {
        const obj = { a: { b: { c: { d: 1 } } } };
        const result = ObjectHandler.minDepth(obj, 3);

        expect(result.pass).toBe(true);
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
        const paths = [Path.fromArray(['settings', 'theme'])];

        const result = ObjectHandler.noneOfPaths(obj, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail when any path is present', () => {
        const obj = { user: { profile: { name: 'Ana' } } };
        const paths = [Path.fromArray(['user', 'profile', 'name'])];

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

    test('should fail when property exists but value is undefined', () => {
        const result = ObjectHandler.property({ a: undefined }, 'a');
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/property');
    });
});

describe('ObjectHandler.someOfPaths', () => {
    test('should pass when any path is present', () => {
        const obj = { user: { profile: { name: 'Ana' } } };
        const paths = [Path.fromArray(['settings', 'theme']), Path.fromArray(['user', 'profile', 'name'])];

        const result = ObjectHandler.someOfPaths(obj, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail when none of the paths are present', () => {
        const obj = { user: { profile: { name: 'Ana' } } };
        const paths = [Path.fromArray(['settings', 'theme']), Path.fromArray(['settings', 'locale'])];

        const result = ObjectHandler.someOfPaths(obj, paths);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/someOfPaths');
    });

    test('should fail for empty paths list', () => {
        const obj = { user: { profile: { name: 'Ana' } } };

        const result = ObjectHandler.someOfPaths(obj, []);
        expect(result.pass).toBe(false);
    });

    test('should pass when one of deep paths is present', () => {
        const obj = {
            account: {
                settings: {
                    preferences: {
                        theme: 'dark'
                    }
                }
            }
        };
        const paths = [
            Path.fromArray(['account', 'settings', 'preferences', 'locale']),
            Path.fromArray(['account', 'settings', 'preferences', 'theme'])
        ];

        const result = ObjectHandler.someOfPaths(obj, paths);
        expect(result.pass).toBe(true);
    });
});

describe('ObjectHandler.xOfPaths', () => {
    test('should pass when exactly X paths are present', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const paths = [Path.fromArray(['a']), Path.fromArray(['b']), Path.fromArray(['d'])];

        const result = ObjectHandler.xOfPaths(obj, 2, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail when more than X paths are present', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const paths = [Path.fromArray(['a']), Path.fromArray(['b']), Path.fromArray(['c'])];

        const result = ObjectHandler.xOfPaths(obj, 2, paths);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/xOfPaths');
    });

    test('should fail when fewer than X paths are present', () => {
        const obj = { a: 1 };
        const paths = [Path.fromArray(['a']), Path.fromArray(['b'])];

        const result = ObjectHandler.xOfPaths(obj, 2, paths);
        expect(result.pass).toBe(false);
    });

    test('should pass when count is zero and no paths are present', () => {
        const obj = { a: 1 };
        const paths = [Path.fromArray(['b']), Path.fromArray(['c'])];

        const result = ObjectHandler.xOfPaths(obj, 0, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail early when count is zero and a path is present', () => {
        const obj = { a: 1 };
        const paths = [Path.fromArray(['a'])];

        const result = ObjectHandler.xOfPaths(obj, 0, paths);
        expect(result.pass).toBe(false);
    });
});

describe('ObjectHandler.allOfButXOfPaths', () => {
    test('should pass when all but X paths are present', () => {
        const obj = { a: 1, b: 2 };
        const paths = [Path.fromArray(['a']), Path.fromArray(['b']), Path.fromArray(['c'])];

        const result = ObjectHandler.allOfButXOfPaths(obj, 1, paths);
        expect(result.pass).toBe(true);
    });

    test('should fail when constraint is not met', () => {
        const obj = { a: 1 };
        const paths = [Path.fromArray(['a']), Path.fromArray(['b']), Path.fromArray(['c'])];

        const result = ObjectHandler.allOfButXOfPaths(obj, 1, paths);
        expect(result.pass).toBe(false);
        expect([...result.errors][0].key).toBe('object/allOfButXOfPaths');
    });

    test('should pass when count is zero and all paths are present', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const paths = [Path.fromArray(['a']), Path.fromArray(['b']), Path.fromArray(['c'])];

        const result = ObjectHandler.allOfButXOfPaths(obj, 0, paths);
        expect(result.pass).toBe(true);
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
        expect(result.value).not.toBe(obj);
    });

    test('should return requested number of keys', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = ObjectHandler.pickRandom(obj, 2);

        expect(result.pass).toBe(true);
        expect(Object.keys(result.value)).toHaveLength(2);
        expect(Object.keys(result.value).every((key) => Object.keys(obj).includes(key))).toBe(true);
    });

    test('should return an empty object when count is zero', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = ObjectHandler.pickRandom(obj, 0);

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({});
    });
});

describe('ObjectHandler.removeEmpty', () => {
    test('should remove null and undefined keys', () => {
        const result = ObjectHandler.removeEmpty({ a: 1, b: null, c: undefined, d: '' });
        expect(result).toEqual({ a: 1, d: '' });
    });

    test('should support custom empty values', () => {
        const result = ObjectHandler.removeEmpty({ a: '', b: 0, c: false, d: 'ok' }, ['', 0]);
        expect(result).toEqual({ c: false, d: 'ok' });
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

    test('should keep arrays untouched while cleaning nested plain objects', () => {
        const result = ObjectHandler.removeEmptyRecursive({
            a: [null, 1],
            b: {
                c: null,
                d: 2
            }
        });

        expect(result).toEqual({ a: [null, 1], b: { d: 2 } });
    });
});

describe('ObjectHandler.removePath', () => {
    test('should remove paths in-place', () => {
        const obj = { a: 1, b: { c: 2, d: 3 } };
        const result = ObjectHandler.removePath(obj, [Path.fromArray(['b', 'c'])]);

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, b: { d: 3 } });
    });

    test('should ignore missing paths without failing', () => {
        const obj = { a: 1, b: { d: 3 } };
        const result = ObjectHandler.removePath(obj, [Path.fromArray(['b', 'c'])]);

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, b: { d: 3 } });
    });

    test('should remove multiple deep paths in the same object', () => {
        const obj = {
            profile: {
                contact: {
                    email: 'ana@example.com',
                    phone: '123'
                }
            },
            settings: {
                preferences: {
                    theme: 'dark',
                    locale: 'en'
                }
            }
        };

        const result = ObjectHandler.removePath(obj, [
            Path.fromArray(['profile', 'contact', 'phone']),
            Path.fromArray(['settings', 'preferences', 'locale'])
        ]);

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({
            profile: {
                contact: {
                    email: 'ana@example.com'
                }
            },
            settings: {
                preferences: {
                    theme: 'dark'
                }
            }
        });
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

    test('should not override existing key when overrideExistingKey is false', () => {
        const result = ObjectHandler.renameKey(
            { old_name: 1, new_name: 2 },
            /old_/,
            'new_',
            { overrideExistingKey: false }
        );

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ old_name: 1, new_name: 2 });
    });
});

describe('ObjectHandler.setPath', () => {
    test('should set values at paths', () => {
        const obj = { a: 1 };
        const valueMap = new Map([
            [Path.fromArray(['b', 'c']), 2],
            [Path.fromArray(['d']), 3]
        ]);

        const result = ObjectHandler.setPath(obj, valueMap);

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, b: { c: 2 }, d: 3 });
    });

    test('should not overwrite existing path when overwrite is false', () => {
        const obj = { b: { c: 1 } };
        const valueMap = new Map([[Path.fromArray(['b', 'c']), 9]]);

        const result = ObjectHandler.setPath(obj, valueMap, false, true);

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ b: { c: 1 } });
    });

    test('should not create path when create is false', () => {
        const obj = { a: 1 };
        const valueMap = new Map([[Path.fromArray(['x', 'y']), 2]]);

        const result = ObjectHandler.setPath(obj, valueMap, true, false);

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1 });
    });

    test('should set multiple deep paths when create is true', () => {
        const obj = { root: {} };
        const valueMap = new Map([
            [Path.fromArray(['root', 'a', 'b', 'c']), 1],
            [Path.fromArray(['root', 'x', 'y', 'z']), 2]
        ]);

        const result = ObjectHandler.setPath(obj, valueMap, true, true);

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({
            root: {
                a: { b: { c: 1 } },
                x: { y: { z: 2 } }
            }
        });
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

    test('should keep defined falsy values when includeUndefined is false', () => {
        const result = ObjectHandler.stripUnknown(
            { a: 0, b: false, c: '', d: undefined },
            ['a', 'b', 'c', 'd']
        );

        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 0, b: false, c: '' });
    });
});
