'use strict';

import { Handler } from '../handlers/Handler.ts';
import { HandlerResult } from '../handlers/HandlerResult.ts';
import { Field, FieldConstructorParams } from './Field.ts';
import { Overwrite } from '../types.ts';

type StepArgsOrFn = unknown[] | ((...args: unknown[]) => unknown[]);
type Step = {
    fn: (value: unknown, ...args: unknown[]) => HandlerResult;
    args?: StepArgsOrFn;
};

export type ChainConstructorParams<H extends Handler = Handler> =
    Overwrite<FieldConstructorParams, {
        chainHandler: H;
        emptyValues?: unknown[];
        pipeline?: Step[];
    }>;

export type ChainCloneParams<P extends ChainConstructorParams = ChainConstructorParams> =
    Partial<Overwrite<P, {
        step?: Step;
    }>>;

export type ChainConfig = {
    emptyValues: unknown[];
};

abstract class Chain<
    P extends ChainConstructorParams = ChainConstructorParams,
    C extends ChainConfig = ChainConfig
> extends Field {

    protected _chainHandler: P['chainHandler'];
    protected _pipeline: Step[];
    protected _config: C;

    public constructor(args: ChainConstructorParams) {
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

    public override clone(args: ChainCloneParams = {}): this {
        const clone = super.clone(args);
        const {
            chainHandler = this._chainHandler,
            emptyValues = this._config.emptyValues,
            step,
        } = args;
        const pipelineCopy = [...this._pipeline];

        if (step) {
            pipelineCopy.push(step);
        }

        clone._chainHandler = chainHandler;
        clone._pipeline = pipelineCopy;
        clone._config.emptyValues = emptyValues;

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
        });
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

