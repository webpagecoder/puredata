'use strict';

import { Processor, ProcessorCompilationContext, ProcessorCtorParams } from '../Processor.ts';
import { ReferenceField } from '../schema/reference/ReferenceField.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { HandlerResult } from '../HandlerResult.ts';
import { AnyChain, PipelineStep } from './AnyChain.ts';
import { ReferenceProcessor } from '../schema/reference/ReferenceProcessor.ts';

/** Constructor options for an any-value processor. */
export type AnyProcessorCtorParams<C extends AnyChain = AnyChain> = ProcessorCtorParams<C>;

/** Processes an any-value chain by applying its validation and transformation pipeline. */
class AnyProcessor<C extends AnyChain = AnyChain> extends Processor<C> {

    /** Creates a processor for an any-value chain. */
    constructor(args: AnyProcessorCtorParams<C>) {
        super(args);
    }

    /** Compiles reference-based default values used by the field. */
    public override compile(context?: ProcessorCompilationContext): Processor {
        const { defaultValue } = this.field.config;
        if (defaultValue instanceof ReferenceField) {
            this._defaultValueReferenceProcessor = defaultValue.createProcessor().compile(context) as ReferenceProcessor;
        }
        return this;
    }

    /** Hook for subclasses to post-process a value after the chain pipeline. */
    public postProcess(tracker: ValueTracker): void { }

    /** Runs preprocessing, pipeline steps, and post-processing for a tracker. */
    public override process(tracker: ValueTracker): void {
        const { defaultValue, mutable } = this.field.config;
        if (!mutable) {
            tracker.setValue(defaultValue);
            return;
        }
        this.preProcess(tracker);
        if (tracker.fail) {
            return;
        }
        this.executePipeline(tracker);
        this.postProcess(tracker);
    }

    /** Resolves static or callback-provided arguments for a pipeline step. */
    public resolveStepArgs(args: PipelineStep['argsOrCallback']): unknown[] {
        if (typeof args === 'function') {
            return args.call(this.field);
        }
        return args || [];
    }

    /** Runs each configured chain step against the tracker's current value. */
    public executePipeline(tracker: ValueTracker): void {
        const { pipeline, config: { failOnFirstError } } = this.field;

        for (const step of pipeline) {
            let { fn, argsOrCallback } = step;
            const finalArgs: unknown[] = [];

            if (argsOrCallback) {
                for (const arg of this.resolveStepArgs(argsOrCallback)) {
                    if (arg instanceof ReferenceField) {
                        const refValueTracker = tracker.parent.resolvePath(arg.config.path);
                        finalArgs.push(refValueTracker ? refValueTracker.value : undefined);
                    }
                    else {
                        finalArgs.push(arg);
                    }
                }
            }

            const result = fn(...[
                tracker.value,
                ...finalArgs
            ]);

            this._copyResultToTracker(tracker, result);

            if (tracker.fail && failOnFirstError) {
                return;
            }
        }
    }

    /** Copies a handler result's value and errors to the tracker. */
    protected _copyResultToTracker(tracker: ValueTracker, result: HandlerResult): void {
        tracker.setValue(result.value);
        if (result.fail) {
            for (const key of Object.keys(result.errors)) {
                tracker.addError(key, result.errors[key]);
            }
        }
    }

}

export { AnyProcessor };
