'use strict';

import { ValueTracker } from "../ValueTracker.ts";

export interface Formatter {
    format(tracker: ValueTracker, depth?: number): string;
}
