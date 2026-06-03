'use strict';

import { Field } from '../fields/Field.ts';
import { Path } from '../Path.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { CompilationContext, Processor, State } from './Processor.ts';
import { SchemaNodePosition } from './SchemaNodePosition.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';

export type SchemaNodeProps = {
    innerProcessor: Processor;
    parent: SchemaNode;
    path: Path;
    root: SchemaNode;
};

class SchemaNode extends Processor implements SchemaNodePosition {
    public innerProcessor: Processor;
    public parent: SchemaProcessor;
    public path: Path;
    public root: SchemaProcessor;

    public constructor(props: SchemaNodeProps) {
        super({
            field: props.innerProcessor.field
        });
        this.innerProcessor = props.innerProcessor;
        this.path = props.path || new Path('/');
        this.parent = props.parent || this;
        this.root = props.root || this;
    }

    public override process(tracker: ValueTracker, state: State): ValueTracker {
        return this.innerProcessor.process(tracker, state);
    }

    public override hasReferences(): boolean {
        return this.innerProcessor.hasReferences();
    }

    public override compile(context: CompilationContext = {}): this {
        this.innerProcessor = this.innerProcessor.compile(context);
        return this;
    }

    public override preProcess(tracker: ValueTracker, state: State): void {
        this.innerProcessor.preProcess(tracker, state);
    }

    public override postProcess(tracker: ValueTracker, state: State): void {
        this.innerProcessor.postProcess(tracker, state);
    }

    public resolvePath(path: Path) {
        return this.parent.resolvePath(path);
    }

}

export { SchemaNode };

