'use strict';

import { ValueTracker } from "../ValueTracker.ts";
import { Formatter } from "./Formatter.ts";

class TextFormatter implements Formatter {
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
        const indent = '\t'.repeat(depth);

        let childDesc = '';
        if (children.size) {
            for (const [, child] of children) {
                childDesc += '\n' + this.format(child as ValueTracker, depth + 1);
            }
        }

        return indent + `- ${label}: ` + errorCollection.map((error): string => error.text).join(', ') + childDesc;
    }
}

export { TextFormatter };