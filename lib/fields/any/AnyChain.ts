'use strict';

import { AnyHandler } from './AnyHandler.ts';
import { HandlerResult } from '../HandlerResult.ts';
import { Field, FieldConfig } from '../Field.ts';
import { AnyProcessor } from './AnyProcessor.ts';

/**
 * Function and argument source stored for one chain step.
 *
 * @property fn Handler function to execute for the step.
 * @property argsResolver Static or dynamic argument resolver for the step.
 */
export type PipelineStep = {
    fn: (value: unknown, ...args: unknown[]) => HandlerResult;
    argsResolver: null | ((...args: unknown[]) => unknown[]);
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
        pipeline: PipelineStep[];
    };

/** Builds a field chain of validation and transformation steps. */
class AnyChain<P extends AnyChainCtorParams = AnyChainCtorParams> extends Field<P> {

    private _chainHandler: P['chainHandler'];
    private _pipeline: PipelineStep[];

    /**
     * Creates a chain from its configuration and exposes handler steps through a proxy.
     *
     * @param args Initial configuration overrides for the chain.
     */
    public constructor(args: Partial<P> = {}) {
        super(args);

        const {
            chainHandler = new AnyHandler(),
            empties = [null, undefined, ''],
            mutable = true,
            pipeline = [],
        } = args;

        this._chainHandler = chainHandler;
        this._pipeline = pipeline;

        this.config.empties = empties;
        this.config.mutable = mutable;

        return new Proxy(this, this as ProxyHandler<this>);
    }

    // ========================================
    // Accessors
    // ========================================

    /** Gets the handler instance used to execute this chain's steps. */
    public get chainHandler(): P['chainHandler'] {
        return this._chainHandler;
    }

    /** Gets the configured pipeline steps. */
    public get pipeline(): PipelineStep[] {
        return this._pipeline;
    }

    // ========================================
    // Processor wiring
    // ========================================

    /**
     * Creates the processor that executes this chain.
     *
     * @returns Processor configured for this chain.
     */
    public override createProcessor(): AnyProcessor {
        return new AnyProcessor({
            field: this,
        });
    }

    /**
     * Proxy trap that maps unknown handler method calls to chain steps.
     *
     * @param target Chain instance being proxied.
     * @param key Property key being accessed.
     * @param receiver Proxy receiver instance.
     * @returns Existing property value or a function that appends a handler call to the pipeline.
     */
    public get(target: this, key: keyof P['chainHandler'], receiver: this): unknown {
        if (key in target) {
            return Reflect.get(target, key, receiver);
        }
        return (...args: unknown[]): this => this.appendToPipeline(key, args);
    }

    // ========================================
    // Pipeline mechanics
    // ========================================

    /**
     * Adds a handler method to the chain by returning a cloned chain.
     *
     * @param fnKey Handler method to invoke.
     * @param argsOrCallback Array of arguments or a callback that supplies them.
     * @returns A cloned chain with the step appended.
     * @throws {@link Error} If the handler does not implement the method.
     */
    public appendToPipeline(
        fnKey: keyof P['chainHandler'],
        argsOrCallback?: unknown[] | ((...args: unknown[]) => unknown[])
    ): this {
        const { _chainHandler } = this;
        const fn = _chainHandler[fnKey];
        if (typeof fn !== 'function') {
            throw new Error(`Method '${String(fnKey)}'(...) not found in chain handler`);
        }

        let argsResolver;
        if (typeof argsOrCallback === 'function') {
            argsResolver = argsOrCallback.bind(this);
        }
        else if (Array.isArray(argsOrCallback)) {
            argsResolver = () => argsOrCallback;
        }
        else {
            argsResolver = null;
        }

        const clone = this.clone();
        clone._pipeline.push({
            fn: fn.bind(_chainHandler),
            argsResolver
        });

        return clone;
    }

    /**
     * Returns a clone with all configured chain steps removed.
     *
     * @returns Cloned chain with an empty pipeline.
     */
    public clearPipeline(): this {
        const clone = this.clone();
        clone._pipeline = [];
        return clone;
    }

    // ========================================
    // Cloning
    // ========================================

    /**
     * Clones this chain with optional configuration overrides.
     *
     * @param args Configuration overrides.
     * @returns A cloned chain.
     */
    public override clone(args: Partial<P> = {}): this {
        const clone = super.clone(args);
        clone._chainHandler = this._chainHandler
        clone._pipeline = [...this._pipeline];

        const {
            empties = this.config.empties,
            mutable = this.config.mutable,
        } = args;

        clone.config.empties = empties;
        clone.config.mutable = mutable;

        return clone;
    }

    // ========================================
    // Configurators
    // ========================================

    /**
     * Returns a chain configured with values treated as empty.
     *
     * @param values Values treated as empty by empty/notEmpty checks.
     * @returns Cloned chain with updated empty values.
     */
    public empties(values: unknown[]): this {
        return this.clone({ empties: values } as Partial<P>);
    }

    /**
     * Adds a validation step requiring an empty value.
     *
     * @returns Cloned chain with an `empty` validator step.
     */
    public empty(): this {
        return this.appendToPipeline('empty', () => {
            return [this.config.empties];
        });
    }

    /**
     * Adds a validation step requiring a non-empty value.
     *
     * @returns Cloned chain with a `notEmpty` validator step.
     */
    public notEmpty(): this {
        return this.appendToPipeline('notEmpty', () => {
            return [this.config.empties];
        });
    }

    /**
     * Returns a Field whose value cannot be changed by user input.
     *
     * @returns Cloned chain with mutability disabled.
     */
    public immutable(): this {
        return this.clone({ mutable: false } as Partial<P>);
    }

    /**
     * Returns a Field whose value can be changed by user input.
     *
     * @returns Cloned chain with mutability enabled.
     */
    public mutable() {
        return this.clone({ mutable: true } as Partial<P>);
    }

}

export { AnyChain };
