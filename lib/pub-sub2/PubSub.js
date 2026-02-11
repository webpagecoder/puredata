'use strict';

const Node = require('./Node.js');

class PubSub {
    static _internalId = 0;

    constructor() {
        this.id = Symbol();
        this.internalId = ++PubSub._internalId;
        this.nodes = new Map();
        this.pairs = [];
        this._cachedNodeOrder = null;
    }

    createNode(key, { callback, context } = {}) {
        const { nodes } = this;
        if (nodes.has(key)) {
            throw new Error('Cannot create node - the key already exists');
        }
        const node = new Node(key, { callback, context });
        nodes.set(key, node);

        return node;
    }

    getOrCreateNode(key, { callback, context } = {}) {
        const node = this.nodes.get(key);
        if (!node) {
            return this.createNode(key, { callback, context });
        }

        if (callback) {
            node.callback = callback;
        }
        if (context) {
            node.context = context;
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

    _findKey(key) {
        const { pairs } = this;
        for (let x = 0, max = pairs.length; x < max; x++) {
            const innerArr = pairs[x];
            for (let y = 0, innerMax = innerArr.length; y < innerMax; y++) {
                if (innerArr[y] === key) {
                    return [x, y];
                }
            }
        }
        return [-1, -1];
    }

    linkNodes(pubNode, subNode) {
        this.pairs.push([pubNode.key, subNode.key]);
        this.assertNotCircular(pubNode.key);
        this._cachedNodeOrder = null;
    }

    assertNotCircular(key) {
        const { pairs } = this;
        let stack = [key];
        while (stack.length) {
            let curKey = stack.pop();

            const nextKeys = []
            for (const [pubKey, subKey] of pairs) {
                if (pubKey === curKey) {
                    nextKeys.push(subKey);
                }
            }

            for (const nextKey of nextKeys) {
                if (nextKey === key) {
                    throw new Error(`Circular pub/sub detected: ${key} <=> ${curKey}`);
                }
            }
            stack = nextKeys;
        }
    }

    execute(context = {}) {
        const { _cachedNodeOrder } = this;

        if (!_cachedNodeOrder) {
            let { pairs, nodes } = this;

            const dependencies = new Map();
            for (const [key,] of nodes) {
                const publishers = new Set();
                for (const [pub, sub] of pairs) {
                    if (key === sub) {
                        publishers.add(pub);
                    }
                }
                dependencies.set(key, publishers);
            }

            const nodeOrder = new Set();
            while (dependencies.size) {
                for (const [key, publishers] of dependencies) {
                    if (!publishers.size) {
                        const node = nodes.get(key);
                        nodeOrder.add(node);
                        dependencies.delete(key);
                        for (const [, innerPub] of dependencies) {
                            innerPub.delete(key);
                        }
                        break;
                    }
                }
            }

            this._cachedNodeOrder = nodeOrder;
        }

        for(const node of this._cachedNodeOrder) {
            node.callback(context);
        }
        
    }
}

module.exports = PubSub;
