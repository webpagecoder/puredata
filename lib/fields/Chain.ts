'use strict';

import { AnyHandler } from './any/AnyHandler.ts';
import { ChainHandler } from './ChainHandler.ts';
import { ChainHandlerResult } from './ChainHandlerResult.ts';
import { Field, FieldCloneParams, FieldCtorParams, FieldProps } from './Field.ts';

type StepArgsOrFn = unknown[] | ((...args: unknown[]) => unknown[]);
type Step = {
    fn: (value: unknown, ...args: unknown[]) => ChainHandlerResult;
    args?: StepArgsOrFn;
};

export type ChainProps<H extends ChainHandler = ChainHandler> =
    FieldProps & {
        emptyValues: unknown[];
        chainHandler: H;
        chainHandlerCtor: new (field: Chain) => H;
        pipeline: Step[];
    };

export type ChainCtorParams<P extends ChainProps = ChainProps> =
    FieldCtorParams & Partial<P> & {
        chainHandlerCtor: new (field: Chain) => P['chainHandler'];
        chainHandler: never;
    };

export type ChainCloneParams<P extends ChainProps = ChainProps> =
    FieldCloneParams<P> & {
        addStep?: Step;
    };

abstract class Chain<
    P extends ChainProps = ChainProps,
    C extends ChainCloneParams<P> = ChainCloneParams<P>
> extends Field<P> {

    public constructor(args: ChainCtorParams<P>) {
        super(args);

        const {
            chainHandlerCtor = AnyHandler,
            emptyValues = [null, undefined],
            pipeline = [],
        } = args;

        this._props = {
            chainHandler: new chainHandlerCtor(this),
            chainHandlerCtor,
            emptyValues,
            pipeline
        } as P;

        return new Proxy(this, this as ProxyHandler<this>);
    }

    public override clone(args: C = {} as C): this {
        const clone = super.clone(args);
        if (args.addStep) {
            clone._props.pipeline = [...clone._props.pipeline, args.addStep];
        }
        return clone;
    }

    public get(target: this, key: PropertyKey): unknown {
        if (key in target) {
            return (target as Record<PropertyKey, unknown>)[key];
        }
        return (...args: unknown[]): this => this.addStep(key as keyof P['chainHandler'], args);
    }

    public addStep(fnKey: keyof P['chainHandler'], args: StepArgsOrFn = []): this {
        const chainHandler = this._props.chainHandler as P['chainHandler'];
        const fn = chainHandler[fnKey];
        if (typeof fn !== 'function') {
            throw new Error(`Method '${String(fnKey)}'(...) not found in chain handler`);
        }

        return this.clone({
            addStep: {
                fn: (fn as Step['fn']).bind(chainHandler),
                args,
            },
        } as C);
    }

    // Validators

    /**
     * Validates that the value is considered empty per generic rules (null or undefined).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.empty()
     */
    public empty(): this {
        return this.addStep('empty', function (this: Chain): unknown[] {
            return [this._props.emptyValues];
        });
    }


    /**
     * Validates that the value is not empty (i.e., not null or undefined).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notEmpty()
     */
    public notEmpty(): this {
        return this.addStep('notEmpty', function (this: Chain): unknown[] {
            return [this._props.emptyValues];
        });
    }


}

export { Chain };

