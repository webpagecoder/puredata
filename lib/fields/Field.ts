'use strict';

import { Locale } from '../Locale.ts';
import { PRESENCE } from '../Presence.ts';
import type { CompilationMapper } from '../CompilationMapper.ts';
import type { Processor } from '../processors/Processor.ts';

type PresenceValue = (typeof PRESENCE)[keyof typeof PRESENCE];

export type FieldProps = Record<string, unknown> & {
    compilationMapper?: CompilationMapper;
    defaultValue?: unknown;
    errorMessages?: Record<string, string>;
    label?: string;
    locale?: Locale | string;
    presence?: PresenceValue;
};

type ResolvedFieldProps = FieldProps & {
    defaultValue: unknown;
    errorMessages: Record<string, string>;
    label: string;
    locale: Locale;
    presence: PresenceValue;
};

class Field {

    static id: number = 0;
    static registry: Map<number, Field> = new Map();

    id: number;
    props: ResolvedFieldProps;
    compiled: null | Processor;

    constructor(props: FieldProps = {}) {

        const {
            defaultValue = undefined,
            errorMessages = {},
            label = 'Value',
            locale,
            presence = PRESENCE.REQUIRED,
            compilationMapper
        } = props;

        this.id = ++Field.id;
        this.props = Object.assign(props, {
            compilationMapper,
            defaultValue,
            locale: new Locale(locale),
            errorMessages,
            label,
            presence,
        });

        this.compiled = null;
        Field.registry.set(this.id, this);
    }

    clone(props: FieldProps = {}): this {
        const Constructor = this.constructor as new (props?: FieldProps) => this;
        return new Constructor(
            //todo: is this deepmerge necessary?
            // Utils.mergeObjects(this.props, props || {}),
            Object.assign({}, this.props, props || {}) as FieldProps
        );
    }

    process(valueOrValueNode: unknown, state: Record<string, unknown> = {}): unknown {
        if (!this.compiled) {
            if (!this.props.compilationMapper) {
                throw new Error('Field compilation mapper is not configured');
            }
            this.compiled = this.props.compilationMapper.createProcessor(this).compile();
        }
        return this.compiled.process(valueOrValueNode, state);
    }

    setProps(props: FieldProps = {}): this {
        return this.clone(props);
    }

    getProp<T = unknown>(key: string): T {
        return this.props[key] as T;
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


    // Generic declaratives exposed in the fluent interface

    // set(props = {}) {
    //     return this.setProps(props);
    // }


    default(defaultValue: unknown): this {
        return this.clone({ defaultValue, presence: PRESENCE.OPTIONAL });
    }

    errors(messages: Record<string, unknown>): this {
        const clone = this.clone();
        clone.props.locale.override(messages);
        return clone;
    }

    forbidden(): this {
        return this.clone({ presence: PRESENCE.FORBIDDEN });
    }

    label(label: string): this {
        return this.clone({ label });
    }

    optional(): this {
        return this.clone({ presence: PRESENCE.OPTIONAL });
    }

    required(): this {
        return this.clone({ presence: PRESENCE.REQUIRED });
    }

    
}

export { Field };