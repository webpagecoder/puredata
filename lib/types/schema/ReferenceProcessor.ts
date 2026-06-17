'use strict';

import { ReferenceField } from './ReferenceField.ts';
import { Path } from '../../Path.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Processor, ProcessorCompilationContext, ProcessorConstructorParams } from '../Processor.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';

export type ReferenceProcessorCompilationContext = ProcessorCompilationContext & {
    ancestors: SchemaProcessor[];
    parent: SchemaProcessor;
    absolutePath: Path;
}

class ReferenceProcessor extends Processor<ReferenceField> {

    protected _innerNestedProcessor: Processor | null;

    public constructor(args: ProcessorConstructorParams<ReferenceField>) {
        super(args);
        this._innerNestedProcessor = null;
    }

    public override compile(context: ReferenceProcessorCompilationContext): Processor {
        const { ancestors, parent, absolutePath } = context;
        const { _processorMapper, _field } = this;
        const { fieldPath } = _field.extendedProps;
        const referencedProcessor = parent.resolveNodePath(fieldPath, ancestors);

        if (!referencedProcessor) {
            throw new Error('At key ' + absolutePath
                + ' - unable to resolve referenced path: ' + fieldPath);
        }
        if (referencedProcessor instanceof ReferenceProcessor) {
            throw new Error('At key ' + absolutePath + ' - cannot point to another reference: ' + fieldPath);
        }

        const resolvedRefPath = absolutePath.move(fieldPath);
        const { separator } = absolutePath.delims;
        const isNest = resolvedRefPath.isRoot
            || (absolutePath.toString() + separator).startsWith(resolvedRefPath.toString() + separator);

        if (isNest) {
            this._innerNestedProcessor = referencedProcessor;
            return this;
        }
        else {
            return _processorMapper.createProcessor(referencedProcessor.field).compile(context);
        }
    }

    // Note: this will only be called if the reference is a nest (i.e. it points to an ancestor)
    public override process(tracker: ValueTracker): void {

        const { minDepth, maxDepth } = this._field.extendedProps;

        tracker.setNestDepth(tracker.parent.nestDepth + 1);

        if (tracker.nestDepth === 1) {
            tracker.setNestRoot(tracker);
        }
        else {
            tracker.setNestRoot(tracker.parent.nestRoot);
        }

        const value = tracker.getValue();

        if (value === undefined && tracker.nestDepth - 1 < minDepth) {
            tracker.nestRoot!.addError('object/recursion/tooShallow', { minDepth, maxDepth });
        }
        else if (value !== undefined) {
            if (tracker.nestDepth > maxDepth) {
                tracker.nestRoot!.addError('object/recursion/tooDeep', { minDepth, maxDepth });
            }
            else {
                this._innerNestedProcessor!.process(tracker);
            }
        }
    }
}

export { ReferenceProcessor };

