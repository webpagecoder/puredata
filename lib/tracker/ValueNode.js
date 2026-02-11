'use strict';

const AdvancedPath = require('../path/AdvancedPath.js');
const Path = require('../path/Path.js');
const ObjectUtils = require('../utils/ObjectUtils.js');
const HtmlErrorFormatter = require('./HtmlErrorFormatter.js');
const Node = require('./Node.js');
const MessageNode = require('./MessageNode.js');

class ValueNode extends Node {
    constructor(_value, {
        compiledEntity,
        path = null,
    } = {}) {
        super();
        this.absoluteDepth = 0;
        this.compiledEntity = compiledEntity;
        this.cachedErrorData = null;
        this._errors = [];
        this.originalValue = _value;
        this.setValue(_value);
        // this.cachedErrors = null;
    }

    setValue(value) {
        this.cachedErrorData = null;
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
        this._errors.push({ key, args });
        return this;
    }

    createChild(key, compiledEntity) {
        const child = super.createChild(key, compiledEntity.valueNodeConstructor);
        child.compiledEntity = compiledEntity;
        return child;
    }


    hasErrors() {
        if (this._errors.length > 0) {
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

    getRawErrors() {

        if(this.cachedErrorData) {
            return this.cachedErrorData;
        }

        const {
            cachedErrors,
            children,
            compiledEntity: { props: { entity: { props: { label, language } } } },
            _errors
        } = this;

        if (cachedErrors) {
            return cachedErrors;
        }

        const messages = new MessageNode(label);

        for (const { key, args = {} } of _errors) {

            let text = language.errors.get(key).replace('{label}', label);
            for (const key of Object.keys(args)) {
                const _value = args[key];
                text = text.replace(`{${key}}`, Array.isArray(_value) ? _value.join(', ') : _value);
            }

            messages.addMessage({
                args,
                key,
                text
            });
        }

        for (const [key, child] of children) {
            const childData = child.getRawErrors();
            if (childData.children.size || childData.messages.length) {
                messages.setChild(key, childData);
            }
        }

        this.cachedErrorData = messages;
        return messages;
    }

    getErrors(formatter = new HtmlErrorFormatter()) {
        return formatter.format(this.getRawErrors());
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



