'use strict';

import { Handler } from '../handlers/Handler.ts';
import { HandlerResult } from '../handlers/HandlerResult.ts';
import { Field, FieldProps } from './Field.ts';


type StepArgs = unknown[] | ((...args: unknown[]) => unknown[]);
type Step = {
    fn: (value: unknown, ...args: unknown[]) => HandlerResult;
    args?: StepArgs;
    prioritize?: boolean;
};

export type ChainProps = FieldProps & {
    emptyValues: unknown[];
    pipeline: Step[];
    chainHandler: Handler;
};

// type ProxiedHandlerMethods<H> = {
//     [K in keyof H]: H[K] extends (...args: any) => Chain<H extends Handler> ? K : never;
// }

type Tester = {
    tester(x: number): void;
}

abstract class Chain<H extends Handler> extends Field {

    declare props: ChainProps;

    constructor(props: Partial<ChainProps> = {}) {
        super(props);
        this.props.chainHandler = props.chainHandler as Handler || {};
        this.props.pipeline = [];
        this.props.emptyValues = props.emptyValues || [null, undefined];
        // return new Proxy(this, this as ProxyHandler<typeof this>) as this & ProxiedHandlerMethods<H>;
        return new Proxy(this, this as ProxyHandler<this>);
    }

    get(target: Chain<H>, fnKey: keyof H): ((...args: unknown[]) => Chain<H>) | Chain<H>[keyof Chain<H>] {
        if (fnKey in target) {
            return target[fnKey as keyof Chain<H>];
        }
        return (...args: unknown[]): this => this.addStep(fnKey, args);
    }

    override clone(props: Partial<ChainProps> & {
        step?: Step;
        pipeline?: Step[];
    } = {}): this {
        const clone = super.clone(props) as this;
        const {
            step,
            pipeline = this.props.pipeline
        } = props;
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

    addStep<H = this['props']['chainHandler']>(fnKey: keyof H, args: StepArgs = [], prioritize: boolean = false): this & H {
        const chainHandler = this.props.chainHandler;
        const fn = (chainHandler as H)?.[fnKey];
        if (typeof fn !== 'function') {
            throw new Error(`Method '${String(fnKey)}'(...) not found in chain handler`);
        }
        return this.clone({
            step: {
                fn,
                args,
                prioritize,
            }
        }) as unknown as this & H ;
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
    hasProperty(...args: unknown[]): this {
        return this.addStep('property', args);
    }

    /**
     * Validates that the value is defined (not undefined).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.defined()
     */
    defined(): this {
        return this.addStep('defined');
    }

    /**
     * Validates that the value is considered empty per generic rules (null or undefined).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.empty()
     */
    empty(): this {
        return this.addStep('empty', function (this: Chain): unknown[] {
            return [this.props.emptyValues];
        });
    }

    /**
     * Validates that the value equals the given comparison value (deep equality).
     * @param {...any} args - Comparison value
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.equals(10)
     */
    equals(...args: unknown[]): this {
        return this.addStep('equals', args);
    }

    /**
     * Validates that the value is falsy when coerced to boolean.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.falsy()
     */
    falsy(): this {
        return this.addStep('falsy');
    }

    /**
     * Validates that the value is an instance of the provided constructor.
     * @param {...any} args - Constructor function to test against
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.instanceOf(Date)
     */
    instanceOf(...args: unknown[]): this {
        return this.addStep('instanceOf', args);
    }

    /**
     * Validates that the value is not empty (i.e., not null or undefined).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notEmpty()
     */
    notEmpty(): this {
        return this.addStep('notEmpty', function (this: Chain): unknown[] {
            return [this.props.emptyValues];
        });
    }

    /**
     * Validates that the value is not null.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notNull()
     */
    notNull(): this {
        return this.addStep('notNull');
    }

    /**
     * Validates that the value does not equal the given comparison value.
     * @param {...any} args - Comparison value
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notEquals(false)
     */
    notEquals(...args: unknown[]): this {
        return this.addStep('notEquals', args);
    }

    /**
     * Validates that the value is not one of the specified forbidden values.
     * @param {...any} args - Array or list of forbidden values
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notOneOf([null, undefined])
     */
    notOneOf(...args: unknown[]): this {
        return this.addStep('notOneOf', args);
    }

    /**
     * Validates that the value is strictly null.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.null()
     */
    null(): this {
        return this.addStep('null');
    }

    /**
     * Validates that the value is either null or undefined.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.nullOrUndefined()
     */
    nullOrUndefined(): this {
        return this.addStep('nullOrUndefined');
    }

    /**
     * Validates that the value is one of the provided allowed values.
     * @param {...any} args - Array or list of allowed values
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.oneOf(['red', 'green', 'blue'])
     */
    oneOf(...args: unknown[]): this {
        return this.addStep('oneOf', args);
    }

    /**
     * Validates that the value is a primitive (string, number, boolean, null, undefined, symbol, bigint).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.primitive('number')
     */
    primitive(type: unknown = null): this {
        return this.addStep('primitive', [type]);
    }

    /**
     * Validates that the value is truthy when coerced to boolean.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.truthy()
     */
    truthy(): this {
        return this.addStep('truthy');
    }

    /**
     * Validates that the value is undefined.
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notDefined()
     */
    notDefined(): this {
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
    custom(...args: unknown[]): this {
        return this.addStep('custom', args);
    }

}

export { Chain };

