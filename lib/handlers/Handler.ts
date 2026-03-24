'use strict';

import { HandlerResult } from './HandlerResult.ts';
import { Utils } from '../utils/Utils.ts';
const { pass, fail } = HandlerResult;

type HandlerValue = unknown;
type HandlerValues = HandlerValue[];
type PrimitiveTypeName = 'string' | 'number' | 'boolean' | 'undefined' | 'symbol' | 'bigint';
type PropertyKeyLike = string | number | symbol;
type ConstructorLike = abstract new (...args: never[]) => object;
type CustomHandlerFn = (value: HandlerValue) => HandlerResult | HandlerValue;

class Handler {


    // ====================================
    // VALIDATORS
    // ====================================

    static equals(value: HandlerValue, comparison: HandlerValue): HandlerResult {
        return Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/equals', { comparison });
    }

    static defined(value: HandlerValue): HandlerResult {
        return value !== undefined ? pass(value) : fail(value, 'generic/defined');
    }

    static empty(value: HandlerValue, empties: HandlerValues = [null, undefined]): HandlerResult {
        return Handler.oneOf(value, empties).pass
            ? pass(value)
            : fail(value, 'generic/empty');
    }

    static falsy(value: HandlerValue): HandlerResult {
        return value ? fail(value, 'generic/falsy') : pass(value);
    }

    static notEmpty(value: HandlerValue, empties: HandlerValues = [null, undefined]): HandlerResult {
        return Handler.oneOf(value, empties).fail
            ? pass(value)
            : fail(value, 'generic/notEmpty');
    }

    static notNull(value: HandlerValue): HandlerResult {
        return value !== null ? pass(value) : fail(value, 'generic/notNull');
    }

    static notOneOf(value: HandlerValue, forbiddenValues: HandlerValues = []): HandlerResult {
        for (const forbidden of forbiddenValues) {
            if (Utils.areEqual(value, forbidden)) {
                return fail(value, 'generic/notOneOf', { forbiddenValues });
            }
        }
        return pass(value);
    }

    static null(value: HandlerValue): HandlerResult {
        return value === null ? pass(value) : fail(value, 'generic/null');
    }

    static oneOf(value: HandlerValue, allowedValues: HandlerValues = []): HandlerResult {
        for (const allowed of allowedValues) {
            if (Utils.areEqual(value, allowed)) {
                return pass(value);
            }
        }
        return fail(value, 'generic/oneOf', { allowedValues });
    }

    static primitive(value: HandlerValue, type: PrimitiveTypeName | null = null): HandlerResult {
        const actualType = typeof value;
        const primitives: PrimitiveTypeName[] = ['string', 'number', 'boolean', 'undefined', 'symbol', 'bigint'];
        if (type) {
            return (actualType === type)
                ? pass(value)
                : fail(value, 'generic/primitive', { actualType });
        }
        return (primitives.indexOf(actualType as PrimitiveTypeName) > -1)
            ? pass(value)
            : fail(value, 'generic/primitive', { actualType: type });
    }

    static property(value: HandlerValue, property: PropertyKeyLike): HandlerResult {
        if (value == null) {
            return fail(value, 'generic/notNull');
        }
        return (value as Record<PropertyKeyLike, unknown>)[property] !== undefined
            ? pass(value)
            : fail(value, 'generic/defined');
    }

    static instanceOf(value: HandlerValue, constructor: ConstructorLike): HandlerResult {
        return value instanceof constructor
            ? pass(value)
            : fail(value, 'generic/equals', { comparison: constructor });
    }

    static truthy(value: HandlerValue): HandlerResult {
        return value ? pass(value) : fail(value, 'generic/truthy');
    }

    static notDefined(value: HandlerValue): HandlerResult {
        return value === undefined ? pass(value) : fail(value, 'generic/notDefined');
    }

    static nullOrUndefined(value: HandlerValue): HandlerResult {
        return value === null || value === undefined
            ? pass(value)
            : fail(value, 'generic/empty');
    }

    static notEquals(value: HandlerValue, comparison: HandlerValue): HandlerResult {
        return !Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/notEquals', { comparison });
    }


    
    // ====================================
    // MUTATORS
    // ====================================

    static custom(value: HandlerValue, filterFn: CustomHandlerFn): HandlerResult {
        const result = filterFn(value);
        if (result instanceof HandlerResult) {
            return result;
        }
        return pass(result);
    }

}


export { Handler };