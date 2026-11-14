'use strict';

import { Node } from '../../lib/pub-sub/Node.ts';

describe('Node', () => {
    it('stores key and starts with no children', () => {
        const node = new Node('alpha');

        expect(node.key).toBe('alpha');
        expect(node.children.size).toBe(0);
    });

    it('uses a default callback that returns true', () => {
        const node = new Node('alpha');

        expect(node.callback()).toBe(true);
    });

    it('setCallback replaces the callback used by the node', () => {
        const node = new Node('alpha');
        node.setCallback(() => false);

        expect(node.callback()).toBe(false);
    });
});

