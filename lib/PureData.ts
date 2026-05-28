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
import { Field } from './fields/Field.ts';

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
    //     this._props = Utils.mergeObjects(this._props, updatedConfig);
    // }

    paths(delims) {
        Path.delims(delims);
    }

    composeChainProps(props = {}, chainType: string, chainHandler: Handler) {
        return Object.assign(
            {
                chainHandler
            },
            this._globalConfig['general'],
            this._globalConfig[chainType],
            props
        );
    }

    composeFieldProps(props = {}) {
        return Object.assign(
            {},
            this._globalConfig['general'],
            props
        );
    }

    // Chains
    array(props = {}) {
        return new ArrayChain(this.composeChainProps(props, 'array', new ArrayHandler()));
    }

    boolean(props = {}) {
        return new BooleanChain(this.composeChainProps(props, 'boolean', new BooleanHandler()));
    }

    date(props = {}) {
        return new DateChain(
            this.composeChainProps(props, 'date', new DateHandler(this._locale)
            ));
    }

    enum(structure = []) {
        return new EnumField(this.composeChainProps({ structure }));
    }

    any() {
        return new Chain(this.composeChainProps());
    }

    number(props = {}) {
        return new NumberChain(this.composeChainProps(props, 'number', new NumberHandler()));
    }

    object(props = {}) {
        return new DateChain(this.composeChainProps(props, 'object', new ObjectHandler()));
    }

    pointer(pathStr, minDepth, maxDepth) {
        return new ReferenceField(this.composeChainProps({
            minDepth,
            maxDepth,
            path: Path.create(pathStr),
        }));
    }

    schema(schema = {}, props = {}) {
        const finalProps = Object.assign({ schema }, props);
        return new SchemaChain(this.composeChainProps(finalProps, 'object', new ObjectHandler()));
    }

    string(props = {}) {
        return new StringChain(this.composeChainProps(props, 'string', new StringHandler()));
    }

    // Other fields

    mutable(value) {
        return new ValueField(this.composeChainProps({ value, mutable: true }));
    }

    immutable(value) {
        return new ValueField(this.composeChainProps({ value, mutable: false }));
    }

    // conditionals

    satisfies(pathStr: string, comparisonField: Field) {
        return new SchemaConditionalField(this.composeChainProps({
            areEqual: true,
            referencePath: this.value(pathStr),
            comparisonField,
        }));
    }

    violates(pathStr: string, comparisonField: Field) {
        return new SchemaConditionalField(this.composeChainProps({
            areEqual: false,
            referencePath: this.value(pathStr),
            comparisonField,
        }));
    }

    errors(overrides: Record<string, string>) {
        const finalOverrides: Record<string, string> = {};
        for (const key of Object.keys(overrides)) {
            finalOverrides[Path.fromArray(['errors', key])] = overrides[key];
        }

        this.locale.override(finalOverrides);
    }

    value(pathStr: string, defaultOrCallback: unknown = undefined) {
        return new PathReferenceField(this.composeFieldProps({ pathStr, defaultOrCallback }));
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
        //todo: date shift via utc setting here!
        return new Date();
    }
}

export { PureData };

