'use strict';

import { AnyHandler } from './AnyHandler.ts';
import { HandlerResult } from '../HandlerResult.ts';
import { Field, FieldConfig } from '../Field.ts';
import { AnyProcessor } from './AnyProcessor.ts';

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

class AnyChain<P extends AnyChainCtorParams = AnyChainCtorParams> extends Field<P> {

    protected _chainHandler: P['chainHandler'];
    protected _chainHandlerCtor: new (...args: unknown[]) => P['chainHandler'];
    protected _pipeline: Step[];

    public constructor(args: Partial<P> = {}) {
        super(args);

        const {
            chainHandlerCtor = AnyHandler,
            emptyValues = [null, undefined, ''],
            pipeline = [],
        } = args;

        this._chainHandler = new chainHandlerCtor() as P['chainHandler'];
        this._chainHandlerCtor = chainHandlerCtor as new (...args: unknown[]) => P['chainHandler'];
        this._pipeline = pipeline;

        this._config.emptyValues = emptyValues;

        return new Proxy(this, this as ProxyHandler<this>);
    }

    public get pipeline(): Step[] {
        return this._pipeline;
    }

    public get(target: this, key: keyof P['chainHandler'], receiver: this): unknown {
        if (key in target) {
            return Reflect.get(target, key, receiver);
        }
        return (...args: unknown[]): this => this.addStepToChain(key, args);
    }

    public override clone(args: Partial<P> = {}, stepToAdd?: Step): this {
        const clone = super.clone(args);
        clone._chainHandler = new this._chainHandlerCtor() as P['chainHandler'];
        clone._chainHandlerCtor = this._chainHandlerCtor;
        clone._pipeline = [...this._pipeline];

        clone._config.emptyValues = this._config.emptyValues;

        if (stepToAdd) {
            clone._pipeline.push(stepToAdd);
        }

        return clone;
    }

    public override createProcessor(): AnyProcessor {
        return new AnyProcessor({
            field: this,
        });
    }

    public addStepToChain(fnKey: keyof P['chainHandler'], argsOrCallback: StepArgsOrCallback = []): this {
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

    public empty(): this {
        return this.addStepToChain('empty', () => {
            return [this._config.emptyValues];
        });
    }

    public notEmpty(): this {
        return this.addStepToChain('notEmpty', () => {
            return [this._config.emptyValues];
        });
    }

    // Configurators

    public emptyValues(values: unknown[]): this {
        return this.clone({ emptyValues: values } as Partial<P>);
    }
}

export { AnyChain };

