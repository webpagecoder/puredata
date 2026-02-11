'use strict';

const Entity = require("./Entity");
const CompiledMixin = require('./CompiledMixin');
const ValueNode = require("../tracker/ValueNode");
const PathReference = require("./reference/PathReference");
const Path = require("../path/Path");
const ObjectUtils = require("../utils/ObjectUtils");


class CompiledEntity {

    constructor(props = {}) {
        const { entity, compilationMapper } = props;
        this.props = {
            compilationMapper,
            defaultValueReference: null,
            entity,
            id: ++CompiledEntity.id
        };
    }

    get valueNodeConstructor() {
        return ValueNode;
    }

    clone(props = {}) {
        return new this.constructor(ObjectUtils.deepMerge(this.props, props || {}));
    }

    compile() {
        const { entity, compilationMapper } = this.props;
        const { defaultValue } = entity.props;
        if (defaultValue instanceof PathReference) {
            this.props.defaultValueReference = compilationMapper.createCompiledEntity(defaultValue);
        }
        return this;
    }

    process(valueOrValueNode, state = {}) {

        const { entity } = this.props;
        this.state = state;

        let value, tracker;

        if (valueOrValueNode instanceof ValueNode) {
            value = valueOrValueNode.value;
            tracker = valueOrValueNode;
            // tracker.clearErrors();
        }
        else {
            value = valueOrValueNode;
            tracker = new ValueNode(value, { compiledEntity: this });
        }
        // tracker.entity = entity;

        const isDefined = tracker.getValue() !== undefined;


        if (entity.isRequired() && !isDefined) {
            return tracker.addError('generic/required');
        }
        else if (entity.isForbidden() && isDefined) {
            return tracker.addError('generic/forbidden');
        }
        else if (!isDefined) {
            const { defaultValueReference } = this.props;
            if (defaultValueReference) {
                defaultValueReference.process(tracker, state);
            }
            else {
                tracker.setValue(entity.props.defaultValue);
            }
        }
        else {
            this._process(tracker, state);
        }
        
        return tracker;
    }

    _process(tracker) {
        return tracker;
    }

    hasReferences() {
        return this.getReferences().size > 0;
    }

    getReferences() {
        if(this.cachedReferences) {
            return this.cachedReferences;
        }

        const { entity } = this.props;
        const references = new Set();
        if (entity instanceof PathReference) {
            references.add(entity);
        }
        else {
            const { defaultValue } = entity.props;
            if (defaultValue instanceof PathReference) {
                references.add(defaultValue);
            }
        }
        this.cachedReferences = references;
        return references;
    }

}

CompiledEntity.id = 0;

module.exports = CompiledEntity;