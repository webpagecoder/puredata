'use strict';

/** Configuration defaults for each field family. */
export type GlobalConfig = typeof GlobalConfig;

/** Default behavior settings used to construct field chains. */
const GlobalConfig = Object.seal({
    any: { 
        autoConvert: true,
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
        postConvert: true,
        transform: (x: unknown) => typeof x === 'string' ? x.toLowerCase() : x, // Transforms boolish strings if needed
    },
    date: {
        order: 'MDY',
        utcOffsetMins: -180 // NOTE: Does *not* take into account any daylight savings
    },
    number: {
        safe: true,
        finite: true,
        precision: true,
    },
    object: {
        clone: false,
        plainOnly: true,
        maxDepth: 10, // set to -1 to not check
        maxKeyCount: 100, // set to -1 to not check - recursive     
        stripEmpties: true,
        stripNestedEmpties: true,   
    },
    schema: {
        failFast: false, //TODO
        stripExtraKeys: true
    },
    string: {
        trim: true,

        // Used in various string validators to determine how to handle case sensitivity, whitespace, and delimiters.
        ignoreCase: false,
        mode: 'loose',
        normalize: true,
        stripDelims: ' ',
    }
});

export { GlobalConfig };
