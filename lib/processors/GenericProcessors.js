'use strict';

import Utils  from '../utils/Utils.js';
import Result  from '../Result.js';
import { pass, fail }  from '../Result.js';

class GenericProcessors {

    // Transformers

    static custom(value, filterFn) {
        const result = filterFn(value);
        if(result instanceof Result) {
            return result;
        }
        return pass(result);
    }

    // Validators

    static equals(value, comparison) {
        return Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/equals', { comparison });
    }

    static defined(value) {
        return value !== undefined ? pass(value) : fail(value, 'generic/defined');
    }

    static empty(value) {
       return this.prototype.nullOrUndefined(value);
    }

    static falsy(value) {
        return !value ? pass(value) : fail(value, 'generic/falsy');
    }

    static notEmpty(value) {
        return this.prototype.notNullOrUndefined(value);
    }

    static notNull(value) {
        return value !== null ? pass(value) : fail(value, 'generic/notNull');
    }

    static notNullOrUndefined(value) {
        return (value === null || value === undefined)
            ? fail(value, 'generic/notNullOrUndefined')
            : pass(value);
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

    static nullOrUndefined(value) {
        return (value === null || value === undefined)
            ? pass(value)
            : fail(value, 'generic/nullOrUndefined');
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

    static truthy(value) {
        return !!value ? pass(value) : fail(value, 'generic/truthy');
    }

    static notDefined(value) {
        return value === undefined ? pass(value) : fail(value, 'generic/notDefined');
    }

    static notEquals(value, comparison) { 
        return !Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/notEquals', { comparison });
    }

}


export default  GenericProcessors;