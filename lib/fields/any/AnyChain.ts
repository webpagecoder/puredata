'use strict';

import { AnyHandler } from './AnyHandler.ts';
import { HandlerResult } from '../HandlerResult.ts';
import { Field, FieldConfig } from '../Field.ts';

type StepArgsOrCallback = unknown[] | ((...args: unknown[]) => unknown[]);
type Step = {
    fn: (value: unknown, ...args: unknown[]) => HandlerResult;
    argsOrCallback?: StepArgsOrCallback;
};

export type AnyChainConfig =
    FieldConfig & {
        emptyValues: unknown[];
    };

export type AnyChainCtorParams<
    C extends AnyChainConfig = AnyChainConfig,
    H extends AnyHandler = AnyHandler
> =
    C & {
        chainHandler: H;
        chainHandlerCtor?: new (...args: unknown[]) => H;
        pipeline: Step[];
    };

class AnyChain<
    C extends AnyChainConfig = AnyChainConfig,
    H extends AnyHandler = AnyHandler,
    P extends AnyChainCtorParams<C, H> = AnyChainCtorParams<C, H>,
> extends Field<C, P> {

    protected _chainHandler: H;
    protected _chainHandlerCtor: new (...args: unknown[]) => H;
    protected _pipeline: Step[];

    public constructor(args: Partial<P> = {}) {
        super(args);

        const {
            chainHandlerCtor = AnyHandler,
            emptyValues = [null, undefined],
            pipeline = [],
        } = args;

        this._config.emptyValues = emptyValues;

        this._chainHandler = new chainHandlerCtor() as H;
        this._chainHandlerCtor = chainHandlerCtor as new (...args: unknown[]) => H;
        this._pipeline = pipeline;

        return new Proxy(this, this as ProxyHandler<this>);
    }

    public override clone(args: Partial<C & P> = {}, addStep?: Step): this {
        const clone = super.clone(args);
        clone._chainHandler = new this._chainHandlerCtor() as H;
        clone._chainHandlerCtor = this._chainHandlerCtor;
        clone._config.emptyValues = this._config.emptyValues;
        clone._pipeline = [...this._pipeline];

        if (addStep) {
            clone._pipeline.push(addStep);
        }

        return clone;
    }

    public get(target: this, key: PropertyKey): unknown {
        if (key in target) {
            return (target as Record<PropertyKey, unknown>)[key];
        }
        return (...args: unknown[]): this => this.addHandlerStep(key as keyof H, args);
    }

    public addHandlerStep(fnKey: keyof H, argsOrCallback: StepArgsOrCallback = []): this {
        const { _chainHandler } = this;
        const fn = _chainHandler[fnKey];
        if (typeof fn !== 'function') {
            throw new Error(`Method '${String(fnKey)}'(...) not found in chain handler`);
        }

        return this.clone({}, {
            fn: fn.bind(_chainHandler),
            argsOrCallback
        });
    }

}

export { AnyChain };

