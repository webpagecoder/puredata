'use strict';

import { PubSub } from '../../lib/pub-sub/PubSub.ts';

describe('PubSub', () => {
    it('creates, stores, and returns nodes by key', () => {
        const pubSub = new PubSub();
        const node = pubSub.createNode('a');

        expect(pubSub.getNode('a')).toBe(node);
        expect(pubSub.getNode('missing')).toBeNull();
    });

    it('rejects duplicate node keys', () => {
        const pubSub = new PubSub();
        pubSub.createNode('a');

        expect(() => pubSub.createNode('a')).toThrow('Cannot create node - the key already exists');
    });

    it('links nodes in dependency order and executes publisher before subscriber', () => {
        const pubSub = new PubSub();
        const order: string[] = [];
        const a = pubSub.createNode('a', () => {
            order.push('a');
            return true;
        });
        const b = pubSub.createNode('b', () => {
            order.push('b');
            return true;
        });

        pubSub.linkNodes(a, b);
        pubSub.execute();

        expect(order).toEqual(['a', 'b']);
    });

    it('passes execution context to each callback', () => {
        const pubSub = new PubSub();
        const seen: unknown[] = [];
        pubSub.createNode('a', (context) => {
            seen.push(context?.value);
            return true;
        });
        pubSub.createNode('b', (context) => {
            seen.push(context?.value);
            return true;
        });

        pubSub.execute({ value: 123 });

        expect(seen).toEqual([123, 123]);
    });

    it('invalidates cached execution order when graph links change', () => {
        const pubSub = new PubSub();
        const firstRun: string[] = [];
        const secondRun: string[] = [];
        const a = pubSub.createNode('a', () => {
            firstRun.push('a');
            secondRun.push('a');
            return true;
        });
        const b = pubSub.createNode('b', () => {
            firstRun.push('b');
            secondRun.push('b');
            return true;
        });

        pubSub.execute();
        expect(firstRun).toEqual(['a', 'b']);

        firstRun.length = 0;
        secondRun.length = 0;
        pubSub.linkNodes(b, a);
        pubSub.execute();

        expect(secondRun).toEqual(['b', 'a']);
    });

    it('detects direct circular dependencies', () => {
        const pubSub = new PubSub();
        const a = pubSub.createNode('a');
        const b = pubSub.createNode('b');

        pubSub.linkNodes(a, b);
        expect(() => pubSub.linkNodes(b, a)).toThrow('Circular pub/sub detected: b -> a');
    });

    it('detects deep circular dependencies', () => {
        const pubSub = new PubSub();
        const a = pubSub.createNode('a');
        const b = pubSub.createNode('b');
        const c = pubSub.createNode('c');

        pubSub.linkNodes(a, b);
        pubSub.linkNodes(b, c);
        expect(() => pubSub.linkNodes(c, a)).toThrow('Circular pub/sub detected: c -> a');
    });

    it('supports multi-level execution ordering', () => {
        const pubSub = new PubSub();
        const order: string[] = [];
        const root = pubSub.createNode('root', () => {
            order.push('root');
            return true;
        });
        const middle = pubSub.createNode('middle', () => {
            order.push('middle');
            return true;
        });
        const leaf = pubSub.createNode('leaf', () => {
            order.push('leaf');
            return true;
        });

        pubSub.linkNodes(root, middle);
        pubSub.linkNodes(middle, leaf);
        pubSub.execute();

        expect(order).toEqual(['root', 'middle', 'leaf']);
    });
});

