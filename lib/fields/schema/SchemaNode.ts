'use strict';

import { Processor } from "../Processor.ts";
import { SchemaProcessor } from "./SchemaProcessor.ts";

class SchemaNodeProcessor extends Processor {

    private _innerProcessor: Processor;
    private _parent: SchemaNodeProcessor | SchemaProcessor | null;

    constructor(processor: Processor, parent: SchemaNodeProcessor | SchemaProcessor | null = null) {
        this._innerProcessor = processor;
        this._parent = parent;
    }

}

export { SchemaNodeProcessor };

