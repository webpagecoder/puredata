'use strict';

import { ChainHandler } from '../handlers/ChainHandler.ts';
import { HandlerResult } from '../handlers/HandlerResult.ts';
import { Field, FieldConstructorParams, FieldCloneParams, FieldConfig } from './Field.ts';
import { Overwrite } from '../types.ts';

type StepArgsOrFn = unknown[] | ((...args: unknown[]) => unknown[]);
type Step = {
    fn: (value: unknown, ...args: unknown[]) => HandlerResult;
    args?: StepArgsOrFn;
};

export type ChainConfig<H extends ChainHandler = ChainHandler> =
    FieldConfig & {
        emptyValues: unknown[];
        chainHandler: H;
        pipeline: Step[];
    };

export type ChainConstructorParams<C extends ChainConfig = ChainConfig> =
    FieldConstructorParams & Partial<C> & Pick<C, 'chainHandler'>;

export type ChainCloneParams<C extends ChainConfig = ChainConfig> =
    FieldCloneParams<C> & {
        addStep?: Step;
    };

abstract class Chain<
    C extends ChainConfig = ChainConfig,
    L extends ChainCloneParams<C> = ChainCloneParams<C>
> extends Field<C> {

    public constructor(args: ChainConstructorParams<C>) {
        super(args);

        const {
            chainHandler,
            emptyValues = [null, undefined],
            pipeline = [],
        } = args;

        this._config = {
            chainHandler,
            emptyValues,
            pipeline
        } as C;

        return new Proxy(this, this as ProxyHandler<this>);
    }

    public override clone(args: L = {} as L): this {
        const clone = super.clone(args);

        if (args.addStep) {
            clone._config.pipeline = [...clone._config.pipeline, args.addStep];
        }
        return clone;
    }

    public get(target: this, key: PropertyKey): unknown {
        if (key in target) {
            return (target as Record<PropertyKey, unknown>)[key];
        }
        return (...args: unknown[]): this => this.addStep(key as keyof C['chainHandler'], args);
    }

    public addStep(fnKey: keyof C['chainHandler'], args: StepArgsOrFn = []): this {
        const chainHandler = this._config.chainHandler as C['chainHandler'];
        const fn = chainHandler[fnKey];
        if (typeof fn !== 'function') {
            throw new Error(`Method '${String(fnKey)}'(...) not found in chain handler`);
        }

        return this.clone({
            addStep: {
                fn: (fn as Step['fn']).bind(chainHandler),
                args,
            },
        } as L);
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

    // public get pipeline(): Step[] {
    //     return this._config.pipeline;
    // }

    // public get chainHandler(): C['chainHandler'] {
    //     return this._config.chainHandler;
    // }

    public get config(): C {
        return this._config;
    }
}

export { Chain };

