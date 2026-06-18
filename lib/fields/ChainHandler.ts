'use strict';

import { ChainHandlerResult } from './ChainHandlerResult.ts';
import { Utils } from '../Utils.ts';
const { pass, fail } = ChainHandlerResult;

type PrimitiveTypeName = 'string' | 'number' | 'boolean' | 'undefined' | 'symbol' | 'bigint';
type PropertyKeyLike = string | number | symbol;
type CtorLike = abstract new (...args: never[]) => object;
type CustomHandlerFn = (value: unknown) => ChainHandlerResult | unknown;

abstract class ChainHandler {

    // // ====================================
    // // FORMATTER
    // // ====================================
    // public format(value: unknown): ChainHandlerResult {
    //     return fail(value, 'generic/format');
    // }

    // ====================================
    // VALIDATORS
    // ====================================

    /**
     * Executes the equals handler step.
     * @param {any} value
     * @param {any} comparison
     * @returns {ChainHandlerResult}
     */
    public equals(value: unknown, comparison: unknown): ChainHandlerResult {
        return Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/equals', { comparison });
    }

    /**
     * Executes the defined handler step.
     * @param {any} value
     * @returns {ChainHandlerResult}
     */
    public defined(value: unknown): ChainHandlerResult {
        return value !== undefined ? pass(value) : fail(value, 'generic/defined');
    }

    /**
     * Executes the empty handler step.
     * @param {any} value
     * @param {any} empties
     * @returns {ChainHandlerResult}
     */
    public empty(value: unknown, empties: unknown[] = [null, undefined]): ChainHandlerResult {
        return ChainHandler.oneOf(value, empties).pass
            ? pass(value)
            : fail(value, 'generic/empty');
    }

    /**
     * Executes the falsy handler step.
     * @param {any} value
     * @returns {ChainHandlerResult}
     */
    public falsy(value: unknown): ChainHandlerResult {
        return value ? fail(value, 'generic/falsy') : pass(value);
    }

    /**
     * Executes the notEmpty handler step.
     * @param {any} value
     * @param {any} empties
     * @returns {ChainHandlerResult}
     */
    public notEmpty(value: unknown, empties: unknown[] = [null, undefined]): ChainHandlerResult {
        return ChainHandler.oneOf(value, empties).fail
            ? pass(value)
            : fail(value, 'generic/notEmpty');
    }

    /**
     * Executes the notNull handler step.
     * @param {any} value
     * @returns {ChainHandlerResult}
     */
    public notNull(value: unknown): ChainHandlerResult {
        return value !== null ? pass(value) : fail(value, 'generic/notNull');
    }

    /**
     * Executes the notOneOf handler step.
     * @param {any} value
     * @param {any} forbiddenValues
     * @returns {ChainHandlerResult}
     */
    public notOneOf(value: unknown, forbiddenValues: unknown[] = []): ChainHandlerResult {
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
     * @returns {ChainHandlerResult}
     */
    public null(value: unknown): ChainHandlerResult {
        return value === null ? pass(value) : fail(value, 'generic/null');
    }

    /**
     * Executes the oneOf handler step.
     * @param {any} value
     * @param {any} allowedValues
     * @returns {ChainHandlerResult}
     */
    public oneOf(value: unknown, allowedValues: unknown[] = []): ChainHandlerResult {
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
     * @returns {ChainHandlerResult}
     */
    public primitive(value: unknown, type: PrimitiveTypeName | null = null): ChainHandlerResult {
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

    // public property(value: unknown, property: PropertyKeyLike): ChainHandlerResult {
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
     * @returns {ChainHandlerResult}
     */
    public instanceOf(value: unknown, constructor: CtorLike): ChainHandlerResult {
        return value instanceof constructor
            ? pass(value)
            : fail(value, 'generic/equals', { comparison: constructor });
    }

    /**
     * Executes the truthy handler step.
     * @param {any} value
     * @returns {ChainHandlerResult}
     */
    public truthy(value: unknown): ChainHandlerResult {
        return value ? pass(value) : fail(value, 'generic/truthy');
    }

    /**
     * Executes the notDefined handler step.
     * @param {any} value
     * @returns {ChainHandlerResult}
     */
    public notDefined(value: unknown): ChainHandlerResult {
        return value === undefined ? pass(value) : fail(value, 'generic/notDefined');
    }

    /**
     * Executes the nullOrUndefined handler step.
     * @param {any} value
     * @returns {ChainHandlerResult}
     */
    public nullOrUndefined(value: unknown): ChainHandlerResult {
        return value === null || value === undefined
            ? pass(value)
            : fail(value, 'generic/empty');
    }

    /**
     * Executes the notEquals handler step.
     * @param {any} value
     * @param {any} comparison
     * @returns {ChainHandlerResult}
     */
    public notEquals(value: unknown, comparison: unknown): ChainHandlerResult {
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
     * @returns {ChainHandlerResult}
     */
    public custom(value: unknown, filterFn: CustomHandlerFn): ChainHandlerResult {
        const result = filterFn(value);
        if (result instanceof ChainHandlerResult) {
            return result;
        }
        return pass(result);
    }

}


export { ChainHandler };