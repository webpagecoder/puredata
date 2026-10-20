'use strict';

import { NodeMixin } from '../../../node/NodeMixin.ts';
import { Path } from '../../../Path.ts';
import { ValueTracker } from '../../../tracker/ValueTracker.ts';
import { Processor, ProcessorCompilationContext, ProcessorCtorParams, State } from '../../Processor.ts';
import { SchemaProcessor } from '../SchemaProcessor.ts';
import { FieldPointerField } from './FieldPointerField.ts';

export type FieldPointerProcessorCompilationContext = ProcessorCompilationContext & {
    parent: SchemaProcessor;
    absolutePath: Path;
}

class BoundFieldPointerProcessor extends Processor<FieldPointerField>{ 
    override process(tracker: ValueTracker, state: State): void { }
}

class FieldPointerProcessor extends NodeMixin(BoundFieldPointerProcessor) {

    private _innerNestedProcessor: Processor | null;

    public constructor(args: ProcessorCtorParams<FieldPointerField>) {
        super(args);
        this._innerNestedProcessor = null;
    }

    public override compile(context: FieldPointerProcessorCompilationContext): Processor {
// return this;
        const { absolutePath } = context;
        const { fieldPath } = this.field.config;

        if(fieldPath.isAbsolute) {
            throw new Error('At key ' + absolutePath + ' - path must be relative and not cross conditional boundaries: ' + fieldPath);
        }
        const referencedProcessor = this.parent.resolvePath(fieldPath);

        if (!referencedProcessor) {
            throw new Error('At key ' + absolutePath + ' - unable to resolve referenced path: ' + fieldPath);
        }

        if (referencedProcessor instanceof FieldPointerProcessor) {
            throw new Error('At key ' + absolutePath + ' - cannot point to another reference: ' + fieldPath);
        }

        const resolvedRefPath = absolutePath.parent().move(fieldPath);
        const { separator } = absolutePath.delims;
        const isNest = resolvedRefPath.isRoot
            || (absolutePath.toString() + separator).startsWith(resolvedRefPath.toString() + separator);

        if (isNest) {
            this._innerNestedProcessor = referencedProcessor;
            return this;
        }
        else {
            return referencedProcessor.field.createProcessor().compile(context);
        }
    }

    // This processor will only be called for a nested schema
    public override process(tracker: ValueTracker, state: State): void {
        const { minDepth, maxDepth } = this.field.config;
        const value = tracker.getValue();

        if (value === undefined && tracker.nestDepth - 1 < minDepth) {
            tracker.nestRoot!.addError('object/nest/tooShallow', { minDepth, maxDepth });
        }
        else if (value !== undefined) {
            if (tracker.nestDepth > maxDepth) {
                tracker.nestRoot!.addError('object/nest/tooDeep', { minDepth, maxDepth });
            }
            else {
                this._innerNestedProcessor!.process(tracker, state);
            }
        }
    }
}

export { FieldPointerProcessor };

