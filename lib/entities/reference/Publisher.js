'use strict';

import GlobalConfig  from '../../GlobalConfig.js';
import AdvancedPath  from '../../path/AdvancedPath.js';
import ValueNode  from '../../tracker/ValueNode.js';
import Entity  from '../Entity.js';

class Publisher extends Entity {
    constructor(path, defaultOrCallback, pathChars) {
        this.path = AdvancedPath.create(path, pathChars);
        if (typeof defaultOrCallback === 'function') {
            this.callback = defaultOrCallback;
        }
        else {
            this.defaultValue = defaultOrCallback;
        }
    }

    get publishers() {
        return new Set([this]);
    }

    _process(tracker, state = {}) {
        const resolvedValue = tracker.getPublisherValue(this);
        if (this.callback) {
            tracker.setValue(this.callback(resolvedValue));
        }
        else if (resolvedValue === undefined) {
            tracker.setValue(this.defaultValue);
        }
        else {
            tracker.setValue(resolvedValue);
        }
        return tracker;
    }

    clone() {
        return new Publisher(this.path, {
            update: this.update,
            defaultValue: this.defaultValue
        });
    }

}

export default  Publisher;
