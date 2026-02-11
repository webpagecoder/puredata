'use strict';

const Node = require("./Node");

class MessageNode extends Node {
    constructor(label) {
        super();
        this.messages = [];
        this.label = label;
    }

    addMessage({ args = {}, key, text } = {}) {
        this.messages.push({ args, key, text });
        return this;
    }
}

module.exports = MessageNode;