'use strict';

import { FieldProcessorMap } from './FieldProcessorMap.ts';
import { Field } from './Field.ts';
import { PathValueField } from './schema/pathValue/PathValueField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { PathValueProcessor } from './schema/pathValue/PathValueProcessor.ts';

export type ProcessorCtorParams<F extends Field = Field> = {
    field: F;
    fieldProcessorMap: FieldProcessorMap;
};

export type State = Record<string, unknown> | undefined;

export type ProcessorCompilationContext = Record<string, unknown>;

abstract class Processor<F extends Field = Field> {

    private static id: number = 0

    protected _id: number;
    protected _cachedReferences: Set<any> | null;
    protected _defaultValuePathValueProcessor: PathValueProcessor | null;
    protected _field: F;
    protected _fieldProcessorMap: FieldProcessorMap;

    constructor(args: ProcessorCtorParams<F>) {
        const {
            fieldProcessorMap = new FieldProcessorMap(),
            field,
        } = args;

        this._id = ++Processor.id;
        this._cachedReferences = null;
        this._defaultValuePathValueProcessor = null;
        this._field = Object.seal(field);
        this._fieldProcessorMap = fieldProcessorMap;
    }

    public compile(context?: ProcessorCompilationContext): Processor {
        const { _field, _fieldProcessorMap } = this;
        const { defaultValue } = _field;
        if (defaultValue instanceof PathValueField) {
            this._defaultValuePathValueProcessor = 
                _fieldProcessorMap.resolve(defaultValue).compile(context) as PathValueProcessor;
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
            const { _defaultValuePathValueProcessor } = this;
            if (_defaultValuePathValueProcessor) {
                _defaultValuePathValueProcessor.process(tracker);
            }
            else {
                tracker.setValue(_field.defaultValue);
            }
        }
    }

    public hasReferences(): boolean {
        return this.getReferences().size > 0;
    }

    public getReferences(): Set<PathValueField> {
        if (this._cachedReferences) {
            return this._cachedReferences;
        }

        const { _field } = this;
        const references = new Set<PathValueField>();
        if (_field instanceof PathValueField) {
            references.add(_field);
        }
        else {
            const { defaultValue } = _field;
            if (defaultValue instanceof PathValueField) {
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

