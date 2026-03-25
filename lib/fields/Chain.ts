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

export type ChainProps<H extends Handler = Handler> = FieldProps & {
    chainHandler: H;
    emptyValues: unknown[];
    pipeline: Step[];
};

type CloneProps<P extends ChainProps = ChainProps> = Partial<P> & { step: Step };

abstract class Chain<P extends ChainProps = ChainProps> extends Field<P> {

    constructor(props: Partial<P> = {}) {
        super(props);
        this.props.chainHandler = (props.chainHandler || {});
        this.props.pipeline = [];
        this.props.emptyValues = props.emptyValues || [null, undefined];
        return new Proxy(this, this as ProxyHandler<this>);
    }

    get(target: this, key: PropertyKey): unknown {
        if (key in target) {
            return (target as Record<PropertyKey, unknown>)[key];
        }
        return (...args: unknown[]): this => this.addStep(key as keyof P['chainHandler'], args);
    }

    override clone(props: CloneProps<P>): this {
        const clone = super.clone(props);
        const {
            step,
        } = props;
        const updatedPipeline = [...this.props.pipeline];

        if (step) {
            if (step.prioritize) {
                updatedPipeline.unshift(step);
            }
            else {
                updatedPipeline.push(step);
            }
        }
        clone.props.pipeline = updatedPipeline;

        return clone;
    }

    addStep(fnKey: keyof P['chainHandler'], args: StepArgsOrFn = [], prioritize: boolean = false): this{
        const chainHandler = this.props.chainHandler as P['chainHandler'];
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
    empty(): this {
        return this.addStep('empty', function (this: Chain<any>): unknown[] {
            return [this.props.emptyValues];
        });
    }


    /**
     * Validates that the value is not empty (i.e., not null or undefined).
     * @returns {Chain} Returns the chain for method chaining
     * @example
     * generic.notEmpty()
     */
    notEmpty(): this {
        return this.addStep('notEmpty', function (this: Chain<any>): unknown[] {
            return [this.props.emptyValues];
        });
    }

}

export { Chain };

