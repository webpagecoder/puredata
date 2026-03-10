'use strict';

import { Field } from '../../lib/fields/Field.ts';
import { Path } from '../../lib/Path.ts';
import { DATE_TYPES } from '../../lib/utils/DateTypes.ts';
import { Utils } from '../../lib/utils/Utils.ts';

const pathObj = (...keys) => ({ keys: [...keys] });

describe('Utils general/object utilities', () => {
    test('areEqual handles primitives, arrays, objects, and Field chains', () => {
        expect(Utils.areEqual(1, 1)).toBe(true);
        expect(Utils.areEqual([1, { a: 2 }], [1, { a: 2 }])).toBe(true);
        expect(Utils.areEqual({ a: 1, b: [2] }, { a: 1, b: [2] })).toBe(true);
        expect(Utils.areEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    test('clone deeply clones nested objects', () => {
        const original = { a: { b: 1 } };
        const cloned = Utils.clone(original);

        expect(cloned).toEqual(original);
        expect(cloned).not.toBe(original);
        expect(cloned.a).not.toBe(original.a);
        expect(Utils.clone(5)).toBe(5);
    });

    test('clone deeply clones four-level nested objects', () => {
        const deep = { a: { b: { c: { d: { e: 1 } } } } };
        const cloned = Utils.clone(deep);

        expect(cloned).toEqual(deep);
        expect(cloned).not.toBe(deep);
        expect(cloned.a.b.c).not.toBe(deep.a.b.c);
        expect(cloned.a.b.c.d).not.toBe(deep.a.b.c.d);
    });

    test('areEqual handles complex nested objects deeply', () => {
        const obj1 = { a: { b: { c: { d: 1 } } }, e: [1, { f: 2 }] };
        const obj2 = { a: { b: { c: { d: 1 } } }, e: [1, { f: 2 }] };
        const obj3 = { a: { b: { c: { d: 1 } } }, e: [1, { f: 3 }] };

        expect(Utils.areEqual(obj1, obj2)).toBe(true);
        expect(Utils.areEqual(obj1, obj3)).toBe(false);
    });

    test('areEqual handles deeply nested arrays with mixed content', () => {
        const arr1 = [[{ a: 1 }], [{ b: 2 }]];
        const arr2 = [[{ a: 1 }], [{ b: 2 }]];
        const arr3 = [[{ a: 1 }], [{ b: 3 }]];

        expect(Utils.areEqual(arr1, arr2)).toBe(true);
        expect(Utils.areEqual(arr1, arr3)).toBe(false);
    });

    test('isPlainObject and isObject behave as expected', () => {
        expect(Utils.isPlainObject({})).toBe(true);
        expect(Utils.isPlainObject(new Date())).toBe(false);
        expect(Utils.isObject({})).toBe(true);
        expect(Utils.isObject([])).toBe(true);
        expect(Utils.isObject(null)).toBe(false);
    });

    test('isPlainObject recognizes Object.create as plain when constructor is Object', () => {
        const customProto = Object.create(Object.prototype);
        expect(Utils.isPlainObject(customProto)).toBe(true);
    });

    test('mergeObjects merges recursively and overrides non-plain values', () => {
        const parent = { a: { x: 1 }, b: 1, c: 1 };
        const child = { a: { y: 2 }, b: 2, d: 3 };

        const merged = Utils.mergeObjects(parent, child);
        expect(merged).toEqual({ a: { x: 1, y: 2 }, b: 2, c: 1, d: 3 });
    });

    test('mergeObjects merges three deep levels recursively', () => {
        const parent = { org: { team: { name: 'A' }, budget: 100 } };
        const child = { org: { team: { members: 'Bob' }, manager: 'Bob' } };

        const merged = Utils.mergeObjects(parent, child);
        expect(merged).toEqual({
            org: {
                team: { name: 'A', members: 'Bob' },
                budget: 100,
                manager: 'Bob'
            }
        });
    });

    test('mergeObjects does not mutate parent or child', () => {
        const parent = { a: { b: 1 } };
        const child = { a: { c: 2 } };
        const parentCopy = JSON.stringify(parent);
        const childCopy = JSON.stringify(child);

        const merged = Utils.mergeObjects(parent, child);

        expect(JSON.stringify(parent)).toBe(parentCopy);
        expect(JSON.stringify(child)).toBe(childCopy);
        expect(merged).toEqual({ a: { b: 1, c: 2 } });
    });

    test('getDepth and getDepthAndKeyCount return values and enforce limits', () => {
        const obj = { a: { b: { c: 1 } }, d: 2 };

        expect(Utils.getDepth(obj)).toBe(3);
        expect(Utils.getDepth(obj, 2)).toBe(false);
        expect(Utils.getDepthAndKeyCount(obj)).toEqual([3, 4]);
        expect(Utils.getDepthAndKeyCount(obj, { maxDepth: 2 })).toBe(false);
        expect(Utils.getDepthAndKeyCount(obj, { maxKeyCount: 3 })).toBe(false);
    });

    test('getDepth returns correct depth for four-level objects', () => {
        const obj = { a: { b: { c: { d: 1 } } } };
        expect(Utils.getDepth(obj)).toBe(4);
    });

    test('getDepth returns correct depth with multiple branches', () => {
        const obj = {
            a: { b: { c: 1 } },
            d: { e: { f: { g: 1 } } }
        };
        expect(Utils.getDepth(obj)).toBe(4);
    });

    test('getDepthAndKeyCount handles deep objects with multiple keys', () => {
        const obj = {
            a: { b: 1, c: 2 },
            d: { e: { f: 3, g: 4 } }
        };
        const [depth, keyCount] = Utils.getDepthAndKeyCount(obj);
        expect(depth).toBe(3);
        expect(keyCount).toBe(7);
    });

    test('getRecursiveKeyCount counts recursively and enforces max', () => {
        const obj = { a: { b: 1 }, c: 2 };
        expect(Utils.getRecursiveKeyCount(obj)).toBe(3);
        expect(Utils.getRecursiveKeyCount(obj, 1)).toBe(false);
    });

    test('getRecursiveKeyCount handles deep structures', () => {
        const obj = {
            level1: {
                level2: {
                    level3: {
                        leaf1: 1,
                        leaf2: 2
                    }
                }
            }
        };
        expect(Utils.getRecursiveKeyCount(obj)).toBe(5);
    });
});

describe('Utils path utilities', () => {
    let originalCreateFromArray;

    beforeAll(() => {
        originalCreateFromArray = Path.fromArray;
        Path.fromArray = (keys, { separator }) => ({
            keys: [...keys],
            string: keys.join(separator)
        });
    });

    afterAll(() => {
        if (originalCreateFromArray === undefined) {
            delete Path.fromArray;
        }
        else {
            Path.fromArray = originalCreateFromArray;
        }
    });

    test('getAllPaths yields leaf paths and optional object roots', () => {
        const obj = { a: { b: 1, c: { d: 2 } } };

        const leaves = [...Utils.getAllPaths(obj, '.')].map(x => x.string);
        expect(leaves).toEqual(['a.b', 'a.c.d']);

        const roots = [...Utils.getAllPaths(obj, '.', { includeObjectRoots: true })].map(x => x.string);
        expect(roots).toEqual(['a', 'a.b', 'a.c', 'a.c.d']);

        const onlyRoots = [...Utils.getAllPaths(obj, '.', { rootsOnly: true })].map(x => x.string);
        expect(onlyRoots).toEqual(['a', 'a.c']);
    });

    test('getAllPaths yields all paths in deeply nested structures', () => {
        const obj = {
            org: {
                dept: {
                    team: {
                        lead: 'Alice'
                    }
                }
            }
        };
        const leaves = [...Utils.getAllPaths(obj, '/')].map(x => x.string);
        expect(leaves).toEqual(['org/dept/team/lead']);

        const roots = [...Utils.getAllPaths(obj, '/', { includeObjectRoots: true })].map(x => x.string);
        expect(roots).toEqual(['org', 'org/dept', 'org/dept/team', 'org/dept/team/lead']);
    });

    test('getAllPaths yields multiple branches', () => {
        const obj = {
            a: { b: 1, c: { d: 2 } },
            e: { f: 3 }
        };
        const leaves = [...Utils.getAllPaths(obj, '.')].map(x => x.string);
        expect(leaves).toEqual(['a.b', 'a.c.d', 'e.f']);
    });

    test('getPathCount counts paths from getAllPaths', () => {
        expect(Utils.getPathCount({ a: { b: 1, c: 2 } })).toBe(2);
        expect(Utils.getPathCount({ a: { b: 1, c: { d: 2 } } }, { includeObjectRoots: true })).toBe(4);
    });

    test('getPathCount handles deep structures', () => {
        const obj = {
            user: {
                profile: {
                    contact: {
                        email: 'a@b.com',
                        phone: '123'
                    }
                }
            }
        };
        expect(Utils.getPathCount(obj)).toBe(2);
    });

    test('getPathPointer, hasPath, getPathValue, setPathValue, and removePath work end-to-end', () => {
        const obj = { a: {} };

        const pointer = Utils.getPathPointer(obj, pathObj('a', 'b'));
        expect(Array.isArray(pointer)).toBe(true);
        expect(pointer[1]).toBe('b');

        expect(Utils.setPathValue(obj, pathObj('a', 'b'), 123)).toBe(true);
        expect(Utils.hasPath(obj, pathObj('a', 'b'))).toBe(true);
        expect(Utils.getPathValue(obj, pathObj('a', 'b'))).toBe(123);
        expect(Utils.getPathValue(obj, pathObj())).toEqual(obj);

        expect(Utils.setPathValue(obj, pathObj('a', 'b'), 999, { overwrite: false })).toBe(false);
        expect(Utils.removePath(obj, pathObj('a', 'b'))).toBe(true);
        expect(Utils.removePath(obj, pathObj('a', 'z'))).toBe(false);
        expect(Utils.getPathPointer(5, pathObj('a'))).toEqual([]);
    });

    test('setPathValue and getPathValue work with deep nested paths', () => {
        const obj = { root: {} };

        expect(Utils.setPathValue(obj, pathObj('root', 'a', 'b', 'c'), 999)).toBe(true);
        expect(Utils.getPathValue(obj, pathObj('root', 'a', 'b', 'c'))).toBe(999);
        expect(Utils.hasPath(obj, pathObj('root', 'a'))).toBe(true);
    });

    test('setPathValue respects overwrite flag on existing paths', () => {
        const obj = { a: { b: 1 } };

        expect(Utils.setPathValue(obj, pathObj('a', 'b'), 2, { overwrite: true })).toBe(true);
        expect(obj.a.b).toBe(2);

        expect(Utils.setPathValue(obj, pathObj('a', 'b'), 3, { overwrite: false })).toBe(false);
        expect(obj.a.b).toBe(2);
    });

    test('setPathValue respects create flag when intermediate paths missing', () => {
        const obj = { root: {} };

        expect(Utils.setPathValue(obj, pathObj('root', 'x', 'y'), 10, { create: true })).toBe(true);
        expect(obj.root.x.y).toBe(10);

        const obj2 = { root: {} };
        expect(Utils.setPathValue(obj2, pathObj('root', 'z', 'w'), 20, { create: false })).toBe(false);
        expect(obj2.root.z).toBeUndefined();
    });

    test('removePath handles deep nested paths', () => {
        const obj = {
            a: {
                b: {
                    c: 1,
                    d: 2
                }
            }
        };

        expect(Utils.removePath(obj, pathObj('a', 'b', 'c'))).toBe(true);
        expect(obj.a.b).toEqual({ d: 2 });
    });

    test('hasPath returns false for paths through non-objects', () => {
        const obj = { a: 1 };

        expect(Utils.hasPath(obj, pathObj('a', 'b'))).toBe(false);
    });
});

describe('Utils string utilities', () => {
    test('padLeft and padRight pad correctly', () => {
        expect(Utils.padLeft('7', 3, '0')).toBe('007');
        expect(Utils.padRight('7', 3, '0')).toBe('700');
    });

    test('generateCheckDigit and validateWithCheckDigit work together', () => {
        const checkDigit = Utils.generateCheckDigit('12');
        expect(checkDigit).toBe(6);
        expect(Utils.validateWithCheckDigit('126')).toBe(true);
        expect(Utils.validateWithCheckDigit('127')).toBe(false);
    });

    test('splitOnDelims, escapeForRegex, replaceChars, and regexMatch handle delimiters', () => {
        expect(Utils.splitOnDelims('a,b;;c', ',;')).toEqual(['a', 'b', 'c']);
        expect(Utils.escapeForRegex('a+b?')).toBe('a\\+b\\?');
        expect(Utils.replaceChars('a-b/c', '-/', '_')).toBe('a_b_c');

        const strict = Utils.regexMatch('12-34', ['\\d{2}', '\\d{2}'], {
            allowedDelims: '-',
            delim: '-',
            allowLooseFormat: false
        });
        expect(strict).not.toBeNull();
        expect(strict[0]).toBe('1234');

        const loose = Utils.regexMatch('12 34', /(\d{2})(\d{2})/, {
            allowedDelims: ' ',
            delim: '-',
            allowLooseFormat: true
        });
        expect(loose).not.toBeNull();
        expect(loose[0]).toBe('1234');
    });
});

describe('Utils date utilities', () => {
    test('areDayAndDateValid and isLeapYear validate dates', () => {
        expect(Utils.isLeapYear(2024)).toBe(true);
        expect(Utils.isLeapYear(2023)).toBe(false);
        expect(Utils.areDayAndDateValid({ YYYY: 2024, MM: 2, DD: 29 })).toBe(true);
        expect(Utils.areDayAndDateValid({ YYYY: 2023, MM: 2, DD: 29 })).toBe(false);
    });

    test('parseDateFromHuman parses common formats and rejects invalid input', () => {
        const parsed = Utils.parseDateFromHuman('1/5/2024');
        expect(parsed).not.toBeNull();
        expect(parsed.parsed.YYYY).toBe(2024);
        expect(parsed.parsed.MM).toBe(1);
        expect(parsed.parsed.DD).toBe(5);
        expect(parsed.parsed.HH).toBeUndefined();

        expect(Utils.parseDateFromHuman('')).toBeNull();
        expect(Utils.parseDateFromHuman('31/31/2024')).toBeNull();
    });

    test('parseDateFromIso parses valid ISO and rejects invalid ISO', () => {
        const parsed = Utils.parseDateFromIso('2024-01-05T23:59:58.123Z');
        expect(parsed).not.toBeNull();
        expect(parsed.parsed.YYYY).toBe(2024);
        expect(parsed.parsed.MM).toBe(1);
        expect(parsed.parsed.DD).toBe(5);
        expect(parsed.parsed.Z).toBe('Z');

        expect(Utils.parseDateFromIso('2024-02-30')).toBeNull();
        expect(Utils.parseDateFromIso('')).toBeNull();
    });

    test('parseDateFromIsoOrdinal and parseDateFromIsoWeek parse valid values', () => {
        const ordinal = Utils.parseDateFromIsoOrdinal('2024-060');
        expect(ordinal).not.toBeNull();
        expect(ordinal.parsed.DDD).toBe(60);
        expect(Utils.parseDateFromIsoOrdinal('2023-366')).toBeNull();

        const week = Utils.parseDateFromIsoWeek('2024-W01-1');
        expect(week).not.toBeNull();
        expect(week.parsed.ww).toBe(1);
        expect(week.parsed.D).toBe(1);
        expect(Utils.parseDateFromIsoWeek('2021-W53-1')).toBeNull();
    });

    test('parseDateFromTimestamp and parseDate select correct type', () => {
        const timestampResult = Utils.parseDateFromTimestamp(1704067200000);
        expect(timestampResult).not.toBeNull();

        expect(Utils.parseDateFromTimestamp('1704067200000')).toBeNull();

        const objectDate = new Date('2024-01-01T00:00:00Z');
        expect(Utils.parseDate(objectDate).type).toBe(DATE_TYPES.OBJECT);
        expect(Utils.parseDate(1704067200000, [DATE_TYPES.TIMESTAMP]).type).toBe(DATE_TYPES.TIMESTAMP);
        expect(Utils.parseDate('2024-01-01', [DATE_TYPES.ISO]).type).toBe(DATE_TYPES.ISO);
        expect(Utils.parseDate('not-a-date')).toBeNull();
    });
});

describe('Utils number utilities', () => {
    test('getSign handles negatives including negative zero', () => {
        expect(Utils.getSign(-1)).toBe(-1);
        expect(Utils.getSign(-0)).toBe(-1);
        expect(Utils.getSign(0)).toBe(1);
        expect(Utils.getSign(10)).toBe(1);
    });

    test('parseNumber validates conversion, safety, finiteness, and precision', () => {
        expect(Utils.parseNumber('10')).toBe(10);
        expect(Utils.parseNumber('10.00')).toBe(10);
        expect(Utils.parseNumber('10.10')).toBeNull();
        expect(Utils.parseNumber('10.10', { preservePrecision: false })).toBe(10.1);
        expect(Utils.parseNumber('abc')).toBeNull();
        expect(Utils.parseNumber(Infinity)).toBeNull();
        expect(Utils.parseNumber(Number.MAX_SAFE_INTEGER + 1)).toBeNull();
    });
});
