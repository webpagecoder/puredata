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

    public field: F;

    protected _id: number;
    protected _defaultValueReferenceProcessor: ReferenceProcessor | null;

    constructor(args: ProcessorCtorParams<F>) {
        const { field } = args;

        this._id = ++Processor.id;
        this._defaultValueReferenceProcessor = null;

        this.field = field;
    }

    public compile(context?: ProcessorCompilationContext): Processor {
        return this;
    }

    public abstract process(tracker: ValueTracker, state?: State): void;

    public preProcess(tracker: ValueTracker): void {
        const { field } = this;

        const isDefined = tracker.getValue() !== undefined;

        if (field.isRequired() && !isDefined) {
            tracker.addError('any/required');
        }
        else if (field.isForbidden() && isDefined) {
            tracker.addError('any/forbidden');
        }
        else if (!isDefined) {
            const { _defaultValueReferenceProcessor } = this;
            if (_defaultValueReferenceProcessor) {
                _defaultValueReferenceProcessor.process(tracker);
            }
            else {
                tracker.setValue(field.default);
            }
        }
    }

}

export { Processor };

