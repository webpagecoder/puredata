'use strict';

import { Path } from '../../Path.ts';
import { PathTreeNodeMixin } from '../../PathTreeNodeMixin.ts';
import { PubSub, PubSubContext } from '../../pub-sub/PubSub.ts';
import { ValueTracker } from '../../tracker/ValueTracker.ts';
import { Utils } from '../../Utils.ts';
import { AnyChain } from '../any/AnyChain.ts';
import { AnyProcessor, AnyProcessorCtorParams } from '../any/AnyProcessor.ts';
import { ObjectProcessor } from '../object/ObjectProcessor.ts';
import { Processor, ProcessorCompilationContext, State } from '../Processor.ts';
import { ConditionalProcessor } from './conditional/ConditionalProcessor.ts';
import { FieldPointerProcessor } from './fieldPointer/FieldPointerProcessor.ts';
import { ReferenceField } from './reference/ReferenceField.ts';
import { SchemaChain } from './SchemaChain.ts';


class SchemaNodeProcessor extends Processor<AnyChain> {
    private _innerProcessor: Processor;

    public constructor(processor: Processor) {
        super({});
        this._innerProcessor = processor;
    }

    public process(tracker: ValueTracker, state?: State) {

    }

}

export { SchemaNodeProcessor };

