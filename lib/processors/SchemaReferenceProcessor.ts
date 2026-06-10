'use strict';

import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { SchemaReferenceField } from '../fields/SchemaReferenceField.ts';
import { Path } from '../Path.ts';
import { NestedValueTracker } from '../tracker/NestedValueTracker.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { Processor, ProcessorCompilationContext, ProcessorConstructorParams, State } from './Processor.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';

export type SchemaReferenceProcessorContext = ProcessorCompilationContext & {
    ancestors: SchemaProcessor[];
    parent: SchemaProcessor;
    absolutePath: Path;
}

class SchemaReferenceProcessor extends Processor<SchemaReferenceField> {

    protected _innerProcessor: Processor | null;

    public constructor(args: ProcessorConstructorParams<SchemaReferenceField>) {
        super(args);
        this._innerProcessor = null;
    }

    public override compile(context: SchemaReferenceProcessorContext): Processor {
        const { ancestors, parent, absolutePath } = context;
        const { _processorMapper, _field } = this;
        const { absolutePath: refPath } = _field.extendedProps;
        const referencedProcessor = parent.resolveNodePath(refPath, ancestors);

        if (!referencedProcessor) {
            throw new Error('At key ' + absolutePath
                + ' - unable to resolve referenced path: ' + refPath);
        }
        if (referencedProcessor instanceof SchemaReferenceProcessor) {
            throw new Error('At key ' + absolutePath + ' - cannot point to another reference: ' + refPath);
        }

        const resolvedRefPath = absolutePath.move(refPath);
        const { separatorChar } = absolutePath;
        const isNest = resolvedRefPath.isRoot
            || (absolutePath.string + separatorChar).startsWith(resolvedRefPath.string + separatorChar);

        if (isNest) {
            this._innerProcessor = referencedProcessor;
            return this;
        }
        else {
            return _processorMapper.createProcessor(referencedProcessor.field).compile();
        }
    }

    public override process(tracker: ValueTracker, state: State = {}): void {
        let {
            minDepth = 0, maxDepth = 1
        } = this._field.extendedProps;

        minDepth = Number(minDepth instanceof PathReferenceField ? minDepth.process().value : minDepth);
        maxDepth = Number(maxDepth instanceof PathReferenceField ? maxDepth.process().value : maxDepth);

        let {
            nestDepth = 1,
            nestParent = null,
            nestRoot = tracker,
        } = state;

        tracker.setNestRoot(nestRoot);
        tracker.setNestParent(nestParent);
        tracker.setNestDepth(nestDepth);

        const value = tracker.getValue();

        if (value === undefined && nestDepth < minDepth) {
            tracker.nestRoot!.addError('object/recursion/tooShallow', { minDepth, maxDepth });
            return;
        }
        else if (value !== undefined) {
            if (nestDepth > maxDepth) {
                tracker.nestRoot!.addError('object/recursion/tooDeep', { minDepth, maxDepth });
                return;
            }
            this._innerProcessor!.process(tracker, {
                nestDepth: nestDepth + 1,
                nestParent: tracker,
                nestRoot
            });
        }



    }

    // public override get ValueTrackerConstructor() {
    //     return NestedValueTracker;
    // }

}

export { SchemaReferenceProcessor };

