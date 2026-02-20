'use strict';

export default {
    calendar: {
        numberSuffixes: [
            'st',
            'nd',
            'rd',
            'th'
        ],
        months: {
            full: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ],
            short: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ]
        }
    },
    errors: {
        array: {
            // isArray: '{label} must be an array',
            dimensions: 'Must have dimensions {dimensions}',
            allOf: 'Must contain all of these values: {requiredValues}, missing: {missingValue}',
            noneOf: 'Cannot contain any of these values: {forbiddenValues}, found {invalidValue} at index {index}',
            someOf: '{label} must contain at least one of these values: {possibleValues}',
            // tuple: '{label} must match the tuple values: {tupleValues}. Expected {expectedValue} at index {index}, but found {invalidValue}',
            exactly: 'Must contain exactly these values: {requiredValues}',
            only: 'Can only contain values from: {allowedValues}. Invalid value {invalidValue} found at index {index}',
            otherThan: 'Cannot contain any of these values: {forbiddenValues}, found {invalidValue} at index {index}',
            // unique: '{label} must contain only unique values. Duplicate value {duplicateValue} found at indices {index1} and {index2}',
            // length: '{label} must have a length of {requiredLength}. Current length: {length}',
            // lengthBetween: '{label} must have a length.isBetween {min} and {max}. Current length: {length}',
            // maxLength: '{label} contains more than {max} items. Current length: {length}',
            // minLength: '{label} contains less than {min} items. Current length: {length}',
            empty: 'Must be empty, current length: {length}',
            notEmpty: 'Must not be empty',
            sorted: 'Must be sorted, first unsorted value {invalidValue} found at index {index}',
        },
    }
};