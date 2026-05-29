'use strict';

import { Path } from '../Path.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Processor, State } from './Processor.ts';
import { SchemaNodePosition } from './SchemaNodePosition.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';

export type SchemaNodeProcessorProps = {
    innerProcessor: Processor;
    parent: SchemaProcessor;
    path: Path;
    root: SchemaProcessor;
};

class SchemaNodeProcessor extends Processor implements SchemaNodePosition {
    public innerProcessor: Processor;
    public parent: SchemaProcessor;
    public path: Path;
    public root: SchemaProcessor;

    public constructor(props: SchemaNodeProcessorProps) {
        super({ field: props.innerProcessor.field });
        this.innerProcessor = props.innerProcessor;
        this.path = props.path;
        this.parent = props.parent;
        this.root = props.root;
    }

    public override actualProcess(tracker: ValueTracker, state: State): ValueTracker {
        return this.innerProcessor.actualProcess(tracker, state);
    }

    public override hasReferences(): boolean {
        return this.innerProcessor.hasReferences();
    }

    public override compile(): this {
        this.innerProcessor.compile();
        return this;
    }

    public override preProcess(tracker: ValueTracker, state: State): void {
        this.innerProcessor.preProcess(tracker, state);
    }

    public override postProcess(tracker: ValueTracker, state: State): void {
        this.innerProcessor.postProcess(tracker, state);
    }

}

export { SchemaNodeProcessor };

