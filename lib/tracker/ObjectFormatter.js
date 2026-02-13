'use strict';

class ObjectFormatter {
    format(node) {
        const { label } = node.compiledEntity.props.entity.props;
        const { children, errorMap } = node;

        let obj = {
            errors: Array.from(errorMap.values()),
            children: {}
        };
        
        if (children.size) {
            for (const [key, childNode] of children) {
                obj.children[key] = this.format(childNode);
            }
        }

        return obj;
    }
}

export default ObjectFormatter;