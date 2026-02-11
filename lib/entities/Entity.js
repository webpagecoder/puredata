'use strict';

const MetaCache = require("../cache/MetaCache");
const GlobalConfig = require("../GlobalConfig");
const ObjectUtils = require("../utils/ObjectUtils");
const Language = require("../Language");
const AdvancedPath = require("../path/AdvancedPath");
const Presence = require("../Presence");
const PubSub = require("../pub-sub/PubSub");
const MessageNode = require("../tracker/MessageNode");
const HtmlDescriptionFormatter = require("../tracker/HtmlDescriptionFormatter");
const TextFormatter = require("../tracker/TextFormatter");
const Path = require("../path/Path");


class Entity {

    constructor(props = {}) {

        const {
            defaultValue = undefined,
            languageKeys = {},
            errorMessages = {},
            label = 'Value',
            language,
            presence = Presence.required,
            compilationMapper
        } = props;

        this.id = ++Entity.id;
        this.props = Object.assign(props, {
            compilationMapper,
            defaultValue,
            languageKeys,
            language: {
                'errors': new Language(language.errors),
                'descriptors': new Language(language.descriptors),
                'calendar': new Language(language.calendar)
            },
            errorMessages,
            label,
            presence,
        });

        Entity.registry.set(this.id, this);
    }

    get description() {
        return this.getDescription();
    }

    get languageKey() {
        return 'entity';
    }

    clone(props = {}) {
        return new this.constructor(
            //todo: is this deepmerge necessary?
            // ObjectUtils.deepMerge(this.props, props || {}),
            Object.assign({}, this.props, props || {})
        );
    }

    process(valueOrValueNode, state = {}) {
        if (!this.compiled) {
            this.compiled = this.props.compilationMapper.createCompiledEntity(this).compile();
        }
        return this.compiled.process(valueOrValueNode, state);
    }

    setDescriptors(languageKeys) {
        return this.clone({ languageKeys });
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

    getRawDescription() {
        const {
            languageKey,
            props: {
                label,
                language,
            }
        } = this;
        const path = Path.from([languageKey, 'base']);
        const builder = new MessageNode(label);
        builder.addMessage({
            key: path.string,
            text: language.descriptors.get(path)
        })
        return builder;
    }

    getDescription(formatter = new HtmlDescriptionFormatter()) {
        return formatter.format(this.getRawDescription());
    }

    // Generic declaratives exposed in the fluent interface

    // set(props = {}) {
    //     return this.setProps(props);
    // }

    descriptors(languageKeys) {
        return this.setDescriptors(languageKeys);
    }

    default(defaultValue) {
        return this.clone({ defaultValue, presence: Presence.optional });
    }

    errors(messages) {
        const clone = this.clone();
        clone.props.language.errors.override(messages);
        return clone;
    }

    descriptors(messages) {
        const clone = this.clone();
        clone.props.language.descriptors.override(messages);
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


    [Symbol.toPrimitive](hint) {
        if (hint !== 'string') {
            throw new Error('Chain cannot be converted to type: ' + hint);
        }
        return this.getRawDescription();
    }

}

Entity.id = 1;
Entity.registry = new Map();

const self = module.exports = Entity;