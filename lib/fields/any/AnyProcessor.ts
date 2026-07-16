'use strict';

import { Processor, ProcessorCompilationContext, ProcessorCtorParams } from '../Processor.ts';
import { PathValueField } from '../schema/pathValue/PathValueField.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Field } from '../Field.ts';
import { HandlerResult } from '../HandlerResult.ts';
import { AnyChain } from './AnyChain.ts';
import { PathValueProcessor } from '../schema/pathValue/PathValueProcessor.ts';

type PipelineError = {
    key: string;
    args: Record<string, unknown>;
};

type PipelineResult = {
    value: unknown;
    fail: boolean;
    errors: PipelineError[];
};

type PipelineStep = {
    fn: (value: unknown, ...args: unknown[]) => PipelineResult;
    args?: unknown[] | ((this: Field) => unknown[]);
};

export type AnyProcessorCtorParams<C extends AnyChain = AnyChain> = ProcessorCtorParams<C> & {
    // hasPipelineHooks?: boolean;
};

class AnyProcessor<C extends AnyChain = AnyChain> extends Processor<C> {

    // protected _hasPipelineHooks: boolean;

    constructor(args: AnyProcessorCtorParams<C>) {
        super(args);
    }

    public override compile(context?: ProcessorCompilationContext): Processor {
        const { defaultValue } = this._field;
        if (defaultValue instanceof PathValueField) {
            this._defaultValuePathValueProcessor = defaultValue.createProcessor().compile(context) as PathValueProcessor;
        }
        return this;
    }

    public override process(tracker: ValueTracker): void {
        this.preProcess(tracker);
        if (tracker.hasErrors()) {
            return;
        }
        this.executePipeline(tracker);
    }

    public resolveStepArgs(args: PipelineStep['args']): unknown[] {
        if (typeof args === 'function') {
            return args.call(this._field);
        }
        return args || [];
    }

    public executePipeline(tracker: ValueTracker): void {
        const pipeline = this._field.props.pipeline || [];
        // const { _hasPipelineHooks } = this;
        for (const step of pipeline) {
            let { fn, argsOrCallback: args } = step;
            const finalArgs: unknown[] = [];
            args = this.resolveStepArgs(args);

            // todo: this should be moved to object child executePipeline.
            // a regular chain cant really refer to itself
            for (const arg of args) {
                if (arg instanceof PathValueField) {
                    const refValueTracker = tracker.resolvePath(arg.props.path);
                    finalArgs.push(refValueTracker ? refValueTracker.value : undefined);
                }
                else if (args != null) {
                    finalArgs.push(arg);
                }
            }

            const result = fn(...[
                tracker.getValue(),
                ...finalArgs
            ]);

            this._copyResultToTracker(tracker, result);

            if (tracker.hasErrors()) {
                return;
            }
        }
    }

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

