'use strict';

class Node {
    constructor(key, { callback = () => true, context = {} }) {
        this.key = key;
        this.callback = callback || (x => true);
        this.context = context;
    }
}

module.exports = Node;
