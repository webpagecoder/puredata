'use strict';

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
        pipeline: Step[];
    };

export type ChainCtorParams<C extends ChainProps = ChainProps> =
    FieldCtorParams & Partial<C> & Pick<C, 'chainHandler'>;

export type ChainCloneParams<C extends ChainProps = ChainProps> =
    FieldCloneParams<C> & {
        addStep?: Step;
    };

abstract class Chain<
    C extends ChainProps = ChainProps,
    L extends ChainCloneParams<C> = ChainCloneParams<C>
> extends Field<C> {

    public constructor(args: ChainCtorParams<C>) {
        super(args);

        const {
            chainHandler,
            emptyValues = [null, undefined],
            pipeline = [],
        } = args;

        this._props = {
            chainHandler,
            emptyValues,
            pipeline
        } as C;

        return new Proxy(this, this as ProxyHandler<this>);
    }

    public override clone(args: L = {} as L): this {
        const clone = super.clone(args);

        if (args.addStep) {
            clone.extendedProps.pipeline = [...clone.extendedProps.pipeline, args.addStep];
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
        const chainHandler = this.extendedProps.chainHandler as C['chainHandler'];
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
        return this.addStep('empty', function (this: Chain): unknown[] {
            return [this.extendedProps.emptyValues];
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
            return [this.extendedProps.emptyValues];
        });
    }

    // public get pipeline(): Step[] {
    //     return this.props.pipeline;
    // }

    // public get chainHandler(): C['chainHandler'] {
    //     return this.props.chainHandler;
    // }

}

export { Chain };

