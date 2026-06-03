'use strict';

import { Path } from "../Path.ts";
import { Processor } from "./Processor.ts";
import { SchemaProcessor } from "./SchemaProcessor.ts";

export interface SchemaNodePosition {
    parent: SchemaProcessor;
    path: Path;
    root: SchemaProcessor;
    resolvePath(path: Path): Processor | null;
}
