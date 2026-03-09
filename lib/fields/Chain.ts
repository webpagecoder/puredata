'use strict';

import Field from './Field.ts';

type StepArgsResolver = (this: Chain) => unknown[];
type StepArgs = unknown[] | StepArgsResolver;
type ProcessorFn = (...args: unknown[]) => unknown;

type Step = {
    fn: ProcessorFn;
    args: StepArgs;
    prioritize: boolean;
};

type CloneOptions = Record<string, unknown> & {
    step?: Step;
    pipeline?: Step[];
};

type ProcessorMap = {
    [key: string]: ProcessorFn | undefined;
    [key: symbol]: ProcessorFn | undefined;
};

class Chain extends Field {

    declare props: Field['props'] & {
        pipeline: Step[];
        processors?: ProcessorMap;
    };

    constructor(props: Record<string, unknown> = {}) {
        super(props);
        this.props.pipeline = [];
        return new Proxy(this, this);
    }

    get(target: Chain, prop: PropertyKey, receiver: unknown) {
        if (prop in target) {
            return target[prop];
        }
        return (...args: unknown[]) => this.addStep(prop, args);
    }


    clone(props: Record<string, unknown> = {}): this {
        const clone = super.clone(props) as this;
        const { step, pipeline = this.props.pipeline as Step[] } = props as CloneOptions;
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

    addStep(fnKey: PropertyKey, args: StepArgs = [], prioritize: boolean = false): Chain {
        const processors = this.props.processors as ProcessorMap | undefined;
        const fn = processors?.[fnKey];
        if (typeof fn === 'function') {
            return this.clone({
                step: {
                    fn,
                    args,
                    prioritize,
                }
            });
        }
        throw new Error(`Filter '${String(fnKey)}' not found in processors`);
    }


    // Validators

    /**
     * Validates that the current value has the given property/key.
     * Note: Intended for objects or maps; non-objects will typically fail.
     * @param {...any} args - Property identifier(s) to check (e.g., 'id')
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.hasProperty('id')
     */
    hasProperty(...args: unknown[]): Chain {
        return this.addStep('property', args);
    }

    /**
     * Validates that the value is defined (not undefined).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.defined()
     */
    defined(): Chain {
        return this.addStep('defined');
    }

    /**
     * Validates that the value is considered empty per generic rules (null or undefined).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.empty()
     */
    empty(): Chain {
        return this.addStep('empty');
    }

    /**
     * Validates that the value equals the given comparison value (deep equality).
     * @param {...any} args - Comparison value
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.equals(10)
     */
    equals(...args: unknown[]): Chain {
        return this.addStep('equals', args);
    }

    /**
     * Validates that the value is falsy when coerced to boolean.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.falsy()
     */
    falsy(): Chain {
        return this.addStep('falsy');
    }

    /**
     * Validates that the value is an instance of the provided constructor.
     * @param {...any} args - Constructor function to test against
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.instanceOf(Date)
     */
    instanceOf(...args: unknown[]): Chain {
        return this.addStep('instanceOf', args);
    }

    /**
     * Validates that the value is not empty (i.e., not null or undefined).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notEmpty()
     */
    notEmpty(): Chain {
        return this.addStep('notEmpty');
    }

    /**
     * Validates that the value is not null.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notNull()
     */
    notNull(): Chain {
        return this.addStep('notNull');
    }

    /**
     * Validates that the value does not equal the given comparison value.
     * @param {...any} args - Comparison value
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notEquals(false)
     */
    notEquals(...args: unknown[]): Chain {
        return this.addStep('notEquals', args);
    }

    /**
     * Validates that the value is not one of the specified forbidden values.
     * @param {...any} args - Array or list of forbidden values
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notOneOf([null, undefined])
     */
    notOneOf(...args: unknown[]): Chain {
        return this.addStep('notOneOf', args);
    }

    /**
     * Validates that the value is strictly null.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.null()
     */
    null(): Chain {
        return this.addStep('null');
    }

    /**
     * Validates that the value is either null or undefined.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.nullOrUndefined()
     */
    nullOrUndefined(): Chain {
        return this.addStep('nullOrUndefined');
    }

    /**
     * Validates that the value is one of the provided allowed values.
     * @param {...any} args - Array or list of allowed values
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.oneOf(['red', 'green', 'blue'])
     */
    oneOf(...args: unknown[]): Chain {
        return this.addStep('oneOf', args);
    }

    /**
     * Validates that the value is a primitive (string, number, boolean, null, undefined, symbol, bigint).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.primitive('number')
     */
    primitive(type: unknown = null): Chain {
        return this.addStep('primitive', [type]);
    }

    /**
     * Validates that the value is truthy when coerced to boolean.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.truthy()
     */
    truthy(): Chain {
        return this.addStep('truthy');
    }

    /**
     * Validates that the value is undefined.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notDefined()
     */
    notDefined(): Chain {
        return this.addStep('notDefined');
    }

    // Transformers

    /**
     * Custom processor execution. If the method returns a Result, it is a validator. 
     * If it returns a value other than a Result, it is a transformer.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.custom(customFunction)
     */
    custom(...args: unknown[]): Chain {
        return this.addStep('custom', args);
    }

}

export default Chain;

