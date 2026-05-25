'use strict';

import { Path } from "../Path.ts";
import { SchemaProcessor } from "./SchemaProcessor.ts";

export interface SchemaNodePosition {
    parent: SchemaProcessor;
    path: Path;
    root: SchemaProcessor;
}

