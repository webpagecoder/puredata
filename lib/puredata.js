'use strict';

import CompilationMapper from './CompilationMapper.js';
import DefaultLanguage from './config/DefaultLanguage.js';
import ArrayChain from './fields/chains/ArrayChain.js';
import BooleanChain from './fields/chains/BooleanChain.js';
import Chain from './fields/chains/Chain.js';
import DateChain from './fields/chains/DateChain.js';
import NumberChain from './fields/chains/NumberChain.js';
import SchemaChain from './fields/chains/SchemaChain.js';
import StringChain from './fields/chains/StringChain.js';
import EnumField from './fields/EnumField.js';
import PathReferenceField from './fields/PathReferenceField.js';
import ReferenceField from './fields/ReferenceField.js';
import SchemaConditionalField from './fields/SchemaConditionalField.js';
import ValueField from './fields/ValueField.js';
import Locale from './Locale.js';
import Path from './Path.js';
import Presence from './Presence.js';
import ArrayProcessors from './processors/ArrayProcessors.js';
import BooleanProcessors from './processors/BooleanProcessors.js';
import DateProcessors from './processors/DateProcessors.js';
import NumberProcessors from './processors/NumberProcessors.js';
import ObjectProcessors from './processors/ObjectProcessors.js';
import StringProcessors from './processors/StringProcessors.js';
import ObjectUtils from './utils/ObjectUtils.js';

Locale.register('en-US', DefaultLanguage);

class PureData {
    constructor(config, compilationMapper = new CompilationMapper()) {
        this.config = ObjectUtils.clone(config);

        Path.delims(this.config.general.pathDelims);

        const { locale } = this.config.general;

        this.locale = new Locale(locale, 'errors');
        this.compilationMapper = compilationMapper;
    }

    setProps(updatedConfig) {
        this.config = ObjectUtils.deepMerge(this.config, updatedConfig);
    }

    paths(delims) {
        Path.delims(delims);
    }

    composeProps(props = {}, chainType, chainProcessors) {
        const { config, compilationMapper, locale } = this;
        return Object.assign(
            {
                compilationMapper,
                locale,
                processors: chainProcessors
            },
            config.general,
            config[chainType],
            chainProcessors,
            props
        );
    }

    // Chains
    array(props = {}) {
        return new ArrayChain(this.composeProps(props, 'array', ArrayProcessors));
    }

    boolean(props = {}) {
        return new BooleanChain(this.composeProps(props, 'boolean', BooleanProcessors));
    }

    date(props = {}) {
        return new DateChain(this.composeProps(props, 'date', DateProcessors));
    }

    enum(structure = []) {
        return new EnumField(this.composeProps({ structure }));
    }

    any() {
        return new Chain(this.composeProps());
    }

    number(props = {}) {
        return new NumberChain(this.composeProps(props, 'number', NumberProcessors));
    }

    object(props = {}) {
        return new DateChain(this.composeProps(props, 'object', ObjectProcessors));
    }

    pointer(pathStr, minDepth, maxDepth) {
        return new ReferenceField(this.composeProps({
            minDepth,
            maxDepth,
            path: Path.create(pathStr),
        }));
    }

    schema(structure = {}, props = {}) {
        return new SchemaChain(this.composeProps(
            Object.assign({ structure }, this.config.schema, props),
            'object',
            ObjectProcessors
        ));
    }

    string(props = {}) {
        return new StringChain(this.composeProps(props, 'string', StringProcessors));
    }

    // Other fields

    mutable(value) {
        return new ValueField(this.composeProps({ value, mutable: true }));
    }

    immutable(value) {
        return new ValueField(this.composeProps({ value, mutable: false }));
    }

    // conditionals

    satisfies(pathStr, comparisonField) {
        return new SchemaConditionalField(this.composeProps({
            areEqual: true,
            referencePath: this.value(pathStr),
            comparisonField,
        }));
    }

    violates(pathStr, comparisonField) {
        return new SchemaConditionalField(this.composeProps({
            areEqual: false,
            referencePath: this.value(pathStr),
            comparisonField,
        }));
    }

    errors(overrides) {
        const finalOverrides = {};
        for (const key of Object.keys(overrides)) {
            finalOverrides[Path.fromArray(['errors', key])] = overrides[key];
        }

        this.locale.override(finalOverrides);
    }

    value(pathStr, defaultOrCallback) {
        return new PathReferenceField(this.composeProps({ pathStr, defaultOrCallback }));
    }

    get optional() {
        return Presence.optional;
    }

    get forbidden() {
        return Presence.forbidden;
    }

    get required() {
        return Presence.required;
    }

    get now() {
        return new Date();
    }
}

export default PureData;
