'use strict';

import { Path } from '../Path.ts';
import { Utils } from '../Utils.ts';
import { Field } from '../fields/Field.ts';
import { NodeMixin } from '../NodeMixin.ts';
import { ErrorCollection } from './ErrorCollection.ts';

/** Details for a validation error recorded by a value tracker. */
export type ErrorData = {
    /** Arguments used to format the error message. */
    args: Record<string, unknown>;
    /** Identifier for the error message template. */
    errorKey: string;
    /** Key of the value within its parent, if present. */
    key: string;
    /** Human-readable label for the value. */
    label: string;
    /** Formatted validation error message. */
    message: string;
    /** Path to the value that produced the error. */
    path: string;
    /** Raw value associated with the error. */
    value: unknown;
};

/**
 * Tracks a field's value, its place in a value tree, and validation errors.
 *
 * Child trackers represent nested values and are managed by {@link NodeMixin}.
 */
class ValueTracker extends NodeMixin<ValueTracker>(Object) {

    /** Value supplied to this tracker before any child values are composed. */
    private _rawValue: unknown;

    /** Field definition associated with this tracker. */
    public field: Field;

    /** Nesting depth of this tracker. */
    public nestDepth: number;

    /** Root tracker for the current nesting context, when one is set. */
    public nestRoot: ValueTracker | null;

    /** Validation errors attached directly to this tracker. */
    public ownErrors: ErrorData[];

    /** Path identifying this tracker's value. */
    public path: Path;

    /**
     * Creates a tracker for a field and initializes its value.
     *
     * @param field Field definition associated with the value.
     * @param value Initial value to track.
     */
    public constructor(field: Field, value?: unknown) {
        super();
        this.field = field;
        this.nestDepth = 0;
        this.nestRoot = null;
        this.ownErrors = [];
        this.path = new Path('/');
        this.setValue(value);
    }

    // Value handling

    /**
     * Creates and registers a child tracker for a nested value.
     *
     * @param field Field definition associated with the child.
     * @param key Key used to identify the child in this tracker's value.
     * @param value Initial value for the child.
     * @returns The newly created child tracker.
     */
    public createChild(field: Field, key: string, value?: unknown): ValueTracker {
        const child = new ValueTracker(field);
        child.path = this.path.addSegment(key);
        child.setValue(value);
        this.children[key] = child;
        return child;
    }

    /**
     * Replaces the raw value and updates existing children from its properties.
     *
     * If the value is not a plain object, all existing children are set to
     * `undefined`.
     *
     * @param value New raw value; defaults to `undefined`.
     */
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

    /** Whether a leaf has a defined value or any child tracker has one. */
    public get hasValue(): boolean {
        const { children } = this;
        const keys = Object.keys(children);
        if (keys.length === 0) {
            return this._rawValue !== undefined;
        }
        for (const key of keys) {
            if (children[key].hasValue) {
                return true;
            }
        }

        return false;
    }

    /**
     * Gets the tracked value, composing child values when this tracker has children.
     *
     * Child properties whose values are `undefined` are omitted from the result.
     */
    public get value(): unknown {
        const { children } = this;
        const keys = Object.keys(children);
        if (keys.length === 0) {
            return this._rawValue;
        }
        const final = Object.assign({}, this._rawValue as Record<string, unknown>);
        for (const key of keys) {
            const value = children[key].value;
            if (value !== undefined) {
                final[key] = value;
            }
            else {
                delete final[key];
            }
        }
        return final;
    }

    /** Gets the raw value most recently supplied to {@link setValue}. */
    public get rawValue(): unknown {
        return this._rawValue;
    }

    // Error handling

    /**
     * Records a validation error on this tracker.
     *
     * @param errorKey Identifier for the error message template.
     * @param args Values substituted into placeholders in the message.
     * @returns This tracker, for chaining.
     * @throws {@link Error} If no field is configured.
     */
    public addError(errorKey: string, args?: Record<string, unknown>): this {
        if (!this.field) {
            throw new Error('ValueTracker field is not configured');
        }

        const {
            field: { config: { label, errorMessages } },
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
            label,
            message,
            path: path.toString(),
            value: this._rawValue
        });
        return this;
    }

    /** Whether this tracker or any of its descendants has validation errors. */
    public get hasErrors(): boolean {
        if (this.hasOwnErrors) {
            return true;
        }
        const { children } = this;
        const keys = Object.keys(children);
        for (const key of keys) {
            if (children[key].hasErrors) {
                return true;
            }
        }

        return false;
    }

    /** Whether this tracker has any directly attached validation errors. */
    public get hasOwnErrors(): boolean {
        return this.ownErrors.length > 0;
    }

    /** Clears validation errors attached directly to this tracker. */
    public setPass() {
        this.ownErrors = [];
    }

    /**
     * Replaces this tracker's own errors with a single validation error.
     *
     * @param errorKey Identifier for the error message template.
     * @param args Values substituted into placeholders in the message.
     */
    public setFail(errorKey: string = 'any/base', args?: Record<string, unknown>) {
        this.ownErrors = [];
        this.addError(errorKey, args);
    }


    // Misc

    /**
     * Copies this tracker and its descendants without copying validation errors.
     *
     * @returns A clone with the same field, value, path, and tree structure.
     */
    public cloneWithoutErrors(): ValueTracker {
        const clone = new ValueTracker(this.field);
        clone.field = this.field;
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

    // Getters

    /** Gets an error collection for this tracker and its descendants. */
    public get errors() {
        return new ErrorCollection(this);
    }

    /** Whether this tracker or any descendant has failed validation. */
    public get fail() {
        return this.hasErrors;
    }

    /** Whether this tracker and all descendants have no validation errors. */
    public get pass() {
        return !this.fail;
    }

}


export { ValueTracker };
