'use strict';

import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { Locale } from '../Locale.ts';
import { Presence } from '../Presence.ts';
import type { Processor } from '../processors/Processor.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';

type ErrorMessages = Record<string, string>;

export type FieldProps = {
    processorMapper: FieldProcessorFactory;
    defaultValue: unknown;
    errorMessages: ErrorMessages;
    label: string;
    locale: Locale;
    presence: Presence;
};

abstract class Field<P extends FieldProps = FieldProps> {

    static id: number = 0;
    static registry: Map<number, Field<FieldProps>> = new Map();

    id: number;
    props: P;
    processor: null | Processor;

    constructor(props: Partial<P> = {}) {

        const {
            processorMapper = new FieldProcessorFactory(),
            defaultValue = undefined,
            label = 'Value',
            locale = new Locale('en-US'),
            presence = 'required',
            errorMessages = {},
        } = props;

        this.id = ++Field.id;
        this.props = Object.assign(props, {
            processorMapper,
            defaultValue,
            errorMessages,
            label,
            locale: new Locale(locale),
            presence,
        } as P);

        this.processor = null;
        Field.registry.set(this.id, this as unknown as Field<FieldProps>);
    }

    clone(props: Partial<P> = {}): this {
        const Constructor = this.constructor as new (props?: Partial<P>) => this;
        return new Constructor(
            //todo: is this deepmerge necessary?
            // Utils.mergeObjects(this.props, props || {}),
            Object.assign({}, this.props, props || {}) as P
        );
    }

    process(valueOrValueTracker: ValueTracker | unknown): ValueTracker {
        if (!this.processor) {
            if (!this.props.processorMapper) {
                throw new Error('Field compilation mapper is not configured');
            }
            this.processor = this.props.processorMapper.createProcessor(this).compile();
        }
        return this.processor.process(valueOrValueTracker);
    }

    clone(props: Partial<P> = {}): this {
        return this.clone(props);
    }

    getProp(key: keyof P): P[typeof key] {
        return (this.props as P)[key];
    }

    isForbidden(): boolean {
        return this.props.presence === 'forbidden';
    }

    isOptional(): boolean {
        return this.props.presence === 'optional';
    }

    isRequired(): boolean {
        return this.props.presence === 'required';
    }

    default(defaultValue: unknown): this {
        return this.clone({ defaultValue, presence: 'optional' } as Partial<P>);
    }

    errors(messages: ErrorMessages): this {
        const clone = this.clone();
        clone.props.locale.override(messages);
        return clone;
    }

    forbidden(): this {
        return this.clone({ presence: 'forbidden' } as Partial<P>);
    }

    label(label: string): this {
        return this.clone({ label } as Partial<P>);
    }

    optional(): this {
        return this.clone({ presence: 'optional' } as Partial<P>);
    }

    required(): this {
        return this.clone({ presence: 'required' } as Partial<P>);
    }
}

export { Field };

