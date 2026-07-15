'use strict';

import { AnyChain, AnyChainCtorParams } from './fields/any/AnyChain.ts';
import { ArrayChain } from './fields/array/ArrayChain.ts';
import { BooleanChain } from './fields/boolean/BooleanChain.ts';
import { DateChain } from './fields/date/DateChain.ts';
import { EnumField, EnumStructure } from './fields/enum/EnumField.ts';
import { Field, FieldCtorParams } from './fields/Field.ts';
import { NumberChain } from './fields/number/NumberChain.ts';
import { ObjectChain, ObjectChainCtorParams } from './fields/object/ObjectChain.ts';
import { ConditionalField } from './fields/schema/conditional/ConditionalField.ts';
import { FieldPointerField } from './fields/schema/fieldPointer/FieldPointerField.ts';
import { PathValueField } from './fields/schema/pathValue/PathValueField.ts';
import { SchemaChain, SchemaObject } from './fields/schema/SchemaChain.ts';
import { StringChain } from './fields/string/StringChain.ts';
import { ValueField } from './fields/value/ValueField.ts';
import { GlobalConfig } from './GlobalConfig.ts';
import { Path, PathDelimTypes } from './Path.ts';
import { DefaultCalendarText } from './text/DefaultCalendarText.ts';
import { DefaultErrorText } from './text/DefaultErrorText.ts';
import { Translation } from './Translation.ts';
import { Utils } from './Utils.ts';

class PureData {

    protected _calendarText: Translation;
    protected _errorMessages: Translation;
    protected _config: GlobalConfig;
    protected _pathDelims: PathDelimTypes;

    constructor({
        calendarText = new Translation(DefaultCalendarText),
        errorMessages = new Translation(DefaultErrorText),
        globalConfig = GlobalConfig,
    } = {}) {
        this._calendarText = calendarText;
        this._errorMessages = errorMessages;
        this._config = Utils.clone(globalConfig);
        this._pathDelims = this._config.general.pathDelims;

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
            this._config['general'],
            {
                errorMessages: this._errorMessages,
                pathDelims: this._pathDelims,
            },
            this._config[chainType as keyof GlobalConfig],
            props
        ) as T;
    }

    protected _composeFieldProps<T extends FieldCtorParams>(props: Record<string, unknown> = {}) {
        return Object.assign(
            {},
            this._config['general'],
            {
                errorMessages: this._errorMessages,
                pathDelims: this._pathDelims,
            },
            props
        ) as T;
    }

    // Chains

    public any() {
        return new AnyChain(this._composeChainProps('any', {}));
    }

    public array(props: Record<string, unknown> = {}) {
        return new ArrayChain(this._composeChainProps('array', props));
    }

    public boolean(props: Record<string, unknown> = {}) {
        return new BooleanChain(this._composeChainProps('boolean', props));
    }

    public date(props: Record<string, unknown> = {}) {
        return new DateChain(this._composeChainProps(
            'date',
            Object.assign({ calendarText: this._calendarText }, props)
        ));
    }

    public number(props: Record<string, unknown> = {}) {
        return new NumberChain(this._composeChainProps('number', props));
    }

    public object(props: Record<string, unknown> = {}) {
        return new ObjectChain(this._composeChainProps<ObjectChainCtorParams>('object', props));
    }

    public schema(schema: SchemaObject = {}, props: Record<string, unknown> = {}) {
        return new SchemaChain(this._composeChainProps('object', Object.assign({ schema }, props)));
    }

    public string(props: Record<string, unknown> = {}) {
        return new StringChain(this._composeChainProps('string', props));
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

    public config(config: Partial<GlobalConfig> = {}) {
        this._config = Utils.mergeObjects(this._config, config) as GlobalConfig;
        this._pathDelims = this._config.general.pathDelims;
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

