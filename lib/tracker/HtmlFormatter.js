'use strict';

class HtmlFormatter {
    format(builder, isRoot = true) {
        const { children, messages, label } = builder;

        let selfErrors = messages.map(message => message.text).join(', ');

        let childErrors = '';
        if (children.size) {
            childErrors = `<ul class="pd-child">`;
            for (const [, child] of children) {
                childErrors += `<li>${this.format(child, false)}</li>`;
            }
            childErrors += '</ul>';
        }

        if(!selfErrors) {
            if(!childErrors) {
                return '';
            }
            else {
                selfErrors = label;
            }
        }

        let combinedErrors = selfErrors ? `<div class="pd-self">${selfErrors}</div>` : '';
        combinedErrors += childErrors ? childErrors : '';

        if(isRoot) {
            combinedErrors = `<div class="pd-${this.className}">${combinedErrors}</div>` ;
        }

        return combinedErrors;
    }


}

module.exports = HtmlFormatter;