'use strict';

const Node = require('./Node.js');

class PubSub {
    static _internalId = 0;

    constructor() {
        this.id = Symbol();
        this.internalId = ++PubSub._internalId;
        this.allNodes = new Map();
        // this._rootNode = new Node(Symbol());
        // this._rootNode.numDependencies = 1;
        // this.rootPromise = new Promise();
        this.rootPromise = new Promise(resolver => this.resolver = resolver)
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
        // _rootNode.subs.add(node);
        // node.numDependencies++;
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
        if (pubNode.hasAncestor(subNode)) {
            throw new Error(`Circular pub/sub dependency detected (${pubNode.key} <-> ${subNode.key})`);
        }
        subNode.addAncestorNode(pubNode);

    }

    execute(context = {}) {

        for (const [, node] of this.allNodes) {

            const ancestorPromises = [];
            for (const ancestorNode of node.ancestorNodes) {
                ancestorPromises.push(ancestorNode.promise);
            }
            Promise.all(ancestorPromises).then(() => {
                node.executeCallback();
            });
        }

    }
}

module.exports = PubSub;
