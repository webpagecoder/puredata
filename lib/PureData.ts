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




/**
 * Factory for building field definitions with shared configuration and text.
 *
 * The exported `PureData` value is a configured instance of this factory.
 */
class PureData extends FieldFactory {

    /** Calendar translations used by fields created from this factory. */
    private _calendarText: Translation;

    /** Error-message translations used by fields created from this factory. */
    private _errorMessages: Translation;

    /** Configuration defaults used by fields created from this factory. */
    private _globalConfig: GlobalConfig;

    /** Path delimiters used by fields created from this factory. */
    private _pathDelims: PathDelimTypes;

    /**
     * Creates a field factory with optional text and configuration overrides.
     *
     * @param options Factory configuration.
     */
    public constructor({
        calendarText = new Translation(DefaultCalendarText),
        errorMessages = new Translation(DefaultErrorText),
        globalConfig = GlobalConfig,
    } = {}) {
        super();
        this._calendarText = calendarText;
        this._errorMessages = errorMessages;
        this._globalConfig = Utils.clone(globalConfig);

        // Hardwired pathDelims for now...
        this._pathDelims = {
            up: '..',
            self: '.',
            separator: '/',
        }
    }

    /** Gets the factory class. */
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
    /** Infers and returns a field definition for the supplied value. */
    public auto(value: unknown) {
        return this.coerce(value);
    }

    // Chains

    /** Creates a chain for values of any type. */
    public any() {
        return new AnyChain(this._composeChainProps<AnyChainCtorParams>('any'));
    }

    /** Creates a chain for array values. */
    public array() {
        return new ArrayChain(this._composeChainProps<ArrayChainCtorParams>('array'));
    }

    /** Creates a chain for boolean values. */
    public boolean() {
        return new BooleanChain(this._composeChainProps<BooleanChainCtorParams>('boolean'));
    }

    /** Creates a chain for date values. */
    public date() {
        return new DateChain(this._composeChainProps<DateChainCtorParams>('date'));
    }

    /** Creates a chain for numeric values. */
    public number() {
        return new NumberChain(this._composeChainProps<NumberChainCtorParams>('number'));
    }

    /** Creates a chain for object values. */
    public object() {
        return new ObjectChain(this._composeChainProps<ObjectChainCtorParams>('object'));
    }

    /** Creates a schema chain for the supplied object schema. */
    public schema(schema: Schema = {}) {
        return new SchemaChain(this._composeChainProps<SchemaChainCtorParams>('object', {
            schema,
            fieldFactory: this,
        }));
    }

    /** Creates a chain for string values. */
    public string() {
        return new StringChain(this._composeChainProps<StringChainCtorParams>('string'));
    }

    // Fields

    /** Creates a field that validates values against an enumeration. */
    public enum(structure: EnumStructure) {
        return new EnumField(this._composeFieldProps<EnumFieldCtorParams>({ structure }));
    }

    /** Creates a field that supplies a fixed value and rejects user changes. */
    public immutable(value: unknown) {
        return new AnyChain(this._composeFieldProps<AnyChainCtorParams>({
            defaultValue: value,
            mutable: false
        }));
    }

    /** Creates a field with the supplied default value that accepts user changes. */
    public mutable(value: unknown) {
        return new AnyChain(this._composeFieldProps<AnyChainCtorParams>({
            defaultValue: value,
            mutable: true
        }));
    }

    /**
     * Creates a field that reads a value from another path.
     *
     * @param pathStr Path to the referenced value.
     * @param defaultOrCallback Fallback value or callback used by the reference field.
     * @returns A reference field typed as `T`.
     */
    public value<T = unknown>(pathStr: string, defaultOrCallback: unknown = undefined): T {
        return new ReferenceField(this._composeFieldProps<ReferenceFieldCtorParams>({ pathStr, defaultOrCallback })) as T;
    }

    // Field pointers

    /**
     * Creates a field pointer to another field in the schema.
     *
     * @param pathStr Path to the target field.
     * @param nestMinDepth Minimum nesting depth, or `null` for no minimum.
     * @param nestMaxDepth Maximum nesting depth, or `null` for no maximum.
     */
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

    /** Creates a conditional field that passes when the target equals the comparison field. */
    public satisfies(targetPathStr: string, comparisonField: Field) {
        return new ConditionalField(this._composeFieldProps<ConditionalFieldCtorParams>({
            fieldFactory: this,
            comparisonField,
            comparisonMode: 'equals',
            targetPathStr,
        }));
    }

    /** Creates a conditional field that passes when the target differs from the comparison field. */
    public violates(targetPathStr: string, comparisonField: Field) {
        return new ConditionalField(this._composeFieldProps<ConditionalFieldCtorParams>({
            fieldFactory: this,
            comparisonField,
            comparisonMode: 'notEquals',
            targetPathStr,
        }));
    }

    // Settings 

    /**
     * Creates a new factory with merged global configuration.
     *
     * @param config Configuration values to override.
     * @returns A factory instance with the updated configuration.
     */
    public config(config: Partial<GlobalConfig> = {}) {
        return new PureData({
            globalConfig: Utils.mergeObjects(this._globalConfig, config) as GlobalConfig,
            calendarText: this._calendarText,
            errorMessages: this._errorMessages
        })
    }

    /**
     * Creates a new factory with calendar text overrides.
     *
     * @param overrides Translation strings keyed by calendar path.
     * @returns A factory instance with the updated calendar text.
     */
    public calendarText(overrides: Record<string, string>) {
        const calendarOverrides: Record<string, string> = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this._pathDelims)
                .toRelative()
                .toNormalizedString();
            calendarOverrides[internalPathStyle] = overrides[pathStr];
        }

        const calendarText = this._calendarText.clone();
        calendarText.setText(calendarOverrides);

        return new PureData({
            globalConfig: this._globalConfig,
            calendarText,
            errorMessages: this._errorMessages
        })
    }

    /**
     * Creates a new factory with error-message text overrides.
     *
     * @param overrides Translation strings keyed by error path.
     * @returns A factory instance with the updated error text.
     */
    public errorText(overrides: Record<string, string>) {
        const errorOverrides: Record<string, string> = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this._pathDelims)
                .toRelative()
                .toNormalizedString();
            errorOverrides[internalPathStyle] = overrides[pathStr];
        }

        const errorMessages = this._errorMessages.clone();
        errorMessages.setText(errorOverrides);

        return new PureData({
            globalConfig: this._globalConfig,
            calendarText: this._calendarText,
            errorMessages
        })
    }

}

const PureDataInstance = new PureData();

export { PureDataInstance as PureData };
