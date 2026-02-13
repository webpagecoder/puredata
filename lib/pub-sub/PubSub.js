'use strict';

import Node  from './Node.js';

class PubSub {
    static _internalId = 0;

    constructor() {
        this.id = Symbol();
        this.internalId = ++PubSub._internalId;
        this.nodes = new Map();
        this.roots = new Set();
        this._cachedExecutionOrder = null;
    }

    createNode(key, callback) {
        const { nodes, roots } = this;
        if (nodes.has(key)) {
            throw new Error('Cannot create node - the key already exists');
        }
        const node = new Node(key, callback);
        nodes.set(key, node);
        roots.add(node);
        return node;
    }

    getOrCreateNode(key, callback) {
        const node = this.nodes.get(key);
        if (!node) {
            return this.createNode(key, callback);
        }
        if (callback) {
            node.callback = callback;
        }
        return node;
    }

    getNode(key) {
        const { nodes } = this;
        return nodes.has(key) ? nodes.get(key) : null;
    }

    hasNode(key) {
        return this.nodes.has(key);
    }

    linkNodes(pubNode, subNode) {

        let stack = [...subNode.children];
        while (stack.length) {
            const nextStack = [];
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

    // assertNotCircular(key) {
    //     const { pairs } = this;
    //     let stack = [key];
    //     while (stack.length) {
    //         let curKey = stack.pop();

    //         const nextKeys = []
    //         for (const [pubKey, subKey] of pairs) {
    //             if (pubKey === curKey) {
    //                 nextKeys.push(subKey);
    //             }
    //         }

    //         for (const nextKey of nextKeys) {
    //             if (nextKey === key) {
    //                 throw new Error(`Circular pub/sub detected: ${key} <=> ${curKey}`);
    //             }
    //         }
    //         stack = nextKeys;
    //     }
    // }

    execute(context = {}) {
        const { _cachedExecutionOrder } = this;

        if (!_cachedExecutionOrder) {

            const executionOrder = new Set(this.roots);
            let curLevelNodes = [...this.roots];

            while (curLevelNodes.length > 0) {
                let nextLevel = [];
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

export default  PubSub;
