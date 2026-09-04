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

class AnyChain<P extends AnyChainCtorParams> extends Field<P> {

    protected _chainHandler: P['chainHandler'];
    protected _chainHandlerCtor: new (...args: unknown[]) => P['chainHandler'];
    protected _pipeline: Step[];

    public constructor(args: Partial<P> = {}) {
        super(args);

        const {
            chainHandlerCtor = AnyHandler,
            emptyValues = [null, undefined],
            pipeline = [],
        } = args;

        this._config.emptyValues = emptyValues;

        this._chainHandler = new chainHandlerCtor() as P['chainHandler'];
        this._chainHandlerCtor = chainHandlerCtor as new (...args: unknown[]) => P['chainHandler'];
        this._pipeline = pipeline;

        return new Proxy(this, this as ProxyHandler<this>);
    }

    public override clone(args: Partial<P> = {}, addStep?: Step): this {
        const clone = super.clone(args);
        clone._chainHandler = new this._chainHandlerCtor() as P['chainHandler'];
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
        return (...args: unknown[]): this => this.addHandlerStep(key as keyof P['chainHandler'], args);
    }

    public addHandlerStep(fnKey: keyof P['chainHandler'], argsOrCallback: StepArgsOrCallback = []): this {
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

