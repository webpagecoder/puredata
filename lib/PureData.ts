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
import { Handler } from './handlers/Handler.ts';

Locale.register('en-US', DEFAULT_LANGUAGE);

class PureData {

    private _locale: Locale;
    private _processorMapper: FieldProcessorFactory;
    private _globalConfig: PureDataConfig;


    constructor(globalConfig, processorMapper = new FieldProcessorFactory()) {
        this._globalConfig = globalConfig;

        Path.delims(this._globalConfig.general.pathDelims);

        const { localeCode } = this._globalConfig.general;

        this._locale = new Locale(localeCode);
        this._processorMapper = processorMapper;

    }

    // clone(updatedConfig) {
    //     this._config = Utils.mergeObjects(this._config, updatedConfig);
    // }

    paths(delims) {
        Path.delims(delims);
    }

    composeProps(props = {}, chainType: string, chainHandler: Handler) {
        return Object.assign(
            {
                chainHandler
            },
            this._globalConfig['general'],
            this._globalConfig[chainType],
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
        return new DateChain(this.composeProps(props, 'date', new DateHandler(this._locale)));
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
        const finalProps = Object.assign({ schema }, props);
        return new SchemaChain(this.composeProps(finalProps, 'object', new ObjectHandler()));
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

