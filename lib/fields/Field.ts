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
    strip: boolean; //todo: implement stripping of the field
};

export type FieldCtorParams<C extends FieldConfig = FieldConfig> = Partial<C>;

export type ConfigFromParams<P extends FieldCtorParams> =
    P extends FieldCtorParams<infer C> ? C : never;

abstract class Field<P extends FieldCtorParams = FieldCtorParams> {

    public config: ConfigFromParams<P>;
    
    private _cachedProcessor: Processor | null;

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
        this.config = {
            autoConvert,
            defaultValue,
            errorMessages: errorMessages.clone(),
            label,
            pathDelims,
            presence,
            strip
        } as ConfigFromParams<P>;
    }

    public get processor(): Processor {
        if (!this._cachedProcessor) {
            this._cachedProcessor = this.createProcessor().compile();
        }
        return this._cachedProcessor;
    }

    public clone(args: Partial<P> = {}): this {

        const { config } = this;
        const {
            autoConvert = config.autoConvert,
            defaultValue = config.defaultValue,
            errorMessages = config.errorMessages.override(),
            label = config.label,
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
                pathDelims,
                presence,
                strip
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
        return this.config.presence === 'forbidden';
    }

    public isOptional(): boolean {
        return this.config.presence === 'optional';
    }

    public isRequired(): boolean {
        return this.config.presence === 'required';
    }


    // Configurators

    public autoConvert(autoConvert: boolean = true): this {
        return this.clone({ autoConvert } as Partial<P>);
    }

    public default(defaultValue: unknown): this {
        return this.clone({ defaultValue } as Partial<P>);
    }

    public errorMessages(overrides: Record<string, string>): this {
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

    public label(label: string): this {
        return this.clone({ label } as Partial<P>);
    }

    public pathDelims(pathDelims: PathDelimTypes): this {
        return this.clone({ pathDelims } as Partial<P>);
    }

    public forbidden(): this {
        return this.clone({ presence: 'forbidden' } as Partial<P>);
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

