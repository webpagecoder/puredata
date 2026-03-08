// @ts-nocheck
'use strict';

import Node from './Node.ts';

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

export default MessageNode;