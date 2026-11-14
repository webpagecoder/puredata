'use strict';

import { Path } from '../lib/Path.ts';

describe('Path', () => {
    describe('construction and parsing', () => {
        it('defaults to self path', () => {
            const path = new Path();

            expect(path.toString()).toBe('.');
            expect(path.isSelf).toBe(true);
            expect(path.isAbsolute).toBe(false);
            expect(path.upCount).toBe(0);
            expect(path.keys).toEqual([]);
        });

        it('parses absolute paths and skips empty/self segments', () => {
            const path = new Path('/users/./john//profile');

            expect(path.isAbsolute).toBe(true);
            expect(path.keys).toEqual(['users', 'john', 'profile']);
            expect(path.toString()).toBe('/users/john/profile');
        });

        it('normalizes parent traversals in relative paths', () => {
            const path = new Path('../../a/b/../c');

            expect(path.isAbsolute).toBe(false);
            expect(path.upCount).toBe(2);
            expect(path.keys).toEqual(['a', 'c']);
            expect(path.toString()).toBe('../../a/c');
        });

        it('does not traverse above root for absolute paths', () => {
            const path = new Path('/a/../../b');

            expect(path.toString()).toBe('/b');
            expect(path.keys).toEqual(['b']);
            expect(path.upCount).toBe(0);
        });

        it('supports array and Path constructor inputs', () => {
            const fromArray = new Path(['a', 'b', 'c']);
            const fromPath = new Path(fromArray);

            expect(fromArray.toString()).toBe('a/b/c');
            expect(fromPath.toString()).toBe('a/b/c');
            expect(fromPath.equals(fromArray)).toBe(true);
        });
    });

    describe('navigation helpers', () => {
        it('parent resolves to parent for relative and root for absolute single segment', () => {
            expect(new Path('a/b').parent().toString()).toBe('a');
            expect(new Path('/a').parent().toString()).toBe('/');
        });

        it('addSegment appends with current delimiters', () => {
            const path = new Path('a/b').addSegment('c');

            expect(path.toString()).toBe('a/b/c');
        });

        it('move appends relative targets and returns absolute targets as-is', () => {
            const base = new Path('/a/b');
            const relTarget = new Path('../c');
            const absTarget = new Path('/x/y');

            expect(base.move(relTarget).toString()).toBe('/a/c');
            expect(base.move(absTarget).toString()).toBe('/x/y');
        });
    });

    describe('comparison and conversion', () => {
        it('equals compares normalized shape rather than source formatting', () => {
            const a = new Path('a/./b/../c');
            const b = new Path('a/c');
            const c = new Path('/a/c');

            expect(a.equals(b)).toBe(true);
            expect(a.equals(c)).toBe(false);
        });

        it('toAbsolute and toRelative convert path modes', () => {
            const rel = new Path('a/b');
            const abs = rel.toAbsolute();
            const relAgain = abs.toRelative();

            expect(abs.toString()).toBe('/a/b');
            expect(relAgain.toString()).toBe('a/b');
        });

        it('toNormalizedString always uses dot/slash/up delimiters', () => {
            const custom = new Path('^.^.a.b', { self: '@', separator: '.', up: '^' });

            expect(custom.toString()).toBe('^.^.a.b');
            expect(custom.toNormalizedString()).toBe('../../a/b');
        });

        it('toString supports delimiter overrides', () => {
            const path = new Path('/a/b/c');

            expect(path.toString({ self: '@', separator: '.', up: '^' })).toBe('.a.b.c');
        });

        it('isRoot identifies root paths', () => {
            expect(new Path('/').isRoot).toBe(true);
            expect(new Path('/a').isRoot).toBe(false);
        });
    });
});

