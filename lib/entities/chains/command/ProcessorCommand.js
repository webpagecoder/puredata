'use strict';

import PathReference  from '../../reference/PathReference.js';
import BaseCommand  from './BaseCommand.js';

class ProcessorCommand extends BaseCommand {
    constructor(fn, args = []) {
        super();
        this.fn = fn;
        this.args = args;
    }

    execute(tracker) {
        let { fn, args } = this;

        let finalArgs;
        if (typeof args === 'function') {
                //todo: whats this???
            //finalArgs = args.call(tracker.entity);
        }
        else {
            finalArgs = [];
            for (const arg of args) {
                if (arg instanceof PathReference) {
                    const refValueNode = tracker.parent.getByPath(arg.path);
                    finalArgs.push(refValueNode ? refValueNode.value : undefined);
                }
                else if (args != null) {
                    finalArgs.push(arg);
                }
            }
        }

        const result = fn(...[
            tracker.getValue(),
            ...finalArgs
        ]);

        tracker.setValue(result.value);

        if (result.fail) {
            for (const { key, args } of result.errors) {
                tracker.addError(key, args);
            }
        }

        return tracker;
    }
}

export default  ProcessorCommand;
