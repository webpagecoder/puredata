'use strict';

import { Field } from './Field.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { PathValueProcessor } from './schema/pathValue/PathValueProcessor.ts';

export type ProcessorCtorParams<F extends Field = Field> = {
    field: F;
};

export type State = Record<string, unknown> | undefined;

export type ProcessorCompilationContext = Record<string, unknown>;

abstract class Processor<F extends Field = Field> {

    private static id: number = 0

    protected _id: number;
    protected _cachedReferences: Set<any> | null;
    protected _defaultValuePathValueProcessor: PathValueProcessor | null;
    protected _field: F;

    constructor(args: ProcessorCtorParams<F>) {
        const { field } = args;

        this._id = ++Processor.id;
        this._cachedReferences = null;
        this._defaultValuePathValueProcessor = null;
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
            tracker.addError('generic/required');
        }
        else if (_field.isForbidden() && isDefined) {
            tracker.addError('generic/forbidden');
        }
        else if (!isDefined) {
            const { _defaultValuePathValueProcessor } = this;
            if (_defaultValuePathValueProcessor) {
                _defaultValuePathValueProcessor.process(tracker);
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

