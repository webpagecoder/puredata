'use strict';

import Processor from '../../processors/Processor.js';
import PathReferenceField from '../../reference/PathReferenceField.js';

class ChainProcessor extends Processor {

    preProcess() { }

    postProcess() { }

    _process(tracker, state = {}) {
        // const { failOnFirstError } = this.globalConfig;
        this.preProcess(tracker, state);
        if (tracker.hasErrors()) {
            return tracker;
        }
        this.executePipeline(tracker);
        this.postProcess(tracker, state);
        return tracker;
    }

    executePipeline(tracker) {
        for (const step of this.props.entity.props.pipeline) {
            let { fn, args } = step;
            let finalArgs = [];
            for (const arg of args) {
                if (arg instanceof PathReferenceField) {
                    const refValueNode = tracker.parent.getByPath(arg.path);
                    finalArgs.push(refValueNode ? refValueNode.value : undefined);
                }
                else if (args != null) {
                    finalArgs.push(arg);
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

            if (tracker.hasErrors()) {
                return;
            }
        }
    }

    getReferences() {
        const references = super.getReferences();
        for (const { args } of this.props.entity.props.pipeline) {
            for (const arg of args) {
                if (arg instanceof PathReferenceField) {
                    references.add(arg);
                }
            }
        }
        return references;
    }
}

export default ChainProcessor;