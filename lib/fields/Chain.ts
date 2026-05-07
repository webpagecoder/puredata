'use strict';

import { Handler } from '../handlers/Handler.ts';
import { HandlerResult } from '../handlers/HandlerResult.ts';
import { Field, FieldProps } from './Field.ts';

type StepArgsOrFn = unknown[] | ((...args: unknown[]) => unknown[]);
type Step = {
    fn: (value: unknown, ...args: unknown[]) => HandlerResult;
    args?: StepArgsOrFn;
    prioritize?: boolean;
};

export type ChainProps<H extends typeof Handler = typeof Handler> = FieldProps & {
    chainHandler: H;
    emptyValues?: unknown[];
    pipeline?: Step[];
};

type CloneProps<P extends ChainProps = ChainProps> = Partial<P> & { step?: Step };

abstract class Chain<P extends ChainProps = ChainProps> extends Field<P> {

    protected _chainHandler: P['chainHandler'];
    protected _emptyValues: unknown[]
    protected _pipeline: Step[];

    constructor(props: P) {
        super(props as FieldProps);

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

    public override clone(props: CloneProps<P> = {}): this {
        const clone = super.clone(props);
        const { 
            chainHandler = this._chainHandler,
            emptyValues = this._emptyValues,
            step,
         } = props;
        const pipelineClone = [...this._pipeline];

        if (step) {
            if (step.prioritize) {
                pipelineClone.unshift(step);
            }
            else {
                pipelineClone.push(step);
            }
        }

        clone._pipeline = pipelineClone;
        clone._chainHandler = chainHandler;
        clone._emptyValues = emptyValues;

        return clone;
    }

    public addStep(fnKey: keyof P['chainHandler'], args: StepArgsOrFn = [], prioritize: boolean = false): this {
        const chainHandler = this._chainHandler as P['chainHandler'];
        const fn = chainHandler?.[fnKey];
        if (typeof fn !== 'function') {
            throw new Error(`Method '${String(fnKey)}'(...) not found in chain handler`);
        }
        return this.clone({
            step: {
                fn: fn as Step['fn'],
                args,
                prioritize,
            }
        } as CloneProps<P>);
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

