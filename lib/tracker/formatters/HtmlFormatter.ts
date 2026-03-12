'use strict';

import { ValueTracker } from "../ValueTracker.ts";
import { Formatter } from "./Formatter.ts";

class HtmlFormatter implements Formatter {
    format(tracker: ValueTracker, depth = 0): string {
        const {
            children,
            errorCollection,
            compiledField: {
                props: {
                    field: {
                        props: { label }
                    }
                }
            }
        } = tracker;

        let html = errorCollection.length
            ? '<ul class="pd-messages">' + errorCollection.map((error):string => `<li>${error.text}</li>`).join('') + '</ul>'
            : '';

        if (children.size) {
            html += '<ul class="pd-child">';
            for (const [, child] of children as unknown as Map<string, ValueTracker>) {
                html += `<li>${this.format(child, depth + 1)}</li>`;
            }
            html += '</ul>';
        }

        html = html ? `<div class="pd-self">${html}</div>` : '';

        return html;
    }


}

export { HtmlFormatter };