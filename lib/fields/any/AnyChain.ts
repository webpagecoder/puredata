'use strict';

import { AnyHandler } from './AnyHandler.ts';
import { HandlerResult } from '../HandlerResult.ts';
import { Field, FieldCloneParams, FieldCtorParams, FieldProps } from '../Field.ts';

type StepArgsOrCallback = unknown[] | ((...args: unknown[]) => unknown[]);
type Step = {
    fn: (value: unknown, ...args: unknown[]) => HandlerResult;
    argsOrCallback?: StepArgsOrCallback;
};

export type AnyChainProps<H extends AnyHandler = AnyHandler> =
    FieldProps & {
        emptyValues: unknown[];
        chainHandler: H;
        chainHandlerCtor: new () => H;
        pipeline: Step[];
    };

export type AnyChainCtorParams<P extends AnyChainProps = AnyChainProps> =
    FieldCtorParams & Partial<Omit<P, 'chainHandler'>> & {
        chainHandlerCtor: new () => P['chainHandler'];
    };

export type AnyChainCloneParams<P extends AnyChainProps = AnyChainProps> =
    FieldCloneParams<P> & {
        addStep?: Step;
    };

class AnyChain<
    P extends AnyChainProps = AnyChainProps,
    C extends AnyChainCloneParams<P> = AnyChainCloneParams<P>
> extends Field<P> {

    public constructor(args: AnyChainCtorParams<P>) {
        super(args);

        const {
            chainHandlerCtor = AnyHandler,
            emptyValues = [null, undefined],
            pipeline = [],
        } = args;

        this._props = {
            chainHandler: new chainHandlerCtor(),
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

    public addStep(fnKey: keyof P['chainHandler'], argsOrCallback: StepArgsOrCallback = []): this {
        const chainHandler = this._props.chainHandler as P['chainHandler'];
        const fn = chainHandler[fnKey];
        if (typeof fn !== 'function') {
            throw new Error(`Method '${String(fnKey)}'(...) not found in chain handler`);
        }

        return this.clone({
            addStep: {
                fn: (fn as Step['fn']).bind(chainHandler),
                argsOrCallback,
            },
        } as C);
    }

    // Validators

    /**
     * Validates that the value is considered empty per generic rules (null or undefined).
     * @returns {AnyChain} Returns the chain for method chaining
     * @example
     * generic.empty()
     */
    public empty(): this {
        return this.addStep('empty', () => {
            return [this._props.emptyValues];
        });
    }


    /**
     * Validates that the value is not empty (i.e., not null or undefined).
     * @returns {AnyChain} Returns the chain for method chaining
     * @example
     * generic.notEmpty()
     */
    public notEmpty(): this {
        return this.addStep('notEmpty', () => {
            return [this._props.emptyValues];
        });
    }


}

export { AnyChain };

