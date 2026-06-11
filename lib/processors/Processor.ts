'use strict';

import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { Field } from '../fields/Field.ts';
import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { PathReferenceProcessor } from './PathReferenceProcessor.ts';

export type ProcessorConstructorParams<F extends Field = Field> = {
    field: F;
    processorMapper: FieldProcessorFactory;
};

export type State = Record<string, unknown> | undefined;

export type ProcessorCompilationContext = Record<string, unknown>;

abstract class Processor<F extends Field = Field> {

    private static id: number = 0

    protected _id: number;
    protected _cachedReferences: Set<any> | null;
    protected _defaultValuePathReferenceProcessor: PathReferenceProcessor | null;
    protected _field: F;
    protected _processorMapper: FieldProcessorFactory;

    constructor(args: ProcessorConstructorParams<F>) {
        const {
            processorMapper = new FieldProcessorFactory(),
            field,
        } = args;

        this._id = ++Processor.id;
        this._cachedReferences = null;
        this._defaultValuePathReferenceProcessor = null;
        this._field = Object.seal(field);
        this._processorMapper = processorMapper;
    }

    public compile(context?: ProcessorCompilationContext): this {
        const { _field, _processorMapper } = this;
        const { defaultValue } = _field;
        if (defaultValue instanceof PathReferenceField) {
            this._defaultValuePathReferenceProcessor = 
                _processorMapper.createProcessor(defaultValue).compile(context) as PathReferenceProcessor;
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
            const { _defaultValuePathReferenceProcessor } = this;
            if (_defaultValuePathReferenceProcessor) {
                _defaultValuePathReferenceProcessor.process(tracker);
            }
            else {
                tracker.setValue(_field.defaultValue);
            }
        }
    }

    public hasReferences(): boolean {
        return this.getReferences().size > 0;
    }

    public getReferences(): Set<PathReferenceField> {
        if (this._cachedReferences) {
            return this._cachedReferences;
        }

        const { _field } = this;
        const references = new Set<PathReferenceField>();
        if (_field instanceof PathReferenceField) {
            references.add(_field);
        }
        else {
            const { defaultValue } = _field;
            if (defaultValue instanceof PathReferenceField) {
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

