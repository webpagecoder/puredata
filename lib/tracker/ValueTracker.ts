'use strict';

import { Path } from '../path/Path.ts';
import { ArgumentCollection } from '../types.ts';
import { Utils } from '../Utils.ts';
import { Formatter } from './formatters/Formatter.ts';
import { HtmlFormatter } from './formatters/HtmlFormatter.ts';
import { Node } from './Node.ts';
import { Field } from '../fields/Field.ts';

export type TrackerError = {
    args: ArgumentCollection;
    errorKey: string;
    key: string;
    path: string;
    text: string;
    value: unknown;
};

export type ErrorTree = {
    errors: TrackerError[];
    children: Record<string, ErrorTree>;
};

class ValueTracker extends Node {

    protected _errorCollection: TrackerError[];
    protected _field: Field;
    protected _nestDepth: number;
    protected _nestRoot: ValueTracker | null;
    protected _rawValue: unknown;

    public constructor(field: Field, value?: unknown) {
        super();
        this._errorCollection = [];
        this._field = field;
        this._nestDepth = 0;
        this._nestRoot = null;
        this.setValue(value);
    }

    public override cloneWithoutErrors(): this {
        const clone = super.cloneWithoutErrors();
        clone._field = this._field;
        clone._nestDepth = this._nestDepth;
        clone._nestRoot = this._nestRoot;
        clone.setValue(this._rawValue);
        return clone;
    }

    public insertChild(field: Field, key: string, value?: unknown): this {
        const child = super.createChild(key);
        child._field = field;
        child.setValue(value);
        return child;
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
            const value = children[key].getValue();
            if (value !== undefined) {
                final[key] = value;
            }
            else {
                delete final[key];
            }
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
            _field: { errorMessages },
            _path: path,
        } = this;
        let text = errorMessages.getText(errorKey) as string;
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
            path: path.toString(),
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

    public setPass() {
        this._errorCollection = [];
    }

    public setFail(errorKey: string = 'generic/base', args?: ArgumentCollection) {
        this._errorCollection = [];
        this.addError(errorKey, args);
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

    public getLocalErrors(path?: Path): TrackerError[] {
        const tracker = path ? this.resolvePath(path) : this;
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

    public get nestDepth(): number {
        return this._nestDepth;
    }

    public get nestRoot(): ValueTracker | null {
        return this._nestRoot;
    }

    public setNestRoot(root: ValueTracker | null): void {
        this._nestRoot = root;
    }

    public setNestDepth(depth: number): void {
        this._nestDepth = depth;
    }
}



export { ValueTracker };



