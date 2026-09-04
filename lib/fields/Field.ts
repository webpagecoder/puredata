'use strict';

import { Translation, TranslationStringRecord } from '../Translation.ts';
import { Presence } from '../Presence.ts';
import type { Processor } from './Processor.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Path } from '../Path.ts';
import { PathDelimTypes } from '../Path.ts';
import { DefaultErrorText } from '../text/DefaultErrorText.ts';


export type FieldConfig = {
    autoConvert: boolean;
    defaultValue: unknown;
    errorMessages: Translation;
    label: string;
    pathDelims: PathDelimTypes; //todo: put in chain only not sure...
    presence: Presence;
    strip: boolean;
};

export type FieldCtorParams<C extends FieldConfig = FieldConfig> = Partial<C>;

export type ConfigFromParams<P extends FieldCtorParams> =
    P extends FieldCtorParams<infer C> ? C : never;

abstract class Field<P extends FieldCtorParams = FieldCtorParams> {

    protected _cachedProcessor: Processor | null;
    protected _config: ConfigFromParams<P>;

    public constructor(args: Partial<P> = {}) {
        const {
            autoConvert = true,
            defaultValue = undefined,
            errorMessages = new Translation(DefaultErrorText),
            label = 'Field',
            pathDelims = { self: '.', separator: '/', up: '..' },
            presence = 'required',
            strip = false
        } = args;

        this._cachedProcessor = null;
        this._config = {
            autoConvert,
            defaultValue,
            errorMessages: errorMessages.clone(),
            label,
            pathDelims,
            presence,
            strip
        } as ConfigFromParams<P>;
    }

    public get defaultValue(): unknown {
        return this._config.defaultValue;
    }

    public get props(): ConfigFromParams<P> {
        return this._config;
    }

    public get errorMessages(): Translation {
        return this._config.errorMessages;
    }

    public get presence(): Presence {
        return this._config.presence;
    }

    public get processor(): Processor {
        if (!this._cachedProcessor) {
            this._cachedProcessor = this.createProcessor().compile();
        }
        return this._cachedProcessor;
    }

    public get autoConvert(): boolean {
        return this._config.autoConvert;
    }

    public get pathDelims(): PathDelimTypes {
        return this._config.pathDelims;
    }

    public clone(args: Partial<P> = {}): this {

        const { _config } = this;
        const {
            autoConvert = _config.autoConvert,
            defaultValue = _config.defaultValue,
            label = _config.label,
            errorMessages = _config.errorMessages.override(),
            pathDelims = _config.pathDelims,
            presence = _config.presence
        } = args;

        const allProps = Object.assign(
            this._config,
            {
                autoConvert,
                defaultValue,
                label,
                errorMessages,
                pathDelims,
                presence
            },
            args
        );

        return new (this.constructor as new (props?: Partial<P>) => this)(allProps);
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
        return this._config.presence === 'forbidden';
    }

    public isOptional(): boolean {
        return this._config.presence === 'optional';
    }

    public isRequired(): boolean {
        return this._config.presence === 'required';
    }

    public getLabel(): string {
        return this._config.label;
    }


    // *****************************************************
    //               Declarative API Methods
    // *****************************************************

    public config(config: Partial<ConfigFromParams<P>>): this {
        return this.clone(config as Partial<P>);
    }

    public default(defaultValue: unknown): this {
        return this.clone({ defaultValue, presence: 'optional' } as Partial<P>);
    }

    public errorText(overrides: Record<string, string>): this {
        const clone = this.clone();
        const errorOverrides: TranslationStringRecord = {};
        for (const pathStr of Object.keys(overrides)) {
            const internalPathStyle = new Path(pathStr, this._config.pathDelims)
                .toRelative()
                .toString({ self: '.', separator: '/', up: '..' });
            errorOverrides[internalPathStyle] = overrides[pathStr];
        }
        clone._config.errorMessages.setText(errorOverrides);
        return clone;
    }

    public forbidden(): this {
        return this.clone({ presence: 'forbidden' } as Partial<P>);
    }

    public label(label: string): this {
        return this.clone({ label } as Partial<P>);
    }

    public optional(): this {
        return this.clone({ presence: 'optional' } as Partial<P>);
    }

    public required(): this {
        return this.clone({ presence: 'required' } as Partial<P>);
    }

    public strip(strip: boolean = true): this {
        return this.clone({ strip } as Partial<P>);
    }

}

export { Field };

