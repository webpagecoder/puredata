'use strict';

import { Path } from '../Path.ts';
import { Utils } from '../Utils.ts';
import { Formatter } from './formatters/Formatter.ts';
import { HtmlFormatter } from './formatters/HtmlFormatter.ts';
import { Field } from '../fields/Field.ts';
import { PathTreeNodeMixin } from '../PathTreeNodeMixin.ts';

export type TrackerError = {
    args: Record<string, unknown>;
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

class ValueTracker extends PathTreeNodeMixin<ValueTracker>(Object) {

    public field: Field;
    public nestDepth: number;
    public nestRoot: ValueTracker | null;
    public path: Path;

    private _errorCollection: TrackerError[];
    private _rawValue: unknown;

    public constructor(field: Field, value?: unknown) {
        super();
        this.nestDepth = 0;
        this.nestRoot = null;
        this.path = new Path('/');
        this.field = field;

        this._errorCollection = [];
        this.setValue(value);
    }

    public cloneWithoutErrors(): ValueTracker {
        const clone = new ValueTracker(this.field);
        clone.nestDepth = this.nestDepth;
        clone.nestRoot = this.nestRoot;
        clone.path = this.path;

        for (const key of Object.keys(this.children)) {
            clone.children[key] = (this.children[key] as ValueTracker).cloneWithoutErrors();
        }

        clone.setValue(this._rawValue);
        return clone;
    }

    public createChild(field: Field, key: string, value?: unknown): ValueTracker {
        const child = new ValueTracker(field);
        this.addChild(key, child);
        child.path = this.path.addSegment(key);

        child.setValue(value);
        return child;
    }

    public setValue(value: unknown = undefined): void {
        this._rawValue = value;
        const { children } = this;
        if (!Utils.isPlainObject(value)) {
            for (const key of Object.keys(children)) {
                children[key].setValue(undefined);
            }
        }
        else {
            for (const key of Object.keys(children)) {
                children[key].setValue((value as Record<PropertyKey, unknown>)[key]);
            }
        }
    }

    public getValue(): unknown {
        if (!this.children.length) {
            return this._rawValue;
        }
        const children = this.children;
        const final = Object.assign({}, this._rawValue as Record<string, unknown>);
        for (const key of Object.keys(children)) {
            const value = (children[key] as ValueTracker).getValue();
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
        if (!this.children.length) {
            return this._rawValue !== undefined;
        }
        const { children } = this;
        for (const key of Object.keys(children)) {
            if (children[key].hasValue()) {
                return true;
            }
        }

        return false;
    }

    public addError(errorKey: string, args?: Record<string, unknown>): this {
        if (!this.field) {
            throw new Error('ValueTracker compiled field is not configured');
        }

        const {
            field: { config: { errorMessages } },
            path,
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
        const { children } = this;
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

    public setFail(errorKey: string = 'any/base', args?: Record<string, unknown>) {
        this._errorCollection = [];
        this.addError(errorKey, args);
    }

    public getErrors(): ErrorTree {
        const obj: ErrorTree = {
            errors: this._errorCollection,
            children: {}
        };

        const { children } = this;
        for (const key of Object.keys(children)) {
            obj.children[key] = children[key].getErrors();
        }

        return obj;
    }

    public getLocalErrors(path?: Path): TrackerError[] {
        const tracker = path ? this.parent.resolvePath(path) : this;
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

    public get rawValue(): unknown {
        return this._rawValue;
    }

    public get errors() {
        return this.getErrors();
    }

    public get fail() {
        return this.hasErrors();
    }

    public get pass() {
        return !this.fail;
    }

}


export { ValueTracker };



