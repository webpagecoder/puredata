'use strict';

const Path = require('../../path/Path.js');
const Entity = require('../Entity.js');

class GenericChain extends Entity {

    constructor(props = {}) {
        super(props);
        this.props.pipeline = [];
    }

    clone(props = {}) {
        const clone = super.clone(props);
        const { step, pipeline = this.props.pipeline } = props;
        const updatedPipeline = [...pipeline];

        if (step) {
            if (step.prioritize) {
                updatedPipeline.unshift(step);
            }
            else {
                updatedPipeline.push(step);
            }
        }
        clone.props.pipeline = updatedPipeline;

        return clone;
    }

    addStep(fnKey, args = [], prioritize = false) {
        const fn = this.props.processors[fnKey];
        if (fn) {
            return this.clone({
                step: {
                    fn,
                    args,
                    prioritize,
                }
            });
        }
        throw new Error(`Filter '${fnKey}' not found in processors`);
    }


    // Validators

    /**
     * Validates that the current value has the given property/key.
     * Note: Intended for objects or maps; non-objects will typically fail.
     * @param {...any} args - Property identifier(s) to check (e.g., 'id')
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.hasProperty('id')
     */
    hasProperty(...args) {
        return this.addStep('property', args);
    }

    /**
     * Validates that the value is defined (not undefined).
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.defined()
     */
    defined() {
        return this.addStep('defined');
    }

    /**
     * Validates that the value is considered empty per generic rules (null or undefined).
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.empty()
     */
    empty() {
        return this.addStep('empty');
    }

    /**
     * Validates that the value equals the given comparison value (deep equality).
     * @param {...any} args - Comparison value
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.equals(10)
     */
    equals(...args) {
        return this.addStep('equals', args);
    }

    /**
     * Validates that the value is falsy when coerced to boolean.
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.falsy()
     */
    falsy() {
        return this.addStep('falsy');
    }

    /**
     * Validates that the value is an instance of the provided constructor.
     * @param {...any} args - Constructor function to test against
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.instanceOf(Date)
     */
    instanceOf(...args) {
        return this.addStep('instanceOf', args);
    }

    /**
     * Validates that the value is not empty (i.e., not null or undefined).
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.notEmpty()
     */
    notEmpty() {
        return this.addStep('notEmpty');
    }

    /**
     * Validates that the value does not equal the given comparison value.
     * @param {...any} args - Comparison value
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.notEquals(false)
     */
    notEquals(...args) {
        return this.addStep('notEquals', args);
    }

    /**
     * Validates that the value is not one of the specified forbidden values.
     * @param {...any} args - Array or list of forbidden values
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.notOneOf([null, undefined])
     */
    notOneOf(...args) {
        return this.addStep('notOneOf', args);
    }

    /**
     * Validates that the value is strictly null.
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.null()
     */
    null() {
        return this.addStep('null');
    }

    /**
     * Validates that the value is either null or undefined.
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.nullOrUndefined()
     */
    nullOrUndefined() {
        return this.addStep('nullOrUndefined');
    }

    /**
     * Validates that the value is one of the provided allowed values.
     * @param {...any} args - Array or list of allowed values
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.oneOf(['red', 'green', 'blue'])
     */
    oneOf(...args) {
        return this.addStep('oneOf', args);
    }

    /**
     * Validates that the value is a primitive (string, number, boolean, null, undefined, symbol, bigint).
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.primitive('number')
     */
    primitive(type = null) {
        return this.addStep('primitive', [type]);
    }

    /**
     * Validates that the value is truthy when coerced to boolean.
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.truthy()
     */
    truthy() {
        return this.addStep('truthy');
    }

    /**
     * Validates that the value is undefined.
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.notDefined()
     */
    notDefined() {
        return this.addStep('notDefined');
    }

    // Transformers

    /**
     * Custom processor execution. If the method returns a Result, it is a validator. 
     * If it returns a value other than a Result, it is a transformer.
     * @returns {GenericChain} Returns the chain for method chaining
     * @example
     * generic.custom(customFunction)
     */
    custom(...args) {
        return this.addStep('custom', args);
    }

    getRawDescription() {
        const {
            props: {
                language, pipeline
            },
            languageKey
        } = this;

        const builder = super.getRawDescription();

        for (const { fn, args } of pipeline) {
            const path = Path.from([languageKey, fn.name]);
            let text = language.descriptors.get(path);
            if (text) {
                for (let i = 0, max = args.length; i < max; ++i) {
                    const arg = args[i];
                    text = text.replace(
                        `{${i}}`,
                        Array.isArray(arg) ? arg.join(', ') : arg
                    );
                }
            }
            builder.addMessage({
                args,
                key: path.string,
                text
            });
        }

        return builder;
    }
}

module.exports = GenericChain;

