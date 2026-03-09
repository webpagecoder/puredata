'use strict';

import Locale from '../Locale.ts';
import Path from '../Path.ts';
import Presence from '../Presence.ts';
import HtmlDescriptionFormatter from '../tracker/HtmlDescriptionFormatter.ts';
import MessageNode from '../tracker/MessageNode.ts';

type CompiledProcessor = {
    process(valueOrValueNode: unknown, state?: Record<string, unknown>): unknown;
};

type CompilationMapperLike = {
    createProcessor(field: Field): {
        compile(): CompiledProcessor;
    };
};

type FieldProps = Record<string, unknown> & {
    compilationMapper?: CompilationMapperLike;
    defaultValue?: unknown;
    errorMessages?: Record<string, unknown>;
    label?: string;
    locale?: unknown;
    presence?: unknown;
};

class Field {

    static id: number;
    static registry: Map<number, Field>;

    id: number;
    props: FieldProps & {
        locale: Locale;
        presence: unknown;
    };
    compiled: false | CompiledProcessor;

    constructor(props: FieldProps = {}) {

        const {
            defaultValue = undefined,
            errorMessages = {},
            label = 'Value',
            locale,
            presence = Presence.required,
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

        this.compiled = false;
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
        return this.props.presence === Presence.forbidden;
    }

    isOptional(): boolean {
        return this.props.presence === Presence.optional;
    }

    isRequired(): boolean {
        return this.props.presence === Presence.required;
    }


    // Generic declaratives exposed in the fluent interface

    // set(props = {}) {
    //     return this.setProps(props);
    // }


    default(defaultValue: unknown): this {
        return this.clone({ defaultValue, presence: Presence.optional });
    }

    errors(messages: Record<string, unknown>): this {
        const clone = this.clone();
        clone.props.locale.override(messages);
        return clone;
    }

    forbidden(): this {
        return this.clone({ presence: Presence.forbidden });
    }

    label(label: string): this {
        return this.clone({ label });
    }

    optional(): this {
        return this.clone({ presence: Presence.optional });
    }

    required(): this {
        return this.clone({ presence: Presence.required });
    }

    
}

Field.id = 1;
Field.registry = new Map();

export default Field;