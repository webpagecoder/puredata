'use strict';

/** Configuration defaults for each field family. */
type GlobalConfigType = {
    /** Settings shared by all field families. */
    any: {
        /** Convert compatible input values to the field's native type. */
        autoConvert: false | 'normal' | 'force';
        /** Values treated as empty by validators and processors. */
        empties: unknown[];
    };
    /** Settings for array fields. */
    array: {
        /** Convert a non-array value into a single-item array. */
        castSingle: boolean;
        /** Remove empty values from arrays. */
        stripEmpties: boolean;
    };
    /** Settings for boolean fields. */
    boolean: {
        /** Pairs of values that represent true and false, respectively. */
        boolishPairs: [truthy: unknown, falsy: unknown][];
        /** Convert recognized boolean-like values to booleans after pipeline runs. */
        postConvert: boolean;
        /** Normalize values before matching them against {@link boolishPairs}. */
        transform: (value: unknown) => unknown;
    };
    /** Settings for date fields. */
    date: {
        /** Component order used when parsing date strings without an explicit format. */
        order: 'MDY' | 'DMY' | 'YMD';
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
        /** Stop validation after the first failure. */
        failFast: boolean;
        /** Remove keys that are not defined by the schema. */
        stripExtraKeys: boolean;
    };
    /** Settings for string fields. */
    string: {
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
    };
};

export type GlobalConfig = GlobalConfigType;

/** Default behavior settings used to construct field chains. */
const GlobalConfig: GlobalConfigType = Object.seal({
    any: {
        autoConvert: 'normal',
        empties: [null, undefined, ''],
    },
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
        postConvert: false,
        transform: (x: unknown) => typeof x === 'string' ? x.toLowerCase() : x,
    },
    date: {
        order: 'MDY',
        utcOffsetMins: -180
    },
    number: {
        safe: true,
        finite: true,
        precision: true,
    },
    object: {
        clone: false,
        plainOnly: true,
        maxDepth: 10,
        maxKeyCount: 100,
        stripEmpties: true,
        stripNestedEmpties: true,
    },
    schema: {
        failFast: false,
        stripExtraKeys: true
    },
    string: {
        trim: true,
        ignoreCase: false,
        mode: 'loose',
        normalize: true,
        stripDelims: ' ',
    }
});

export { GlobalConfig };
