'use strict';

import { Field } from './Field.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { ReferenceProcessor } from './schema/reference/ReferenceProcessor.ts';

/** Constructor options shared by field processors. */
export type ProcessorCtorParams<F extends Field = Field> = {
    field: F;
};

/** State shared between processor steps, when needed. */
export type State = Record<string, unknown> | undefined;

/** Context passed while processors are compiled. */
export type ProcessorCompilationContext = Record<string, unknown>;

/** Base class for processing and validating values for a field. */
abstract class Processor<F extends Field = Field> {

    private static id: number = 0

    /** Field definition processed by this processor. */
    public field: F;

    private _id: number;
    protected _defaultValueReferenceProcessor: ReferenceProcessor | null;

    /** Creates a processor for the supplied field. */
    public constructor(args: ProcessorCtorParams<F>) {
        const { field } = args;

        this._id = ++Processor.id;
        this._defaultValueReferenceProcessor = null;

        this.field = field;
    }

    /** Gets the unique identifier assigned to this processor. */
    public get id() {
        return this._id;
    }

    /** Compiles this processor; subclasses may prepare state for execution. */
    public compile(context?: ProcessorCompilationContext): Processor {
        return this;
    }

    /**
     * Processes a tracker's value.
     *
     * @param tracker Tracker whose value is processed.
     * @param state Optional state shared with nested processor calls.
     */
    public abstract process(tracker: ValueTracker, state?: State): void;

    /** Applies required/forbidden checks and any configured default value. */
    public preProcess(tracker: ValueTracker): void {
        const { defaultValue, presence } = this.field.config;

        const isDefined = tracker.value !== undefined;

        if (presence === 'required' && !isDefined) {
            tracker.addError('any/required');
        }
        else if (presence === 'forbidden' && isDefined) {
            tracker.addError('any/forbidden');
        }
        else if (!isDefined) {
            const { _defaultValueReferenceProcessor } = this;
            if (_defaultValueReferenceProcessor) {
                _defaultValueReferenceProcessor.process(tracker);
            }
            else {
                tracker.setValue(defaultValue);
            }
        }
    }

}

export { Processor };
