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
    // public format(value: unknown): HandlerResult {
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
    public equals(value: unknown, comparison: unknown): HandlerResult {
        return Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/equals', { comparison });
    }

    /**
     * Executes the defined handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    public defined(value: unknown): HandlerResult {
        return value !== undefined ? pass(value) : fail(value, 'generic/defined');
    }

    /**
     * Executes the empty handler step.
     * @param {any} value
     * @param {any} empties
     * @returns {HandlerResult}
     */
    public empty(value: unknown, empties: unknown[] = [null, undefined]): HandlerResult {
        return Handler.oneOf(value, empties).pass
            ? pass(value)
            : fail(value, 'generic/empty');
    }

    /**
     * Executes the falsy handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    public falsy(value: unknown): HandlerResult {
        return value ? fail(value, 'generic/falsy') : pass(value);
    }

    /**
     * Executes the notEmpty handler step.
     * @param {any} value
     * @param {any} empties
     * @returns {HandlerResult}
     */
    public notEmpty(value: unknown, empties: unknown[] = [null, undefined]): HandlerResult {
        return Handler.oneOf(value, empties).fail
            ? pass(value)
            : fail(value, 'generic/notEmpty');
    }

    /**
     * Executes the notNull handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    public notNull(value: unknown): HandlerResult {
        return value !== null ? pass(value) : fail(value, 'generic/notNull');
    }

    /**
     * Executes the notOneOf handler step.
     * @param {any} value
     * @param {any} forbiddenValues
     * @returns {HandlerResult}
     */
    public notOneOf(value: unknown, forbiddenValues: unknown[] = []): HandlerResult {
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
    public null(value: unknown): HandlerResult {
        return value === null ? pass(value) : fail(value, 'generic/null');
    }

    /**
     * Executes the oneOf handler step.
     * @param {any} value
     * @param {any} allowedValues
     * @returns {HandlerResult}
     */
    public oneOf(value: unknown, allowedValues: unknown[] = []): HandlerResult {
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
    public primitive(value: unknown, type: PrimitiveTypeName | null = null): HandlerResult {
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

    // public property(value: unknown, property: PropertyKeyLike): HandlerResult {
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
    public instanceOf(value: unknown, constructor: ConstructorLike): HandlerResult {
        return value instanceof constructor
            ? pass(value)
            : fail(value, 'generic/equals', { comparison: constructor });
    }

    /**
     * Executes the truthy handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    public truthy(value: unknown): HandlerResult {
        return value ? pass(value) : fail(value, 'generic/truthy');
    }

    /**
     * Executes the notDefined handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    public notDefined(value: unknown): HandlerResult {
        return value === undefined ? pass(value) : fail(value, 'generic/notDefined');
    }

    /**
     * Executes the nullOrUndefined handler step.
     * @param {any} value
     * @returns {HandlerResult}
     */
    public nullOrUndefined(value: unknown): HandlerResult {
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
    public notEquals(value: unknown, comparison: unknown): HandlerResult {
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
    public custom(value: unknown, filterFn: CustomHandlerFn): HandlerResult {
        const result = filterFn(value);
        if (result instanceof HandlerResult) {
            return result;
        }
        return pass(result);
    }

}


export { Handler };