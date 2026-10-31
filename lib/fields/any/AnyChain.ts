'use strict';

import { AnyHandler } from './AnyHandler.ts';
import { HandlerResult } from '../HandlerResult.ts';
import { Field, FieldConfig } from '../Field.ts';
import { AnyProcessor } from './AnyProcessor.ts';
import { GlobalConfig } from '../../GlobalConfig.ts';

/** Static arguments or a callback that produces arguments for a chain step. */
export type StepArgsOrCallback = unknown[] | ((...args: unknown[]) => unknown[]);

/** Function and argument source stored for one chain step. */
export type ChainStep = {
    fn: (value: unknown, ...args: unknown[]) => HandlerResult;
    argsOrCallback?: StepArgsOrCallback;
};

/** Configuration shared by any-value chains. */
export type AnyChainConfig =
    FieldConfig & {
        empties: unknown[];
        mutable: boolean;
    };

/** Constructor options for an any-value chain. */
export type AnyChainCtorParams<
    C extends AnyChainConfig = AnyChainConfig,
    H extends AnyHandler = AnyHandler
> =
    C & {
        chainHandler: H;
        pipeline: ChainStep[];
    };

/** Builds a field chain of validation and transformation steps. */
class AnyChain<P extends AnyChainCtorParams = AnyChainCtorParams> extends Field<P> {

    private _chainHandler: P['chainHandler'];
    private _pipeline: ChainStep[];

    /** Creates a chain from its configuration and exposes handler steps through a proxy. */
    public constructor(args: Partial<P> = {}) {
        const finalArgs = Object.assign(
            {},
            GlobalConfig.general,
            GlobalConfig.fields.any,
            args
        ) as P;

        super(finalArgs);

        const {
            chainHandler = new AnyHandler(),
            empties,
            mutable,
            pipeline = [],
        } = finalArgs;

        this._chainHandler = chainHandler;
        this._pipeline = pipeline;

        this.config.empties = empties;
        this.config.mutable = mutable;

        return new Proxy(this, this as ProxyHandler<this>);
    }

    /** Gets the handler instance used to execute this chain's steps. */
    public get chainHandler(): P['chainHandler'] {
        return this._chainHandler;
    }

    /** Gets the configured pipeline steps. */
    public get pipeline(): ChainStep[] {
        return this._pipeline;
    }

    /** Creates the processor that executes this chain. */
    public override createProcessor(): AnyProcessor {
        return new AnyProcessor({
            field: this,
        });
    }

    /** Proxy trap that maps unknown handler method calls to chain steps. */
    public get(target: this, key: keyof P['chainHandler'], receiver: this): unknown {
        if (key in target) {
            return Reflect.get(target, key, receiver);
        }
        return (...args: unknown[]): this => this.addStepToChain(key, args);
    }

    /**
     * Clones this chain, optionally appending a step.
     *
     * @param args Configuration overrides.
     * @param stepToAdd Optional step to append to the clone.
     * @returns A cloned chain.
     */
    public override clone(args: Partial<P> = {}, stepToAdd?: ChainStep): this {
        const clone = super.clone(args);
        clone._chainHandler = this._chainHandler
        clone._pipeline = [...this._pipeline];

        clone.config.empties = this.config.empties;
        clone.config.mutable = this.config.mutable;

        if (stepToAdd) {
            clone._pipeline.push(stepToAdd);
        }

        return clone;
    }

    /**
     * Adds a handler method to the chain by returning a cloned chain.
     *
     * @param fnKey Handler method to invoke.
     * @param argsOrCallback Arguments or a callback that supplies them.
     * @returns A cloned chain with the step appended.
     * @throws {@link Error} If the handler does not implement the method.
     */
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

    /** Returns a clone with all configured chain steps removed. */
    public clearChain(): this {
        const clone = this.clone();
        clone._pipeline = [];
        return clone;
    }

    // Configurators

    /** Returns a chain configured with values treated as empty. */
    public empties(values: unknown[]): this {
        return this.clone({ empties: values } as Partial<P>);
    }

    /** Adds a validation step requiring an empty value. */
    public empty(): this {
        return this.addStepToChain('empty', () => {
            return [this.config.empties];
        });
    }

    /** Adds a validation step requiring a non-empty value. */
    public notEmpty(): this {
        return this.addStepToChain('notEmpty', () => {
            return [this.config.empties];
        });
    }

    /** Returns a Field whose value cannot be changed by user input. */
    public immutable(): this {
        return this.clone({ mutable: false } as Partial<P>);
    }

    /** Returns a Field whose value can be changed by user input. */
    public mutable() {
        return this.clone({ mutable: true } as Partial<P>);
    }

}

export { AnyChain };
