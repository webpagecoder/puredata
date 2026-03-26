'use strict';

import { FieldProcessorFactory } from '../FieldProcessorFactory.ts';
import { Locale } from '../Locale.ts';
import { PRESENCE } from '../Presence.ts';
import type { Processor } from '../processors/Processor.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';

type ErrorMessages = Record<string, string>;

export type FieldProps = {
    compilationMapper: FieldProcessorFactory;
    defaultValue: unknown;
    errorMessages: ErrorMessages;
    label: string;
    locale: Locale;
    presence: PRESENCE;
};

abstract class Field<P extends FieldProps = FieldProps> {

    static id: number = 0;
    static registry: Map<number, Field<FieldProps>> = new Map();

    id: number;
    props: P;
    processor: null | Processor;

    constructor(props: Partial<P> = {}) {

        const {
            compilationMapper = new FieldProcessorFactory(),
            defaultValue = undefined,
            label = 'Value',
            locale = new Locale('en-US'),
            presence = PRESENCE.REQUIRED,
            errorMessages = {},
        } = props;

        this.id = ++Field.id;
        this.props = Object.assign(props, {
            compilationMapper,
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
            if (!this.props.compilationMapper) {
                throw new Error('Field compilation mapper is not configured');
            }
            this.processor = this.props.compilationMapper.createProcessor(this).compile();
        }
        return this.processor.process(valueOrValueTracker);
    }

    setProps(props: Partial<P> = {}): this {
        return this.clone(props);
    }

    getProp(key: keyof P): P[typeof key] {
        return (this.props as P)[key];
    }

    isForbidden(): boolean {
        return this.props.presence === PRESENCE.FORBIDDEN;
    }

    isOptional(): boolean {
        return this.props.presence === PRESENCE.OPTIONAL;
    }

    isRequired(): boolean {
        return this.props.presence === PRESENCE.REQUIRED;
    }

    default(defaultValue: unknown): this {
        return this.clone({ defaultValue, presence: PRESENCE.OPTIONAL } as Partial<P>);
    }

    errors(messages: ErrorMessages): this {
        const clone = this.clone();
        clone.props.locale.override(messages);
        return clone;
    }

    forbidden(): this {
        return this.clone({ presence: PRESENCE.FORBIDDEN } as Partial<P>);
    }

    label(label: string): this {
        return this.clone({ label } as Partial<P>);
    }

    optional(): this {
        return this.clone({ presence: PRESENCE.OPTIONAL } as Partial<P>);
    }

    required(): this {
        return this.clone({ presence: PRESENCE.REQUIRED } as Partial<P>);
    }
}

export { Field };

