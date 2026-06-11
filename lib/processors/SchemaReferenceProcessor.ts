'use strict';

import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { SchemaReferenceField } from '../fields/SchemaReferenceField.ts';
import { Path } from '../Path.ts';
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

    public override process(tracker: ValueTracker): void {
        let {
            minDepth = 0, maxDepth = 1
        } = this._field.extendedProps;

        //todo: cant use field here
        minDepth = Number(minDepth instanceof PathReferenceField ? minDepth.process().value : minDepth);
        maxDepth = Number(maxDepth instanceof PathReferenceField ? maxDepth.process().value : maxDepth);

        tracker.setNestDepth(tracker.parent.nestDepth + 1);

        if(tracker.nestDepth === 1) {
            tracker.setNestRoot(tracker);
        }
        else {
            tracker.setNestRoot(tracker.parent.nestRoot);
        }

        const value = tracker.getValue();

        if (value === undefined && tracker.nestDepth < minDepth) {
            tracker.nestRoot!.addError('object/recursion/tooShallow', { minDepth, maxDepth });
            return;
        }
        else if (value !== undefined) {
            if (tracker.nestDepth > maxDepth) {
                tracker.nestRoot!.addError('object/recursion/tooDeep', { minDepth, maxDepth });
                return;
            }
            this._innerProcessor!.process(tracker);
        }



    }


}

export { SchemaReferenceProcessor };

