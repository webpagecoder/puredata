'use strict';

class HtmlFormatter {
    format(node, isRoot = true) {
        const { children, errorCollection, compiledEntity } = node;
        const { label } = compiledEntity.props.entity.props;

        let html = errorCollection.length
            ? '<ul class="pd-messages">' + errorCollection.map(error => `<li>${error.text}</li>`).join('') + '</ul>'
            : '';

        if (children.size) {
            html += '<ul class="pd-child">';
            for (const [, child] of children) {
                html += `<li>${this.format(child, false)}</li>`;
            }
            html += '</ul>';
        }


        html = html ? `<div class="pd-self">${html}</div>` : '';

        if (isRoot) {
            html = `<div class="pd-${this.className}">${html}</div>`;
        }

        return html;
    }


}

export default HtmlFormatter;