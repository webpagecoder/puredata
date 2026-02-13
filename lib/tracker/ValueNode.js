'use strict';

// import AdvancedPath from '../path/AdvancedPath.js'; // File missing - commented out 
import Path from '../path/Path.js';
import ObjectUtils from '../utils/ObjectUtils.js';
import HtmlErrorFormatter from './HtmlErrorFormatter.js';
import ObjectFormatter from './ObjectFormatter.js';
import Node from './Node.js';
import MessageNode from './MessageNode.js';

class ValueNode extends Node {
    constructor(_value, {
        compiledEntity,
    } = {}) {
        super();
        this.compiledEntity = compiledEntity;
        // this.cachedErrorMessages = null;
        this.errorCollection = [];
        this.originalValue = _value;
        this.setValue(_value);
    }

    setValue(value) {
        // this.cachedErrorMessages = null;
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

    addError(errorKey, args) {
        const {
            compiledEntity: { props: { entity: { props: { label, language } } } },
            path,
            key: pathKey,
        } = this;
        let text = language.errors.get(errorKey).replace('{label}', label);
        if (args) {
            for (const key of Object.keys(args)) {
                const arg = args[key];
                text = text.replace(`{${key}}`, Array.isArray(arg) ? arg.join(', ') : arg);
            }
        }
        this.errorCollection.push({
            args: args || {},
            errorKey,
            key: path.keys[path.keys.length - 1],
            path: path.string,
            text
        });
        return this;
    }

    createChild(key, compiledEntity) {
        const child = super.createChild(key, compiledEntity.valueNodeConstructor);
        child.compiledEntity = compiledEntity;
        return child;
    }

    hasErrors() {
        if (this.errorCollection.length > 0) {
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




    getErrors() {
        let obj = {
            errors: this.errorCollection,
            children: {}
        };
        
        if (this.children.size) {
            for (const [key, childNode] of this.children) {
                obj.children[key] = childNode.getErrors();
            }
        }

        return obj;
    }

    getLocalErrors(path) {
        const node = path ? this.getNodeByPath(path) : this;
        return node ? node.errorCollection : [];
    }

    formatErrors(formatter = new HtmlErrorFormatter()) {
        return formatter.format(this);
    }

    formatLocalErrors(formatter = new HtmlErrorFormatter()) {
        return formatter.format(this);
    }



    // Convenience getters

    get value() {
        return this.getValue();
    }

    get errors() {
        return this.getErrors();
    }

}

export default ValueNode;



