'use strict';

import { Path } from '../Path.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Processor, State } from './Processor.ts';
import { SchemaNodePosition } from './SchemaNodePosition.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';

export type SchemaNodeProcessorProps = {
    processor: Processor;
    parent: SchemaProcessor;
    path: Path;
    root: SchemaProcessor;
};

class SchemaNodeProcessor extends Processor implements SchemaNodePosition {
    public processor: Processor;
    public parent: SchemaProcessor;
    public path: Path;
    public root: SchemaProcessor;

    public constructor(props: SchemaNodeProcessorProps) {
        super({ field: props.processor.field });
        this.processor = props.processor;
        this.path = props.path;
        this.parent = props.parent;
        this.root = props.root;
    }

    public override actualProcess(tracker: ValueTracker, state: State): ValueTracker {
        return this.processor.actualProcess(tracker, state);
    }

    public override hasReferences(): boolean {
        return this.processor.hasReferences();
    }

    public override compile(): this {
        this.processor.compile();
        return this;
    }

    public override preProcess(tracker: ValueTracker, state: State): void {
        this.processor.preProcess(tracker, state);
    }

    public override postProcess(tracker: ValueTracker, state: State): void {
        this.processor.postProcess(tracker, state);
    }

}

export { SchemaNodeProcessor };

