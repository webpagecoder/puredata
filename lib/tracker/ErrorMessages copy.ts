'use strict';

import { NodeMixin } from "../NodeMixin.ts";
import { ErrorData, ValueTracker } from "./ValueTracker.ts";

export type FlattenedErrors = Record<string, string[]>;

class ErrorMessages extends NodeMixin(Object) {
    // public ownErrors: ErrorData[];
    // public childErrors: Record<string, ErrorMessages>;
    // public hasOwnErrors: boolean;
    // public hasChildErrors: boolean;

    public constructor(tracker: ValueTracker) {
        super();
        this.ownErrors = tracker.getOwnErrors();
        this.hasOwnErrors = this.ownErrors.length > 0;

        const childErrors: Record<string, ErrorMessages> = {};
        const { children } = tracker;

        let hasChildErrors = false;
        for (const key of Object.keys(children)) {
            const childError = new ErrorMessages(children[key] as ValueTracker);
            if (childError.hasOwnErrors || Object.keys(childError.childErrors).length > 0) {
                childErrors[key] = childError;
                hasChildErrors = true;
            }
        }
        this.hasChildErrors = hasChildErrors;
        this.childErrors = childErrors;
    }

    public get hasErrors(): boolean {
        return this.hasOwnErrors || this.hasChildErrors;
    }

    private _collectErrors(errors: FlattenedErrors = {}): void {
        if (this.hasOwnErrors) {
            const path = this.ownErrors[0].path;
            errors[path] = [];
            for (const error of this.ownErrors) {
                errors[path].push(error.message);
            }
        }
        if (this.hasChildErrors) {
            for (const key of Object.keys(this.childErrors)) {
                this.childErrors[key]._collectErrors(errors);
            }
        }

    }

    public get flattenedErrors(): FlattenedErrors {
        const errors: FlattenedErrors = {};
        this._collectErrors(errors);
        return errors;
    }


}

export { ErrorMessages };