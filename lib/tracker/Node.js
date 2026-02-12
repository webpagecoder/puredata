'use strict';

const Path = require("../path/Path");

class Node {
    constructor() {
        this.children = new Map();
        this.parent = this.root = this;
        this.path = Path.create('/');
    }

    removeChild(key) {
        this.children.delete(key);
    }

    setChild(key, child) {
        this.children.set(key, child);
        child.parent = this;
        child.root = this.root;
    }

    createChild(key, childConstructor = this.constructor) {
        const child = new childConstructor();
        child.path = this.path.move(key);
        this.setChild(key, child);
        return child;
    }

    // getFormatted(formatter = new NodeFormatter()) {
    //     return formatter.visit(this);
    // }

    hasChildren() {
        return this.children.size > 0;
    }

    getNodeByPath(path) {
        if (typeof path === 'string') {
            path = Path.create(path);
        }
        if (path.isSelf) {
            return this;
        }
        let node = this;
        if (path.isAbsolute) {
            node = this.root;
        }
        else {
            node = this;
            for (let i = 0; i < path.upCount; ++i) {
                if (!node.parent) {
                    break;
                }
                node = node.parent;
            }
        }

        for (const key of path.keys) {
            const child = node.children.get(key);
            if (!child) {
                return null;
            }
            node = child;
        }
        return node;
    }
}

// class NodeFormatter {
//     visit(message) {
//         let str = `<span class="pd-message">`;
//         str += message.data.join(', ');
//         if (message.children.length) {
//             str += '\t<ul>\n';
//             for (const child of message.children) {
//                 str += '\t<li>' + this.visit(child) + '</li>\n';
//             }
//             str += '\t\n</ul>\n';
//         }
//         return str + '</span>\n';
//     }
// }

module.exports = Node;