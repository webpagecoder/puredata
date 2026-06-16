'use strict';

import { DefaultText } from './config/DefaultErrorText.ts';
import { GlobalConfig } from './config/GlobalConfig.ts';
import { AnyChain } from './fields/AnyChain.ts';
import { ArrayChain } from './fields/ArrayChain.ts';
import { BooleanChain } from './fields/BooleanChain.ts';
import { ChainConstructorParams } from './fields/Chain.ts';
import { DateChain } from './fields/DateChain.ts';
import { EnumField, EnumStructure } from './fields/EnumField.ts';
import { Field, FieldConstructorParams } from './fields/Field.ts';
import { NumberChain } from './fields/NumberChain.ts';
import { ObjectChain, ObjectChainConstructorParams } from './fields/ObjectChain.ts';
import { PathReferenceField } from './fields/PathReferenceField.ts';
import { SchemaChain } from './fields/SchemaChain.ts';
import { SchemaConditionalField } from './fields/SchemaConditionalField.ts';
import { SchemaReferenceField, SchemaReferenceFieldConstructorParams } from './fields/SchemaReferenceField.ts';
import { StringChain } from './fields/StringChain.ts';
import { ValueField } from './fields/ValueField.ts';
import { AnyChainHandler } from './handlers/AnyChainHandler.ts';
import { ArrayHandler } from './handlers/ArrayHandler.ts';
import { BooleanHandler } from './handlers/BooleanHandler.ts';
import { ChainHandler } from './handlers/ChainHandler.ts';
import { DateHandler } from './handlers/DateHandler.ts';
import { NumberHandler } from './handlers/NumberHandler.ts';
import { ObjectHandler } from './handlers/ObjectHandler.ts';
import { StringHandler } from './handlers/StringHandler.ts';
import { Locale } from './Locale.ts';
import { Path, PathDelimTypes } from './path/Path.ts';
import { PathFactory } from './path/PathFactory.ts';
import { ProcessorFactory } from './ProcessorFactory.ts';

Locale.register('en-US', DefaultText);

class PureData {

    private _locale: Locale;
    private _pathDelims: PathDelimTypes;
    private _processorMapper: ProcessorFactory;
    private _globalConfig: GlobalConfig;

    constructor(globalConfig: GlobalConfig, processorMapper = new ProcessorFactory()) {
        this._globalConfig = globalConfig;
        this._locale = new Locale(globalConfig.general.localeCode);
        this._pathDelims = globalConfig.general.pathDelims;
        this._processorMapper = processorMapper;
    }

    composeChainProps<T extends ChainConstructorParams>(
        props: Record<string, unknown> = {},
        chainType: string,
        chainHandler: ChainHandler
    ) {
        return Object.assign(
            {
                chainHandler,
                locale: this._locale,
                pathDelims: this._pathDelims,
                processorMapper: this._processorMapper,
            },
            this._globalConfig['general'],
            this._globalConfig[chainType as keyof GlobalConfig],
            props
        ) as T;
    }

    composeFieldProps<T extends FieldConstructorParams>(props: Record<string, unknown> = {}) {
        return Object.assign(
            {
                locale: this._locale,
                pathDelims: this._pathDelims,
                processorMapper: this._processorMapper,
            },
            this._globalConfig['general'],
            props
        ) as T;
    }

    // Chains

    any() {
        return new AnyChain(this.composeChainProps({}, 'any', new AnyChainHandler()));
    }

    array(props: Record<string, unknown> = {}) {
        return new ArrayChain(
            this.composeChainProps(props, 'array', new ArrayHandler())
        );
    }

    boolean(props: Record<string, unknown> = {}) {
        return new BooleanChain(
            this.composeChainProps(props, 'boolean', new BooleanHandler())
        );
    }

    date(props: Record<string, unknown> = {}) {
        return new DateChain(
            this.composeChainProps(props, 'date', new DateHandler(this._locale))
        );
    }

    number(props: Record<string, unknown> = {}) {
        return new NumberChain(this.composeChainProps(props, 'number', new NumberHandler()));
    }

    object(props: Record<string, unknown> = {}) {
        return new ObjectChain(this.composeChainProps<ObjectChainConstructorParams>(props, 'object', new ObjectHandler()));
    }

    schema(schema: Record<string, Field> = {}, props: Record<string, unknown> = {}) {
        const finalProps = Object.assign({ schema }, props);
        return new SchemaChain(this.composeChainProps(finalProps, 'object', new ObjectHandler()));
    }

    string(props: Record<string, unknown> = {}) {
        return new StringChain(this.composeChainProps(props, 'string', new StringHandler()));
    }

    // Fields

    enum(structure: EnumStructure) {
        return new EnumField(this.composeFieldProps({ structure }));
    }

    immutable(value: unknown) {
        return new ValueField(this.composeFieldProps({ value, mutable: false }));
    }

    mutable(value: unknown) {
        return new ValueField(this.composeFieldProps({ value, mutable: true }));
    }

    value(pathStr: string, defaultOrCallback: unknown = undefined) {
        return new PathReferenceField(this.composeFieldProps({ pathStr, defaultOrCallback }));
    }

    // Field pointer

    field(pathStr: string, minDepth?: number, maxDepth?: number) {
        return new SchemaReferenceField(this.composeFieldProps({
            minDepth,
            maxDepth,
            fieldPath: new Path(pathStr, this._pathDelims)
        }));
    }

    // Conditionals

    satisfies(targetPathStr: string, comparisonField: Field) {
        return new SchemaConditionalField(this.composeFieldProps({
            areEqual: true,
            targetPathStr,
            comparisonField,
        }));
    }

    violates(targetPathStr: string, comparisonField: Field) {
        return new SchemaConditionalField(this.composeFieldProps({
            areEqual: false,
            targetPathStr,
            comparisonField,
        }));
    }

    // Settings 

    calendar(){}

    errors(overrides: Record<string, string>) {
        const errorOverrides: Record<string, string> = {};
        for (const pathStr of Object.keys(overrides)) {
            const path = new Path(['errors', pathStr], this._pathDelims);
            errorOverrides[path.toString()] = overrides[pathStr];
        }

        this._locale.override(errorOverrides);
    }

    language(){}

    pathDelims(delims: PathDelimTypes) {
        this._pathDelims = delims;
    }


}

export { PureData };

