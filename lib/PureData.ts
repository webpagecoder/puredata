'use strict';

import { DefaultErrorText } from './text/DefaultErrorText.ts';
import { DefaultCalendarText } from './text/DefaultCalendarText.ts';
import { GlobalConfig } from './GlobalConfig.ts';
import { AnyChain } from './types/any/AnyChain.ts';
import { ArrayChain } from './types/array/ArrayChain.ts';
import { BooleanChain } from './types/boolean/BooleanChain.ts';
import { ChainCtorParams } from './types/Chain.ts';
import { DateChain } from './types/date/DateChain.ts';
import { EnumField, EnumStructure } from './types/enum/EnumField.ts';
import { Field, FieldCtorParams } from './types/Field.ts';
import { NumberChain } from './types/number/NumberChain.ts';
import { ObjectChain, ObjectChainCtorParams } from './types/object/ObjectChain.ts';
import { PathValueField } from './types/schema/pathValue/PathValueField.ts';
import { SchemaChain } from './types/schema/SchemaChain.ts';
import { ConditionalField } from './types/schema/conditional/ConditionalField.ts';
import { FieldPointerField } from './types/schema/fieldPointer/FieldPointerField.ts';
import { StringChain } from './types/string/StringChain.ts';
import { ValueField } from './types/value/ValueField.ts';
import { AnyHandler } from './types/any/AnyHandler.ts';
import { ArrayHandler } from './types/array/ArrayHandler.ts';
import { BooleanHandler } from './types/boolean/BooleanHandler.ts';
import { ChainHandler } from './types/ChainHandler.ts';
import { DateHandler } from './types/date/DateHandler.ts';
import { NumberHandler } from './types/number/NumberHandler.ts';
import { ObjectHandler } from './types/object/ObjectHandler.ts';
import { StringHandler } from './types/string/StringHandler.ts';
import { Path, PathDelimTypes } from './Path.ts';
import { FieldProcessorMap } from './types/FieldProcessorMap.ts';
import { Translation } from './Translation.ts';


class PureData {

    protected _calendarText: Translation;
    protected _errorMessages: Translation;
    protected _pathDelims: PathDelimTypes;
    protected _processorMapper: FieldProcessorMap;
    protected _globalConfig: GlobalConfig;

    constructor(
        globalConfig = GlobalConfig,
        processorMapper = new FieldProcessorMap(),
        errorMessages = new Translation(DefaultErrorText),
        calendarText = new Translation(DefaultCalendarText)
    ) {
        this._errorMessages = errorMessages;
        this._calendarText = calendarText;
        this._globalConfig = globalConfig;
        this._pathDelims = globalConfig.general.pathDelims;
        this._processorMapper = processorMapper;
    }

    public get instance() {
        return PureData;
    }

    protected _composeChainProps<T extends ChainCtorParams>(
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

    protected _composeFieldProps<T extends FieldCtorParams>(props: Record<string, unknown> = {}) {
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

    public any() {
        return new AnyChain(this._composeChainProps({}, 'any', new AnyHandler()));
    }

    public array(props: Record<string, unknown> = {}) {
        return new ArrayChain(
            this._composeChainProps(props, 'array', new ArrayHandler())
        );
    }

    public boolean(props: Record<string, unknown> = {}) {
        return new BooleanChain(
            this._composeChainProps(props, 'boolean', new BooleanHandler())
        );
    }

    public date(props: Record<string, unknown> = {}) {
        return new DateChain(this._composeChainProps(
            Object.assign(props),
            'date',
            new DateHandler(this._calendarText)
        ));
    }

    public number(props: Record<string, unknown> = {}) {
        return new NumberChain(this._composeChainProps(
            props,
            'number',
            new NumberHandler()
        ));
    }

    public object(props: Record<string, unknown> = {}) {
        return new ObjectChain(this._composeChainProps<ObjectChainCtorParams>(
            props,
            'object',
            new ObjectHandler()
        ));
    }

    public schema(schema: Record<string, Field> = {}, props: Record<string, unknown> = {}) {
        const finalProps = Object.assign({ schema }, props);
        return new SchemaChain(this._composeChainProps(finalProps, 'object', new ObjectHandler()));
    }

    public string(props: Record<string, unknown> = {}) {
        return new StringChain(this._composeChainProps(props, 'string', new StringHandler()));
    }

    // Fields

    public enum(structure: EnumStructure) {
        return new EnumField(this._composeFieldProps({ structure }));
    }

    public immutable(value: unknown) {
        return new ValueField(this._composeFieldProps({ value, mutable: false }));
    }

    public mutable(value: unknown) {
        return new ValueField(this._composeFieldProps({ value, mutable: true }));
    }

    public value(pathStr: string, defaultOrCallback: unknown = undefined) {
        return new PathValueField(this._composeFieldProps({ pathStr, defaultOrCallback }));
    }

    // Field pointer

    public field(pathStr: string, minDepth?: number, maxDepth?: number) {
        return new FieldPointerField(this._composeFieldProps({
            minDepth,
            maxDepth,
            fieldPath: new Path(pathStr, this._pathDelims)
        }));
    }

    // Conditionals

    public satisfies(targetPathStr: string, comparisonField: Field) {
        return new ConditionalField(this._composeFieldProps({
            areEqual: true,
            targetPathStr,
            comparisonField,
        }));
    }

    public violates(targetPathStr: string, comparisonField: Field) {
        return new ConditionalField(this._composeFieldProps({
            areEqual: false,
            targetPathStr,
            comparisonField,
        }));
    }

    // Settings 

    public calendar(overrides: Record<string, string>) {
        const calendarOverrides: Record<string, string> = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this._pathDelims)
                .toRelative()
                .toNormalizedString();
            calendarOverrides[internalPathStyle] = overrides[pathStr];
        }
        this._errorMessages.setText(calendarOverrides);
    }

    public errors(overrides: Record<string, string>) {
        const errorOverrides: Record<string, string> = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this._pathDelims)
                .toRelative()
                .toNormalizedString();
            errorOverrides[internalPathStyle] = overrides[pathStr];
        }
        this._errorMessages.setText(errorOverrides);
    }

    public pathDelims(delims: PathDelimTypes) {
        this._pathDelims = delims;
    }

}

const PureDataInstance = new PureData();

export { PureDataInstance as PureData };

