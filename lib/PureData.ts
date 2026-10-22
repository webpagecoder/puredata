'use strict';

import { FieldFactory } from './fields/FieldFactory.ts';
import { AnyChain, AnyChainCtorParams } from './fields/any/AnyChain.ts';
import { ArrayChain, ArrayChainCtorParams } from './fields/array/ArrayChain.ts';
import { BooleanChain, BooleanChainCtorParams } from './fields/boolean/BooleanChain.ts';
import { DateChain, DateChainCtorParams } from './fields/date/DateChain.ts';
import { EnumField, EnumFieldCtorParams, EnumStructure } from './fields/enum/EnumField.ts';
import { Field, FieldCtorParams } from './fields/Field.ts';
import { NumberChain, NumberChainCtorParams } from './fields/number/NumberChain.ts';
import { ObjectChain, ObjectChainCtorParams } from './fields/object/ObjectChain.ts';
import { ConditionalField, ConditionalFieldCtorParams } from './fields/schema/conditional/ConditionalField.ts';
import { PointerField, PointerFieldCtorParams } from './fields/schema/pointer/PointerField.ts';
import { ReferenceField, ReferenceFieldCtorParams } from './fields/schema/reference/ReferenceField.ts';
import { Schema, SchemaChain, SchemaChainCtorParams } from './fields/schema/SchemaChain.ts';
import { StringChain, StringChainCtorParams } from './fields/string/StringChain.ts';
import { GlobalConfig } from './GlobalConfig.ts';
import { Path, PathDelimTypes } from './Path.ts';
import { DefaultCalendarText } from './text/DefaultCalendarText.ts';
import { DefaultErrorText } from './text/DefaultErrorText.ts';
import { Translation } from './Translation.ts';
import { Utils } from './Utils.ts';

//TODO puredata should also be immutable. when they config, you need to make a new instance



class PureData extends FieldFactory {

    private _calendarText: Translation;
    private _errorMessages: Translation;
    private _globalConfig: GlobalConfig;
    private _pathDelims: PathDelimTypes;

    public constructor({
        calendarText = new Translation(DefaultCalendarText),
        errorMessages = new Translation(DefaultErrorText),
        globalConfig = GlobalConfig,
    } = {}) {
        super();
        this._calendarText = calendarText;
        this._errorMessages = errorMessages;
        this._globalConfig = Utils.clone(globalConfig);
        this._pathDelims = this._globalConfig.any.pathDelims;
    }

    public get instance() {
        return PureData;
    }

    private _composeChainProps<T extends AnyChainCtorParams>(
        chainType: string,
        props: Partial<T> = {}
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

    private _composeFieldProps<T extends FieldCtorParams>(props: Partial<T> = {}) {
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

    // Specialized 
    public auto(value: unknown) {
        return this.coerce(value);
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

    public schema(schema: Schema = {}) {
        return new SchemaChain(this._composeChainProps<SchemaChainCtorParams>('object', {
            schema,
            fieldFactory: this,
        }));
    }

    public string() {
        return new StringChain(this._composeChainProps<StringChainCtorParams>('string'));
    }

    // Fields

    public enum(structure: EnumStructure) {
        return new EnumField(this._composeFieldProps<EnumFieldCtorParams>({ structure }));
    }

    public immutable(value: unknown) {
        return new AnyChain(this._composeFieldProps<AnyChainCtorParams>({ 
            defaultValue: value, 
            mutable: false
         }));
    }

    public mutable(value: unknown) {
        return new AnyChain(this._composeFieldProps<AnyChainCtorParams>({ 
            defaultValue: value, 
            mutable: true 
        }));
    }

    public value<T = unknown>(pathStr: string, defaultOrCallback: unknown = undefined): T {
        return new ReferenceField(this._composeFieldProps<ReferenceFieldCtorParams>({ pathStr, defaultOrCallback })) as T;
    }

    // Field pointers

    public field(
        pathStr: string,
        nestMinDepth: number | null = null,
        nestMaxDepth: number | null = null
    ) {
        return new PointerField(this._composeFieldProps<PointerFieldCtorParams>({
            nestMinDepth,
            nestMaxDepth,
            fieldPath: new Path(pathStr, this._pathDelims)
        }));
    }

    // Conditionals

    public satisfies(targetPathStr: string, comparisonField: Field) {
        return new ConditionalField(this._composeFieldProps<ConditionalFieldCtorParams>({
            fieldFactory: this,
            comparisonField,
            comparisonMode: 'equals',
            targetPathStr,
        }));
    }

    public violates(targetPathStr: string, comparisonField: Field) {
        return new ConditionalField(this._composeFieldProps({
            fieldFactory: this,
            comparisonField,
            comparisonMode: 'notEquals',
            targetPathStr,
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

}

const PureDataInstance = new PureData();

export { PureDataInstance as PureData };

