'use strict';

import { ChainHandler } from '../handlers/ChainHandler.ts';
import { HandlerResult } from '../handlers/HandlerResult.ts';
import { Field, FieldConstructorParams } from './Field.ts';
import { Overwrite } from '../types.ts';

type StepArgsOrFn = unknown[] | ((...args: unknown[]) => unknown[]);
type Step = {
    fn: (value: unknown, ...args: unknown[]) => HandlerResult;
    args?: StepArgsOrFn;
};

export type ChainConfig = {
    emptyValues: unknown[];
};

export type ChainConstructorParams<
    H extends ChainHandler = ChainHandler,
    C extends ChainConfig = ChainConfig
> =
    Overwrite<FieldConstructorParams, Overwrite<C, {
        chainHandler: H;
        pipeline?: Step[];
    }>>;

export type ChainCloneParams<P extends ChainConstructorParams = ChainConstructorParams> =
    Partial<Overwrite<P, {
        step?: Step;
    }>>;

abstract class Chain<
    P extends ChainConstructorParams = ChainConstructorParams,
    C extends ChainConfig = ChainConfig
> extends Field {

    protected _chainHandler: P['chainHandler'];
    protected _pipeline: Step[];
    protected _config: C;

    public constructor(args: P) {
        super(args);

        const {
            chainHandler,
            emptyValues = [null, undefined],
            pipeline = [],
        } = args;

        this._chainHandler = chainHandler;
        this._pipeline = pipeline;
        this._config = {
            emptyValues
        } as C;

        return new Proxy(this, this as ProxyHandler<this>);
    }

    public get(target: this, key: PropertyKey): unknown {
        if (key in target) {
            return (target as Record<PropertyKey, unknown>)[key];
        }
        return (...args: unknown[]): this => this.addStep(key as keyof P['chainHandler'], args);
    }

    public override clone(args: ChainCloneParams<P> = {}): this {
        const clone = super.clone(args);
        const {
            chainHandler = this._chainHandler,
            step,
        } = args;

        const pipelineCopy = [...this._pipeline];
        if (step) {
            pipelineCopy.push(step);
        }

        clone._chainHandler = chainHandler;
        clone._pipeline = pipelineCopy;

        const config = clone._config;
        for (const key of Object.keys(this._config) as (keyof C)[]) {
            config[key] = key in args
                ? (args)[key]
                : this._config[key];
        }
        return clone;
    }

    public addStep(fnKey: keyof P['chainHandler'], args: StepArgsOrFn = []): this {
        const chainHandler = this._chainHandler as P['chainHandler'];
        const fn = chainHandler[fnKey];
        if (typeof fn !== 'function') {
            throw new Error(`Method '${String(fnKey)}'(...) not found in chain handler`);
        }

        return this.clone({
            step: {
                fn: (fn as Step['fn']).bind(chainHandler),
                args,
            }
        } as ChainCloneParams<P>);
    }

    // Validators

    /**
     * Validates that the value is considered empty per generic rules (null or undefined).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.empty()
     */
    public empty(): this {
        return this.addStep('empty', function (this: Chain<any>): unknown[] {
            return [this._config.emptyValues];
        });
    }


    /**
     * Validates that the value is not empty (i.e., not null or undefined).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notEmpty()
     */
    public notEmpty(): this {
        return this.addStep('notEmpty', function (this: Chain<any>): unknown[] {
            return [this._config.emptyValues];
        });
    }

    public get pipeline(): Step[] {
        return this._pipeline;
    }

    public get chainHandler(): P['chainHandler'] {
        return this._chainHandler;
    }

    public get config(): C {
        return this._config;
    }
}

export { Chain };

