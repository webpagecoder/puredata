'use strict';

export type GlobalConfig = typeof GlobalConfig;

const GlobalConfig = Object.seal({
    any: { 
        autoConvert: true,
        emptyValues: [null, undefined, ''],
        pathDelims: {
            separator: '/',
            self: '.',
            up: '..'
        },
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
        transformer: (x: unknown) => typeof x === 'string' ? x.toLowerCase() : x, // Transforms boolish strings if needed
    },
    date: {
        dateOrder: 'MDY',
        utcOffsetMinutes: -180 // NOTE: Does *not* take into account any daylight savings
    },
    number: {
        ensureSafe: true,
        ensureFinite: true,
        preservePrecision: true,
    },
    object: {
        cloneObject: false,
        ensurePlain: true,
        maxDepth: 10, // set to -1 to not check
        maxKeyCount: 100, // set to -1 to not check - recursive     
        stripEmpties: true,
        stripNestedEmpties: true,   
    },
    schema: {
        failOnFirstError: false, //TODO
        stripExtraKeys: true
    },
    string: {
        maxLength: 2000,
        trim: true,
        truncate: true,

        // Used in various string validators to determine how to handle case sensitivity, whitespace, and delimiters.
        ignoreCase: false,
        mode: 'loose',
        normalize: true,
        stripDelims: ' ',
    }
});

export { GlobalConfig };
