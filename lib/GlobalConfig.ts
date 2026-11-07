'use strict';

import { AnyHandler } from "./fields/any/AnyHandler.ts";
import { ArrayHandler } from "./fields/array/ArrayHandler.ts";
import { BooleanHandler } from "./fields/boolean/BooleanHandler.ts";
import { DateType } from "./fields/date/DateConverter.ts";
import { DateHandler } from "./fields/date/DateHandler.ts";
import { NumberHandler } from "./fields/number/NumberHandler.ts";
import { ObjectHandler } from "./fields/object/ObjectHandler.ts";
import { StringHandler } from "./fields/string/StringHandler.ts";
import { PathDelimTypes } from "./Path.ts";
import { DefaultCalendarText } from "./text/DefaultCalendarText.ts";
import { DefaultErrorText } from "./text/DefaultErrorText.ts";
import { Translation } from "./Translation.ts";

/** Configuration defaults for each field family. */
type GlobalConfigType = {
    /** Settings shared by all field families. */
    general: {
        /** Convert compatible input values to the field's native type. */
        autoConvert: 'none' | 'normal' | 'force';
        /** Values treated as empty by validators and processors. */
        empties: unknown[];
        /** Error messages for the library.. */
        errorMessages: Translation;
        /** The path delimiters used by the library. DO NOT CHANGE AT THIS TIME. */
        pathDelims: PathDelimTypes;
    },
    /** Defaults grouped by field type. */
    fields: {
        /** Settings for array fields. */
        array: {
            /** Convert a non-array value into a single-item array. */
            castSingle: boolean;
            /** Remove empty values from arrays. */
            stripEmpties: boolean;
            /** Remove empty values from nested arrays. */
            stripNestedEmpties: boolean; //todo: add stripNestedEmpties to array chain and processor
        };
        /** Settings for boolean fields. */
        boolean: {
            /** Pairs of values that represent true and false, respectively. */
            boolishPairs: [truthy: unknown, falsy: unknown][];
            /** Convert recognized boolean-like values to booleans after pipeline runs. */
            postConvert: boolean;
            /** Normalize values before matching them against {@link boolishPairs}. */
            boolishTransform: (value: unknown) => unknown;
        };
        /** Settings for date fields. */
        date: {
            /** Text for the calendar. */
            calendarText: Translation;
            /** Component order used when parsing date strings without an explicit format. */
            order: 'MDY' | 'DMY' | 'YMD';
            /** Output format for date values. */
            outputFormat: DateType | string;
            /** Output time mode for date values. "local" means the local timezone, "utc" means UTC. */
            outputTimeMode: 'local' | 'utc';
            /** Local offset, in minutes, used when parsing dates. */
            utcOffsetMins: number;
        };
        /** Settings for number fields. */
        number: {
            /** Require values to be within the safe integer range. */
            safe: boolean;
            /** Reject infinite numeric values. */
            finite: boolean;
            /** Enforce the configured numeric precision. */
            precision: boolean;
        };
        /** Settings for object fields. */
        object: {
            /** Clone object values before processing them. */
            clone: boolean;
            /** Restrict object values to plain objects. */
            plainOnly: boolean;
            /** Maximum depth to inspect; use -1 to disable this check. */
            maxDepth: number | null;
            /** Maximum number of keys to inspect recursively; use -1 to disable this check. */
            maxKeyCount: number | null;
            /** Remove empty values from objects. */
            stripEmpties: boolean;
            /** Remove empty values from nested objects. */
            stripNestedEmpties: boolean;
        };
        /** Settings for schema fields. */
        schema: {
            /** Stop validation after the first failure. */
            failFast: boolean;
            /** Remove keys that are not defined by the schema. */
            stripExtraKeys: boolean;
        };
        /** Settings for string fields. */
        string: {
            /** Delimiters accepted in loose matching. */
            acceptableDelims: string;
            /** Delimiter used when normalization is applied. */
            normalizedDelim: string;
            /** Ignore case when comparing string values. */
            ignoreCase: boolean;
            /** String validation mode. */
            mode: 'strict' | 'loose';
            /** Normalize string values before processing them. */
            normalize: boolean;
            /** Delimiter characters to remove from string values. */
            stripDelims: string;
            /** Trim leading and trailing whitespace. */
            trim: boolean;
        }
    }
};

export type GlobalConfig = GlobalConfigType;

/** Default behavior settings used to construct field chains. */
const GlobalConfig: GlobalConfigType = Object.seal({
    general: {
        autoConvert: 'normal',
        empties: [null, undefined, ''],
        errorMessages: new Translation(DefaultErrorText),
        pathDelims: {
            self: '.',
            separator: '/',
            up: '..'
        }
    },
    fields: {
        array: {
            castSingle: true,
            stripEmpties: true,
        },
        boolean: {
            boolishPairs: [
                [1, 0],
                ['1', '0'],
                ['yes', 'no'],
                ['y', 'n'],
                ['true', 'false'],
                ['t', 'f'],
                ['on', 'off'],
            ],
            boolishTransform: (x: unknown) => typeof x === 'string' ? x.toLowerCase() : x,
            postConvert: false,
        },
        date: {
            calendarText: new Translation(DefaultCalendarText),
            order: 'MDY',
            outputFormat: 'iso',
            outputTimeMode: 'utc',
            utcOffsetMins: 0
        },
        number: {
            finite: true,
            precision: true,
            safe: true,
        },
        object: {
            clone: false,
            plainOnly: true,
            maxDepth: null,
            maxKeyCount: null,
            stripEmpties: true,
            stripNestedEmpties: true,
        },
        schema: {
            failFast: false,
            stripExtraKeys: true
        },
        string: {
            acceptableDelims: ' -_',
            normalizedDelim: '-',
            ignoreCase: false,
            mode: 'loose',
            normalize: true,
            stripDelims: ' ',
            trim: true,
        }
    }
});

export { GlobalConfig };
