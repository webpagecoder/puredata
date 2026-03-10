// @ts-nocheck
'use strict';

class Node {
    constructor(key, callback = () => true) {
        this.key = key;
        this.callback = callback;
        this.children = new Set();
    }
}

export { Node };
