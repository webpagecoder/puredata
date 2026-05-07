'use strict';

import { ValueTracker } from '../tracker/ValueTracker.ts';
import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { Field } from '../fields/Field.ts';

export type ProcessorProps<F extends Field = Field> = {
    field: F;
    processorMapper?: FieldProcessorFactory;
    defaultValueReference?: Processor;
};

export type State = Record<string, unknown>;

abstract class Processor<F extends Field = Field> {

    private static id: number = 0

    protected _id: number;
    protected _cachedReferences: Set<any> | null;
    protected _defaultValueProcessor: Processor | null;
    protected _field: F;
    protected _processorMapper: FieldProcessorFactory;
    // protected _state: Record<string, unknown>;
    
    constructor(props: ProcessorProps<F>) {
        const {
            processorMapper = new FieldProcessorFactory(),
            field,
        } = props;

        this._id = ++Processor.id;
        this._cachedReferences = null;
        this._defaultValueProcessor = null;
        this._field = field;
        this._processorMapper = processorMapper;
        // this._state = {};
    }

    public compile(_context: Record<string, unknown> = {}): this {
        const { _field, _processorMapper } = this;
        const { defaultValue } = _field;
        if (defaultValue instanceof PathReferenceField) {
            this._defaultValueProcessor = _processorMapper.createProcessor(defaultValue);
        }
        return this;
    }

    protected actualProcess(tracker: ValueTracker, state: State = {}): ValueTracker {
        const { _field } = this;
        
        const isDefined = tracker.getValue() !== undefined;

        if (_field.isRequired() && !isDefined) {
            return tracker.addError('generic/required');
        }
        else if (_field.isForbidden() && isDefined) {
            return tracker.addError('generic/forbidden');
        }
        else if (!isDefined) {
            const { _defaultValueProcessor } = this;
            if (_defaultValueProcessor) {
                _defaultValueProcessor.actualProcess(tracker, state);
            }
            else {
                tracker.setValue(_field.defaultValue);
            }
            return tracker;
        }
        
        return tracker;
    }

    public process(value: unknown = undefined): ValueTracker {
        return this.actualProcess(new ValueTracker(value, this));
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
        this._cachedReferences = references;
        return references;
    }

    public get field(): F {
        return this._field;
    }

}

export { Processor };
