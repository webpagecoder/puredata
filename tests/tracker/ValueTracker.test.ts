'use strict';

import { AnyChain } from '../../lib/fields/any/AnyChain.ts';
import { ErrorCollection } from '../../lib/tracker/ErrorCollection.ts';
import { ValueTracker } from '../../lib/tracker/ValueTracker.ts';

describe('ValueTracker', () => {
    it('initializes with defaults and exposes raw/value state', () => {
        const field = new AnyChain();
        const tracker = new ValueTracker(field, 42);

        expect(tracker.field).toBe(field);
        expect(tracker.nestDepth).toBe(0);
        expect(tracker.nestRoot).toBeNull();
        expect(tracker.path.toString()).toBe('/');
        expect(tracker.rawValue).toBe(42);
        expect(tracker.value).toBe(42);
        expect(tracker.pass).toBe(true);
    });

    it('createChild registers a child tracker and assigns a nested path', () => {
        const root = new ValueTracker(new AnyChain(), { child: 'x' });
        const childField = new AnyChain();
        const child = root.createChild(childField, 'child', 'x');

        expect(root.children.child).toBe(child);
        expect(child.field).toBe(childField);
        expect(child.path.toString()).toBe('/child');
        expect(child.rawValue).toBe('x');
        expect(child.value).toBe('x');
    });

    it('setValue updates existing children from object keys and clears on non-objects', () => {
        const root = new ValueTracker(new AnyChain(), { a: 1, b: 2 });
        const childA = root.createChild(new AnyChain(), 'a', 1);
        const childB = root.createChild(new AnyChain(), 'b', 2);

        root.setValue({ a: 10 });
        expect(childA.value).toBe(10);
        expect(childB.value).toBe(undefined);

        root.setValue('not-an-object');
        expect(childA.value).toBe(undefined);
        expect(childB.value).toBe(undefined);
    });

    it('hasValue reflects leaf and descendant values', () => {
        const leafUndefined = new ValueTracker(new AnyChain(), undefined);
        const leafDefined = new ValueTracker(new AnyChain(), null);
        const root = new ValueTracker(new AnyChain(), {});
        root.createChild(new AnyChain(), 'a', undefined);
        root.createChild(new AnyChain(), 'b', 'present');

        expect(leafUndefined.hasValue).toBe(false);
        expect(leafDefined.hasValue).toBe(true);
        expect(root.hasValue).toBe(true);
    });

    it('composes object value from children and omits undefined child values', () => {
        const root = new ValueTracker(new AnyChain(), { keep: true, a: 1, b: 2 });
        const childA = root.createChild(new AnyChain(), 'a', 1);
        const childB = root.createChild(new AnyChain(), 'b', 2);

        childA.setValue(99);
        childB.setValue(undefined);

        expect(root.value).toEqual({ keep: true, a: 99 });
    });

    it('addError records formatted metadata and supports array argument formatting', () => {
        const field = new AnyChain().label('Payload');
        const tracker = new ValueTracker(field, 'x');
        tracker.path = tracker.path.addSegment('item');

        tracker.addError('any/anyOf', { allowedValues: ['a', 'b', 'c'] });

        expect(tracker.ownErrors).toHaveLength(1);
        expect(tracker.ownErrors[0]).toMatchObject({
            errorKey: 'any/anyOf',
            key: 'item',
            label: 'Payload',
            path: '/item',
            value: 'x',
            args: { allowedValues: ['a', 'b', 'c'] },
        });
        expect(tracker.ownErrors[0].message).toContain('a, b, c');
    });

    it('throws when addError is called without a configured field', () => {
        const tracker = new ValueTracker(new AnyChain(), 'x');
        (tracker as unknown as { field: null }).field = null;

        expect(() => tracker.addError('any/base')).toThrow('ValueTracker field is not configured');
    });

    it('tracks own and descendant failures through hasErrors/fail/pass', () => {
        const root = new ValueTracker(new AnyChain(), {});
        const child = root.createChild(new AnyChain(), 'child', 'x');

        expect(root.hasErrors).toBe(false);
        expect(root.fail).toBe(false);
        expect(root.pass).toBe(true);

        child.addError('any/base');
        expect(root.hasErrors).toBe(true);
        expect(root.fail).toBe(true);
        expect(root.pass).toBe(false);
    });

    it('setPass clears only own errors and setFail replaces them', () => {
        const root = new ValueTracker(new AnyChain(), {});
        const child = root.createChild(new AnyChain(), 'child', 'x');
        root.addError('any/base');
        child.addError('any/defined');

        root.setPass();
        expect(root.hasOwnErrors).toBe(false);
        expect(root.hasErrors).toBe(true);

        root.setFail('any/notEquals', { comparison: 'y' });
        expect(root.ownErrors).toHaveLength(1);
        expect(root.ownErrors[0].errorKey).toBe('any/notEquals');
        expect(root.ownErrors[0].message).toContain('y');
    });

    it('cloneWithoutErrors deep-clones structure and value state without copying errors', () => {
        const root = new ValueTracker(new AnyChain(), { a: 1 });
        root.nestDepth = 2;
        root.nestRoot = root;
        const child = root.createChild(new AnyChain(), 'a', 1);
        root.addError('any/base');
        child.addError('any/defined');

        const clone = root.cloneWithoutErrors();

        expect(clone).not.toBe(root);
        expect(clone.path).toBe(root.path);
        expect(clone.field).toBe(root.field);
        expect(clone.nestDepth).toBe(2);
        expect(clone.nestRoot).toBe(root);
        expect(clone.rawValue).toEqual({ a: 1 });
        expect(clone.value).toEqual({ a: 1 });
        expect(clone.ownErrors).toHaveLength(0);
        expect((clone.children.a as ValueTracker).ownErrors).toHaveLength(0);
    });

    it('errors getter returns a fresh ErrorCollection snapshot', () => {
        const tracker = new ValueTracker(new AnyChain(), 'x');
        tracker.addError('any/base');

        const errors1 = tracker.errors;
        const errors2 = tracker.errors;

        expect(errors1).toBeInstanceOf(ErrorCollection);
        expect(errors2).toBeInstanceOf(ErrorCollection);
        expect(errors1).not.toBe(errors2);
        expect(errors1.hasErrors).toBe(true);
    });
});

