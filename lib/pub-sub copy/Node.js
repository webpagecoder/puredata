'use strict';

class Node {
    constructor(psId, { key, callback, context = {}, pubSub } = {}) {
        this.psId = psId;
        this.key = key;
        this._callback = callback || (x => true);
        this.context = context;
        this.pubSub = pubSub;
        this.pubs = new Set();
        this.subs = new Set();
        this.numDependencies = 0;
        this.activePingCount = 0;
        this.loopback = false;
    }

    set callback(callback) {
        this._callback = callback;
    }

    set data(context) {
        this.context = context;
    }

    isCircular(subNode) {
        if (this.key === subNode.key) {
            return true;
        }
        for (const childNode of subNode.subs) {
            if (this.isCircular(childNode)) {
                return true;
            }
        }
        return false;
    }

    ping(context) {
        ++this.activePingCount;
        const { activePingCount, numDependencies } = this;
        if (activePingCount === numDependencies) {
            const { _callback, subs } = this;
            if (_callback(this, context) === false) {
                return false;
            }
            for (const node of subs) {
                if (!node.ping(context)) {
                    return false;
                }
            }
        }
        return true;
    }

    toString() {
        return String(this.key);
    }

    addSub(subNode) {
        this.pubSub.linkNodes(this, subNode);
    }
}

module.exports = Node;
