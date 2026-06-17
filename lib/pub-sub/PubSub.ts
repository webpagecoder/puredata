'use strict';

import { Node, NodeCallback } from './Node.ts';

export type PubSubContext = Record<string, unknown>;

class PubSub {

    protected _nodes: Map<unknown, Node>;
    protected _roots: Set<Node>;
    protected _cachedExecutionOrder: Set<Node> | null;

    constructor() {
        this._nodes = new Map<unknown, Node>();
        this._roots = new Set<Node>();
        this._cachedExecutionOrder = null;
    }

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

    public getNode(key: unknown): Node | null {
        const { _nodes: nodes } = this;
        return nodes.get(key) || null;
    }

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
