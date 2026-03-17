'use strict';

import { Processor, State } from './Processor.ts';
import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Chain } from '../fields/Chain.ts';

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
    args?: unknown[] | ((this: ChainProcessor) => unknown[]);
};

class ChainProcessor extends Processor {

    preProcess(_tracker: ValueTracker, _state?: State): void {}

    postProcess(_tracker: ValueTracker, _state?: State): void {};

    override _process(tracker: ValueTracker, state: State = {}): ValueTracker {
        // const { failOnFirstError } = this.globalConfig;
        this.preProcess(tracker, state);
        if (tracker.hasErrors()) {
            return tracker;
        }
        this.executePipeline(tracker);
        this.postProcess(tracker, state);
        return tracker;
    }

    private resolveStepArgs(args: PipelineStep['args']): unknown[] {
        if (typeof args === 'function') {
            return args.call(this);
        }
        return args || [];
    }

    executePipeline(tracker: ValueTracker): void {
        const pipeline = (this.props.field as Chain).props.pipeline;
        for (const step of pipeline) {
            let { fn, args } = step;
            const finalArgs: unknown[] = [];
            args = this.resolveStepArgs(args);

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

            const result = fn(...[
                tracker.getValue(),
                ...finalArgs
            ]);

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
        const pipeline = (this.props.field as Chain).props.pipeline;
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