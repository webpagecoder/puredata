'use strict';

const Language = require('./Language.js');
const PathReference = require('./entities/reference/PathReference.js');
const ObjectUtils = require('./utils/ObjectUtils.js');
const Enum = require('./entities/Enum.js');
const BooleanChain = require('./entities/chains/BooleanChain.js');
const ArrayChain = require('./entities/chains/ArrayChain.js');
const DateChain = require('./entities/chains/DateChain.js');
const ObjectChain = require('./entities/chains/ObjectChain.js');
const NumberChain = require('./entities/chains/NumberChain.js');
const GenericChain = require('./entities/chains/GenericChain.js');
const SchemaChain = require('./entities/chains/SchemaChain.js');
const StringChain = require('./entities/chains/StringChain.js');

const CompiledEntity = require('./entities/CompiledEntity.js');
const CompiledSchemaChain = require('./entities/chains/CompiledSchemaChain.js');

const ConditionalEntity = require('./entities/ConditionalEntity.js');
const SchemaConditionalEntity = require('./entities/SchemaConditionalEntity.js');
const ArrayProcessors = require('./processors/ArrayProcessors.js');
const DateProcessors = require('./processors/DateProcessors.js');
const BooleanProcessors = require('./processors/BooleanProcessors.js');
const NumberProcessors = require('./processors/NumberProcessors.js');
const ObjectProcessors = require('./processors/ObjectProcessors.js');
const StringProcessors = require('./processors/StringProcessors.js');
const Path = require('./path/Path.js');
const CompilationMapper = require('./entities/CompilationMapper.js');
const StaticValue = require('./entities/values/StaticValue.js');
const EntityReference = require('./entities/EntityReference.js');


Language.register('en-US', 'errors', require('./language/en/US/errors.json'));
Language.register('en-US', 'descriptors', require('./language/en/US/descriptors.json'));
Language.register('en-US', 'calendar', require('./language/en/US/calendar.json'));


class PureData {
    constructor(config, compilationMapper = new CompilationMapper()) {
        this.config = ObjectUtils.clone(config);

        Path.delims(this.config.general.pathDelims);

        const { locale } = this.config.general;

        this.language = {
            errors: new Language(locale, 'errors'),
            descriptors: new Language(locale, 'descriptors'),
            calendar: new Language(locale, 'calendar'),
        };

        this.compilationMapper = compilationMapper;
    }

    setProps(updatedConfig) {
        this.config = ObjectUtils.deepMerge(this.config, updatedConfig);
    }

    paths(delims) {
        Path.delims(delims);
    }

    composeProps(props = {}, chainType, chainProcessors) {
        const { config, compilationMapper, language } = this;
        return Object.assign(
            {
                compilationMapper,
                language,
                processors: chainProcessors
            },
            config.general,
            config[chainType],
            chainProcessors,
            props
        );
    }

    // Chains
    array(props = {}) {
        return new ArrayChain(this.composeProps(props, 'array', ArrayProcessors));
    }

    boolean(props = {}) {
        return new BooleanChain(this.composeProps(props, 'boolean', BooleanProcessors));
    }

    date(props = {}) {
        return new DateChain(this.composeProps(props, 'date', DateProcessors));
    }

    enum(structure = []) {
        return new Enum(this.composeProps({ structure }));
    }

    any() {
        return new GenericChain(this.composeProps());
    }

    number(props = {}) {
        return new NumberChain(this.composeProps(props, 'number', NumberProcessors));
    }

    object(props = {}) {
        return new DateChain(this.composeProps(props, 'object', ObjectProcessors));
    }

    pointer(pathStr, minDepth, maxDepth) {
        return new EntityReference(this.composeProps({
            minDepth,
            maxDepth,
            path: Path.create(pathStr),
        }));
    }

    schema(structure = {}, props = {}) {
        return new SchemaChain(this.composeProps(
            Object.assign({ structure }, this.config.schema, props),
            'object',
            ObjectProcessors
        ));
    }

    string(props = {}) {
        return new StringChain(this.composeProps(props, 'string', StringProcessors));
    }

    // Other entities

    mutable(value) {
        return new StaticValue(this.composeProps({ value, mutable: true }));
    }

    immutable(value) {
        return new StaticValue(this.composeProps({ value, mutable: false }));
    }

    // conditionals

    satisfies(pathStr, comparisonEntity) {
        return new SchemaConditionalEntity(this.composeProps({
            areEqual: true,
            referencePath: this.value(pathStr),
            comparisonEntity,
        }));
    }

    violates(pathStr, comparisonEntity) {
        return new SchemaConditionalEntity(this.composeProps({
            areEqual: false,
            referencePath: this.value(pathStr),
            comparisonEntity,
        }));
    }

    errors(messages) {
        this.language.errors.override(messages);
    }

    descriptors(messages) {
        this.language.descriptors.override(messages);
    }

    value(pathStr, defaultOrCallback) {
        return new PathReference(this.composeProps({ pathStr, defaultOrCallback }));
    }

    get optional() {
        return Presence.optional;
    }

    get forbidden() {
        return Presence.forbidden;
    }

    get required() {
        return Presence.required;
    }

    get now() {
        return new Date();
    }
}

module.exports = PureData;
