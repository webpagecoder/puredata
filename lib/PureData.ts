'use strict';

import { DefaultErrorText } from './text/DefaultErrorText.ts';
import { DefaultCalendarText } from './text/DefaultCalendarText.ts';
import { GlobalConfig } from './GlobalConfig.ts';
import { AnyChain } from './types/any/AnyChain.ts';
import { ArrayChain } from './types/array/ArrayChain.ts';
import { BooleanChain } from './types/boolean/BooleanChain.ts';
import { ChainConstructorParams } from './fields/chains/Chain.ts';
import { DateChain } from './types/date/DateChain.ts';
import { EnumField, EnumStructure } from './fields/EnumField.ts';
import { Field, FieldConstructorParams } from './types/Field.ts';
import { NumberChain } from './types/number/NumberChain.ts';
import { ObjectChain, ObjectChainConstructorParams } from './types/object/ObjectChain.ts';
import { PathReferenceField } from './types/PathReferenceField.ts';
import { SchemaChain } from './types/schema/SchemaChain.ts';
import { SchemaConditionalField } from './fields/SchemaConditionalField.ts';
import { SchemaReferenceField } from './fields/SchemaReferenceField.ts';
import { StringChain } from './types/string/StringChain.ts';
import { ValueField } from './types/value/ValueField.ts';
import { AnyChainHandler } from './types/any/AnyChainHandler.ts';
import { ArrayHandler } from './types/array/ArrayHandler.ts';
import { BooleanHandler } from './types/boolean/BooleanHandler.ts';
import { ChainHandler } from './types/ChainHandler.ts';
import { DateHandler } from './types/date/DateHandler.ts';
import { NumberHandler } from './types/number/NumberHandler.ts';
import { ObjectHandler } from './types/object/ObjectHandler.ts';
import { StringHandler } from './types/string/StringHandler.ts';
import { Path, PathDelimTypes } from './Path.ts';
import { ProcessorFactory } from './ProcessorFactory.ts';
import { Translation } from './Translation.ts';


class PureData {

    protected _calendarText: Translation;
    protected _errorMessages: Translation;
    protected _pathDelims: PathDelimTypes;
    protected _processorMapper: ProcessorFactory;
    protected _globalConfig: GlobalConfig;

    constructor(
        globalConfig: GlobalConfig,
        processorMapper = new ProcessorFactory(),
        errorMessages = new Translation(DefaultErrorText),
        calendarText = new Translation(DefaultCalendarText)
    ) {
        this._errorMessages = errorMessages;
        this._calendarText = calendarText;
        this._globalConfig = globalConfig;
        this._pathDelims = globalConfig.general.pathDelims;
        this._processorMapper = processorMapper;
    }

    composeChainProps<T extends ChainConstructorParams>(
        props: Record<string, unknown> = {},
        chainType: string,
        chainHandler: ChainHandler
    ) {
        return Object.assign(
            {},
            this._globalConfig['general'],
            {
                chainHandler,
                errorMessages: this._errorMessages,
                pathDelims: this._pathDelims,
                processorMapper: this._processorMapper,
            },
            this._globalConfig[chainType as keyof GlobalConfig],
            props
        ) as T;
    }

    composeFieldProps<T extends FieldConstructorParams>(props: Record<string, unknown> = {}) {
        return Object.assign(
            {},
            this._globalConfig['general'],
            {
                errorMessages: this._errorMessages,
                pathDelims: this._pathDelims,
                processorMapper: this._processorMapper,
            },
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
        return new DateChain(this.composeChainProps(
            Object.assign(props),
            'date',
            new DateHandler(this._calendarText)
        ));
    }

    number(props: Record<string, unknown> = {}) {
        return new NumberChain(this.composeChainProps(
            props,
            'number',
            new NumberHandler()
        ));
    }

    object(props: Record<string, unknown> = {}) {
        return new ObjectChain(this.composeChainProps<ObjectChainConstructorParams>(
            props,
            'object',
            new ObjectHandler()
        ));
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

    calendar(overrides: Record<string, string>) {
        const calendarOverrides: Record<string, string> = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this._pathDelims)
                .toRelative()
                .toNormalizedString();
            calendarOverrides[internalPathStyle] = overrides[pathStr];
        }
        this._errorMessages.setText(calendarOverrides);
    }

    errors(overrides: Record<string, string>) {
        const errorOverrides: Record<string, string> = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this._pathDelims)
                .toRelative()
                .toNormalizedString();
            errorOverrides[internalPathStyle] = overrides[pathStr];
        }
        this._errorMessages.setText(errorOverrides);
    }

    pathDelims(delims: PathDelimTypes) {
        this._pathDelims = delims;
    }

}

export { PureData };

