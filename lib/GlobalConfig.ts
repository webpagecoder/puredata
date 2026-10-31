'use strict';

import { AnyHandler } from "./fields/any/AnyHandler.ts";
import { ArrayHandler } from "./fields/array/ArrayHandler.ts";
import { BooleanHandler } from "./fields/boolean/BooleanHandler.ts";
import { DateHandler } from "./fields/date/DateHandler.ts";
import { NumberHandler } from "./fields/number/NumberHandler.ts";
import { ObjectHandler } from "./fields/object/ObjectHandler.ts";
import { StringHandler } from "./fields/string/StringHandler.ts";
import { PathDelimTypes } from "./Path.ts";
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
        /** Settings for unconstrained "any" fields. */
        any: {
            /** Handler instance used by any-field chains. */
            chainHandler: AnyHandler;
        }
        /** Settings for array fields. */
        array: {
            /** Convert a non-array value into a single-item array. */
            castSingle: boolean;
            /** Handler instance used by array-field chains. */
            chainHandler: ArrayHandler;
            /** Remove empty values from arrays. */
            stripEmpties: boolean;
            /** Remove empty values from nested arrays. */
            stripNestedEmpties: boolean;
        };
        /** Settings for boolean fields. */
        boolean: {
            /** Pairs of values that represent true and false, respectively. */
            boolishPairs: [truthy: unknown, falsy: unknown][];
            /** Handler instance used by boolean-field chains. */
            chainHandler: BooleanHandler;
            /** Convert recognized boolean-like values to booleans after pipeline runs. */
            postConvert: boolean;
            /** Normalize values before matching them against {@link boolishPairs}. */
            boolishTransform: (value: unknown) => unknown;
        };
        /** Settings for date fields. */
        date: {
            calendarText: Translation;
            /** Handler instance used by date-field chains. */
            chainHandler: DateHandler;
            /** Component order used when parsing date strings without an explicit format. */
            order: 'MDY' | 'DMY' | 'YMD';
            /** Local offset, in minutes, used when parsing dates. */
            utcOffsetMins: number;
        };
        /** Settings for number fields. */
        number: {
            /** Handler instance used by number-field chains. */
            chainHandler: NumberHandler;
            /** Require values to be within the safe integer range. */
            safe: boolean;
            /** Reject infinite numeric values. */
            finite: boolean;
            /** Enforce the configured numeric precision. */
            precision: boolean;
        };
        /** Settings for object fields. */
        object: {
            /** Handler instance used by object-field chains. */
            chainHandler: ObjectHandler;
            /** Clone object values before processing them. */
            clone: boolean;
            /** Restrict object values to plain objects. */
            plainOnly: boolean;
            /** Maximum depth to inspect; use -1 to disable this check. */
            maxDepth: number;
            /** Maximum number of keys to inspect recursively; use -1 to disable this check. */
            maxKeyCount: number;
            /** Remove empty values from objects. */
            stripEmpties: boolean;
            /** Remove empty values from nested objects. */
            stripNestedEmpties: boolean;
        };
        /** Settings for schema fields. */
        schema: {
            /** Handler instance used by schema-field chains. */
            chainHandler: ObjectHandler;
            /** Stop validation after the first failure. */
            failFast: boolean;
            /** Remove keys that are not defined by the schema. */
            stripExtraKeys: boolean;
        };
        /** Settings for string fields. */
        string: {
            /** Handler instance used by string-field chains. */
            chainHandler: StringHandler;
            /** Trim leading and trailing whitespace. */
            trim: boolean;
            /** Ignore case when comparing string values. */
            ignoreCase: boolean;
            /** String validation mode. */
            mode: 'strict' | 'loose';
            /** Normalize string values before processing them. */
            normalize: boolean;
            /** Delimiter characters to remove from string values. */
            stripDelims: string;
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
        any: {
            chainHandler: new AnyHandler()
        },
        array: {
            castSingle: true,
            chainHandler: new ArrayHandler(),
            stripEmpties: true,
            stripNestedEmpties: true, //todo: add stripNestedEmpties to array chain and processor
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
            chainHandler: new BooleanHandler(),
            postConvert: false,
        },
        date: {
            calendarText: new Translation(DefaultErrorText),
            chainHandler: new DateHandler(),
            order: 'MDY',
            utcOffsetMins: -180
        },
        number: {
            chainHandler: new NumberHandler(),
            finite: true,
            precision: true,
            safe: true,
        },
        object: {
            chainHandler: new ObjectHandler(),
            clone: false,
            plainOnly: true,
            maxDepth: 10,
            maxKeyCount: 100,
            stripEmpties: true,
            stripNestedEmpties: true,
        },
        schema: {
            chainHandler: new ObjectHandler(),
            failFast: false,
            stripExtraKeys: true
        },
        string: {
            chainHandler: new StringHandler(),
            ignoreCase: false,
            mode: 'loose',
            normalize: true,
            stripDelims: ' ',
            trim: true,
        }
    }
});

export { GlobalConfig };
