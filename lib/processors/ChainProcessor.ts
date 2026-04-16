'use strict';

import { Processor, ProcessorProps, State } from './Processor.ts';
import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Chain } from '../fields/Chain.ts';
import { Field } from '../fields/Field.ts';

type PipelineError = {
    key: string;
    args: Record<string, unknown>;
};

type PipelineResult = {
    value: unknown;
    fail: boolean;
    errors: Iterable<PipelineError>;
};

type PipelineStep = {
    fn: (value: unknown, ...args: unknown[]) => PipelineResult;
    args?: unknown[] | ((this: Field) => unknown[]);
};

export type ChainProcessorProps = ProcessorProps & {
    hasPipelineHooks: boolean;
    field: Chain;
};

class ChainProcessor extends Processor<ChainProcessorProps> {

    constructor(props: ChainProcessorProps) {
        super(props);
        this.props.hasPipelineHooks = props.hasPipelineHooks;
    }

    preProcess(tracker: ValueTracker, state?: State): void {
        const result = this.props.field.props.chainHandler.format(tracker.getValue());
        if (result.fail) {
            for (const key of Object.keys(result.errors)) {
                tracker.addError(key, result.errors[key]);
            }
        }
        else {
            tracker.setValue(result.value);
        }
    }

    preStepHook(tracker: ValueTracker, state?: State): void { }

    postStepHook(tracker: ValueTracker, state?: State): void { }

    postProcess(tracker: ValueTracker, state?: State): void { }

    override _process(tracker: ValueTracker, state: State = {}): ValueTracker {
        // const { failOnFirstError } = this.globalConfig;
        this.preProcess(tracker, state);
        if (tracker.hasErrors()) {
            return tracker;
        }
        this.executePipeline(tracker, state);
        this.postProcess(tracker, state);
        return tracker;
    }

    private resolveStepArgs(args: PipelineStep['args']): unknown[] {
        if (typeof args === 'function') {
            return args.call(this.props.field);
        }
        return args || [];
    }

    executePipeline(tracker: ValueTracker, state: State = {}): void {
        const pipeline = this.props.field.props.pipeline;
        const { hasPipelineHooks } = this.props;
        for (const step of pipeline) {
            let { fn, args } = step;
            const finalArgs: unknown[] = [];
            args = this.resolveStepArgs(args);

            // todo: this should be moved to object child executePipeline.
            // a regular chain cant really refer to itself
            for (const arg of args) {
                if (arg instanceof PathReferenceField) {
                    const refValueTracker = (tracker.parent as unknown as {
                        getByPath(path: unknown): ValueTracker | undefined;
                    }).getByPath(arg.path);
                    finalArgs.push(refValueTracker ? refValueTracker.value : undefined);
                }
                else if (args != null) {
                    finalArgs.push(arg);
                }
            }

            if (hasPipelineHooks) {
                this.preStepHook(tracker, state);
            }
            const result = fn(...[
                tracker.getValue(),
                ...finalArgs
            ]);
            if (hasPipelineHooks) {
                this.postStepHook(tracker, state);
            }

            tracker.setValue(result.value);

            if (result.fail) {
                for (const key of Object.keys(result.errors)) {
                    tracker.addError(key, result.errors[key]);
                }
            }

            if (tracker.hasErrors()) {
                return;
            }
        }
    }

    override getReferences(): Set<PathReferenceField> {
        const references = super.getReferences();
        const { pipeline } = this.props.field.props;
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