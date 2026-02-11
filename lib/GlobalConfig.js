'use strict';

const StringUtils = require("./utils/StringUtils");


const GlobalConfig = {
    general: {
        emptyValues: [null, undefined, ''],
        // cloneValueBeforeFilter: false,
        // exceptions: false, //todo: throw exceptions in special functions like delete/insert in chain only if this is true
        locale: 'en-US',
        pathDelims: {
            separator: '/',
            self: '.',
            up: '..'
        },
    },
    array: {
        castSingle: true,
        // emptyValues: [null, undefined, ''], inherit GlobalConfig.emptyValues
        maxLength: null,
        removeEmpties: true,
    },
    boolean: {
        autoConvert: true,
        allowBoolish: false,
        boolishPairs: [
            [1, 0],
            ['1', '0'],
            ['yes', 'no'],
            ['y', 'n'],
            ['true', 'false'],
            ['t', 'f'],
        ],
        transformer: x => StringUtils.toLowerCase(x), // Transforms boolish strings if needed
    },
    date: {
        monthBeforeDay: true,
        utcOffset: ['-03', '00'], // NOTE: Does *not* take into account any daylight savings
    },
    number: {
        autoConvert: true,
        ensureSafe: true,
        ensureFinite: true,
        preservePrecision: true,
    },
    object: {
        // emptyValues: [null, undefined, ''], inherit GlobalConfig.emptyValues
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
        matching: {          // options for str matching
            exactFormat: true,
            looseFormat: true,
            ignoreCase: false,
            normalize: true,
            delims: ' -',
        },
        maxLength: 2000,    // max length allowed for a string being validated todo: THIS PART
        trim: true,
        truncate: true //todo
    }
}

module.exports = Object.seal(GlobalConfig);
