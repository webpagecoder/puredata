'use strict';

import { Field } from './Field.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ReferenceProcessor } from './schema/reference/ReferenceProcessor.ts';

export type ProcessorCtorParams<F extends Field = Field> = {
    field: F;
};

export type State = Record<string, unknown> | undefined;

export type ProcessorCompilationContext = Record<string, unknown>;

abstract class Processor<F extends Field = Field> {

    private static id: number = 0

    protected _id: number;
    protected _defaultValueReferenceProcessor: ReferenceProcessor | null;
    protected _field: F;

    constructor(args: ProcessorCtorParams<F>) {
        const { field } = args;

        this._id = ++Processor.id;
        this._defaultValueReferenceProcessor = null;
        this._field = Object.seal(field);
    }

    public compile(context?: ProcessorCompilationContext): Processor {
        return this;
    }

    public abstract process(tracker: ValueTracker, state?: State): void;

    public preProcess(tracker: ValueTracker): void {
        const { _field } = this;

        const isDefined = tracker.getValue() !== undefined;

        if (_field.isRequired() && !isDefined) {
            tracker.addError('any/required');
        }
        else if (_field.isForbidden() && isDefined) {
            tracker.addError('any/forbidden');
        }
        else if (!isDefined) {
            const { _defaultValueReferenceProcessor } = this;
            if (_defaultValueReferenceProcessor) {
                _defaultValueReferenceProcessor.process(tracker);
            }
            else {
                tracker.setValue(_field.defaultValue);
            }
        }
    }

    public get field(): F {
        return this._field;
    }

}

export { Processor };

