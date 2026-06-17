'use strict';

import { ProcessorFactory } from '../ProcessorFactory.ts';
import { Field } from './Field.ts';
import { PathField } from './schema/PathField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { PathProcessor } from './PathProcessor.ts';

export type ProcessorCtorParams<F extends Field = Field> = {
    field: F;
    processorMapper: ProcessorFactory;
};

export type State = Record<string, unknown> | undefined;

export type ProcessorCompilationContext = Record<string, unknown>;

abstract class Processor<F extends Field = Field> {

    private static id: number = 0

    protected _id: number;
    protected _cachedReferences: Set<any> | null;
    protected _defaultValuePathProcessor: PathProcessor | null;
    protected _field: F;
    protected _processorMapper: ProcessorFactory;

    constructor(args: ProcessorCtorParams<F>) {
        const {
            processorMapper = new ProcessorFactory(),
            field,
        } = args;

        this._id = ++Processor.id;
        this._cachedReferences = null;
        this._defaultValuePathProcessor = null;
        this._field = Object.seal(field);
        this._processorMapper = processorMapper;
    }

    public compile(context?: ProcessorCompilationContext): Processor {
        const { _field, _processorMapper } = this;
        const { defaultValue } = _field;
        if (defaultValue instanceof PathField) {
            this._defaultValuePathProcessor = 
                _processorMapper.createProcessor(defaultValue).compile(context) as PathProcessor;
        }
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
            const { _defaultValuePathProcessor } = this;
            if (_defaultValuePathProcessor) {
                _defaultValuePathProcessor.process(tracker);
            }
            else {
                tracker.setValue(_field.defaultValue);
            }
        }
    }

    public hasReferences(): boolean {
        return this.getReferences().size > 0;
    }

    public getReferences(): Set<PathField> {
        if (this._cachedReferences) {
            return this._cachedReferences;
        }

        const { _field } = this;
        const references = new Set<PathField>();
        if (_field instanceof PathField) {
            references.add(_field);
        }
        else {
            const { defaultValue } = _field;
            if (defaultValue instanceof PathField) {
                references.add(defaultValue);
            }
        }
        return this._cachedReferences = references;
    }

    public get field(): F {
        return this._field;
    }

}

export { Processor };

