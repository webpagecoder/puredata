'use strict';

import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Utils } from '../utils/Utils.ts';
import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { Field } from '../fields/Field.ts';

export type ProcessorProps = {
    field: Field;
    compilationMapper: FieldProcessorFactory;
    defaultValueReference?: Processor;
};

export type State = Record<string, unknown>;

class Processor<P extends ProcessorProps = ProcessorProps> {

    static id: number = 0;

    declare props: P;

    id: number;
    cachedReferences: Set<any> | null = null;
    state: Record<string, unknown> = {};

    constructor(props: P) {
        const { field, compilationMapper } = props;
        this.props = {
            compilationMapper,
            field,
        } as P;
        this.id = ++Processor.id;
    }

    clone(props: Partial<P>): this {
        const Constructor = this.constructor as new (props?: Partial<P>) => this;
        return new Constructor(
            Object.assign({}, this.props, props || {}) as P
        );
    }

    compile(): this {
        const { field, compilationMapper } = this.props;
        const { defaultValue } = field.props;
        if (defaultValue instanceof PathReferenceField) {
            this.props.defaultValueReference = compilationMapper.createProcessor(defaultValue);
        }
        return this;
    }

    process(valueOrValueTracker: unknown | ValueTracker = undefined, state: State = {}): ValueTracker {

        const { field } = this.props;
        this.state = state;

        let value, tracker;

        if (valueOrValueTracker instanceof ValueTracker) {
            value = valueOrValueTracker.value;
            tracker = valueOrValueTracker;
            // tracker.clearErrors();
        }
        else {
            value = valueOrValueTracker;
            tracker = new ValueTracker(value, this);
        }
        // tracker.field = field;

        const isDefined = tracker.getValue() !== undefined;

        if (field.isRequired() && !isDefined) {
            return tracker.addError('generic/required');
        }
        else if (field.isForbidden() && isDefined) {
            return tracker.addError('generic/forbidden');
        }
        else if (!isDefined) {
            const { defaultValueReference } = this.props;
            if (defaultValueReference) {
                defaultValueReference.process(tracker, state);
            }
            else {
                tracker.setValue(field.props.defaultValue);
            }
        }
        else {
            this._process(tracker, state);
        }

        return tracker;
    }

    _process(tracker: ValueTracker, state: State = {}): ValueTracker {
        return tracker;
    }

    hasReferences(): boolean {
        return this.getReferences().size > 0;
    }

    getReferences(): Set<PathReferenceField> {
        if (this.cachedReferences) {
            return this.cachedReferences;
        }

        const { field } = this.props;
        const references = new Set<PathReferenceField>();
        if (field instanceof PathReferenceField) {
            references.add(field);
        }
        else {
            const { defaultValue } = field.props;
            if (defaultValue instanceof PathReferenceField) {
                references.add(defaultValue);
            }
        }
        this.cachedReferences = references;
        return references;
    }

}

export { Processor };
