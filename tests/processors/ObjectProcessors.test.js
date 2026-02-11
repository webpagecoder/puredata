'use strict';

const ObjectProcessors = require('../../lib/processors/ObjectProcessors.js');
const Path = require('../../lib/path/PathFactory.js');

// Note: ObjectProcessors does not have an isObject method
// Use GenericProcessors.isPrimitive(value, 'object') for type checking

describe('ObjectProcessors.isEmpty', () => {
    it('should pass for empty objects', () => {
        const result = ObjectProcessors.isEmpty({});
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({});
    });

    it('should fail for objects with keys', () => {
        const obj = { a: 1 };
        const result = ObjectProcessors.isEmpty(obj);
        expect(result.pass).toBe(false);
        expect(result.value).toEqual(obj);
    });

    it('should fail for objects with multiple keys', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = ObjectProcessors.isEmpty(obj);
        expect(result.pass).toBe(false);
    });

    it('should pass for new Object() with no properties', () => {
        const result = ObjectProcessors.isEmpty(new Object());
        expect(result.pass).toBe(true);
    });
});

describe('ObjectProcessors.isNotEmpty', () => {
    it('should pass for objects with keys', () => {
        const obj = { a: 1 };
        const result = ObjectProcessors.isNotEmpty(obj);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(obj);
    });

    it('should pass for objects with multiple keys', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = ObjectProcessors.isNotEmpty(obj);
        expect(result.pass).toBe(true);
    });

    it('should fail for empty objects', () => {
        const result = ObjectProcessors.isNotEmpty({});
        expect(result.pass).toBe(false);
        expect(result.value).toEqual({});
    });

    it('should pass for objects with null values', () => {
        const obj = { a: null };
        const result = ObjectProcessors.isNotEmpty(obj);
        expect(result.pass).toBe(true);
    });

    it('should pass for objects with undefined values', () => {
        const obj = { a: undefined };
        const result = ObjectProcessors.isNotEmpty(obj);
        expect(result.pass).toBe(true);
    });
});

describe('ObjectProcessors.hasProperty', () => {
    it('should pass when property exists', () => {
        const obj = { foo: 'bar' };
        const result = ObjectProcessors.hasProperty(obj, 'foo');
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(obj);
    });

    it('should fail when property does not exist', () => {
        const obj = { foo: 'bar' };
        const result = ObjectProcessors.hasProperty(obj, 'baz');
        expect(result.pass).toBe(false);
    });

    it('should pass for properties with null values', () => {
        const obj = { foo: null };
        const result = ObjectProcessors.hasProperty(obj, 'foo');
        expect(result.pass).toBe(true);
    });

    it('should fail for properties with undefined values', () => {
        const obj = { foo: undefined };
        const result = ObjectProcessors.hasProperty(obj, 'foo');
        expect(result.pass).toBe(false);
    });

    it('should fail when object is null', () => {
        const result = ObjectProcessors.hasProperty(null, 'foo');
        expect(result.pass).toBe(false);
    });

    it('should fail when object is undefined', () => {
        const result = ObjectProcessors.hasProperty(undefined, 'foo');
        expect(result.pass).toBe(false);
    });

    it('should pass for nested properties when checking first level', () => {
        const obj = { foo: { bar: 'baz' } };
        const result = ObjectProcessors.hasProperty(obj, 'foo');
        expect(result.pass).toBe(true);
    });
});

describe('ObjectProcessors.isPlainObject', () => {
    it('should pass for plain objects', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.isPlainObject(obj);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(obj);
    });

    it('should pass for empty objects', () => {
        const result = ObjectProcessors.isPlainObject({});
        expect(result.pass).toBe(true);
    });

    it('should fail for arrays', () => {
        const result = ObjectProcessors.isPlainObject([1, 2, 3]);
        expect(result.pass).toBe(false);
    });

    it('should fail for class instances', () => {
        class MyClass {}
        const result = ObjectProcessors.isPlainObject(new MyClass());
        expect(result.pass).toBe(false);
    });

    it('should fail for Date objects', () => {
        const result = ObjectProcessors.isPlainObject(new Date());
        expect(result.pass).toBe(false);
    });

    it('should fail for RegExp objects', () => {
        const result = ObjectProcessors.isPlainObject(/test/);
        expect(result.pass).toBe(false);
    });

    it('should fail for primitives', () => {
        expect(ObjectProcessors.isPlainObject('string').pass).toBe(false);
        expect(ObjectProcessors.isPlainObject(123).pass).toBe(false);
        expect(ObjectProcessors.isPlainObject(true).pass).toBe(false);
        expect(ObjectProcessors.isPlainObject(null).pass).toBe(false);
        expect(ObjectProcessors.isPlainObject(undefined).pass).toBe(false);
    });
});

describe('ObjectProcessors.removeEmpties', () => {
    it('should remove null and undefined by default', () => {
        const obj = { a: 1, b: null, c: undefined, d: 2 };
        const result = ObjectProcessors.removeEmpties(obj);
        expect(result).toEqual({ a: 1, d: 2 });
    });

    it('should remove only null by default', () => {
        const obj = { a: 1, b: null, c: 2 };
        const result = ObjectProcessors.removeEmpties(obj);
        expect(result).toEqual({ a: 1, c: 2 });
    });

    it('should remove custom empty values', () => {
        const obj = { a: 1, b: '', c: 0, d: 2 };
        const result = ObjectProcessors.removeEmpties(obj, ['', 0]);
        expect(result).toEqual({ a: 1, d: 2 });
    });

    it('should keep false values by default', () => {
        const obj = { a: false, b: null };
        const result = ObjectProcessors.removeEmpties(obj);
        expect(result).toEqual({ a: false });
    });

    it('should remove false when specified', () => {
        const obj = { a: true, b: false, c: 1 };
        const result = ObjectProcessors.removeEmpties(obj, [false]);
        expect(result).toEqual({ a: true, c: 1 });
    });

    it('should return empty object when all values are empty', () => {
        const obj = { a: null, b: undefined };
        const result = ObjectProcessors.removeEmpties(obj);
        expect(result).toEqual({});
    });

    it('should not modify nested objects', () => {
        const obj = { a: 1, b: { c: null } };
        const result = ObjectProcessors.removeEmpties(obj);
        expect(result).toEqual({ a: 1, b: { c: null } });
    });
});

describe('ObjectProcessors.removeEmptiesRecursive', () => {
    it('should remove null and undefined recursively', () => {
        const obj = { a: 1, b: { c: null, d: 2 }, e: undefined };
        const result = ObjectProcessors.removeEmptiesRecursive(obj);
        expect(result).toEqual({ a: 1, b: { d: 2 } });
    });

    it('should remove nested objects that become empty', () => {
        const obj = { a: 1, b: { c: null, d: undefined } };
        const result = ObjectProcessors.removeEmptiesRecursive(obj);
        expect(result).toEqual({ a: 1 });
    });

    it('should handle deeply nested objects', () => {
        const obj = { a: { b: { c: { d: null } } } };
        const result = ObjectProcessors.removeEmptiesRecursive(obj);
        expect(result).toEqual({});
    });

    it('should work with custom empty values', () => {
        const obj = { a: 1, b: { c: '', d: 2 } };
        const result = ObjectProcessors.removeEmptiesRecursive(obj, ['']);
        expect(result).toEqual({ a: 1, b: { d: 2 } });
    });

    it('should keep non-empty nested objects', () => {
        const obj = { a: 1, b: { c: 2, d: { e: 3 } } };
        const result = ObjectProcessors.removeEmptiesRecursive(obj);
        expect(result).toEqual({ a: 1, b: { c: 2, d: { e: 3 } } });
    });

    it('should remove multiple levels of empty objects', () => {
        const obj = { a: 1, b: { c: { d: null } }, e: { f: undefined } };
        const result = ObjectProcessors.removeEmptiesRecursive(obj);
        expect(result).toEqual({ a: 1 });
    });
});

describe('ObjectProcessors.removePaths', () => {
    it('should remove simple paths', () => {
        const obj = { a: 1, b: 2, c: 3 };
            const result = ObjectProcessors.removePaths(obj, [Path.create('b', '.')]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, c: 3 });
    });

    it('should remove multiple paths', () => {
        const obj = { a: 1, b: 2, c: 3 };
            const result = ObjectProcessors.removePaths(obj, [Path.create('a', '.'), Path.create('c', '.')]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ b: 2 });
    });

    it('should remove nested paths', () => {
        const obj = { a: { b: { c: 1 } } };
            const result = ObjectProcessors.removePaths(obj, [Path.create('a.b.c', '.')]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: { b: {} } });
    });

    it('should handle non-existent paths gracefully', () => {
        const obj = { a: 1 };
            const result = ObjectProcessors.removePaths(obj, [Path.create('b', '.')]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1 });
    });

    it('should handle empty paths array', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.removePaths(obj, []);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, b: 2 });
    });

    it('should modify the original object', () => {
        const obj = { a: 1, b: 2 };
            ObjectProcessors.removePaths(obj, [Path.create('b', '.')]);
        expect(obj).toEqual({ a: 1 });
    });
});

describe('ObjectProcessors.setPaths', () => {
    it('should set simple paths', () => {
        const obj = { a: 1 };
            const result = ObjectProcessors.setPaths(obj, [[Path.create('b', '.'), 2]]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, b: 2 });
    });

    it('should set nested paths', () => {
        const obj = {};
            const result = ObjectProcessors.setPaths(obj, [[Path.create('a.b.c', '.'), 123]]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: { b: { c: 123 } } });
    });

    it('should set multiple paths', () => {
        const obj = {};
            const result = ObjectProcessors.setPaths(obj, [[Path.create('a', '.'), 1], [Path.create('b', '.'), 2], [Path.create('c', '.'), 3]]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should overwrite existing values by default', () => {
        const obj = { a: 1 };
            const result = ObjectProcessors.setPaths(obj, [[Path.create('a', '.'), 2]]);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 2 });
    });

    it('should not overwrite when overwrite is false', () => {
        const obj = { a: 1 };
            const result = ObjectProcessors.setPaths(obj, [[Path.create('a', '.'), 2]], false);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1 });
    });

    it('should create nested paths by default', () => {
        const obj = {};
            const result = ObjectProcessors.setPaths(obj, [[Path.create('a.b.c', '.'), 123]], true, true);
        expect(result.pass).toBe(true);
        expect(result.value.a.b.c).toBe(123);
    });

    it('should modify the original object', () => {
        const obj = { a: 1 };
            ObjectProcessors.setPaths(obj, [[Path.create('b', '.'), 2]]);
        expect(obj).toEqual({ a: 1, b: 2 });
    });

    it('should handle Map-like arrays of [path, value] pairs', () => {
        const obj = {};
        const valueMap = [
                [Path.create('name', '.'), 'John'],
                [Path.create('age', '.'), 30],
                [Path.create('address.city', '.'), 'NYC']
        ];
        const result = ObjectProcessors.setPaths(obj, valueMap);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({
            name: 'John',
            age: 30,
            address: { city: 'NYC' }
        });
    });
});

describe('ObjectProcessors.renameKeys', () => {
    it('should rename keys matching the regex', () => {
        const obj = { foo_1: 1, foo_2: 2, bar: 3 };
        const result = ObjectProcessors.renameKeys(obj, /^foo_/, 'baz_');
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ baz_1: 1, baz_2: 2, bar: 3 });
    });

    it('should not delete original keys if deleteOriginalKey is false', () => {
        const obj = { a_1: 1, a_2: 2 };
        const result = ObjectProcessors.renameKeys(obj, /^a_/, 'b_', { deleteOriginalKey: false });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a_1: 1, a_2: 2, b_1: 1, b_2: 2 });
    });

    it('should skip undefined values if ignoreUndefined is true', () => {
        const obj = { foo_1: undefined, foo_2: 2 };
        const result = ObjectProcessors.renameKeys(obj, /^foo_/, 'bar_', { ignoreUndefined: true });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ bar_2: 2 });
    });

    it('should not override existing keys if overrideExistingKey is false', () => {
        const obj = { foo: 1, bar: 2 };
        const result = ObjectProcessors.renameKeys(obj, /^foo$/, 'bar', { overrideExistingKey: false });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ foo: 1, bar: 2 });
    });

    it('should override existing keys if overrideExistingKey is true', () => {
        const obj = { foo: 1, bar: 2 };
        const result = ObjectProcessors.renameKeys(obj, /^foo$/, 'bar', { overrideExistingKey: true });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ bar: 1 });
    });
});

describe('ObjectProcessors.stripUnknownKeys', () => {
    it('should keep only known keys', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = ObjectProcessors.stripUnknownKeys(obj, ['a', 'c']);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, c: 3 });
    });

    it('should include undefined values if includeUndefined is true', () => {
        const obj = { a: 1, b: undefined, c: 3 };
        const result = ObjectProcessors.stripUnknownKeys(obj, ['a', 'b', 'c'], { includeUndefined: true });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, b: undefined, c: 3 });
    });

    it('should skip undefined values if includeUndefined is false', () => {
        const obj = { a: 1, b: undefined, c: 3 };
        const result = ObjectProcessors.stripUnknownKeys(obj, ['a', 'b', 'c'], { includeUndefined: false });
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({ a: 1, c: 3 });
    });

    it('should return an empty object if no known keys are present', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.stripUnknownKeys(obj, ['x', 'y']);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({});
    });

    it('should return an empty object if the input is not an object', () => {
        const result = ObjectProcessors.stripUnknownKeys('not an object', ['a', 'b']);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({});
    });
});

describe('ObjectProcessors.instanceOf', () => {
    it('should pass if object is instance of given constructor', () => {
        function MyClass() { }
        const obj = new MyClass();
        const result = ObjectProcessors.instanceOf(obj, MyClass);
        expect(result.pass).toBe(true);
    });

    it('should fail if object is not instance of given constructor', () => {
        function MyClass() { }
        function OtherClass() { }
        const obj = new MyClass();
        const result = ObjectProcessors.instanceOf(obj, OtherClass);
        expect(result.pass).toBe(false);
    });

    it('should fail if input is not an object', () => {
        const result = ObjectProcessors.instanceOf('not an object', Object);
        expect(result.pass).toBe(false);
    });
});

describe('ObjectProcessors.pickRandom', () => {
    it('should return a new object with the specified number of random keys', () => {
        const obj = { a: 1, b: 2, c: 3, d: 4 };
        const result = ObjectProcessors.pickRandom(obj, 2);
        expect(result.pass).toBe(true);
        const keys = Object.keys(result.value);
        expect(keys.length).toBe(2);
        expect(keys.every(k => obj.hasOwnProperty(k))).toBe(true);
    });

    it('should return a copy of the object if count is greater than or equal to number of keys', () => {
        const obj = { x: 10, y: 20 };
        const result = ObjectProcessors.pickRandom(obj, 5);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual(obj);
    });

    it('should return an empty object if count is 0', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.pickRandom(obj, 0);
        expect(result.pass).toBe(true);
        expect(result.value).toEqual({});
    });
});

describe('ObjectProcessors.maxDepth', () => {
    it('should pass if object depth is less than or equal to maxDepth', () => {
        const obj = { a: 1, b: { c: 2, d: { e: 3 } }, f: 4 }; // depth 3
        const result = ObjectProcessors.maxDepth(obj, 3);
        expect(result.pass).toBe(true);
    });

    it('should fail if object depth is greater than maxDepth', () => {
        const obj = {
            a: {
                b: {
                    c: {
                        d: {
                            e: {
                                f: 1
                            }
                        }
                    }
                }
            },
            g: 2,
            h: 3
        }; // depth 6
        const result = ObjectProcessors.maxDepth(obj, 5);
        expect(result.pass).toBe(false);
    });

    it('should pass for a very deep but shallow object and maxDepth equal to depth', () => {
        const obj = {
            a: {
                b: {
                    c: {
                        d: {
                            e: {
                                f: {
                                    g: 7
                                }
                            }
                        }
                    }
                }
            }
        }; // depth 7
        const result = ObjectProcessors.maxDepth(obj, 7);
        expect(result.pass).toBe(true);
    });
});

describe('ObjectProcessors.minDepth', () => {
    it('should pass if object depth is greater than or equal to minDepth', () => {
        const obj = {
            a: { b: { c: { d: 1 } } },
            e: 2,
            f: 3
        }; // depth 4
        const result = ObjectProcessors.minDepth(obj, 4);
        expect(result.pass).toBe(true);
    });

    it('should fail if object depth is less than minDepth', () => {
        const obj = { a: 1, b: { c: 2 }, d: 3 }; // depth 2
        const result = ObjectProcessors.minDepth(obj, 3);
        expect(result.pass).toBe(false);
    });

    it('should pass for a complex object with minDepth 5', () => {
        const obj = {
            a: {
                b: {
                    c: {
                        d: {
                            e: 5,
                            f: 6
                        }
                    }
                }
            },
            g: 7
        }; // depth 5
        const result = ObjectProcessors.minDepth(obj, 5);
        expect(result.pass).toBe(true);
    });
});

describe('ObjectProcessors.depth', () => {
    it('should pass if object depth matches depth', () => {
        const obj = {
            a: {
                b: {
                    c: {
                        d: 1,
                        e: 2
                    }
                }
            },
            f: 3
        }; // depth 4
        const result = ObjectProcessors.depth(obj, 4);
        expect(result.pass).toBe(true);
    });

    it('should fail if object depth does not match depth', () => {
        const obj = {
            a: 1,
            b: { c: 2, d: { e: 3 } },
            f: 4
        }; // depth 3
        const result = ObjectProcessors.depth(obj, 4);
        expect(result.pass).toBe(false);
    });

    it('should pass for a very deep object and correct depth', () => {
        const obj = {
            a: {
                b: {
                    c: {
                        d: {
                            e: {
                                f: {
                                    g: {
                                        h: 8
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }; // depth 8
        const result = ObjectProcessors.depth(obj, 8);
        expect(result.pass).toBe(true);
    });
});

describe('ObjectProcessors.maxKeyCount', () => {
    it('should pass if object has keys less than or equal to maxKeyCount', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.maxKeyCount(obj, 2);
        expect(result.pass).toBe(true);
    });

    it('should pass if object has fewer keys than maxKeyCount', () => {
        const obj = { a: 1 };
        const result = ObjectProcessors.maxKeyCount(obj, 2);
        expect(result.pass).toBe(true);
    });

    it('should fail if object has more keys than maxKeyCount', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = ObjectProcessors.maxKeyCount(obj, 2);
        expect(result.pass).toBe(false);
    });

    it('should work with a deep object but only count top-level keys', () => {
        const obj = { a: 1, b: { c: 2, d: 3 }, e: 4 };
        const result = ObjectProcessors.maxKeyCount(obj, 3);
        expect(result.pass).toBe(true);
    });

    it('should fail for a deep object with many top-level keys', () => {
        const obj = { a: 1, b: 2, c: 3, d: { e: 4, f: 5 }, g: 6 };
        const result = ObjectProcessors.maxKeyCount(obj, 4);
        expect(result.pass).toBe(false);
    });
});

describe('ObjectProcessors.maxKeyCountRecursive', () => {
    it('should pass if total keys (recursive) are less than or equal to maxKeyCount', () => {
        const obj = { a: 1, b: { c: 2 } }; // 3 keys
        const result = ObjectProcessors.maxKeyCountRecursive(obj, 3);
        expect(result.pass).toBe(true);
    });

    it('should fail if total keys (recursive) are more than maxKeyCount', () => {
        const obj = { a: 1, b: { c: 2, d: 3 } }; // 4 keys
        const result = ObjectProcessors.maxKeyCountRecursive(obj, 3);
        expect(result.pass).toBe(false);
    });

    it('should pass for flat object and maxKeyCountRecursive 2', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.maxKeyCountRecursive(obj, 2);
        expect(result.pass).toBe(true);
    });

    it('should handle deep nested objects', () => {
        const obj = {
            a: 1,
            b: {
                c: 2,
                d: {
                    e: 3,
                    f: {
                        g: 4,
                        h: 5
                    }
                }
            },
            i: 6
        }; // 8 keys
        const result = ObjectProcessors.maxKeyCountRecursive(obj, 9);
        expect(result.pass).toBe(true);
        const failResult = ObjectProcessors.maxKeyCountRecursive(obj, 8);
        expect(failResult.pass).toBe(false);
    });
});

describe('ObjectProcessors.minKeyCount', () => {
    it('should pass if object has keys greater than or equal to minKeyCount', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.minKeyCount(obj, 2);
        expect(result.pass).toBe(true);
    });

    it('should fail if object has fewer keys than minKeyCount', () => {
        const obj = { a: 1 };
        const result = ObjectProcessors.minKeyCount(obj, 2);
        expect(result.pass).toBe(false);
    });

    it('should pass for object with more keys than minKeyCount', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = ObjectProcessors.minKeyCount(obj, 2);
        expect(result.pass).toBe(true);
    });

    it('should work with deep objects but only count top-level keys', () => {
        const obj = { a: 1, b: { c: 2, d: 3 }, e: 4, f: 5 };
        const result = ObjectProcessors.minKeyCount(obj, 4);
        expect(result.pass).toBe(true);
    });

    it('should fail for deep object with few top-level keys', () => {
        const obj = { a: { b: { c: { d: 1 } } } };
        const result = ObjectProcessors.minKeyCount(obj, 2);
        expect(result.pass).toBe(false);
    });
});

describe('ObjectProcessors.minKeyCountRecursive', () => {
    it('should pass if total keys (recursive) are greater than or equal to minKeyCount', () => {
        const obj = { a: 1, b: { c: 2 } }; // 3 keys
        const result = ObjectProcessors.minKeyCountRecursive(obj, 3);
        expect(result.pass).toBe(true);
    });

    it('should fail if total keys (recursive) are less than minKeyCount', () => {
        const obj = { a: 1, b: {} }; // 2 keys
        const result = ObjectProcessors.minKeyCountRecursive(obj, 3);
        expect(result.pass).toBe(false);
    });

    it('should pass for flat object and minKeyCountRecursive 2', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.minKeyCountRecursive(obj, 2);
        expect(result.pass).toBe(true);
    });

    it('should handle deep nested objects with many keys', () => {
        const obj = {
            a: 1,
            b: {
                c: 2,
                d: {
                    e: 3,
                    f: {
                        g: 4,
                        h: 5,
                        i: 6
                    }
                }
            },
            j: 7
        }; // 10 keys
        const result = ObjectProcessors.minKeyCountRecursive(obj, 10);
        expect(result.pass).toBe(true);
        const failResult = ObjectProcessors.minKeyCountRecursive(obj, 11);
        expect(failResult.pass).toBe(false);
    });
});

describe('ObjectProcessors.keyCount', () => {
    it('should pass if object has exactly keyCount keys', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.keyCount(obj, 2);
        expect(result.pass).toBe(true);
    });

    it('should fail if object has more than keyCount keys', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = ObjectProcessors.keyCount(obj, 2);
        expect(result.pass).toBe(false);
    });

    it('should fail if object has fewer than keyCount keys', () => {
        const obj = { a: 1 };
        const result = ObjectProcessors.keyCount(obj, 2);
        expect(result.pass).toBe(false);
    });

    it('should work with deep objects but only count top-level keys', () => {
        const obj = { a: 1, b: { c: 2, d: 3 }, e: 4 };
        const result = ObjectProcessors.keyCount(obj, 3);
        expect(result.pass).toBe(true);
    });

    it('should fail for deep object with wrong top-level key count', () => {
        const obj = { a: 1, b: { c: 2 }, d: 3, e: 4 };
        const result = ObjectProcessors.keyCount(obj, 2);
        expect(result.pass).toBe(false);
    });
});

describe('ObjectProcessors.keyCountRecursive', () => {
    it('should pass if total keys (recursive) equal keyCount', () => {
        const obj = { a: 1, b: { c: 2 } }; // 3 keys
        const result = ObjectProcessors.keyCountRecursive(obj, 3);
        expect(result.pass).toBe(true);
    });

    it('should fail if total keys (recursive) are more than keyCount', () => {
        const obj = { a: 1, b: { c: 2, d: 3 } }; // 4 keys
        const result = ObjectProcessors.keyCountRecursive(obj, 3);
        expect(result.pass).toBe(false);
    });

    it('should fail if total keys (recursive) are less than keyCount', () => {
        const obj = { a: 1, b: {} }; // 2 keys
        const result = ObjectProcessors.keyCountRecursive(obj, 3);
        expect(result.pass).toBe(false);
    });

    it('should handle very deep and wide objects', () => {
        const obj = {
            a: 1,
            b: {
                c: 2,
                d: {
                    e: 3,
                    f: {
                        g: 4,
                        h: 5,
                        i: 6,
                        j: 7
                    }
                }
            },
            k: 8,
            l: 9
        }; // 12 keys
        const result = ObjectProcessors.keyCountRecursive(obj, 12);
        expect(result.pass).toBe(true);
        const failResult = ObjectProcessors.keyCountRecursive(obj, 11);
        expect(failResult.pass).toBe(false);
    });
});










// Path import moved to top of file

describe('ObjectProcessors.noneOfPaths', () => {
    it('should pass if none of the specified paths exist', () => {
        const obj = {
            a: 1,
            b: {
                c: 2,
                d: {
                    e: 3,
                    f: { g: 4 }
                }
            },
            h: { i: 5 }
        };
        const result = ObjectProcessors.noneOfPaths(
            obj,
            [
                Path.create('x/y/z', '/'),
                Path.create('b/d/x', '/'),
                Path.create('h/j', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });

    it('should fail if at least one of the specified paths exists', () => {
        const obj = {
            a: 1,
            b: {
                c: 2,
                d: {
                    e: 3,
                    f: { g: 4 }
                }
            },
            h: { i: 5 }
        };
        const result = ObjectProcessors.noneOfPaths(
            obj,
            [
                Path.create('b/d/e', '/'),
                Path.create('not/real', '/')
            ]
        );
        expect(result.pass).toBe(false);
    });

    it('should pass for empty path list', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 }
        };
        const result = ObjectProcessors.noneOfPaths(obj);
        expect(result.pass).toBe(true);
    });

    it('should work with deep nested paths', () => {
        const obj = {
            a: {
                b: {
                    c: {
                        d: {
                            e: 5
                        }
                    }
                }
            },
            f: {
                g: {
                    h: 6
                }
            }
        };
        const result = ObjectProcessors.noneOfPaths(
            obj,
            [
                Path.create('a/b/c/d/x', '/'),
                Path.create('f/g/i', '/')
            ]
        );
        expect(result.pass).toBe(true);

        const failResult = ObjectProcessors.noneOfPaths(
            obj,
            [
                Path.create('a/b/c/d/e', '/'),
                Path.create('f/g/h', '/')
            ]
        );
        expect(failResult.pass).toBe(false);
    });
});

describe('ObjectProcessors.someOfPaths', () => {
    it('should pass if at least one of the specified paths exists', () => {
        const obj = {
            a: 1,
            b: {
                c: 2,
                d: {
                    e: 3,
                    f: { g: 4 }
                }
            },
            h: { i: 5 }
        };
        const result = ObjectProcessors.someOfPaths(
            obj,
            [
                Path.create('b/d/e', '/'),
                Path.create('x/y/z', '/'),
                Path.create('not/real', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });

    it('should fail if none of the specified paths exist', () => {
        const obj = {
            a: 1,
            b: {
                c: 2,
                d: {
                    e: 3,
                    f: { g: 4 }
                }
            },
            h: { i: 5 }
        };
        const result = ObjectProcessors.someOfPaths(
            obj,
            [
                Path.create('x/y/z', '/'),
                Path.create('b/d/x', '/'),
                Path.create('h/j', '/')
            ]
        );
        expect(result.pass).toBe(false);
    });

    it('should pass for deep nested paths', () => {
        const obj = {
            a: {
                b: {
                    c: {
                        d: {
                            e: 5
                        }
                    }
                }
            },
            f: {
                g: {
                    h: 6
                }
            }
        };
        const result = ObjectProcessors.someOfPaths(
            obj,
            [
                Path.create('a/b/c/d/e', '/'),
                Path.create('f/g/i', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });
    it('should fail for empty path list', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.someOfPaths(obj);
        expect(result.pass).toBe(false);
    });
});

describe('ObjectProcessors.allOfPaths', () => {
    it('should pass if all specified paths exist', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2, f: { g: 3 } },
            h: 4
        };
        const result = ObjectProcessors.allOfPaths(
            obj,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('d/f/g', '/'),
                Path.create('h', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });

    it('should fail if any specified path does not exist', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 }
        };
        const result = ObjectProcessors.allOfPaths(
            obj,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('d/f', '/')
            ]
        );
        expect(result.pass).toBe(false);
    });

    it('should pass for a single deep path', () => {
        const obj = { x: { y: { z: { w: 5 } } } };
        const result = ObjectProcessors.allOfPaths(obj, [Path.create('x/y/z/w', '/')]);
        expect(result.pass).toBe(true);
    });
});

describe('ObjectProcessors.exactlyPaths', () => {
    it('should pass if object has exactly the specified paths', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 },
            f: 3
        };
        const paths = [
            Path.create('a/b/c', '/'),
            Path.create('d/e', '/'),
            Path.create('f', '/')
        ];
        const result = ObjectProcessors.exactlyPaths(obj, paths);
        expect(result.pass).toBe(true);
    });

    it('should fail if object has extra paths', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 },
            f: 3,
            g: 4
        };
        const paths = [
            Path.create('a/b/c', '/'),
            Path.create('d/e', '/'),
            Path.create('f', '/')
        ];
        const result = ObjectProcessors.exactlyPaths(obj, paths);
        expect(result.pass).toBe(false);
    });

    it('should fail if object is missing a specified path', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 }
        };
        const paths = [
            Path.create('a/b/c', '/'),
            Path.create('d/e', '/'),
            Path.create('f', '/')
        ];
        const result = ObjectProcessors.exactlyPaths(obj, paths);
        expect(result.pass).toBe(false);
    });
});

describe('ObjectProcessors.onlyPaths', () => {
    it('should pass if object only has the allowed paths', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 },
            f: 3
        };
        const result = ObjectProcessors.onlyPaths(
            obj,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('f', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });

    it('should fail if object has paths not in the allowed list', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 },
            f: 3,
            g: { h: 4 }
        };
        const result = ObjectProcessors.onlyPaths(
            obj,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('f', '/')
            ]
        );
        expect(result.pass).toBe(false);
    });

    it('should pass for a complex object with nested allowed paths', () => {
        const obj = {
            x: { y: { z: 1 } },
            a: { b: 2 }
        };
        const result = ObjectProcessors.onlyPaths(
            obj,
            [
                Path.create('x/y/z', '/'),
                Path.create('a/b', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });
});

describe('ObjectProcessors.pathsOtherThan', () => {
    it('should pass if at least one of the specified paths does not exist', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 },
            f: 3
        };
        const result = ObjectProcessors.pathsOtherThan(
            obj,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('x/y/z', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });

    it('should fail if all specified paths exist', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 },
            f: 3
        };
        const result = ObjectProcessors.pathsOtherThan(
            obj,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('f', '/')
            ]
        );
        expect(result.pass).toBe(false);
    });

    it('should pass if none of the specified paths exist', () => {
        const obj = {
            a: 1,
            b: 2
        };
        const result = ObjectProcessors.pathsOtherThan(
            obj,
            [
                Path.create('x/y', '/'),
                Path.create('z', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });

    it('should not fail for empty path list', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.pathsOtherThan(obj);
        expect(result.pass).toBe(true);
    });
});

describe('ObjectProcessors.xOfPaths', () => {
    it('should pass if exactly X of the specified paths exist', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 },
            f: 3,
            g: { h: 4 }
        };
        const result = ObjectProcessors.xOfPaths(
            obj,
            2,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('x/y/z', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });

    it('should fail if fewer than X of the specified paths exist', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 }
        };
        const result = ObjectProcessors.xOfPaths(
            obj,
            3,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('f', '/')
            ]
        );
        expect(result.pass).toBe(false);
    });

    it('should fail if more than X of the specified paths exist', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 },
            f: 3
        };
        const result = ObjectProcessors.xOfPaths(
            obj,
            2,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('f', '/')
            ]
        );
        expect(result.pass).toBe(false);
    });

    it('should pass for X = 0 if none of the paths exist', () => {
        const obj = { a: 1, b: 2 };
        const result = ObjectProcessors.xOfPaths(
            obj,
            0,
            [
                Path.create('x/y', '/'),
                Path.create('z', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });

    it('should fail for X = 0 if any path exists', () => {
        const obj = { a: { b: 2 } };
        const result = ObjectProcessors.xOfPaths(
            obj,
            0,
            [
                Path.create('a/b', '/'),
                Path.create('x/y', '/')
            ]
        );
        expect(result.pass).toBe(false);
    });
});

describe('ObjectProcessors.allOfButXOfPaths', () => {
    it('should pass if all but X of the specified paths exist', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 },
            f: 3,
            g: { h: 4 }
        };
        // 3 exist, 1 does not, X = 1
        const result = ObjectProcessors.allOfButXOfPaths(
            obj,
            1,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('f', '/'),
                Path.create('not/real', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });

    it('should fail if more than X of the specified paths do not exist', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 }
        };
        // Only 2 exist, 2 do not, X = 1
        const result = ObjectProcessors.allOfButXOfPaths(
            obj,
            1,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('f', '/'),
                Path.create('g/h', '/')
            ]
        );
        expect(result.pass).toBe(false);
    });

    it('should fail if fewer than X of the specified paths do not exist', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 },
            f: 3
        };
        // All exist, X = 1
        const result = ObjectProcessors.allOfButXOfPaths(
            obj,
            1,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/'),
                Path.create('f', '/')
            ]
        );
        expect(result.pass).toBe(false);
    });

    it('should pass for X = 0 if all paths exist', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: 2 }
        };
        const result = ObjectProcessors.allOfButXOfPaths(
            obj,
            0,
            [
                Path.create('a/b/c', '/'),
                Path.create('d/e', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });

    it('should pass for X = total paths if none exist', () => {
        const obj = { x: 1 };
        const result = ObjectProcessors.allOfButXOfPaths(
            obj,
            3,
            [
                Path.create('a/b', '/'),
                Path.create('c/d', '/'),
                Path.create('e/f', '/')
            ]
        );
        expect(result.pass).toBe(true);
    });
});