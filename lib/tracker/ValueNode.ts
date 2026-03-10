// @ts-nocheck
'use strict';

// import { AdvancedPath } from '../path/AdvancedPath.ts'; // File missing - commented out 
import { Utils } from '../utils/Utils.ts';
import { HtmlErrorFormatter } from './HtmlErrorFormatter.ts';
import { Node } from './Node.ts';
import { Path } from '../Path.ts'

class ValueNode extends Node {
    constructor(_value, {
        compiledField,
    } = {}) {
        super();
        this.compiledField = compiledField;
        // this.cachedErrorMessages = null;
        this.errorCollection = [];
        this.originalValue = _value;
        this.setValue(_value);
    }

    setValue(value) {
        // this.cachedErrorMessages = null;
        this._value = value;

        if (this.hasChildren()) {
            if (!Utils.isPlainObject(value)) {
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
            compiledField: { props: { field: { props: { label, locale } } } },
            path,
        } = this;
        let text = locale.getText(Path.fromArray(['errors', errorKey])).replace('{label}', label);
        if (args) {
            for (const argKey of Object.keys(args)) {
                const arg = args[argKey];
                text = text.replace(`{${argKey}}`, Array.isArray(arg) ? arg.join(', ') : arg);
            }
        }
        this.errorCollection.push({
            args: args || {},
            errorKey,
            key: path.keys[path.keys.length - 1],
            path: path.string,
            text,
            value: this.value
        });
        return this;
    }

    createChild(key, compiledField) {
        const child = super.createChild(key, compiledField.valueNodeConstructor);
        child.compiledField = compiledField;
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

    get fail() {
        return this.hasErrors();
    }

    get pass() {
        return !this.fail;
    }
}

export { ValueNode };



