'use strict';

import { PubSubContext } from './PubSub.ts';

export type NodeCallback = (context?: PubSubContext) => boolean;

class Node {

    protected _key: unknown;
    protected _callback: NodeCallback;
    protected _children: Set<Node>;

    public constructor(key: unknown, callback: NodeCallback = (_context?: PubSubContext) => true) {
        this._key = key;
        this._callback = callback;
        this._children = new Set<Node>();
    }

    public get callback() {
        return this._callback;
    }

    public get children() {
        return this._children;
    }
    
    public get key() {
        return this._key;
    }

    public setCallback(callback: NodeCallback): void {
        this._callback = callback;
    }
}

export { Node };
