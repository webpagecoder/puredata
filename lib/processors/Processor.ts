'use strict';

import { ValueNode } from '../tracker/ValueNode.ts';
import { Utils } from '../utils/Utils.ts';
import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { CompilationMapper } from '../CompilationMapper.ts';

export type ProcessorProps = { 
    field: any; 
    compilationMapper: CompilationMapper
};

class Processor {

    static id = 0;
    props: ProcessorProps;
    cachedReferences: Set<any> | null = null;
    state: Record<string, unknown> = {};

    constructor(props: ProcessorProps) {
        const { field, compilationMapper } = props;
        this.props = {
            compilationMapper,
            defaultValueReference: null,
            field,
            id: ++Processor.id
        };
    }

    get valueNodeConstructor() {
        return ValueNode;
    }

    clone(props = {}) {
        return new this.constructor(Utils.mergeObjects(this.props, props || {}));
    }

    compile() {
        const { field, compilationMapper } = this.props;
        const { defaultValue } = field.props;
        if (defaultValue instanceof PathReferenceField) {
            this.props.defaultValueReference = compilationMapper.createProcessor(defaultValue);
        }
        return this;
    }

    process(valueOrValueNode, state = {}) {

        const { field } = this.props;
        this.state = state;

        let value, tracker;

        if (valueOrValueNode instanceof ValueNode) {
            value = valueOrValueNode.value;
            tracker = valueOrValueNode;
            // tracker.clearErrors();
        }
        else {
            value = valueOrValueNode;
            tracker = new ValueNode(value, { compiledField: this });
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

    _process(tracker, state = {}) {
        return tracker;
    }

    hasReferences() {
        return this.getReferences().size > 0;
    }

    getReferences() {
        if(this.cachedReferences) {
            return this.cachedReferences;
        }

        const { field } = this.props;
        const references = new Set();
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
