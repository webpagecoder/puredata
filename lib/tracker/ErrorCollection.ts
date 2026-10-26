'use strict';

import { NodeMixin } from "../NodeMixin.ts";
import { Path } from "../Path.ts";
import { ErrorData, ValueTracker } from "./ValueTracker.ts";

export type FlattenedErrors = Record<string, ErrorData[]>;

/**
 * Provides access to validation errors on a tracker and its descendants.
 *
 * Child collections are included only when they contain errors.
 */
class ErrorCollection extends NodeMixin<ErrorCollection>(Object) {
    /** Errors attached directly to the corresponding tracker. */
    private _ownErrorData: ErrorData[];

    /** Whether this collection has errors attached directly to its tracker. */
    private _hasOwnErrors: boolean;

    /** Whether any included child collection contains errors. */
    private _hasChildErrors: boolean;

    /**
     * Creates an error collection from a value tracker and its descendants.
     *
     * @param tracker Tracker whose errors and child errors are collected.
     */
    public constructor(tracker: ValueTracker) {
        super();
        this._ownErrorData = tracker.ownErrors;
        this._hasOwnErrors = this._ownErrorData.length > 0;

        const { children } = tracker;

        let hasChildErrors = false;
        for (const key of Object.keys(children)) {
            const childError = new ErrorCollection(children[key]);
            if (childError._hasOwnErrors || Object.keys(childError.children).length > 0) {
                this.addChild(key, childError);
                hasChildErrors = true;
            }
        }
        this._hasChildErrors = hasChildErrors;
    }

    /** Whether this collection or any of its descendants has errors. */
    public get hasErrors(): boolean {
        return this._hasOwnErrors || this._hasChildErrors;
    }

    /** Whether any descendant collection has errors. */
    public get hasChildErrors(): boolean {
        return this._hasChildErrors;
    }

    /** Whether this collection has errors attached directly to its tracker. */
    public get hasOwnErrors(): boolean {
        return this._hasOwnErrors;
    }

    /**
     * Adds this collection's errors and all descendant errors to a path map.
     *
     * @param errors Map to populate, created when omitted.
     * @returns The populated error map.
     */
    private _gatherErrorData(errors: FlattenedErrors = {}) {
        if (this._hasOwnErrors) {
            const path = this._ownErrorData[0].path;
            errors[path] = [];
            for (const error of this._ownErrorData) {
                errors[path].push(error);
            }
        }
        this._gatherChildErrorData(errors);
        return errors;
    }

    /**
     * Adds descendant errors, excluding this collection's own errors, to a path map.
     *
     * @param errors Map to populate, created when omitted.
     * @returns The populated error map.
     */
    private _gatherChildErrorData(errors: FlattenedErrors = {}) {
        if (this._hasChildErrors) {
            for (const key of Object.keys(this.children)) {
                this.children[key]._gatherErrorData(errors);
            }
        }
        return errors;
    }

    /**
     * Adds this collection's error messages and all descendant messages to a path map.
     *
     * @param errors Map to populate, created when omitted.
     * @returns The populated message map.
     */
    private _gatherErrorMessages(errors: Record<string, string[]> = {}) {
        if (this._hasOwnErrors) {
            const path = this._ownErrorData[0].path;
            errors[path] = [];
            for (const error of this._ownErrorData) {
                errors[path].push(error.message);
            }
        }
        this._gatherChildErrorMessages(errors);
        return errors;
    }

    /**
     * Adds descendant error messages, excluding this collection's own messages, to a path map.
     *
     * @param errors Map to populate, created when omitted.
     * @returns The populated message map.
     */
    private _gatherChildErrorMessages(errors: Record<string, string[]> = {}) {
        if (this._hasChildErrors) {
            for (const key of Object.keys(this.children)) {
                this.children[key]._gatherErrorMessages(errors);
            }
        }
        return errors;
    }

    /** All errors in this collection and its descendants, grouped by path. */
    public get errorData() {
        return this._gatherErrorData();
    }

    /** Errors attached directly to this collection's tracker. */
    public get ownErrorData() {
        return this._ownErrorData;
    }

    /** Errors from descendants, grouped by path and excluding this collection's own errors. */
    public get childErrorData() {
        return this._gatherChildErrorData();
    }

    /** All error messages in this collection and its descendants, grouped by path. */
    public get errorMessages() {
        return this._gatherErrorMessages();
    }

    /** Messages for errors attached directly to this collection's tracker. */
    public get ownErrorMessages() {
        return this._ownErrorData.map(errorData => errorData.message);
    }

    /** Messages from descendants, grouped by path and excluding this collection's own messages. */
    public get childErrorMessages() {
        return this._gatherChildErrorMessages();
    }

    /**
     * Resolves a path to a collection within this collection's tree.
     *
     * Absolute paths are resolved from the tree root; relative paths are resolved
     * from this collection.
     *
     * @param path Absolute or relative path to resolve.
     * @returns The collection at the path, or `null` if no collection exists there.
     */
    public byPath(path: string | Path) {
        return this.resolvePath(path) as ErrorCollection;
    }


}

export { ErrorCollection };