'use strict';

import { PathReferenceField } from '../fields/PathReferenceField.ts';
import { SchemaReferenceField } from '../fields/SchemaReferenceField.ts';
import { Path } from '../Path.ts';
import { ValueTracker } from '../tracker/ValueTracker.ts';
import { PathReferenceProcessor } from './PathReferenceProcessor.ts';
import { Processor, ProcessorCompilationContext, ProcessorConstructorParams, State } from './Processor.ts';
import { SchemaProcessor } from './SchemaProcessor.ts';

export type SchemaReferenceProcessorCompilationContext = ProcessorCompilationContext & {
    ancestors: SchemaProcessor[];
    parent: SchemaProcessor;
    absolutePath: Path;
}

class SchemaReferenceProcessor extends Processor<SchemaReferenceField> {

    protected _innerNestedProcessor: Processor | null;
    protected _minDepthNum: number | null;
    protected _maxDepthNum: number | null;
    protected _minDepthProcessor: PathReferenceProcessor | null;
    protected _maxDepthProcessor: PathReferenceProcessor | null;

    public constructor(args: ProcessorConstructorParams<SchemaReferenceField>) {
        super(args);
        const { extendedProps: { minDepth, maxDepth } } = this._field;

        this._innerNestedProcessor = null;
        if (minDepth instanceof PathReferenceField) {
            this._minDepthProcessor = new PathReferenceProcessor({
                field: minDepth,
                processorMapper: this._processorMapper
            });
            this._minDepthNum = null;
        } else {
            this._minDepthNum = minDepth;
            this._minDepthProcessor = null;
        }

        if (maxDepth instanceof PathReferenceField) {
            this._maxDepthProcessor = new PathReferenceProcessor({
                field: maxDepth,
                processorMapper: this._processorMapper
            });
            this._maxDepthNum = null;
        } else {
            this._maxDepthNum = maxDepth;
            this._maxDepthProcessor = null;
        }
    }

    public override compile(context: SchemaReferenceProcessorCompilationContext): Processor {
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
            this._innerNestedProcessor = referencedProcessor;
            return this;
        }
        else {
            return _processorMapper.createProcessor(referencedProcessor.field).compile();
        }
    }

    // For recursive nesting...
    public override process(tracker: ValueTracker): ValueTracker {

        // Nests are guaranteed to run after all other reference values have settled within a schema.
        // They don't use the PubSub system for dynamic value resolution like other references. 
        // Instead, they resolve their min/max depth values directly at runtime.
        const { _minDepthNum, _maxDepthNum, _minDepthProcessor, _maxDepthProcessor } = this;
        let minDepth: number, maxDepth: number;

        if (_minDepthProcessor instanceof PathReferenceProcessor) {
            const minDepthTracker = new ValueTracker(_minDepthProcessor.field);
            _minDepthProcessor.process(tracker);
            minDepth = Number(minDepthTracker.getValue());
        }
        else {
            minDepth = _minDepthNum!;
        }

        if (_maxDepthProcessor instanceof PathReferenceProcessor) {
            const maxDepthTracker = new ValueTracker(_maxDepthProcessor.field);
            _maxDepthProcessor.process(maxDepthTracker);
            maxDepth = Number(maxDepthTracker.getValue());
        }
        else {
            maxDepth = _maxDepthNum!;
        }

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

export { SchemaReferenceProcessor };

