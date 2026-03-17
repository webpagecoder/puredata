'use strict';

import { PubSubContext } from './PubSub.ts';

export type NodeCallback = (context?: PubSubContext) => unknown;

class Node {

    key: unknown;
    callback: NodeCallback;
    children: Set<Node>;

    constructor(key: unknown, callback: NodeCallback = (_context: PubSubContext = {}): unknown => true) {
        this.key = key;
        this.callback = callback;
        this.children = new Set<Node>();
    }
}

export { Node };
