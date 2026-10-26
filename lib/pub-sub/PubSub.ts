'use strict';

import { Node, NodeCallback } from './Node.ts';

/** Data supplied to callbacks during a pub/sub execution. */
export type PubSubContext = Record<string, unknown>;

/** Manages a dependency graph and executes its nodes in dependency order. */
class PubSub {

    /** Nodes indexed by key. */
    private _nodes: Map<unknown, Node>;

    /** Nodes that have no parent dependencies. */
    private _roots: Set<Node>;

    /** Cached traversal order, invalidated when the graph changes. */
    private _cachedExecutionOrder: Set<Node> | null;

    /** Creates an empty pub/sub graph. */
    constructor() {
        this._nodes = new Map<unknown, Node>();
        this._roots = new Set<Node>();
        this._cachedExecutionOrder = null;
    }

    /**
     * Creates and registers a root node.
     *
     * @param key Unique key for the node.
     * @param callback Callback invoked when the node executes.
     * @returns The newly created node.
     * @throws {@link Error} If the key is already registered.
     */
    public createNode(key: unknown, callback?: NodeCallback): Node {
        const { _nodes: nodes, _roots: roots } = this;
        if (nodes.has(key)) {
            throw new Error('Cannot create node - the key already exists');
        }
        const node = new Node(key, callback);
        nodes.set(key, node);
        roots.add(node);
        this._cachedExecutionOrder = null;
        return node;
    }

    /** Gets a node by key, or `null` if no node is registered with that key. */
    public getNode(key: unknown): Node | null {
        const { _nodes: nodes } = this;
        return nodes.get(key) || null;
    }

    /**
     * Links a publisher node to a subscriber node.
     *
     * @param pubNode Node that must execute before the subscriber.
     * @param subNode Dependent node to link.
     * @throws {@link Error} If the link would create a cycle.
     */
    public linkNodes(pubNode: Node, subNode: Node): void {

        let stack: Node[] = [...subNode.children];
        while (stack.length) {
            const nextStack: Node[] = [];
            for (const node of stack) {
                if (node === pubNode) {
                    throw new Error(`Circular pub/sub detected: ${pubNode.key} -> ${subNode.key}`);
                }
                for (const child of node.children) {
                    nextStack.push(child);
                }
            }
            stack = nextStack;
        }

        pubNode.children.add(subNode);
        this._roots.delete(subNode);
        this._cachedExecutionOrder = null;
    }

    /**
     * Executes every node in dependency order.
     *
     * @param context Data passed to each node callback.
     */
    public execute(context: PubSubContext = {}): void {

        if (!this._cachedExecutionOrder) {
            const executionOrder = new Set<Node>(this._roots);
            let curLevelNodes: Node[] = [...this._roots];
            while (curLevelNodes.length > 0) {
                const nextLevel: Node[] = [];
                for (const node of curLevelNodes) {
                    for (const child of node.children) {
                        executionOrder.delete(child);
                        executionOrder.add(child);
                        nextLevel.push(child);
                    }
                }
                curLevelNodes = nextLevel;
            }
            this._cachedExecutionOrder = executionOrder;
        }

        for (const node of this._cachedExecutionOrder) {
            node.callback(context);
        }
    }
}

export { PubSub };
