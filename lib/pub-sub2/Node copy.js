'use strict';

class Node {
    constructor(psId, { key, callback, context = {}, pubSub } = {}) {
        this.psId = psId;
        this.key = key;
        this._callback = callback || (x => true);
        this.context = context;
        this.pubSub = pubSub;

        this.promise = new Promise((resolver) => {
            this.resolvePromise = resolver;
        });

        this._ancestorNodes = new Set();
    }

    executeCallback() {
        this._callback();
        this.resolvePromise();
    }

    addAncestorNode(node) {
        this._ancestorNodes.add(node);
    }

    get ancestorNodes() {
        const nodeSet = new Set();
        for(const node of this._ancestorNodes) {
            nodeSet.add(node);
            for(const ancestorNode of node.ancestorNodes) {
                nodeSet.add(ancestorNode);
            }
        }
        return nodeSet;
    }

    set callback(callback) {
        this._callback = callback;
    }

    set data(context) {
        this.context = context;
    }

    hasAncestor(subNode) {
        for (const ancestorNode of this.ancestorNodes) {
            if(ancestorNode.key === subNode.key) {
                return true;
            }
        }
        return false;
    }

}

module.exports = Node;
