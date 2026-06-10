'use strict';

import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { Locale } from '../Locale.ts';
import { Presence } from '../Presence.ts';
import type { Processor } from '../processors/Processor.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';

export type FieldProps = {};

export type FieldConstructorParams = {
    autoConvert?: boolean;
    defaultValue?: unknown;
    label?: string;
    locale: Locale;
    presence?: Presence;
    processorMapper: FieldProcessorFactory;
};

export type FieldCloneParams<C extends FieldProps = FieldProps> = Partial<FieldConstructorParams & C>;

abstract class Field<C extends FieldProps = FieldProps> {

    private static _id: number;

    protected _props: C;

    protected _id: number;
    protected _processor: Processor | null;

    protected _autoConvert: boolean;
    protected _defaultValue: unknown;
    protected _label: string
    protected _locale: Locale;
    protected _presence: Presence;
    protected _processorMapper: FieldProcessorFactory;

    public constructor(args: FieldConstructorParams) {
        const {
            autoConvert = true,
            defaultValue = undefined,
            label = 'Field',
            locale,
            presence = 'required',
            processorMapper
        } = args;

        this._props = {} as C;
        this._autoConvert = autoConvert;
        this._defaultValue = defaultValue;
        this._id = Field._id ? ++Field._id : Field._id = 1;
        this._label = label;
        this._locale = locale;
        this._presence = presence;
        this._processor = null;
        this._processorMapper = processorMapper;
    }

    public get id(): number {
        return this._id;
    }

    public get defaultValue(): unknown {
        return this._defaultValue;
    }

    public get extendedProps(): C {
        return this._props;
    }

    public get locale(): Locale {
        return this._locale;
    }

    public get presence(): Presence {
        return this._presence;
    }

    public get processor(): Processor {
        if (!this._processor) {
            if (!this._processorMapper) {
                throw new Error('Field/Processor compilation mapper is not configured');
            }
            this._processor = this._processorMapper.createProcessor(this).compile();
        }
        return this._processor;
    }

    public get processorMapper(): FieldProcessorFactory {
        return this._processorMapper;
    }

    public get autoConvert(): boolean {
        return this._autoConvert;
    }

    public clone(args: FieldCloneParams<C> = {}): this {
        const Constructor = this.constructor as new (props?: FieldConstructorParams) => this;
        const {
            autoConvert = this._autoConvert,
            defaultValue = this._defaultValue,
            label = this._label,
            locale = this._locale,
            presence = this._presence,
            processorMapper = this._processorMapper,
        } = args;
        const clone = new Constructor({
            autoConvert,
            defaultValue,
            label,
            locale,
            presence,
            processorMapper,
        } as FieldConstructorParams);

        const { _props } = this;
        for (const key of Object.keys(_props) as (keyof C)[]) {
            clone._props[key] = key in args
                ? (args as Partial<C>)[key] as C[keyof C]
                : _props[key];
        }

        return clone;
    }

    public process(value?: unknown): ValueTracker {
        const { processor } = this;
        const tracker = new processor.ValueTrackerConstructor(this, value);
        processor.process(tracker);
        return tracker;
    }

    //     public process(valueOrValueTracker: ValueTracker | unknown): ValueTracker {
    //     if (!this._processor) {
    //         if (!this._processorMapper) {
    //             throw new Error('Field/Processor compilation mapper is not configured');
    //         }
    //         this._processor = this._processorMapper.createProcessor(this).compile();
    //     }
    //     return this._processor.process(valueOrValueTracker);
    // }

    public isForbidden(): boolean {
        return this._presence === 'forbidden';
    }

    public isOptional(): boolean {
        return this._presence === 'optional';
    }

    public isRequired(): boolean {
        return this._presence === 'required';
    }

    public config(config: C) {
        return this.clone(config);
    }

    public default(defaultValue: unknown): this {
        return this.clone({ defaultValue, presence: 'optional' } as FieldCloneParams<C>);
    }

    public errors(messages: Record<string, string>): this {
        const clone = this.clone();
        clone._locale.override(messages);
        return clone;
    }

    public forbidden(): this {
        return this.clone({ presence: 'forbidden' } as FieldCloneParams<C>);
    }

    public label(label: string): this {
        return this.clone({ label } as FieldCloneParams<C>);
    }

    public optional(): this {
        return this.clone({ presence: 'optional' } as FieldCloneParams<C>);
    }

    public required(): this {
        return this.clone({ presence: 'required' } as FieldCloneParams<C>);
    }
}

export { Field };

