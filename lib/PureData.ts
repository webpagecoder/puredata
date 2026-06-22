'use strict';

import { DefaultErrorText } from './text/DefaultErrorText.ts';
import { DefaultCalendarText } from './text/DefaultCalendarText.ts';
import { GlobalConfig } from './GlobalConfig.ts';
import { AnyChain } from './fields/any/AnyChain.ts';
import { ArrayChain } from './fields/array/ArrayChain.ts';
import { BooleanChain } from './fields/boolean/BooleanChain.ts';
import { ChainCtorParams } from './fields/Chain.ts';
import { DateChain } from './fields/date/DateChain.ts';
import { EnumField, EnumStructure } from './fields/enum/EnumField.ts';
import { Field, FieldCtorParams } from './fields/Field.ts';
import { NumberChain } from './fields/number/NumberChain.ts';
import { ObjectChain, ObjectChainCtorParams } from './fields/object/ObjectChain.ts';
import { PathValueField } from './fields/schema/pathValue/PathValueField.ts';
import { SchemaChain, SchemaObject } from './fields/schema/SchemaChain.ts';
import { ConditionalField } from './fields/schema/conditional/ConditionalField.ts';
import { FieldPointerField } from './fields/schema/fieldPointer/FieldPointerField.ts';
import { StringChain } from './fields/string/StringChain.ts';
import { ValueField } from './fields/value/ValueField.ts';
import { AnyHandler } from './fields/any/AnyHandler.ts';
import { ArrayHandler } from './fields/array/ArrayHandler.ts';
import { BooleanHandler } from './fields/boolean/BooleanHandler.ts';
import { ChainHandler } from './fields/ChainHandler.ts';
import { DateHandler } from './fields/date/DateHandler.ts';
import { NumberHandler } from './fields/number/NumberHandler.ts';
import { ObjectHandler } from './fields/object/ObjectHandler.ts';
import { StringHandler } from './fields/string/StringHandler.ts';
import { Path, PathDelimTypes } from './Path.ts';
import { FieldProcessorMap } from './fields/FieldProcessorMap.ts';
import { Translation } from './Translation.ts';

class PureData {

    protected _calendarText: Translation;
    protected _errorMessages: Translation;
    protected _fieldProcessorMap: FieldProcessorMap;
    protected _globalConfig: GlobalConfig;
    protected _pathDelims: PathDelimTypes;

    constructor({
        calendarText = new Translation(DefaultCalendarText),
        errorMessages = new Translation(DefaultErrorText),
        fieldProcessorMap = new FieldProcessorMap(),
        globalConfig = GlobalConfig,
    } = {}) {
        this._calendarText = calendarText;
        this._errorMessages = errorMessages;
        this._fieldProcessorMap = fieldProcessorMap;
        this._globalConfig = globalConfig;
        this._pathDelims = globalConfig.general.pathDelims;

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
                fieldProcessorMap: this._fieldProcessorMap,
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
                fieldProcessorMap: this._fieldProcessorMap,
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
            props,
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

    public schema(schema: SchemaObject = {}, props: Record<string, unknown> = {}) {
        const finalProps = Object.assign({ schema }, props);
        return new SchemaChain(this._composeChainProps(
            finalProps,
            'object',
            new ObjectHandler()
        ));
    }

    public string(props: Record<string, unknown> = {}) {
        return new StringChain(this._composeChainProps(
            props,
            'string',
            new StringHandler()
        ));
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

