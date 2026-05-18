'use strict';

import { Utils } from '../Utils.ts';
import { HtmlFormatter } from './formatters/HtmlFormatter.ts';
import { Node, NodeData } from './Node.ts';
import { Path } from '../Path.ts';
import type { Processor } from '../processors/Processor.ts';
import { Formatter } from './formatters/Formatter.ts';
import { ArgumentCollection } from '../types.ts';

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

    private _processor: Processor;
    private _errorCollection: TrackerError[];
    private _originalValue: unknown;
    private _value: unknown;


    constructor(value: unknown, processor: Processor) {
        super();
        this._processor = processor;
        // this.cachedErrorMessages = null;
        this._errorCollection = [];
        this._originalValue = value;
        this.setValue(value);
    }

    public setValue(value: unknown): void {
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

    public getValue(): unknown {
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

    public hasValue(): boolean {
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

    public addError(errorKey: string, args?: ArgumentCollection): this {
        if (!this._processor) {
            throw new Error('ValueTracker compiled field is not configured');
        }

        const {
            _processor: { field: { label, locale} },
            path,
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
            key: String(path.keys[path.keys.length - 1] ?? ''),
            path: path.string,
            text,
            value: this.value
        });
        return this;
    }

    public hasErrors(): boolean {
        if (this._errorCollection.length > 0) {
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

        const children = this.children as unknown as Map<string, ValueTracker>;
        if (children.size) {
            for (const [key, tracker] of children) {
                obj.children[key] = tracker.getErrors();
            }
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



