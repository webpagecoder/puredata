'use strict';

export type GlobalConfig = typeof GlobalConfig;

const GlobalConfig = Object.seal({
    general: {
        autoConvert: true,
        emptyValues: [null, undefined, '', NaN],
        // cloneValueBeforeFilter: false,
        // exceptions: false, //todo: throw exceptions in special functions like delete/insert in chain only if this is true
        pathDelims: {
            separator: '/',
            self: '.',
            up: '..'
        },
    },
    array: {
        castSingle: true,
        maxLength: null,
        removeEmpties: true,
    },
    boolean: {
        allowBoolish: true,
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
        ensurePlain: true,
        maxDepth: 10, // set to -null to not check
        maxKeyCount: 100, // set to -null to not check - recursive        
    },
    schema: {
        clone: true, //todo:not sure
        failOnFirstError: false,
        stripUnknownKeys: true
    },
    string: {
        ignoreCase: false,
        mode: 'strict',
        normalize: true,
        stripDelims: ' ',
        
        maxLength: 2000,    // max length allowed for a string being validated todo: THIS PART
        trim: true,
        truncate: true //todo
    }
});

export { GlobalConfig };
