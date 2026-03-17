'use strict';

import { Node, NodeCallback } from './Node.ts';

export type PubSubContext = Record<string, unknown>;

type PubSubNode = {
    key: unknown;
    callback: NodeCallback;
    children: Set<PubSubNode>;
};

class PubSub {
    static _internalId: number = 0;

    id: symbol;
    internalId: number;
    nodes: Map<unknown, PubSubNode>;
    roots: Set<PubSubNode>;
    _cachedExecutionOrder: Set<PubSubNode> | null;

    constructor() {
        this.id = Symbol();
        this.internalId = ++PubSub._internalId;
        this.nodes = new Map<unknown, PubSubNode>();
        this.roots = new Set<PubSubNode>();
        this._cachedExecutionOrder = null;
    }

    createNode(key: unknown, callback?: NodeCallback): PubSubNode {
        const { nodes, roots } = this;
        if (nodes.has(key)) {
            throw new Error('Cannot create node - the key already exists');
        }
        const finalCallback: NodeCallback = callback || ((_: PubSubContext = {}): unknown => true);
        const node = new Node(key, finalCallback as unknown as () => boolean) as unknown as PubSubNode;
        nodes.set(key, node);
        roots.add(node);
        this._cachedExecutionOrder = null;
        return node;
    }

    getOrCreateNode(key: unknown, callback?: NodeCallback): PubSubNode {
        const node = this.nodes.get(key);
        if (!node) {
            return this.createNode(key, callback);
        }
        if (callback) {
            node.callback = callback;
        }
        return node;
    }

    getNode(key: unknown): PubSubNode | null {
        const { nodes } = this;
        return nodes.get(key) || null;
    }

    hasNode(key: unknown): boolean {
        return this.nodes.has(key);
    }

    linkNodes(pubNode: PubSubNode, subNode: PubSubNode): void {

        let stack: PubSubNode[] = [...subNode.children];
        while (stack.length) {
            const nextStack: PubSubNode[] = [];
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
        this.roots.delete(subNode);
        this._cachedExecutionOrder = null;
    }

    execute(context: PubSubContext = {}): void {
        const { _cachedExecutionOrder } = this;

        if (!_cachedExecutionOrder) {

            const executionOrder = new Set<PubSubNode>(this.roots);
            let curLevelNodes: PubSubNode[] = [...this.roots];

            while (curLevelNodes.length > 0) {
                const nextLevel: PubSubNode[] = [];
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

        if (!this._cachedExecutionOrder) {
            return;
        }

        for (const node of this._cachedExecutionOrder) {
            node.callback(context);
        }

    }
}

export { PubSub };
