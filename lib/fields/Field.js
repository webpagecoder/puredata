'use strict';

import Locale from '../Locale.js';
import Path from '../Path.js';
import Presence from '../Presence.js';
import HtmlDescriptionFormatter from '../tracker/HtmlDescriptionFormatter.js';
import MessageNode from '../tracker/MessageNode.js';


class Field {

    constructor(props = {}) {

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

        Field.registry.set(this.id, this);
    }

    clone(props = {}) {
        return new this.constructor(
            //todo: is this deepmerge necessary?
            // Utils.deepMerge(this.props, props || {}),
            Object.assign({}, this.props, props || {})
        );
    }

    process(valueOrValueNode, state = {}) {
        if (!this.compiled) {
            this.compiled = this.props.compilationMapper.createProcessor(this).compile();
        }
        return this.compiled.process(valueOrValueNode, state);
    }

    setProps(props = {}) {
        return this.clone(props);
    }

    getProp(key) {
        return this.props[key];
    }

    isForbidden() {
        return this.props.presence === Presence.forbidden;
    }

    isOptional() {
        return this.props.presence === Presence.optional;
    }

    isRequired() {
        return this.props.presence === Presence.required;
    }


    // Generic declaratives exposed in the fluent interface

    // set(props = {}) {
    //     return this.setProps(props);
    // }


    default(defaultValue) {
        return this.clone({ defaultValue, presence: Presence.optional });
    }

    errors(messages) {
        const clone = this.clone();
        clone.props.locale.override(messages);
        return clone;
    }

    forbidden() {
        return this.clone({ presence: Presence.forbidden });
    }

    label(label) {
        return this.clone({ label });
    }

    optional() {
        return this.clone({ presence: Presence.optional });
    }

    required() {
        return this.clone({ presence: Presence.required });
    }

}

Field.id = 1;
Field.registry = new Map();

export default Field;