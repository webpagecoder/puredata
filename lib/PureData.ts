'use strict';

import { FieldProcessorFactory } from './FieldProcessorFactory.ts';
import { Locale } from './Locale.ts';
import { Path } from './Path.ts';
import { DEFAULT_LANGUAGE } from './config/DefaultLanguage.ts';
import { ArrayChain } from './fields/ArrayChain.ts';
import { BooleanChain } from './fields/BooleanChain.ts';
import { Chain } from './fields/Chain.ts';
import { DateChain } from './fields/DateChain.ts';
import { EnumField } from './fields/EnumField.ts';
import { NumberChain } from './fields/NumberChain.ts';
import { PathReferenceField } from './fields/PathReferenceField.ts';
import { ReferenceField } from './fields/ReferenceField.ts';
import { SchemaChain } from './fields/SchemaChain.ts';
import { SchemaConditionalField } from './fields/SchemaConditionalField.ts';
import { StringChain } from './fields/StringChain.ts';
import { ValueField } from './fields/ValueField.ts';
import { ArrayHandler } from './handlers/ArrayHandler.ts';
import { BooleanHandler } from './handlers/BooleanHandler.ts';
import { DateHandler } from './handlers/DateHandler.ts';
import { NumberHandler } from './handlers/NumberHandler.ts';
import { ObjectHandler } from './handlers/ObjectHandler.ts';
import { StringHandler } from './handlers/StringHandler.ts';
import { Utils } from './Utils.ts';

Locale.register('en-US', DEFAULT_LANGUAGE);

class PureData {

    private _config: PureDataConfig;
    private _locale: Locale
    private _processorMapper: FieldProcessorFactory;

    constructor(config, processorMapper = new FieldProcessorFactory()) {
        this.config = Utils.clone(config);

        Path.delims(this.config.general.pathDelims);

        const { localeCode } = this.config.general;

        this.locale = new Locale(localeCode);
        this.processorMapper = processorMapper;
    }

    clone(updatedConfig) {
        this.config = Utils.mergeObjects(this.config, updatedConfig);
    }

    paths(delims) {
        Path.delims(delims);
    }

    composeProps(props = {}, chainType, chainHandler) {
        const { config, processorMapper, locale } = this;
        return Object.assign(
            {
                processorMapper,
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
        return new ArrayChain(this.composeProps(props, 'array', new ArrayHandler()));
    }

    boolean(props = {}) {
        return new BooleanChain(this.composeProps(props, 'boolean', new BooleanHandler()));
    }

    date(props = {}) {
        //todo: redo how props are configged. get rid of composeProps
        const dateOrder = props.dateOrder || this.config.date.dateOrder;
        return new DateChain(this.composeProps(props, 'date', new DateHandler(this.locale, dateOrder)));
    }

    enum(structure = []) {
        return new EnumField(this.composeProps({ structure }));
    }

    any() {
        return new Chain(this.composeProps());
    }

    number(props = {}) {
        return new NumberChain(this.composeProps(props, 'number', new NumberHandler()));
    }

    object(props = {}) {
        return new DateChain(this.composeProps(props, 'object', new ObjectHandler()));
    }

    pointer(pathStr, minDepth, maxDepth) {
        return new ReferenceField(this.composeProps({
            minDepth,
            maxDepth,
            path: Path.create(pathStr),
        }));
    }

    schema(schema = {}, props = {}) {
        return new SchemaChain(this.composeProps(
            Object.assign({ schema }, this.config.schema, props),
            'object',
            ObjectHandler
        ));
    }

    string(props = {}) {
        return new StringChain(this.composeProps(props, 'string', new StringHandler()));
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
        return 'optional';
    }

    get forbidden() {
        return 'forbidden';
    }

    get required() {
        return 'required';
    }

    get now() {
        return new Date();
    }
}

export { PureData };

