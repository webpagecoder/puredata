'use strict';

import { AnyChain, AnyChainCtorParams } from './fields/any/AnyChain.ts';
import { ArrayChain, ArrayChainCtorParams } from './fields/array/ArrayChain.ts';
import { BooleanChain, BooleanChainCtorParams } from './fields/boolean/BooleanChain.ts';
import { DateChain, DateChainCtorParams } from './fields/date/DateChain.ts';
import { EnumField, EnumFieldCtorParams, EnumStructure } from './fields/enum/EnumField.ts';
import { Field, FieldCtorParams } from './fields/Field.ts';
import { NumberChain, NumberChainCtorParams } from './fields/number/NumberChain.ts';
import { ObjectChain, ObjectChainCtorParams } from './fields/object/ObjectChain.ts';
import { ConditionalField } from './fields/schema/conditional/ConditionalField.ts';
import { FieldPointerField } from './fields/schema/fieldPointer/FieldPointerField.ts';
import { PathValueField, PathValueFieldCtorParams } from './fields/schema/pathValue/PathValueField.ts';
import { SchemaChain, SchemaChainCtorParams, SchemaObject } from './fields/schema/SchemaChain.ts';
import { StringChain, StringChainCtorParams } from './fields/string/StringChain.ts';
import { GlobalConfig } from './GlobalConfig.ts';
import { Path, PathDelimTypes } from './Path.ts';
import { DefaultCalendarText } from './text/DefaultCalendarText.ts';
import { DefaultErrorText } from './text/DefaultErrorText.ts';
import { Translation } from './Translation.ts';
import { Utils } from './Utils.ts';

class PureData {

    protected _calendarText: Translation;
    protected _errorMessages: Translation;
    protected _globalConfig: GlobalConfig;
    protected _pathDelims: PathDelimTypes;

    constructor({
        calendarText = new Translation(DefaultCalendarText),
        errorMessages = new Translation(DefaultErrorText),
        globalConfig = GlobalConfig,
    } = {}) {
        this._calendarText = calendarText;
        this._errorMessages = errorMessages;
        this._globalConfig = Utils.clone(globalConfig);
        this._pathDelims = this._globalConfig.any.pathDelims;

    }

    public get instance() {
        return PureData;
    }

    protected _composeChainProps<T extends AnyChainCtorParams>(
        chainType: string,
        props: Record<string, unknown> = {}
    ) {
        return Object.assign(
            {},
            this._globalConfig['any'],
            {
                errorMessages: this._errorMessages,
                pathDelims: this._pathDelims,
            },
            this._globalConfig[chainType as keyof GlobalConfig],
            props
        ) as T;
    }

    protected _composeFieldProps(
        props: Record<string, unknown> = {}
    ) {
        return Object.assign(
            {},
            this._globalConfig['any'],
            {
                errorMessages: this._errorMessages,
                pathDelims: this._pathDelims,
            },
            props
        );
    }

    // Chains

    public any() {
        return new AnyChain(this._composeChainProps<AnyChainCtorParams>('any'));
    }

    public array() {
        return new ArrayChain(this._composeChainProps<ArrayChainCtorParams>('array'));
    }

    public boolean() {
        return new BooleanChain(this._composeChainProps<BooleanChainCtorParams>('boolean'));
    }

    public date() {
        return new DateChain(this._composeChainProps<DateChainCtorParams>('date'));
    }
    public number() {
        return new NumberChain(this._composeChainProps<NumberChainCtorParams>('number'));
    }

    public object() {
        return new ObjectChain(this._composeChainProps<ObjectChainCtorParams>('object'));
    }

    public schema(schema: SchemaObject = {}) {
        return new SchemaChain(this._composeChainProps<SchemaChainCtorParams>('object', {
            schema,
            anyChain: this.any(),
            arrayChain: this.array(),
        }));
    }

    public string() {
        return new StringChain(this._composeChainProps<StringChainCtorParams>('string'));
    }

    // Fields

    public enum(structure: EnumStructure) {
        return new EnumField(this._composeFieldProps({ structure }));
    }

    public immutable(value: unknown) {
        return new AnyChain(this._composeFieldProps({ value, mutable: false }));
    }

    public mutable(value: unknown) {
        return new AnyChain(this._composeFieldProps({ value, mutable: true }));
    }

    public value<T = unknown>(pathStr: string, defaultOrCallback: unknown = undefined): T {
        return new PathValueField(this._composeFieldProps({ pathStr, defaultOrCallback })) as T;
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

    public config(config: Partial<GlobalConfig> = {}) {
        this._globalConfig = Utils.mergeObjects(this._globalConfig, config) as GlobalConfig;
        this._pathDelims = this._globalConfig.any.pathDelims;
    }

    public calendarText(overrides: Record<string, string>) {
        const calendarOverrides: Record<string, string> = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this._pathDelims)
                .toRelative()
                .toNormalizedString();
            calendarOverrides[internalPathStyle] = overrides[pathStr];
        }
        this._calendarText.setText(calendarOverrides);
    }

    public errorText(overrides: Record<string, string>) {
        const errorOverrides: Record<string, string> = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this._pathDelims)
                .toRelative()
                .toNormalizedString();
            errorOverrides[internalPathStyle] = overrides[pathStr];
        }
        this._errorMessages.setText(errorOverrides);
    }

    // public pathDelims(delims: PathDelimTypes) {
    //     this._pathDelims = delims;
    // }
}

const PureDataInstance = new PureData();

export { PureDataInstance as PureData };

