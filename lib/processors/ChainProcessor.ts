'use strict';

import { Processor, ProcessorConstructorParams, State } from './Processor.ts';
import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Chain } from '../fields/Chain.ts';
import { Field } from '../fields/Field.ts';
import { HandlerResult } from '../handlers/HandlerResult.ts';

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

export type ChainProcessorConstructorParams<C extends Chain = Chain> = ProcessorConstructorParams<C> & {
    // hasPipelineHooks?: boolean;
};

abstract class ChainProcessor<C extends Chain = Chain> extends Processor<C> {

    // protected _hasPipelineHooks: boolean;

    constructor(args: ChainProcessorConstructorParams<C>) {
        super(args);
        // this._hasPipelineHooks = args.hasPipelineHooks || false;
    }

    public override process(tracker: ValueTracker): void {
        this.preProcess(tracker);
        if (tracker.hasErrors()) {
            return;
        }
        this.executePipeline(tracker);
    }

    private resolveStepArgs(args: PipelineStep['args']): unknown[] {
        if (typeof args === 'function') {
            return args.call(this._field);
        }
        return args || [];
    }

    public executePipeline(tracker: ValueTracker): void {
        const pipeline = this._field.extendedProps.pipeline || [];
        // const { _hasPipelineHooks } = this;
        for (const step of pipeline) {
            let { fn, args } = step;
            const finalArgs: unknown[] = [];
            args = this.resolveStepArgs(args);

            // todo: this should be moved to object child executePipeline.
            // a regular chain cant really refer to itself
            for (const arg of args) {
                if (arg instanceof PathReferenceField) {
                    const refValueTracker = tracker.parent.resolvePath(arg.extendedProps.path);
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

    public override getReferences(): Set<PathReferenceField> {
        const references = super.getReferences();
        const { pipeline } = this._field.extendedProps;
        for (const { args } of pipeline) {
            for (const arg of this.resolveStepArgs(args)) {
                if (arg instanceof PathReferenceField) {
                    references.add(arg);
                }
            }
        }
        return references;
    }
}

export { ChainProcessor };