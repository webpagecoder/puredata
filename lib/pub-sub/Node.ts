'use strict';

import { PubSubContext } from './PubSub.ts';

/** Callback invoked when a pub/sub node is executed. */
export type NodeCallback = (context?: PubSubContext) => boolean;

/** A node in a pub/sub dependency graph. */
class Node {

    /** Key identifying this node within its pub/sub instance. */
    private _key: unknown;

    /** Callback invoked when this node executes. */
    private _callback: NodeCallback;

    /** Nodes that depend on this node. */
    private _children: Set<Node>;

    /**
     * Creates a node with a key and optional callback.
     *
     * @param key Identifier for the node.
     * @param callback Function invoked when the node executes.
     */
    public constructor(key: unknown, callback: NodeCallback = (_context?: PubSubContext) => true) {
        this._key = key;
        this._callback = callback;
        this._children = new Set<Node>();
    }

    /** Gets the node's callback. */
    public get callback() {
        return this._callback;
    }

    /** Gets the nodes that depend on this node. */
    public get children() {
        return this._children;
    }
    
    /** Gets the node's key. */
    public get key() {
        return this._key;
    }

    /** Replaces the callback invoked when this node executes. */
    public setCallback(callback: NodeCallback): void {
        this._callback = callback;
    }
}

export { Node };
