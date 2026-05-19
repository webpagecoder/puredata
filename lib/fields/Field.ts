'use strict';

import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { Locale } from '../Locale.ts';
import { Presence } from '../Presence.ts';
import type { Processor } from '../processors/Processor.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';

export type FieldConstructorProps = {
    defaultValue?: unknown;
    label?: string;
    locale?: Locale;
    presence?: Presence;
    processorMapper?: FieldProcessorFactory;
};

export type FieldCloneProps<P extends FieldConstructorProps = FieldConstructorProps> = Partial<P>;

abstract class Field<P extends FieldConstructorProps = FieldConstructorProps> {

    private static _id: number = 0;

    protected _id: number;
    protected _defaultValue: unknown;
    protected _label: string
    protected _locale: Locale;
    protected _presence: Presence;
    protected _processor: Processor | null;
    protected _processorMapper: FieldProcessorFactory;

    constructor(props: FieldConstructorProps) {

        const {
            defaultValue = undefined,
            label = 'Value',
            locale = new Locale('en-US'),
            presence = 'required',
            processorMapper = new FieldProcessorFactory(),
        } = props;

        this._defaultValue = defaultValue || undefined;
        this._id = ++Field._id;
        this._label = label || 'Field';
        this._locale = locale;
        this._presence = presence || 'required';
        this._processor = null;
        this._processorMapper = processorMapper;
    }

    public get id(): number {
        return this._id;
    }

    public get defaultValue(): unknown {
        return this._defaultValue;
    }

    public get locale(): Locale {
        return this._locale;
    }

    public get presence(): Presence {
        return this._presence;
    }

    public clone(props: FieldCloneProps = {}): this {
        const Constructor = this.constructor as new (props?: P) => this;
        const {
            defaultValue = this._defaultValue,
            label = this._label,
            locale = this._locale,
            presence = this._presence,
            processorMapper = this._processorMapper
        } = props;
        const clone = new Constructor({
            defaultValue,
            label,
            locale,
            presence,
            processorMapper,
        } as P);
        clone._processor = null;
        return clone;
    }

    // public config(props: FieldConfigProps): this {
    //     return this.clone(props);
    // }

    public process(valueOrValueTracker: ValueTracker | unknown): ValueTracker {
        if (!this._processor) {
            if (!this._processorMapper) {
                throw new Error('Field compilation mapper is not configured');
            }
            this._processor = this._processorMapper.createProcessor(this).compile();
        }
        return this._processor.process(valueOrValueTracker);
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

    public default(defaultValue: unknown): this {
        return this.clone({ defaultValue, presence: 'optional' });
    }

    public errors(messages: Record<string, string>): this {
        const clone = this.clone();
        clone._locale.override(messages);
        return clone;
    }

    public forbidden(): this {
        return this.clone({ presence: 'forbidden' });
    }

    public label(label: string): this {
        return this.clone({ label });
    }

    public optional(): this {
        return this.clone({ presence: 'optional' });
    }

    public required(): this {
        return this.clone({ presence: 'required' });
    }
}

export { Field };

