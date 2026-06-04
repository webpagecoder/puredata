'use strict';

import { Path } from '../Path.ts';
import { ArgumentCollection } from '../types.ts';
import { Utils } from '../Utils.ts';
import { Formatter } from './formatters/Formatter.ts';
import { HtmlFormatter } from './formatters/HtmlFormatter.ts';
import { Node } from './Node.ts';
import { Field } from '../fields/Field.ts';

type TrackerError = {
    args: ArgumentCollection;
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

    private _errorCollection: TrackerError[];
    private _field: Field;
    private _rawValue: unknown;

    public static fail(field: Field) {
        const tracker = new ValueTracker(field);
        tracker.addError('generic/base');
        return tracker;
    }

    public static pass(field: Field) {
        return new ValueTracker(field);
    }

    public constructor(field: Field, value: unknown = undefined) {
        super();
        this._errorCollection = [];
        this._field = field;
        this.setValue(value);
    }

    public override clone(): this {
        const clone = super.clone();
        clone._field = this._field;
        clone.setValue(this._rawValue);
        return clone;
    }

    public setValue(value: unknown = undefined): void {
        // this.cachedErrorMessages = null;
        this._rawValue = value;
        const children = this._children;
        if (!Utils.isPlainObject(value)) {
            for (const key of Object.keys(children)) {
                children[key].setValue(undefined);
            }
        }
        else {
            for (const key of Object.keys(children)) {
                children[key].setValue((value as Record<string, unknown>)[key]);
            }
        }
    }

    public getValue(): unknown {
        if (!this.hasChildren()) {
            return this._rawValue;
        }
        const children = this._children;
        const final = Object.assign({}, this._rawValue as Record<string, unknown>);
        for (const key of Object.keys(children)) {
            final[key] = children[key].getValue();
        }
        return final;
    }

    public hasValue(): boolean {
        if (!this.hasChildren()) {
            return this._rawValue !== undefined;
        }
        const children = this._children;
        for (const key of Object.keys(children)) {
            if (children[key].hasValue()) {
                return true;
            }
        }

        return false;
    }

    public addError(errorKey: string, args?: ArgumentCollection): this {
        if (!this._field) {
            throw new Error('ValueTracker compiled field is not configured');
        }

        const {
            _field: { label, locale },
            _path: path,
        } = this;
        let text = locale.translate(Path.fromArray(['errors', errorKey])).replace('{label}', label);
        if (args) {
            for (const argKey of Object.keys(args)) {
                const arg = args[argKey];
                text = text.replace(`{${argKey}}`, Array.isArray(arg) ? arg.join(', ') : arg as string);
            }
        }
        this._errorCollection.push({
            args: args || {},
            errorKey,
            key: String(path.keys[path.keys.length - 1] || ''),
            path: path.string,
            text,
            value: this._rawValue
        });
        return this;
    }

    public hasErrors(): boolean {
        if (this._errorCollection.length > 0) {
            return true;
        }
        const children = this._children;
        const keys = Object.keys(children);
        for (const key of keys) {
            if (children[key].hasErrors()) {
                return true;
            }
        }

        return false;
    }

    public isPass(): boolean {
        return !this.hasErrors();
    }

    public isFail(): boolean {
        return this.hasErrors();
    }

    public getErrors(): ErrorTree {
        const obj: ErrorTree = {
            errors: this._errorCollection,
            children: {}
        };

        const children = this._children;
        for (const key of Object.keys(children)) {
            obj.children[key] = children[key].getErrors();
        }

        return obj;
    }

    public getLocalErrors(path?: string | Path): TrackerError[] {
        const tracker = path ? this.getNodeByPath(path) : this;
        return tracker ? (tracker as ValueTracker)._errorCollection : [];
    }

    public formatErrors(formatter: Formatter = new HtmlFormatter()): string {
        return formatter.format(this);
    }

    public formatLocalErrors(formatter: Formatter = new HtmlFormatter()): string {
        return formatter.format(this);
    }

    // Convenience getters

    public get value(): unknown {
        return this.getValue();
    }

    public get errors(): ErrorTree {
        return this.getErrors();
    }

    public get fail(): boolean {
        return this.hasErrors();
    }

    public get pass(): boolean {
        return !this.fail;
    }
}

export { ValueTracker };



