'use strict';

import { AnyHandler } from './AnyHandler.ts';
import { HandlerResult } from '../HandlerResult.ts';
import { Field, FieldConfig } from '../Field.ts';
import { AnyProcessor } from './AnyProcessor.ts';

type StepArgsOrCallback = unknown[] | ((...args: unknown[]) => unknown[]);
type ChainStep = {
    fn: (value: unknown, ...args: unknown[]) => HandlerResult;
    argsOrCallback?: StepArgsOrCallback;
};

export type AnyChainConfig =
    FieldConfig & {
        emptyValues: unknown[];
        mutable: boolean;
    };

export type AnyChainCtorParams<
    C extends AnyChainConfig = AnyChainConfig,
    H extends AnyHandler = AnyHandler
> =
    C & {
        chainHandler: H;
        chainHandlerCtor?: new (...args: unknown[]) => H;
        pipeline: ChainStep[];
    };

class AnyChain<P extends AnyChainCtorParams = AnyChainCtorParams> extends Field<P> {

    protected _chainHandler: P['chainHandler'];
    protected _chainHandlerCtor: new (...args: unknown[]) => P['chainHandler'];
    protected _pipeline: ChainStep[];

    public constructor(args: Partial<P> = {}) {
        super(args);

        const {
            chainHandlerCtor = AnyHandler,
            emptyValues = [null, undefined, ''],
            mutable = true,
            pipeline = [],
        } = args;

        this._chainHandler = new chainHandlerCtor() as P['chainHandler'];
        this._chainHandlerCtor = chainHandlerCtor as new (...args: unknown[]) => P['chainHandler'];
        this._pipeline = pipeline;

        this._config.emptyValues = emptyValues;
        this._config.mutable = mutable;

        return new Proxy(this, this as ProxyHandler<this>);
    }

    public get chainHandler(): P['chainHandler'] {
        return this._chainHandler;
    }

    public get chainHandlerCtor(): new (...args: unknown[]) => P['chainHandler'] {
        return this._chainHandlerCtor;
    }

    public get pipeline(): ChainStep[] {
        return this._pipeline;
    }

    public override createProcessor(): AnyProcessor {
        return new AnyProcessor({
            field: this,
        });
    }

    public get(target: this, key: keyof P['chainHandler'], receiver: this): unknown {
        if (key in target) {
            return Reflect.get(target, key, receiver);
        }
        return (...args: unknown[]): this => this.addStepToChain(key, args);
    }

    public override clone(args: Partial<P> = {}, stepToAdd?: ChainStep): this {
        const clone = super.clone(args);
        clone._chainHandler = new this._chainHandlerCtor() as P['chainHandler'];
        clone._chainHandlerCtor = this._chainHandlerCtor;
        clone._pipeline = [...this._pipeline];

        clone._config.emptyValues = this._config.emptyValues;
        clone._config.mutable = this._config.mutable;

        if (stepToAdd) {
            clone._pipeline.push(stepToAdd);
        }

        return clone;
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

    public clearChain(): this {
        const clone = this.clone();
        clone._pipeline = [];
        return clone;
    }

    // Configurators

    public emptyValues(values: unknown[]): this {
        return this.clone({ emptyValues: values } as Partial<P>);
    }

    public immutable() {
        return this.clone({ mutable: false } as Partial<P>);
    }

    public mutable() {
        return this.clone({ mutable: true } as Partial<P>);
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

}

export { AnyChain };

