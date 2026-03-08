// @ts-nocheck
'use strict';

import ProcessResult from '../ProcessResult.ts';
import Utils from '../utils/Utils.ts';
const { pass, fail } = ProcessResult;

class GenericHandler {


    // ====================================
    // VALIDATORS
    // ====================================

    static equals(value, comparison) {
        return Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/equals', { comparison });
    }

    static defined(value) {
        return value !== undefined ? pass(value) : fail(value, 'generic/defined');
    }

    static empty(value) {
        return (value === null || value === undefined)
            ? pass(value)
            : fail(value, 'generic/empty');
    }

    static falsy(value) {
        return !value ? pass(value) : fail(value, 'generic/falsy');
    }

    static notEmpty(value) {
        return (value !== null && value !== undefined)
            ? pass(value)
            : fail(value, 'generic/empty');
    }

    static notNull(value) {
        return value !== null ? pass(value) : fail(value, 'generic/notNull');
    }

    static notOneOf(value, forbiddenValues = []) {
        for (const forbidden of forbiddenValues) {
            if (Utils.areEqual(value, forbidden)) {
                return fail(value, 'generic/notOneOf', { forbiddenValues });
            }
        }
        return pass(value);
    }

    static null(value) {
        return value === null ? pass(value) : fail(value, 'generic/null');
    }

    static oneOf(value, allowedValues = []) {
        for (const allowed of allowedValues) {
            if (Utils.areEqual(value, allowed)) {
                return pass(value);
            }
        }
        return fail(value, 'generic/oneOf', { allowedValues });
    }

    static primitive(value, type = null) {
        const actualType = typeof value;
        const primitives = ['string', 'number', 'boolean', 'undefined', 'symbol', 'bigint'];
        if (type) {
            return (actualType === type)
                ? pass(value)
                : fail(value, 'generic/primitive', { actualType });
        }
        return (primitives.indexOf(actualType) > -1)
            ? pass(value)
            : fail(value, 'generic/primitive', { actualType: type });
    }

    static property(value, property) {
        if (value == null) {
            return fail(value, 'generic/notNull');
        }
        return value[property] !== undefined
            ? pass(value)
            : fail(value, 'generic/defined');
    }

    static instanceOf(value, constructor) {
        return value instanceof constructor
            ? pass(value)
            : fail(value, 'generic/equals', { comparison: constructor });
    }

    static truthy(value) {
        return !!value ? pass(value) : fail(value, 'generic/truthy');
    }

    static notDefined(value) {
        return value === undefined ? pass(value) : fail(value, 'generic/notDefined');
    }

    static nullOrUndefined(value) {
        return value === null || value === undefined
            ? pass(value)
            : fail(value, 'generic/empty');
    }

    static notEquals(value, comparison) {
        return !Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/notEquals', { comparison });
    }


    
    // ====================================
    // MUTATORS
    // ====================================

    static custom(value, filterFn) {
        const result = filterFn(value);
        if (result instanceof ProcessResult) {
            return result;
        }
        return pass(result);
    }

}


export default GenericHandler;