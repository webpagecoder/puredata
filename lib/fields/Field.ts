'use strict';

import { Translation, TranslationStringRecord } from '../Translation.ts';
import { Presence } from '../Presence.ts';
import type { Processor } from './Processor.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Path } from '../Path.ts';
import { PathDelimTypes } from '../Path.ts';
import { DefaultErrorText } from '../text/DefaultErrorText.ts';


/** Shared configuration options for field definitions. */
export type FieldConfig = {
    autoConvert: boolean;
    defaultValue: unknown;
    errorMessages: Translation;
    label: string;
    mutable: boolean;
    pathDelims: PathDelimTypes; //todo: put in chain only not sure...
    presence: Presence;
    strip: boolean; //todo: implement stripping of the field
};

/** Constructor options for a field configuration. */
export type FieldCtorParams<C extends FieldConfig = FieldConfig> = Partial<C>;

/** Extracts the configuration type represented by a field constructor type. */
export type ConfigFromParams<P extends FieldCtorParams> =
    P extends FieldCtorParams<infer C> ? C : never;

/** Base class for field definitions and their validation configuration. */
abstract class Field<P extends FieldCtorParams = FieldCtorParams> {

    /** Configuration used to process values for this field. */
    public config: ConfigFromParams<P>;
    
    private _cachedProcessor: Processor | null;

    /** Creates a field with the supplied configuration and defaults. */
    public constructor(args: Partial<P> = {}) {
        const {
            autoConvert = true,
            defaultValue = undefined,
            errorMessages = new Translation(DefaultErrorText),
            label = 'Field',
            mutable = true,
            pathDelims = { self: '.', separator: '/', up: '..' },
            presence = 'required',
            strip = false
        } = args;

        this._cachedProcessor = null;
        this.config = {
            autoConvert,
            defaultValue,
            errorMessages: errorMessages.clone(),
            label,
            mutable,
            pathDelims,
            presence,
            strip
        } as ConfigFromParams<P>;
    }

    /** Gets the compiled processor for this field, compiling it on first access. */
    public get processor(): Processor {
        if (!this._cachedProcessor) {
            this._cachedProcessor = this.createProcessor().compile();
        }
        return this._cachedProcessor;
    }

    /**
     * Creates a new field with this field's configuration and supplied overrides.
     *
     * @param args Configuration values to override.
     * @returns A new field of the same concrete type.
     */
    public clone(args: Partial<P> = {}): this {

        const { config } = this;
        const {
            autoConvert = config.autoConvert,
            defaultValue = config.defaultValue,
            errorMessages = config.errorMessages.override(),
            label = config.label,
            mutable = config.mutable,
            pathDelims = config.pathDelims,
            presence = config.presence,
            strip = config.strip
        } = args;

        const allProps = Object.assign(
            this.config,
            {
                autoConvert,
                defaultValue,
                errorMessages,
                label,
                mutable,
                pathDelims,
                presence,
                strip
            },
            args
        );

        return new (this.constructor as new (props?: Partial<P>) => this)(allProps);
    }

    /**
     * Creates the processor used to validate this field.
     *
     * Subclasses must provide an implementation.
     *
     * @returns The processor for this field.
     * @throws {@link Error} If the subclass does not implement this method.
     */
    public createProcessor(): Processor {
        throw new Error('createProcessor() must be implemented in subclass');
    }

    /**
     * Processes a value and returns its tracker with value and validation results.
     *
     * @param value Value to process.
     * @returns Tracker containing the processed value and any errors.
     */
    public process(value?: unknown): ValueTracker {
        const tracker = new ValueTracker(this, value);
        this.processor.process(tracker);
        return tracker;
    }

    /** Whether this field is configured to forbid a value. */
    public isForbidden(): boolean {
        return this.config.presence === 'forbidden';
    }

    /** Whether this field may be omitted. */
    public isOptional(): boolean {
        return this.config.presence === 'optional';
    }

    /** Whether this field is required. */
    public isRequired(): boolean {
        return this.config.presence === 'required';
    }


    // Configurators

    /** Returns a field configured to convert values automatically when possible. */
    public autoConvert(autoConvert: boolean = true): this {
        return this.clone({ autoConvert } as Partial<P>);
    }

    /** Returns a field with the supplied default value. */
    public default(defaultValue: unknown): this {
        return this.clone({ defaultValue } as Partial<P>);
    }

    /** Returns a field with custom error-message overrides. */
    public errors(overrides: Record<string, string>): this {
        const clone = this.clone();
        const errorOverrides: TranslationStringRecord = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this.config.pathDelims)
                .toRelative()
                .toString({ self: '.', separator: '/', up: '..' });
            errorOverrides[internalPathStyle] = overrides[pathStr];
        }
        clone.config.errorMessages.setText(errorOverrides);
        return clone;
    }

    /** Returns a Field with a custom display label. */
    public label(label: string): this {
        return this.clone({ label } as Partial<P>);
    }

    /** Returns a Field whose value cannot be changed by user input. */
    public immutable() : this{
        return this.clone({ mutable: false } as Partial<P>);
    }

    /** Returns a Field whose value can be changed by user input. */
    public mutable() {
        return this.clone({ mutable: true } as Partial<P>);
    }

    /** Returns a field configured to reject a present value. */
    public forbidden(): this {
        return this.clone({ presence: 'forbidden' } as Partial<P>);
    }

    /** Returns a field configured as optional. */
    public optional(): this {
        return this.clone({ presence: 'optional' } as Partial<P>);
    }

    /** Returns a field configured as required. */
    public required(): this {
        return this.clone({ presence: 'required' } as Partial<P>);
    }

    /** Returns a field configured to strip its value when supported. */
    public strip(strip: boolean = true): this {
        return this.clone({ strip } as Partial<P>);
    }

}

export { Field };
