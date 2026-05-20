'use strict';

import { Handler } from '../handlers/Handler.ts';
import { HandlerResult } from '../handlers/HandlerResult.ts';
import { Field, FieldConstructorProps } from './Field.ts';
import { Overwrite } from '../types.ts';

type StepArgsOrFn = unknown[] | ((...args: unknown[]) => unknown[]);
type Step = {
    fn: (value: unknown, ...args: unknown[]) => HandlerResult;
    args?: StepArgsOrFn;
};

export type ChainConfigProps = {
    emptyValues?: unknown[];
};

export type ChainConstructorProps<
    P extends ChainConfigProps = ChainConfigProps,
    H extends Handler = Handler
> =
    Overwrite<
        FieldConstructorProps,
        Overwrite<
            P, {
                chainHandler: H;
                pipeline?: Step[];
            }
        >
    >;

export type ChainCloneProps<P extends ChainConstructorProps = ChainConstructorProps> = Partial<Overwrite<P, {
    step?: Step;
}>>;

abstract class Chain<P extends ChainConstructorProps = ChainConstructorProps> extends Field {

    protected _chainHandler: P['chainHandler'];
    protected _emptyValues: unknown[];
    protected _pipeline: Step[];

    public constructor(props: ChainConstructorProps) {
        super(props);

        const {
            chainHandler,
            emptyValues = [null, undefined],
            pipeline = [],
        } = props;

        this._chainHandler = chainHandler;
        this._pipeline = pipeline;
        this._emptyValues = emptyValues;

        return new Proxy(this, this as ProxyHandler<this>);
    }

    public get(target: this, key: PropertyKey): unknown {
        if (key in target) {
            return (target as Record<PropertyKey, unknown>)[key];
        }
        return (...args: unknown[]): this => this.addStep(key as keyof P['chainHandler'], args);
    }

    public override clone(props: ChainCloneProps = {}): this {
        const clone = super.clone(props);
        const {
            chainHandler = this._chainHandler,
            emptyValues = this._emptyValues,
            step,
        } = props;
        const pipelineCopy = [...this._pipeline];

        if (step) {
            pipelineCopy.push(step);
        }

        clone._pipeline = pipelineCopy;
        clone._chainHandler = chainHandler;
        clone._emptyValues = emptyValues;

        return clone;
    }

    public config(props: ChainConfigProps): this {
        return this.clone(props);
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
            return [this._emptyValues];
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
            return [this._emptyValues];
        });
    }

    get pipeline(): Step[] {
        return this._pipeline;
    }

    get chainHandler(): P['chainHandler'] {
        return this._chainHandler;
    }

}

export { Chain };

