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

    createNode(key, callback) {
        const { nodes } = this;
        if (nodes.has(key)) {
            throw new Error('Cannot create node - the key already exists');
        }
        const node = new Node(key, callback);
        nodes.set(key, node);

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
        this.pairs.push([pubNode.key, subNode.key]);
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

            const nodeOrder = [];

            let preprocessSize;
            while (dependencies.size) {
                preprocessSize = dependencies.size;
                for (const [key, publishers] of dependencies) {
                    if (!publishers.size) {
                        const node = nodes.get(key);
                        nodeOrder.push(node);
                        dependencies.delete(key);
                        for (const [, innerPub] of dependencies) {
                            innerPub.delete(key);
                        }
                        break;
                    }
                }
                if(dependencies.size === preprocessSize) {
                    throw new Error(`Circular pub/subs detected!`);
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
