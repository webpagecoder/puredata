'use strict';

import { Translation, TranslationStringRecord } from '../Translation.ts';
import { Presence } from '../Presence.ts';
import type { Processor } from './Processor.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Path } from '../Path.ts';
import { PathDelimTypes } from '../Path.ts';
import { DefaultErrorText } from '../text/DefaultErrorText.ts';

export type FieldProps = {};

export type FieldCtorParams = {
    autoConvert?: boolean;
    defaultValue?: unknown;
    errorMessages?: Translation;
    label?: string;
    pathDelims?: PathDelimTypes;
    presence?: Presence;
    strip?: boolean;
};

export type FieldCloneParams<P extends FieldProps = FieldProps> = Partial<FieldCtorParams & P>;

abstract class Field<P extends FieldProps = FieldProps> {

    protected _autoConvert: boolean;
    protected _defaultValue: unknown;
    protected _errorMessages: Translation;
    protected _label: string
    protected _pathDelims: PathDelimTypes;
    protected _presence: Presence;
    protected _strip: boolean;

    protected _cachedProcessor: Processor | null;
    protected _props: P;

    public constructor(args: FieldCtorParams = {}) {
        const {
            autoConvert = true,
            defaultValue = undefined,
            errorMessages = new Translation(DefaultErrorText),
            label = 'Field',
            pathDelims = { self: '.', separator: '/', up: '..' },
            presence = 'required',
            strip = false
        } = args;

        this._autoConvert = autoConvert;
        this._defaultValue = defaultValue;
        this._errorMessages = errorMessages.override();
        this._label = label;
        this._pathDelims = pathDelims;
        this._presence = presence;
        this._strip = strip;

        this._cachedProcessor = null;
        this._props = {} as P;
    }

    public get defaultValue(): unknown {
        return this._defaultValue;
    }

    public get props(): P {
        return this._props;
    }

    public get errorMessages(): Translation {
        return this._errorMessages;
    }

    public get presence(): Presence {
        return this._presence;
    }

    public get processor(): Processor {
        if (!this._cachedProcessor) {
            this._cachedProcessor = this.createProcessor().compile();
        }
        return this._cachedProcessor;
    }

    public get autoConvert(): boolean {
        return this._autoConvert;
    }

    public get pathDelims(): PathDelimTypes {
        return this._pathDelims;
    }

    public clone(args: FieldCloneParams<P> = {}): this {

        const {
            autoConvert = this._autoConvert,
            defaultValue = this._defaultValue,
            label = this._label,
            errorMessages = this._errorMessages.override(),
            pathDelims = this._pathDelims,
            presence = this._presence
        } = args;

        const allProps = Object.assign(
            {
                autoConvert,
                defaultValue,
                label,
                errorMessages,
                pathDelims,
                presence
            },
            this._props,
            args as Partial<P>
        );

        return new (this.constructor as new (props?: FieldCtorParams) => this)(allProps);
    }

    public createProcessor(): Processor {
        throw new Error('createProcessor() must be implemented in subclass');
    }

    public process(value?: unknown): ValueTracker {
        const tracker = new ValueTracker(this, value);
        this.processor.process(tracker);
        return tracker;
    }

    public isForbidden(): boolean {
        return this._presence === 'forbidden';
    }

    public isOptional(): boolean {
        return this._presence === 'optional';
    }

    public isRequired(): boolean {
        return this._presence === 'required';
    }

    public getLabel(): string {
        return this._label;
    }

    
    // *****************************************************
    //               Declarative API Methods
    // *****************************************************

    public config(config: P): this {
        return this.clone(config);
    }

    public default(defaultValue: unknown): this {
        return this.clone({ defaultValue, presence: 'optional' } as FieldCloneParams<P>);
    }

    public errorText(overrides: Record<string, string>): this {
        const clone = this.clone();
        const errorOverrides: TranslationStringRecord = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this._pathDelims)
                .toRelative()
                .toString({ self: '.', separator: '/', up: '..' });
            errorOverrides[internalPathStyle] = overrides[pathStr];
        }
        clone._errorMessages.setText(errorOverrides);
        return clone;
    }

    public forbidden(): this {
        return this.clone({ presence: 'forbidden' } as FieldCloneParams<P>);
    }

    public label(label: string): this {
        return this.clone({ label } as FieldCloneParams<P>);
    }

    public optional(): this {
        return this.clone({ presence: 'optional' } as FieldCloneParams<P>);
    }

    public required(): this {
        return this.clone({ presence: 'required' } as FieldCloneParams<P>);
    }

    public strip(strip: boolean = true): this {
        return this.clone({ strip } as FieldCloneParams<P>);
    }

}

export { Field };

