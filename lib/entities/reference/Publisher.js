'use strict';

const GlobalConfig = require('../../GlobalConfig.js');
const AdvancedPath = require('../../path/AdvancedPath.js');
const ValueNode = require('../../tracker/ValueNode.js');
const Entity = require('../Entity.js');

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

module.exports = Publisher;
