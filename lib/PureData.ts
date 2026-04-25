'use strict';

import { FieldProcessorFactory } from './FieldProcessorFactory.ts';
import { DEFAULT_LANGUAGE } from './config/DefaultLanguage.ts';
import { ArrayChain } from './fields/ArrayChain.ts';
import { BooleanChain } from './fields/BooleanChain.ts';
import { Chain } from './fields/Chain.ts';
import { DateChain } from './fields/DateChain.ts';
import { NumberChain } from './fields/NumberChain.ts';
import { SchemaChain } from './fields/SchemaChain.ts';
import { StringChain } from './fields/StringChain.ts';
import { EnumField } from './fields/EnumField.ts';
import { PathReferenceField } from './fields/PathReferenceField.ts';
import { ReferenceField } from './fields/ReferenceField.ts';
import { SchemaConditionalField } from './fields/SchemaConditionalField.ts';
import { ValueField } from './fields/ValueField.ts';
import { Locale } from './Locale.ts';
import { Path } from './Path.ts';
import { Presence } from './Presence.ts';
import { ArrayHandler } from './handlers/ArrayHandler.ts';
import { BooleanHandler } from './handlers/BooleanHandler.ts';
import { DateHandler } from './handlers/DateHandler.ts';
import { NumberHandler } from './handlers/NumberHandler.ts';
import { ObjectHandler } from './handlers/ObjectHandler.ts';
import { StringHandler } from './handlers/StringHandler.ts';
import { Utils } from './utils/Utils.ts';
import { NormalizedDate } from './date/NormalizedDate.ts';

Locale.register('en-US', DEFAULT_LANGUAGE);

class PureData {
    constructor(config, compilationMapper = new FieldProcessorFactory()) {
        this.config = Utils.clone(config);

        Path.delims(this.config.general.pathDelims);

        const { locale } = this.config.general;

        this.locale = new Locale(locale);
        this.compilationMapper = compilationMapper;
    }

    setProps(updatedConfig) {
        this.config = Utils.mergeObjects(this.config, updatedConfig);
    }

    paths(delims) {
        Path.delims(delims);
    }

    composeProps(props = {}, chainType, chainHandler) {
        const { config, compilationMapper, locale } = this;
        return Object.assign(
            {
                compilationMapper,
                locale,
                chainHandler
            },
            config.general,
            config[chainType],
            chainHandler,
            props
        );
    }

    // Chains
    array(props = {}) {
        return new ArrayChain(this.composeProps(props, 'array', ArrayHandler));
    }

    boolean(props = {}) {
        return new BooleanChain(this.composeProps(props, 'boolean', BooleanHandler));
    }

    date(props = {}) {
        return new DateChain(this.composeProps(props, 'date', DateHandler));
    }

    enum(structure = []) {
        return new EnumField(this.composeProps({ structure }));
    }

    any() {
        return new Chain(this.composeProps());
    }

    number(props = {}) {
        return new NumberChain(this.composeProps(props, 'number', NumberHandler));
    }

    object(props = {}) {
        return new DateChain(this.composeProps(props, 'object', ObjectHandler));
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
            ObjectHandler
        ));
    }

    string(props = {}) {
        return new StringChain(this.composeProps(props, 'string', StringHandler));
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
        return Presence.Optional;
    }

    get forbidden() {
        return Presence.Forbidden;
    }

    get required() {
        return Presence.Required;
    }

    get now() {
        return new Date();
    }
}

export { PureData };
