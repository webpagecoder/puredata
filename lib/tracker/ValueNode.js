'use strict';

const AdvancedPath = require('../path/AdvancedPath.js');
const Path = require('../path/Path.js');
const ObjectUtils = require('../utils/ObjectUtils.js');
const HtmlErrorFormatter = require('./HtmlErrorFormatter.js');
const PlainFormatter = require('./PlainFormatter.js');
const Node = require('./Node.js');
const MessageNode = require('./MessageNode.js');

class ValueNode extends Node {
    constructor(_value, {
        compiledEntity,
    } = {}) {
        super();
        this.absoluteDepth = 0;
        this.compiledEntity = compiledEntity;
        this.cachedErrorMessages = null;
        this.errorMap = new Map();
        this.originalValue = _value;
        this.setValue(_value);
    }

    setValue(value) {
        this.cachedErrorMessages = null;
        this._value = value;

        if (this.hasChildren()) {
            if (!ObjectUtils.isPlainObject(value)) {
                for (const [, tracker] of this.children) {
                    tracker.setValue(undefined);
                }
            }
            else {
                for (const [key, tracker] of this.children) {
                    tracker.setValue(value[key]);
                }
            }
        }
    }

    getValue() {
        if (!this.hasChildren()) {
            return this._value;
        }

        const final = Object.assign({}, this._value);
        for (const [key, tracker] of this.children) {
            const value = tracker.getValue();
            // if (_value !== undefined) {
            final[key] = value;
            // }
        }

        return final;
    }

    hasValue() {
        if (!this.hasChildren()) {
            return this._value !== undefined;
        }

        for (const [, tracker] of this.children) {
            if (tracker.hasValue()) {
                return true;
            }
        }

        return false;
    }

    addError(key, args) {
        const {
            compiledEntity: { props: { entity: { props: { label, language } } } }
        } = this;
        let text = language.errors.get(key).replace('{label}', label);
        if (args) {
            for (const key of Object.keys(args)) {
                const arg = args[key];
                text = text.replace(`{${key}}`, Array.isArray(arg) ? arg.join(', ') : arg);
            }
        }
        this.errorMap.set(key, text);
        return this;
    }

    createChild(key, compiledEntity) {
        const child = super.createChild(key, compiledEntity.valueNodeConstructor);
        child.compiledEntity = compiledEntity;
        return child;
    }


    hasErrors() {
        if (this.errorMap.size > 0) {
            return true;
        }
        if (this.children) {
            for (const [, tracker] of this.children) {
                if (tracker.hasErrors()) {
                    return true;
                }
            }
        }
        return false;
    }

    isPass() {
        return !this.hasErrors();
    }

    isFail() {
        return this.hasErrors();
    }

    formatErrors(formatter = new HtmlErrorFormatter()) {
        return formatter.format(this);
    }

    getAllErrors() {
        return new PlainFormatter().format(this);
    }

    getErrors(path) {
        if(path) {
            return this.getNodeByPath(path)?.getErrors();
        }
        const errorsObj = {};
        for (const [key, value] of this.errorMap) {
            errorsObj[key] = value;
        }
        return errorsObj;
    }


    // Convenience getters

    get value() {
        return this.getValue();
    }

    get errors() {
        return this.getErrors();
    }

}

module.exports = ValueNode;



