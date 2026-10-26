'use strict';

import { NodeMixin } from '../../../NodeMixin.ts';
import { Path } from '../../../Path.ts';
import { ValueTracker } from '../../../tracker/ValueTracker.ts';
import { Processor, ProcessorCompilationContext, ProcessorCtorParams, State } from '../../Processor.ts';
import { SchemaProcessor } from '../SchemaProcessor.ts';
import { PointerField } from './PointerField.ts';

/** Compilation context containing the pointer's absolute schema path. */
export type PointerProcessorCompilationContext = ProcessorCompilationContext & {
    absolutePath: Path;
}

class BoundPointerProcessor extends Processor<PointerField> {
    override process(tracker: ValueTracker, state: State): void { }
}

/** Resolves field pointers and processes recursive schema nesting. */
class PointerProcessor extends NodeMixin(BoundPointerProcessor) {

    /** Referenced schema processor when the pointer represents a recursive nest. */
    private _nestedSchemaProcessor: SchemaProcessor | null;

    /** Creates a pointer processor for a pointer field. */
    public constructor(args: ProcessorCtorParams<PointerField>) {
        super(args);
        this._nestedSchemaProcessor = null;
    }

    /**
     * Resolves the pointer target during schema compilation.
     *
     * @param context Compilation context with this field's absolute path.
     * @returns This processor for recursive nesting, or the resolved target processor.
     * @throws {@link Error} If the target path is invalid or cannot be resolved.
     */
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
    /** Processes a nested schema and enforces configured nesting-depth limits. */
    public override process(tracker: ValueTracker, state: State): void {
        const { nestMinDepth, nestMaxDepth } = this.field.config;
        const value = tracker.value;

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
