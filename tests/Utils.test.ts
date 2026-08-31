'use strict';

import { NumberChain } from '../lib/fields/number/NumberChain.ts';
import { Path } from '../lib/Path.ts';
import { Utils } from '../lib/Utils.ts';


describe('General Utils', () => {
    it('areEqual', () => {
        expect(Utils.areEqual(1, 1)).toBe(true);
        expect(Utils.areEqual(1, 2)).toBe(false);
        expect(Utils.areEqual('abc', 'abc')).toBe(true);
        expect(Utils.areEqual('abc', 'ab')).toBe(false);

        expect(Utils.areEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(Utils.areEqual([1, 2, 3], [1, 2])).toBe(false);
        expect(Utils.areEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
        expect(Utils.areEqual([1, [2, 3]], [1, [3, 2]])).toBe(false);

        expect(Utils.areEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
        expect(Utils.areEqual({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true);
        expect(Utils.areEqual({ a: { b: 2 } }, { a: { b: 3 } })).toBe(false);
        expect(Utils.areEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
        expect(Utils.areEqual({ a: 1 }, { b: 1 })).toBe(false);

        expect(Utils.areEqual(null, null)).toBe(true);
        expect(Utils.areEqual(null, {})).toBe(false);
        expect(Utils.areEqual(undefined, undefined)).toBe(true);

        const chain = new NumberChain().between(1, 3);
        expect(Utils.areEqual(chain, 2)).toBe(true);
        expect(Utils.areEqual(chain, 4)).toBe(false);
        expect(Utils.areEqual(2, chain)).toBe(true);
        expect(Utils.areEqual(4, chain)).toBe(false);

        const evenChain = new NumberChain().even();
        expect(Utils.areEqual(evenChain, 2)).toBe(true);
        expect(Utils.areEqual(evenChain, 3)).toBe(false);

        const gtChain = new NumberChain().greaterThan(10);
        expect(Utils.areEqual(gtChain, 11)).toBe(true);
        expect(Utils.areEqual(gtChain, 10)).toBe(false);

        const intChain = new NumberChain().integer();
        expect(Utils.areEqual(intChain, 5)).toBe(true);
        expect(Utils.areEqual(intChain, 5.5)).toBe(false);

        const sameLogicDifferentInstancesA = new NumberChain().between(1, 3);
        const sameLogicDifferentInstancesB = new NumberChain().between(1, 3);
        expect(Utils.areEqual(sameLogicDifferentInstancesA, sameLogicDifferentInstancesB)).toBe(false);

        expect(Utils.areEqual(chain, null)).toBe(false);
        expect(Utils.areEqual(undefined, chain)).toBe(false);

    });

    it('clone', () => {
        expect(Utils.clone(5)).toBe(5);
        expect(Utils.clone('abc')).toBe('abc');
        expect(Utils.clone(null)).toBeNull();

        const source = {
            a: 1,
            b: {
                c: [1, { d: 2 }]
            }
        };
        const cloned = Utils.clone(source);

        expect(cloned).toEqual(source);
        expect(cloned).not.toBe(source);
        expect(cloned.b).not.toBe(source.b);
        expect(cloned.b.c).not.toBe(source.b.c);
        expect((cloned.b.c[1] as Record<string, unknown>)).not.toBe(source.b.c[1]);

        const arrSource = [{ x: 1 }, [2, 3]];
        const arrCloned = Utils.clone(arrSource);
        expect(arrCloned).toEqual(arrSource);
        expect(arrCloned).not.toBe(arrSource);
        expect(arrCloned[0]).not.toBe(arrSource[0]);
        expect(arrCloned[1]).not.toBe(arrSource[1]);

        const sym = Symbol('s');
        const symbolSource: Record<PropertyKey, unknown> = { plain: 1, [sym]: 'secret' };
        const symbolCloned = Utils.clone(symbolSource) as Record<PropertyKey, unknown>;
        expect(symbolCloned).toEqual(symbolSource);
        expect(symbolCloned[sym]).toBe('secret');
        expect(symbolCloned).not.toBe(symbolSource);
    });

});




describe('Object based utils', () => {

    it('getDepth', () => {
        expect(Utils.getDepth({})).toBe(1);
        expect(Utils.getDepth({ a: 1 })).toBe(1);
        expect(Utils.getDepth({ a: { b: 1 } })).toBe(2);
        expect(Utils.getDepth({ a: { b: { c: 1 } }, d: 2 })).toBe(3);
        expect(Utils.getDepth({
            a: { b: { c: 1 } },
            x: 1,
            y: { z: 2 },
            m: { n: { o: { p: 3 } } }
        })).toBe(4);

        expect(Utils.getDepth({ a: { b: 1 } }, 2)).toBe(2);
        expect(Utils.getDepth({ a: { b: { c: 1 } } }, 2)).toBe(false);
        expect(Utils.getDepth(null as unknown as object)).toBe(0);
    });

    it('getDepthAndKeyCount', () => {
        expect(Utils.getDepthAndKeyCount({})).toEqual([1, 0]);
        expect(Utils.getDepthAndKeyCount({ a: 1, b: 2 })).toEqual([1, 2]);
        expect(Utils.getDepthAndKeyCount({ a: { b: 1 }, c: { d: 2 } })).toEqual([2, 4]);
        expect(Utils.getDepthAndKeyCount({ a: { b: { c: 1 } }, d: 2 })).toEqual([3, 4]);
        expect(Utils.getDepthAndKeyCount({
            a: { b: { c: 1 } },
            x: 1,
            y: { z: 2 },
            m: { n: { o: { p: 3 } } }
        })).toEqual([4, 10]);

        expect(Utils.getDepthAndKeyCount(
            { a: { b: { c: 1 } } },
            { maxDepth: 3 }
        )).toEqual([3, 3]);
        expect(Utils.getDepthAndKeyCount(
            { a: { b: { c: 1 } } },
            { maxDepth: 2 }
        )).toBe(false);

        expect(Utils.getDepthAndKeyCount(
            { a: 1, b: { c: 2 } },
            { maxKeyCount: 3 }
        )).toEqual([2, 3]);
        expect(Utils.getDepthAndKeyCount(
            { a: 1, b: { c: 2 } },
            { maxKeyCount: 2 }
        )).toBe(false);
    });

    it('getRecursiveKeyCount', () => {
        expect(Utils.getKeyCountRecursive({})).toBe(0);
        expect(Utils.getKeyCountRecursive({ a: 1, b: 2 })).toBe(2);
        expect(Utils.getKeyCountRecursive({ a: { b: 1 }, c: 2 })).toBe(3);
        expect(Utils.getKeyCountRecursive({ a: { b: { c: 1 } }, d: 2 })).toBe(4);
        expect(Utils.getKeyCountRecursive({
            a: { b: { c: 1 } },
            x: 1,
            y: { z: 2 },
            m: { n: { o: { p: 3 } } }
        })).toBe(10);

        expect(Utils.getKeyCountRecursive(
            { a: 1, b: { c: 2 } },
            3
        )).toBe(3);
        expect(Utils.getKeyCountRecursive(
            { a: 1, b: { c: 2 } },
            2
        )).toBe(false);
        expect(Utils.getKeyCountRecursive(
            { a: { b: { c: 1 } }, d: 2 },
            4
        )).toBe(4);
        expect(Utils.getKeyCountRecursive(
            { a: { b: { c: 1 } }, d: 2 },
            3
        )).toBe(4);
    });

    it('isObject', () => {
        expect(Utils.isObject({})).toBe(true);
        expect(Utils.isObject([])).toBe(true);
        expect(Utils.isObject(new Date())).toBe(true);

        expect(Utils.isObject(null)).toBe(false);
        expect(Utils.isObject(undefined)).toBe(false);
        expect(Utils.isObject('abc')).toBe(false);
        expect(Utils.isObject(0)).toBe(false);
        expect(Utils.isObject(false)).toBe(false);
        expect(Utils.isObject(() => 1)).toBe(false);
    });

    it('isPlainObject', () => {
        expect(Utils.isPlainObject({})).toBe(true);
        expect(Utils.isPlainObject({ a: 1 })).toBe(true);
        expect(Utils.isPlainObject(Object.create(null))).toBe(true);

        expect(Utils.isPlainObject([])).toBe(false);
        expect(Utils.isPlainObject(new Date())).toBe(false);
        expect(Utils.isPlainObject(new Map())).toBe(false);
        expect(Utils.isPlainObject(null)).toBe(false);
        expect(Utils.isPlainObject('abc')).toBe(false);

        class Custom {
            public a = 1;
        }
        expect(Utils.isPlainObject(new Custom())).toBe(false);
    });

    it('mergeObjects', () => {
        const parent = {
            a: 1,
            nested: { x: 1, keep: true },
            arr: [1, 2],
        };
        const child = {
            b: 2,
            nested: { y: 2 },
            arr: [9],
        };

        const merged = Utils.mergeObjects(parent, child) as Record<string, unknown>;

        expect(merged).toEqual({
            a: 1,
            b: 2,
            nested: { x: 1, keep: true, y: 2 },
            arr: [9],
        });

        expect(merged).not.toBe(parent);
        expect((merged.nested as Record<string, unknown>)).not.toBe(parent.nested);
        expect(merged.arr).toEqual([9]);
        expect(merged.arr).not.toBe(child.arr);

        expect(parent).toEqual({
            a: 1,
            nested: { x: 1, keep: true },
            arr: [1, 2],
        });
        expect(child).toEqual({
            b: 2,
            nested: { y: 2 },
            arr: [9],
        });
    });


});










describe('Object path utils', () => {
    it('getAllPaths', () => {
        const obj = {
            a: { b: 1, c: { d: 2 } },
            e: 3,
            f: {},
            g: [1, 2],
        };

        const defaultPaths = [...Utils.getAllPaths(obj)].map((path) => path.toString());
        expect(defaultPaths).toEqual(['a/b', 'a/c/d', 'e', 'g']);

        const includeRootsPaths = [...Utils.getAllPaths(obj, { includeRoots: true })].map((path) => path.toString());
        expect(includeRootsPaths).toEqual(['a', 'a/b', 'a/c', 'a/c/d', 'e', 'f', 'g']);

        const rootsOnlyPaths = [...Utils.getAllPaths(obj, { rootsOnly: true })].map((path) => path.toString());
        expect(rootsOnlyPaths).toEqual(['a', 'a/c', 'f']);

        expect([...Utils.getAllPaths({})].map((path) => path.toString())).toEqual([]);
    });

    it('getPathCount', () => {
        const obj = {
            a: { b: 1, c: { d: 2 } },
            e: 3,
            f: {},
            g: [1, 2],
        };

        expect(Utils.getPathCount(obj)).toBe(4);
        expect(Utils.getPathCount(obj, { includeRoots: true })).toBe(7);
        expect(Utils.getPathCount(obj, { rootsOnly: true })).toBe(3);
        expect(Utils.getPathCount({})).toBe(0);
    });

    it('getRefByPath', () => {
        const obj: Record<string, unknown> = { a: { b: 1 }, x: undefined };

        const existing = Utils.getRefByPath(obj, new Path('a/b'));
        expect(existing).not.toBeNull();
        expect(existing?.[1]).toBe('b');
        expect((existing?.[0] as Record<string, unknown>).b).toBe(1);

        const undefinedLeaf = Utils.getRefByPath(obj, new Path('x'));
        expect(undefinedLeaf).not.toBeNull();
        expect(undefinedLeaf?.[1]).toBe('x');

        expect(Utils.getRefByPath(obj, new Path('missing/path'))).toBeNull();
        expect(Utils.getRefByPath(obj, new Path(''))).toBeNull();

        const createObj: Record<string, unknown> = { a: {} };
        const created = Utils.getRefByPath(createObj, new Path('a/c'), true, false);
        expect(created).not.toBeNull();
        expect(created?.[1]).toBe('c');
        expect((createObj.a as Record<string, unknown>).c).toBeUndefined();

        const overwriteObj: Record<string, unknown> = { a: 5 };
        const overwritten = Utils.getRefByPath(overwriteObj, new Path('a/b'), true, true);
        expect(overwritten).not.toBeNull();
        expect(overwritten?.[1]).toBe('b');
        expect(overwriteObj).toEqual({ a: { b: undefined } });
    });

    it('getPathValue', () => {
        const obj: Record<string, unknown> = {
            a: { b: { c: 1 } },
            x: undefined,
            y: 2,
        };

        expect(Utils.getPathValue(obj, new Path('a/b/c'))).toBe(1);
        expect(Utils.getPathValue(obj, new Path('a/b'))).toEqual({ c: 1 });
        expect(Utils.getPathValue(obj, new Path('x'))).toBeUndefined();
        expect(Utils.getPathValue(obj, new Path('a/b/missing'))).toBeUndefined();
        expect(Utils.getPathValue(obj, new Path('y/z'))).toBeUndefined();
        expect(Utils.getPathValue(obj, new Path(''))).toBe(obj);
    });

    it('hasPath', () => {
        const obj = { a: { b: 1 }, x: undefined };

        expect(Utils.hasPath(obj, new Path('a/b'))).toBe(true);
        expect(Utils.hasPath(obj, new Path('x'))).toBe(true);
        expect(Utils.hasPath(obj, new Path('a/c'))).toBe(false);
        expect(Utils.hasPath(obj, new Path('a/b/c'))).toBe(false);
        expect(Utils.hasPath(obj, new Path(''))).toBe(false);
    });

    it('removePath', () => {
        const obj: Record<string, unknown> = {
            a: { b: 1, c: 2 },
            x: undefined,
        };

        expect(Utils.removePath(obj, new Path('a/b'))).toBe(true);
        expect(obj).toEqual({ a: { c: 2 }, x: undefined });

        expect(Utils.removePath(obj, new Path('x'))).toBe(true);
        expect(obj).toEqual({ a: { c: 2 } });

        expect(Utils.removePath(obj, new Path('a/b'))).toBe(false);
        expect(Utils.removePath(obj, new Path('missing/path'))).toBe(false);
        expect(Utils.removePath(obj, new Path(''))).toBe(false);
    });

    it('setPathValue', () => {
        const obj: Record<string, unknown> = { a: {} };

        expect(Utils.setPathValue(obj, new Path('a/b'), 5)).toBe(true);
        expect(obj).toEqual({ a: { b: 5 } });

        expect(Utils.setPathValue(obj, new Path('a/b'), 7, true, false)).toBe(false);
        expect(obj).toEqual({ a: { b: 5 } });

        expect(Utils.setPathValue(obj, new Path('a/c/d'), 1, false, true)).toBe(false);
        expect(obj).toEqual({ a: { b: 5 } });

        const obj2: Record<string, unknown> = { a: { b: undefined } };
        expect(Utils.setPathValue(obj2, new Path('a/b'), 9, true, false)).toBe(true);
        expect(obj2).toEqual({ a: { b: 9 } });

        const obj3: Record<string, unknown> = { a: 1 };
        expect(Utils.setPathValue(obj3, new Path('a/b'), 2, true, true)).toBe(true);
        expect(obj3).toEqual({ a: { b: 2 } });
    });


});










describe('String Utils', () => {
    it('escapeForRegex', () => {
        expect(Utils.escapeForRegex('a+b*c?.')).toBe('a\\+b\\*c\\?\\.');
        expect(Utils.escapeForRegex('[abc](x){y}')).toBe('\\[abc\\]\\(x\\)\\{y\\}');
        expect(Utils.escapeForRegex('plain')).toBe('plain');
    });

    it('generateCheckDigit', () => {
        expect(Utils.generateCheckDigit('12345')).toBe(6);
        expect(Utils.generateCheckDigit('1234', { reverse: true })).toBe(4);
        expect(Utils.generateCheckDigit('ABC', {
            weights: [1],
            mod: 10,
            reverse: false,
            transform: (x) => x,
        })).toBe(7);
    });

    it('padLeft', () => {
        expect(Utils.padLeft('7', 3, '0')).toBe('007');
        expect(Utils.padLeft('abc', 2, '0')).toBe('abc');
        expect(Utils.padLeft(5, 3, '0')).toBe('005');
    });

    it('padRight', () => {
        expect(Utils.padRight('7', 3, '0')).toBe('700');
        expect(Utils.padRight('abc', 2, '0')).toBe('abc');
        expect(Utils.padRight(5, 3, '0')).toBe('500');
    });

    it('regexMatch', () => {
        expect(Utils.regexMatch(
            '123-456',
            ['(\\d{3})', '(\\d{3})'],
            { acceptableDelims: '-', normalizedDelim: '-' }
        )).toEqual(['123-456', null]);

        expect(Utils.regexMatch(
            '123/456',
            ['(\\d{3})', '(\\d{3})'],
            { acceptableDelims: '-', normalizedDelim: '-' }
        )).toEqual([null, '123/456']);

        expect(Utils.regexMatch(
            '(123 456)',
            ['(\\d{3})', '(\\d{3})'],
            {
                mode: 'loose',
                acceptableDelims: ' ',
                normalizedDelim: '-',
                stripDelims: '()'
            },
            false
        )).toEqual(['123-456', null]);

        expect(Utils.regexMatch(
            '12 3456',
            ['(\\d{3})', '(\\d{3})'],
            {
                mode: 'loose',
                acceptableDelims: ' ',
                normalizedDelim: '-',
                stripDelims: '()'
            },
            false
        )).toEqual([null, '12-3456']);
    });

    it('replaceChars', () => {
        expect(Utils.replaceChars('123-45 67', '- ', '')).toBe('1234567');
        expect(Utils.replaceChars('a,b.c', ',.', '_')).toBe('a_b_c');
        expect(Utils.replaceChars('abc', 'xyz')).toBe('abc');
    });

    it('splitOnDelims', () => {
        expect(Utils.splitOnDelims('a,b; c', ',; ')).toEqual(['a', 'b', 'c']);
        expect(Utils.splitOnDelims('a---b', '-')).toEqual(['a', 'b']);
        expect(Utils.splitOnDelims('abc', '')).toEqual(['a', 'b', 'c']);
        expect(Utils.splitOnDelims('', ',')).toEqual([]);
    });

    it('validateWithCheckDigit', () => {
        const base = '7992739871';
        const checkDigit = Utils.generateCheckDigit(base);
        expect(Utils.validateWithCheckDigit(base + String(checkDigit))).toBe(true);
        expect(Utils.validateWithCheckDigit(base + String((checkDigit + 1) % 10))).toBe(false);
        expect(Utils.validateWithCheckDigit('')).toBe(false);
    });
});





describe('Number Utils', () => {
    it('parseNumber', () => {
        expect(Utils.parseNumber('42')).toBe(42);
        expect(Utils.parseNumber('42.00')).toBe(42);
        expect(Utils.parseNumber('abc')).toBeNull();

        expect(Utils.parseNumber('3.14')).toBe(3.14);
        expect(Utils.parseNumber('3.140', { preservePrecision: false })).toBe(3.14);
        expect(Utils.parseNumber('3.140', { preservePrecision: true })).toBeNull();

        expect(Utils.parseNumber('Infinity')).toBeNull();
        expect(Utils.parseNumber('Infinity', { ensureFinite: false, ensureSafe: false })).toBe(Infinity);

        expect(Utils.parseNumber(String(Number.MAX_SAFE_INTEGER + 1))).toBeNull();
        expect(Utils.parseNumber(String(Number.MAX_SAFE_INTEGER + 1), { ensureSafe: false })).toBe(Number.MAX_SAFE_INTEGER + 1);

        expect(Utils.parseNumber(12, { autoConvert: false })).toBe(12);
        expect(Utils.parseNumber('12', { autoConvert: false })).toBeNull();
    });
});


