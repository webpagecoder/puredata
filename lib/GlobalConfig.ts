'use strict';

import { DateType } from "./fields/date/DateConverter.ts";
import { PathDelimTypes } from "./Path.ts";
import { DefaultCalendarText } from "./text/DefaultCalendarText.ts";
import { DefaultErrorText } from "./text/DefaultErrorText.ts";
import { Translation } from "./Translation.ts";

/** Configuration defaults */
export type GlobalConfigGeneral = {
    autoConvert: 'none' | 'normal' | 'force';
    /** Values treated as empty by validators and processors. */
    empties: unknown[];
    /** Error messages for the library.. */
    errorMessages: Translation;
    /** Stop validation after the first failure. */
    failOnFirstError: boolean;
    /** The path delimiters used by the library. EXPERIMENTAL - DO NOT CHANGE AT THIS TIME. */
    pathDelims: PathDelimTypes;
}

export type GlobalConfigType = {
    /** Settings shared by all field families. */
    general: {
        /** Convert compatible input values to the field's native type. */
        autoConvert: 'none' | 'normal' | 'force';
        /** Values treated as empty by validators and processors. */
        empties: unknown[];
        /** Error messages for the library.. */
        errorMessages: Translation;
        /** Stop validation after the first failure. */
        failOnFirstError: boolean;
        /** The path delimiters used by the library. EXPERIMENTAL - DO NOT CHANGE AT THIS TIME. */
        pathDelims: PathDelimTypes;
    },
    fields: {
        array: ArrayFieldType,
        boolean: BooleanFieldType,
        date: DateFieldType,
        number: NumberFieldType,
        object: ObjectFieldType,
        schema: SchemaFieldType,
        string: StringFieldType,
    }
}
export type ArrayFieldType = Partial<GlobalConfigType['general']> & {
    /** Convert a non-array value into a single-item array. */
    castSingle: boolean;
    /** Remove empty values from arrays. */
    stripEmpties: boolean;
}

export type BooleanFieldType = Partial<GlobalConfigType['general']> & {
    /** Pairs of values that represent true and false, respectively. */
    boolishPairs: [truthy: unknown, falsy: unknown][];
    /** Convert recognized boolean-like values to booleans after pipeline runs. */
    postConvert: boolean;
    /** Normalize values before matching them against {@link boolishPairs}. */
    boolishTransform: (value: unknown) => unknown;
}

export type DateFieldType = Partial<GlobalConfigType['general']> & {
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
}

export type NumberFieldType = Partial<GlobalConfigType['general']> & {
    /** Require values to be within the safe integer range. */
    safe: boolean;
    /** Reject infinite numeric values. */
    finite: boolean;
    /** Enforce the configured numeric precision. */
    precision: boolean;
}

export type ObjectFieldType = Partial<GlobalConfigType['general']> & {
    /** Clone object values before processing them. */
    cloneValue: boolean;
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
}

export type SchemaFieldType = Partial<GlobalConfigType['general']> & {
    /** Remove keys that are not defined by the schema. */
    stripExtraKeys: boolean;
    /** Stop validation after the first field failure. */
    failFast: boolean;
}

export type StringFieldType = Partial<GlobalConfigType['general']> & {
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

export type GlobalConfig = GlobalConfigType;

/** Default behavior settings used to construct field chains. */
const GlobalConfig: GlobalConfigType = Object.seal({
    general: {
        autoConvert: 'normal',
        empties: [null, undefined, ''],
        errorMessages: new Translation(DefaultErrorText),
        failOnFirstError: false,
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
            cloneValue: false,
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

