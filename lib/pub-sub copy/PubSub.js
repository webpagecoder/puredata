'use strict';

const Node = require('./Node.js');

class PubSub {
    static _internalId = 0;

    constructor() {
        this.id = Symbol();
        this.internalId = ++PubSub._internalId;
        this.allNodes = new Map();
        this._rootNode = new Node(Symbol());
        this._rootNode.numDependencies = 1;
    }

    createNode(key, { callback, context } = {}) {
        const { allNodes, _rootNode } = this;
        if (allNodes.has(key)) {
            throw new Error('Cannot create node - the key already exists');
        }
        const node = new Node(this.id, {
            key,
            callback,
            context,
            pubSub: this
        });
        allNodes.set(key, node);
        _rootNode.subs.add(node);
        node.numDependencies++;
        return node;
    }

    getOrCreateNode(key, { callback, context } = {}) {
        const allNodes = this.allNodes;
        if (allNodes.has(key)) {
            const node = allNodes.get(key);
            if (callback) {
                node.callback = callback;
            }
            if (context) {
                node.data = context;
            }
            return node;
        }
        else {
            return this.createNode(key, { callback, context });
        }
    }

    getNode(key) {
        const { allNodes } = this;
        return allNodes.has(key) ? allNodes.get(key) : null;
    }

    hasNode(key) {
        return this.allNodes.has(key);
    }

    linkNodes(pubNode, subNode) {
        if (pubNode.psId !== this.id || subNode.psId !== this.id) {
            throw new Error('Cannot subscribe nodes created from different PubSub instances');
        }
        if (pubNode.subs.has(subNode)) {
            return;
        }
        
        pubNode.subs.add(subNode);
        subNode.pubs.add(pubNode);
        subNode.numDependencies++;

        if (pubNode.isCircular(subNode)) {
            throw new Error(`Circular pub/sub dependency detected (${pubNode.key} <-> ${subNode.key})`);
        }

        if(this._rootNode.subs.has(subNode)) {
            this._rootNode.subs.delete(subNode);
            subNode.numDependencies--;
        }
    }

    execute(context = {}) {
        for (const [, node] of this.allNodes) {
            node.activePingCount = 0;
        }
        return this._rootNode.ping(context);
    }
}

module.exports = PubSub;
