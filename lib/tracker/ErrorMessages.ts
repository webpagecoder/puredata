'use strict';

import { NodeMixin } from "../NodeMixin.ts";
import { Path } from "../Path.ts";
import { ErrorData, ValueTracker } from "./ValueTracker.ts";

export type FlattenedErrors = Record<string, ErrorData[]>;

class ErrorMessages extends NodeMixin(Object) {
    public ownErrors: ErrorData[];
    public hasOwnErrors: boolean;
    public hasChildErrors: boolean;

    private _flattenedErrorsCached: FlattenedErrors | null;

    public constructor(tracker: ValueTracker) {
        super();
        this.ownErrors = tracker.getOwnErrors();
        this.hasOwnErrors = this.ownErrors.length > 0;
        this._flattenedErrorsCached = null;

        const { children } = tracker;

        let hasChildErrors = false;
        for (const key of Object.keys(children)) {
            const childError = new ErrorMessages(children[key] as ValueTracker);
            if (childError.hasOwnErrors || Object.keys(childError.children).length > 0) {
                this.addChild(key, childError);
                hasChildErrors = true;
            }
        }
        this.hasChildErrors = hasChildErrors;
    }

    public get hasErrors(): boolean {
        return this.hasOwnErrors || this.hasChildErrors;
    }

    private _collectErrors(errors: FlattenedErrors = {}): void {
        if (this.hasOwnErrors) {
            const path = this.ownErrors[0].path;
            errors[path] = [];
            for (const error of this.ownErrors) {
                errors[path].push(error);
            }
        }
        if (this.hasChildErrors) {
            for (const key of Object.keys(this.children)) {
                this.children[key]._collectErrors(errors);
            }
        }

    }

    public get flattenedErrors(): FlattenedErrors {
        if (this._flattenedErrorsCached) {
            return this._flattenedErrorsCached;
        }

        const errors: FlattenedErrors = {};
        this._collectErrors(errors);
        this._flattenedErrorsCached = errors;
        return errors;
    }

    public byPath(path: string | Path): ErrorData[] {
        return this.flattenedErrors[
            (new Path(path)).toAbsolute().toString()
        ] || [];
    }

    public get toJson(): Record<string, unknown> {
        const json: Record<string, unknown> = {};
    }
}

export { ErrorMessages };