'use strict';

import { NodeMixin } from '../../../NodeMixin.ts';
import { Path } from '../../../Path.ts';
import { ValueTracker } from '../../../tracker/ValueTracker.ts';
import { Processor, ProcessorCompilationContext, ProcessorCtorParams, State } from '../../Processor.ts';
import { SchemaProcessor } from '../SchemaProcessor.ts';
import { PointerField } from './PointerField.ts';

export type PointerProcessorCompilationContext = ProcessorCompilationContext & {
    absolutePath: Path;
}

class BoundPointerProcessor extends Processor<PointerField> {
    override process(tracker: ValueTracker, state: State): void { }
}

class PointerProcessor extends NodeMixin(BoundPointerProcessor) {

    private _nestedSchemaProcessor: SchemaProcessor | null;

    public constructor(args: ProcessorCtorParams<PointerField>) {
        super(args);
        this._nestedSchemaProcessor = null;
    }

    public override compile(context: PointerProcessorCompilationContext): Processor {
        const { absolutePath } = context;
        const { fieldPath } = this.field.config;

        if (fieldPath.isAbsolute) {
            throw new Error('At key ' + absolutePath + ' - field reference path must be relative (not absolute) and not cross conditional boundaries: ' + fieldPath);
        }
        
        const referencedProcessor = this.parent.resolvePath(fieldPath);
        if (!referencedProcessor) {
            throw new Error('At key ' + absolutePath + ' - unable to resolve referenced field path: ' + fieldPath);
        }
        if (referencedProcessor instanceof PointerProcessor) {
            throw new Error('At key ' + absolutePath + ' - a field reference cannot point to another field reference: ' + fieldPath);
        }

        const resolvedRefPath = absolutePath.parent().move(fieldPath);
        const { separator } = absolutePath.delims;
        const isNest = resolvedRefPath.isRoot
            || (absolutePath.toString() + separator).startsWith(resolvedRefPath.toString() + separator);

        if (isNest) {
            this._nestedSchemaProcessor = referencedProcessor as SchemaProcessor;
            return this;
        }
        else {
            return (referencedProcessor as Processor).field.createProcessor().compile(context);
        }
    }

    // This processor will only be called for a nested schema
    public override process(tracker: ValueTracker, state: State): void {
        const { nestMinDepth, nestMaxDepth } = this.field.config;
        const value = tracker.getValue();

        if (value === undefined && nestMinDepth != null && tracker.nestDepth - 1 < nestMinDepth) {
            tracker.nestRoot!.addError('object/nest/tooShallow', { minDepth: nestMinDepth, maxDepth: nestMaxDepth });
        }
        else if (value !== undefined) {
            if (nestMaxDepth != null && tracker.nestDepth > nestMaxDepth) {
                tracker.nestRoot!.addError('object/nest/tooDeep', { minDepth: nestMinDepth, maxDepth: nestMaxDepth });
            }
            else {
                this._nestedSchemaProcessor!.process(tracker, state);
            }
        }
    }
}

export { PointerProcessor };

