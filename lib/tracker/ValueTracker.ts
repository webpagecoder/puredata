'use strict';

import { Path } from '../Path.ts';
import { Utils } from '../Utils.ts';
import { Field } from '../fields/Field.ts';
import { NodeMixin } from '../NodeMixin.ts';
import { ErrorMessages } from './ErrorMessages.ts';

export type ErrorData = {
    args: Record<string, unknown>;
    errorKey: string;
    key: string;
    path: string;
    message: string;
    value: unknown;
};

class ValueTracker extends NodeMixin<ValueTracker>(Object) {

    private _rawValue: unknown;

    public children: Record<string, ValueTracker>;
    public field: Field;
    public nestDepth: number;
    public nestRoot: ValueTracker | null;
    public ownErrors: ErrorData[];
    public path: Path;

    public constructor(field: Field, value?: unknown) {
        super();
        this.children = {};
        this.field = field;
        this.nestDepth = 0;
        this.nestRoot = null;
        this.ownErrors = [];
        this.path = new Path('/');
        this.setValue(value);
    }

    // Value handling

    public createChild(field: Field, key: string, value?: unknown): ValueTracker {
        const child = new ValueTracker(field);
        child.path = this.path.addSegment(key);
        child.setValue(value);
        this.children[key] = child;
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
        const { children } = this;
        const keys = Object.keys(children);
        if (keys.length === 0) {
            return this._rawValue;
        }
        const final = Object.assign({}, this._rawValue as Record<string, unknown>);
        for (const key of keys) {
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
        const { children } = this;
        const keys = Object.keys(children);
        if (keys.length === 0) {
            return this._rawValue !== undefined;
        }
        for (const key of keys) {
            if (children[key].hasValue()) {
                return true;
            }
        }

        return false;
    }

    // Error handling

    public addError(errorKey: string, args?: Record<string, unknown>): this {
        if (!this.field) {
            throw new Error('ValueTracker compiled field is not configured');
        }

        const {
            field: { config: { errorMessages } },
            path,
        } = this;
        let message = errorMessages.getText(errorKey) as string;
        if (args) {
            for (const argKey of Object.keys(args)) {
                const arg = args[argKey];
                message = message.replace(`{${argKey}}`, Array.isArray(arg) ? arg.join(', ') : arg as string);
            }
        }
        this.ownErrors.push({
            args: args || {},
            errorKey,
            key: String(path.keys[path.keys.length - 1] || ''),
            path: path.toString(),
            message,
            value: this._rawValue
        });
        return this;
    }

    public hasErrors(): boolean {
        if (this.ownErrors.length > 0) {
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
        this.ownErrors = [];
    }

    public setFail(errorKey: string = 'any/base', args?: Record<string, unknown>) {
        this.ownErrors = [];
        this.addError(errorKey, args);
    }

    public getOwnErrors(path?: Path): ErrorData[] {
        const tracker = path ? this.parent.resolvePath(path) : this;
        return tracker ? (tracker as ValueTracker).ownErrors : [];
    }

    // Misc

    public cloneWithoutErrors(): ValueTracker {
        const clone = new ValueTracker(this.field);
        clone.nestDepth = this.nestDepth;
        clone.nestRoot = this.nestRoot;
        clone.path = this.path;
        clone.parent = this.parent;

        for (const key of Object.keys(this.children)) {
            clone.addChild(key, (this.children[key] as this).cloneWithoutErrors());
        }

        clone.setValue(this._rawValue);
        return clone;
    }

    // Convenience getters

    public get value(): unknown {
        return this.getValue();
    }

    public get rawValue(): unknown {
        return this._rawValue;
    }

    public get errors() {
        return new ErrorMessages(this);
    }

    public get fail() {
        return this.hasErrors();
    }

    public get pass() {
        return !this.fail;
    }

}


export { ValueTracker };



// public formatErrors(formatter: Formatter = new HtmlFormatter()): string {
//     return formatter.format(this);
// }

// public formatLocalErrors(formatter: Formatter = new HtmlFormatter()): string {
//     return formatter.format(this);
// }