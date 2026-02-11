'use strict';

class Node {
    constructor(key, callback = () => true) {
        this.key = key;
        this.callback = callback;
    }
}

module.exports = Node;
