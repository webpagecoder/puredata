'use strict';

import { Utils } from '../utils/Utils.ts';
import { HtmlFormatter } from './formatters/HtmlFormatter.ts';
import { Node, NodeData } from './Node.ts';
import { Path } from '../Path.ts';
import type { Processor } from '../processors/Processor.ts';
import { Formatter } from './formatters/Formatter.ts';

export type ErrorArgs = Record<string, unknown>;

type TrackerError = {
    args: ErrorArgs;
    errorKey: string;
    key: string;
    path: string;
    text: string;
    value: unknown;
};
type ErrorTree = {
    errors: TrackerError[];
    children: Record<string, ErrorTree>;
};

class ValueTracker extends Node {

    compiledField: Processor;
    errorCollection: TrackerError[];
    originalValue: unknown;
    _value: unknown;

    constructor(value: unknown, compiledField: Processor) {
        super();
        this.compiledField = compiledField;
        // this.cachedErrorMessages = null;
        this.errorCollection = [];
        this.originalValue = value;
        this.setValue(value);
    }

    setValue(value: unknown): void {
        // this.cachedErrorMessages = null;
        this._value = value;
        const children = this.children as unknown as Map<string, ValueTracker>;

        if (this.hasChildren()) {
            if (!Utils.isPlainObject(value)) {
                for (const [, tracker] of children) {
                    tracker.setValue(undefined);
                }
            }
            else {
                for (const [key, tracker] of children) {
                    tracker.setValue((value as Record<string, unknown>)[key]);
                }
            }
        }
    }

    getValue(): unknown {
        if (!this.hasChildren()) {
            return this._value;
        }

        const children = this.children as unknown as Map<string, ValueTracker>;
        const final = Object.assign({}, this._value as Record<string, unknown>);
        for (const [key, tracker] of children) {
            const value = tracker.getValue();
            // if (_value !== undefined) {
            final[key] = value;
            // }
        }

        return final;
    }

    hasValue(): boolean {
        if (!this.hasChildren()) {
            return this._value !== undefined;
        }

        const children = this.children as unknown as Map<string, ValueTracker>;
        for (const [, tracker] of children) {
            if (tracker.hasValue()) {
                return true;
            }
        }

        return false;
    }

    addError(errorKey: string, args?: ErrorArgs): this {
        if (!this.compiledField) {
            throw new Error('ValueTracker compiled field is not configured');
        }

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
            key: String(path.keys[path.keys.length - 1] ?? ''),
            path: path.string,
            text,
            value: this.value
        });
        return this;
    }

    createChild(key: string, data: NodeData = {}): ValueTracker {
        const child = super.createChild(key, data) as ValueTracker;
        this.compiledField = data.compiledField as Processor;
        return child;
    }

    hasErrors(): boolean {
        if (this.errorCollection.length > 0) {
            return true;
        }
        const children = this.children as unknown as Map<string, ValueTracker>;
        if (children) {
            for (const [, tracker] of children) {
                if (tracker.hasErrors()) {
                    return true;
                }
            }
        }
        return false;
    }

    isPass(): boolean {
        return !this.hasErrors();
    }

    isFail(): boolean {
        return this.hasErrors();
    }

    getErrors(): ErrorTree {
        const obj: ErrorTree = {
            errors: this.errorCollection,
            children: {}
        };

        const children = this.children as unknown as Map<string, ValueTracker>;
        if (children.size) {
            for (const [key, tracker] of children) {
                obj.children[key] = tracker.getErrors();
            }
        }

        return obj;
    }

    getLocalErrors(path?: string | Path): TrackerError[] {
        const tracker = path ? this.getNodeByPath(path) : this;
        return tracker ? (tracker as ValueTracker).errorCollection : [];
    }

    formatErrors(formatter: Formatter = new HtmlFormatter()): string {
        return formatter.format(this);
    }

    formatLocalErrors(formatter: Formatter = new HtmlFormatter()): string {
        return formatter.format(this);
    }

    // Convenience getters

    get value(): unknown {
        return this.getValue();
    }

    get errors(): ErrorTree {
        return this.getErrors();
    }

    get fail(): boolean {
        return this.hasErrors();
    }

    get pass(): boolean {
        return !this.fail;
    }
}

export { ValueTracker };



