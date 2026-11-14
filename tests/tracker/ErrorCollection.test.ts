'use strict';

import { AnyChain } from '../../lib/fields/any/AnyChain.ts';
import { ErrorCollection } from '../../lib/tracker/ErrorCollection.ts';
import { ValueTracker } from '../../lib/tracker/ValueTracker.ts';

describe('ErrorCollection', () => {
    const makeTree = () => {
        const root = new ValueTracker(new AnyChain().label('Root'), {});
        const child = root.createChild(new AnyChain().label('Child'), 'child', {});
        const grandChild = child.createChild(new AnyChain().label('Grandchild'), 'leaf', 'x');
        return { root, child, grandChild };
    };

    it('is empty when tracker tree has no errors', () => {
        const { root } = makeTree();
        const collection = new ErrorCollection(root);

        expect(collection.hasErrors).toBe(false);
        expect(collection.hasOwnErrors).toBe(false);
        expect(collection.hasChildErrors).toBe(false);
        expect(Object.keys(collection.children)).toEqual([]);
        expect(collection.errorData).toEqual({});
        expect(collection.errorMessages).toEqual({});
    });

    it('keeps own errors and includes only children that contain errors', () => {
        const root = new ValueTracker(new AnyChain(), {});
        const childWithError = root.createChild(new AnyChain(), 'a', 'x');
        root.createChild(new AnyChain(), 'b', 'y');
        childWithError.addError('any/base');

        const collection = new ErrorCollection(root);

        expect(collection.hasOwnErrors).toBe(false);
        expect(collection.hasChildErrors).toBe(true);
        expect(Object.keys(collection.children)).toEqual(['a']);
    });

    it('reports flags correctly when own errors exist', () => {
        const { root } = makeTree();
        root.addError('any/base');
        const collection = new ErrorCollection(root);

        expect(collection.hasOwnErrors).toBe(true);
        expect(collection.hasErrors).toBe(true);
        expect(collection.ownErrorData).toHaveLength(1);
        expect(collection.ownErrorData[0].errorKey).toBe('any/base');
    });

    it('flattens own and descendant errorData by tracker paths', () => {
        const { root, child, grandChild } = makeTree();
        root.addError('any/base');
        child.addError('any/defined');
        grandChild.addError('any/nullish');

        const collection = new ErrorCollection(root);
        const flattened = collection.errorData;

        expect(Object.keys(flattened).sort()).toEqual(['/', '/child', '/child/leaf']);
        expect(flattened['/'][0].errorKey).toBe('any/base');
        expect(flattened['/child'][0].errorKey).toBe('any/defined');
        expect(flattened['/child/leaf'][0].errorKey).toBe('any/nullish');
    });

    it('collects childErrorData without own errors', () => {
        const { root, child, grandChild } = makeTree();
        child.addError('any/defined');
        grandChild.addError('any/null');

        const collection = new ErrorCollection(root);
        const flattened = collection.childErrorData;

        expect(flattened['/child'][0].errorKey).toBe('any/defined');
        expect(flattened['/child/leaf'][0].errorKey).toBe('any/null');
        expect(flattened['/']).toBeUndefined();
    });

    it('returns ownErrorMessages and flattened errorMessages', () => {
        const { root, child } = makeTree();
        root.addError('any/base');
        child.addError('any/notEquals', { comparison: 'match' });

        const collection = new ErrorCollection(root);

        expect(collection.ownErrorMessages).toEqual(['Invalid value']);
        expect(collection.errorMessages['/']).toEqual(['Invalid value']);
        expect(collection.errorMessages['/child'][0]).toContain('match');
    });

    it('returns childErrorMessages excluding own path messages', () => {
        const { root, child } = makeTree();
        root.addError('any/base');
        child.addError('any/required');

        const collection = new ErrorCollection(root);
        const childMessages = collection.childErrorMessages;

        expect(childMessages['/']).toBeUndefined();
        expect(childMessages['/child'][0]).toBe('Is required');
    });

    it('byPath resolves absolute and relative collection nodes', () => {
        const { root, child, grandChild } = makeTree();
        child.addError('any/base');
        grandChild.addError('any/required');

        const collection = new ErrorCollection(root);
        const childCollection = collection.byPath('/child') as ErrorCollection;
        const leafCollection = childCollection.byPath('./leaf') as ErrorCollection;
        const rootFromLeaf = leafCollection.byPath('/'); // absolute from anywhere

        expect(childCollection).toBeInstanceOf(ErrorCollection);
        expect(leafCollection).toBeInstanceOf(ErrorCollection);
        expect(rootFromLeaf).toBe(collection);
        expect(leafCollection.ownErrorData[0].errorKey).toBe('any/required');
    });

    it('byPath supports deep relative traversal with self and up segments', () => {
        const root = new ValueTracker(new AnyChain(), {});
        const level1 = root.createChild(new AnyChain(), 'level1', {});
        const level2 = level1.createChild(new AnyChain(), 'level2', {});
        const level3 = level2.createChild(new AnyChain(), 'level3', {});
        const side = level1.createChild(new AnyChain(), 'side', 'x');

        level3.addError('any/base');
        side.addError('any/required');

        const collection = new ErrorCollection(root);
        const level3Collection = collection.byPath('/level1/level2/level3') as ErrorCollection;
        const selfFromLevel3 = level3Collection.byPath('.');
        const parentFromLevel3 = level3Collection.byPath('..');
        const sideFromLevel3 = level3Collection.byPath('../.././side');
        const level3FromSide = (sideFromLevel3 as ErrorCollection).byPath('../level2/./level3');

        expect(selfFromLevel3).toBe(level3Collection);
        expect(parentFromLevel3).toBe(collection.byPath('/level1/level2'));
        expect(sideFromLevel3).toBe(collection.byPath('/level1/side'));
        expect(level3FromSide).toBe(level3Collection);
    });

    it('byPath returns null for missing paths', () => {
        const { root } = makeTree();
        const collection = new ErrorCollection(root);

        expect(collection.byPath('/missing')).toBeNull();
    });
});
