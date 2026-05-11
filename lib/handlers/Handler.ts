'use strict';

import { HandlerResult } from './HandlerResult.ts';
import { Utils } from '../utils/Utils.ts';
const { pass, fail } = HandlerResult;

type PrimitiveTypeName = 'string' | 'number' | 'boolean' | 'undefined' | 'symbol' | 'bigint';
type PropertyKeyLike = string | number | symbol;
type ConstructorLike = abstract new (...args: never[]) => object;
type CustomHandlerFn = (value: unknown) => HandlerResult | unknown;

abstract class Handler {

    // // ====================================
    // // FORMATTER
    // // ====================================
    // static format(value: unknown): HandlerResult {
    //     return fail(value, 'generic/format');
    // }

    // ====================================
    // VALIDATORS
    // ====================================

    /**
     * Executes the equals handler step.
     * @param {any} value
     * @param {any} comparison
     * @returns {HandlerResult}
     */
    static equals(value: unknown, comparison: unknown): HandlerResult {
        return Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/equals', { comparison });
    }

    /**
     * Executes the defined handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    static defined(value: unknown): HandlerResult {
        return value !== undefined ? pass(value) : fail(value, 'generic/defined');
    }

    /**
     * Executes the empty handler step.
     * @param {any} value
     * @param {any} empties
     * @returns {HandlerResult}
     */
    static empty(value: unknown, empties: unknown[] = [null, undefined]): HandlerResult {
        return Handler.oneOf(value, empties).pass
            ? pass(value)
            : fail(value, 'generic/empty');
    }

    /**
     * Executes the falsy handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    static falsy(value: unknown): HandlerResult {
        return value ? fail(value, 'generic/falsy') : pass(value);
    }

    /**
     * Executes the notEmpty handler step.
     * @param {any} value
     * @param {any} empties
     * @returns {HandlerResult}
     */
    static notEmpty(value: unknown, empties: unknown[] = [null, undefined]): HandlerResult {
        return Handler.oneOf(value, empties).fail
            ? pass(value)
            : fail(value, 'generic/notEmpty');
    }

    /**
     * Executes the notNull handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    static notNull(value: unknown): HandlerResult {
        return value !== null ? pass(value) : fail(value, 'generic/notNull');
    }

    /**
     * Executes the notOneOf handler step.
     * @param {any} value
     * @param {any} forbiddenValues
     * @returns {HandlerResult}
     */
    static notOneOf(value: unknown, forbiddenValues: unknown[] = []): HandlerResult {
        for (const forbidden of forbiddenValues) {
            if (Utils.areEqual(value, forbidden)) {
                return fail(value, 'generic/notOneOf', { forbiddenValues });
            }
        }
        return pass(value);
    }

    /**
     * Executes the null handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    static null(value: unknown): HandlerResult {
        return value === null ? pass(value) : fail(value, 'generic/null');
    }

    /**
     * Executes the oneOf handler step.
     * @param {any} value
     * @param {any} allowedValues
     * @returns {HandlerResult}
     */
    static oneOf(value: unknown, allowedValues: unknown[] = []): HandlerResult {
        for (const allowed of allowedValues) {
            if (Utils.areEqual(value, allowed)) {
                return pass(value);
            }
        }
        return fail(value, 'generic/oneOf', { allowedValues });
    }

    /**
     * Executes the primitive handler step.
     * @param {any} value
     * @param {any} type
     * @returns {HandlerResult}
     */
    static primitive(value: unknown, type: PrimitiveTypeName | null = null): HandlerResult {
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

    // static property(value: unknown, property: PropertyKeyLike): HandlerResult {
    //     if (value == null) {
    //         return fail(value, 'generic/notNull');
    //     }
    //     return (value as Record<PropertyKeyLike, unknown>)[property] !== undefined
    //         ? pass(value)
    //         : fail(value, 'generic/defined');
    // }

    /**
     * Executes the instanceOf handler step.
     * @param {any} value
     * @param {any} constructor
     * @returns {HandlerResult}
     */
    static instanceOf(value: unknown, constructor: ConstructorLike): HandlerResult {
        return value instanceof constructor
            ? pass(value)
            : fail(value, 'generic/equals', { comparison: constructor });
    }

    /**
     * Executes the truthy handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    static truthy(value: unknown): HandlerResult {
        return value ? pass(value) : fail(value, 'generic/truthy');
    }

    /**
     * Executes the notDefined handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    static notDefined(value: unknown): HandlerResult {
        return value === undefined ? pass(value) : fail(value, 'generic/notDefined');
    }

    /**
     * Executes the nullOrUndefined handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    static nullOrUndefined(value: unknown): HandlerResult {
        return value === null || value === undefined
            ? pass(value)
            : fail(value, 'generic/empty');
    }

    /**
     * Executes the notEquals handler step.
     * @param {any} value
     * @param {any} comparison
     * @returns {HandlerResult}
     */
    static notEquals(value: unknown, comparison: unknown): HandlerResult {
        return !Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/notEquals', { comparison });
    }


    
    // ====================================
    // MUTATORS
    // ====================================

    /**
     * Executes the custom handler step.
     * @param {any} value
     * @param {any} filterFn
     * @returns {HandlerResult}
     */
    static custom(value: unknown, filterFn: CustomHandlerFn): HandlerResult {
        const result = filterFn(value);
        if (result instanceof HandlerResult) {
            return result;
        }
        return pass(result);
    }

}


export { Handler };