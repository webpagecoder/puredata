'use strict';

class TextFormatter {
    format(builder, depth = 0) {
        const { children, messages, label } = builder;
        const indent = '\t'.repeat(depth);

        let childDesc = '';
        if (children.size) {
            for (const [, child] of children) {
                childDesc += '\n' + this.format(child, depth + 1);
            }
        }

        return indent + `- ${label}: ` + messages.map(message => message.text).join(', ') + childDesc;
    }
}

module.exports = TextFormatter;