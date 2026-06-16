'use strict';

import { ProcessorFactory } from '../ProcessorFactory.ts';
import { Translation } from '../Translation.ts';
import { Presence } from '../Presence.ts';
import type { Processor } from './Processor.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Path } from '../Path.ts';
import { PathDelimTypes } from '../Path.ts';

export type FieldProps = {};

export type FieldConstructorParams = {
    autoConvert?: boolean;
    defaultValue?: unknown;
    label?: string;
    errorMessages: Translation;
    pathDelims: PathDelimTypes;
    presence?: Presence;
    processorMapper: ProcessorFactory;
};

export type FieldCloneParams<C extends FieldProps = FieldProps> = Partial<FieldConstructorParams & C>;

abstract class Field<C extends FieldProps = FieldProps> {

    protected _autoConvert: boolean;
    protected _defaultValue: unknown;
    protected _label: string
    protected _errorMessages: Translation;
    protected _pathDelims: PathDelimTypes;
    protected _presence: Presence;
    protected _processor: Processor | null;
    protected _processorMapper: ProcessorFactory;
    protected _props: C;

    public constructor(args: FieldConstructorParams) {
        const {
            autoConvert = true,
            defaultValue = undefined,
            label = 'Field',
            errorMessages,
            pathDelims,
            presence = 'required',
            processorMapper
        } = args;

        this._props = {} as C;
        this._autoConvert = autoConvert;
        this._defaultValue = defaultValue;
        this._label = label;
        this._errorMessages = errorMessages.override();
        this._pathDelims = pathDelims;
        this._presence = presence;
        this._processor = null;
        this._processorMapper = processorMapper;
    }

    public get defaultValue(): unknown {
        return this._defaultValue;
    }

    public get extendedProps(): C {
        return this._props;
    }

    public get errorMessages(): Translation {
        return this._errorMessages;
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

    public get processorMapper(): ProcessorFactory {
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
            errorMessages = this._errorMessages.override(),
            pathDelims = this._pathDelims,
            presence = this._presence,
            processorMapper = this._processorMapper,
        } = args;
        const clone = new Constructor({
            autoConvert,
            defaultValue,
            label,
            errorMessages,
            pathDelims,
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

    // Declarative API
    public config(config: C) {
        return this.clone(config);
    }

    public default(defaultValue: unknown): this {
        return this.clone({ defaultValue, presence: 'optional' } as FieldCloneParams<C>);
    }

    public errors(overrides: Record<string, string>): this {
        const clone = this.clone();
        const errorOverrides: Record<string, string> = {};
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

