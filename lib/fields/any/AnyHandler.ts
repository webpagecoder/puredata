'use strict';

import { Utils } from '../../Utils.ts';
import { HandlerResult } from '../HandlerResult.ts';
const { pass, fail } = HandlerResult;

export type PrimitiveTypeName = 'string' | 'number' | 'boolean' | 'undefined' | 'symbol' | 'bigint';
export type CtorLike = abstract new (...args: never[]) => object;
export type CustomHandler = (value: unknown) => HandlerResult | unknown;

class AnyHandler {

    // *****************************************
    //                VALIDATORS
    // *****************************************


    /**
     * Validates that a value matches one of the allowed values.
     * @param value Value being validated.
     * @param allowedValues Values that are accepted.
     * @returns A passing result when a match is found; otherwise a failing result.
     */
    public anyOf(value: unknown, allowedValues: unknown[] = []): HandlerResult {
        for (const allowed of allowedValues) {
            if (Utils.areEqual(value, allowed)) {
                return pass(value);
            }
        }
        return fail(value, 'generic/anyOf', { allowedValues });
    }

    /**
     * Validates that a value is not undefined.
     * @param value Value being validated.
     * @returns A passing result when the value is defined; otherwise a failing result.
     */
    public defined(value: unknown): HandlerResult {
        return value !== undefined ? pass(value) : fail(value, 'generic/defined');
    }

    /**
     * Validates that a value is one of the configured empty values.
     * @param value Value being validated.
     * @param empties Values treated as empty. Defaults to null and undefined.
     * @returns A passing result when the value is considered empty; otherwise a failing result.
     */
    public empty(value: unknown, empties: unknown[] = [null, undefined]): HandlerResult {
        return this.anyOf(value, empties).pass
            ? pass(value)
            : fail(value, 'generic/empty');
    }

    /**
     * Validates that a value is deeply equal to the provided comparison value.
     * @param value Value being validated.
     * @param comparison Value to compare against.
     * @returns A passing result when values are equal; otherwise a failing result.
     */
    public equals(value: unknown, comparison: unknown): HandlerResult {
        return Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/equals', { comparison });
    }

    /**
     * Validates that a value is falsy.
     * @param value Value being validated.
     * @returns A passing result for falsy values; otherwise a failing result.
     */
    public falsy(value: unknown): HandlerResult {
        return value ? fail(value, 'generic/falsy') : pass(value);
    }

    /**
     * Validates that a value is an instance of the supplied constructor.
     * @param value Value being validated.
     * @param constructor Constructor function the value must be an instance of.
     * @returns A passing result when the instance check succeeds; otherwise a failing result.
     */
    public instanceOf(value: unknown, constructor: CtorLike): HandlerResult {
        return value instanceof constructor
            ? pass(value)
            : fail(value, 'generic/instanceOf', { constructor });
    }

    /**
     * Validates that a value does not match any of the forbidden values.
     * @param value Value being validated.
     * @param forbiddenValues Values that are not allowed.
     * @returns A passing result when the value is not found; otherwise a failing result.
     */
    public noneOf(value: unknown, forbiddenValues: unknown[] = []): HandlerResult {
        for (const forbidden of forbiddenValues) {
            if (Utils.areEqual(value, forbidden)) {
                return fail(value, 'generic/noneOf', { forbiddenValues });
            }
        }
        return pass(value);
    }

    /**
     * Validates that a value is not one of the configured empty values.
     * @param value Value being validated.
     * @param empties Values treated as empty. Defaults to null and undefined.
     * @returns A passing result when the value is not considered empty; otherwise a failing result.
     */
    public notEmpty(value: unknown, empties: unknown[] = [null, undefined]): HandlerResult {
        return this.anyOf(value, empties).fail
            ? pass(value)
            : fail(value, 'generic/notEmpty');
    }

    /**
     * Validates that a value is not deeply equal to the provided comparison value.
     * @param value Value being validated.
     * @param comparison Value to compare against.
     * @returns A passing result when values differ; otherwise a failing result.
     */
    public notEquals(value: unknown, comparison: unknown): HandlerResult {
        return !Utils.areEqual(value, comparison)
            ? pass(value)
            : fail(value, 'generic/notEquals', { comparison });
    }

    /**
     * Validates that a value is not null.
     * @param value Value being validated.
     * @returns A passing result when the value is not null; otherwise a failing result.
     */
    public notNull(value: unknown): HandlerResult {
        return value !== null ? pass(value) : fail(value, 'generic/notNull');
    }

    /**
     * Validates that a value is null or undefined.
     * @param value Value being validated.
     * @returns A passing result when the value is nullish; otherwise a failing result.
     */
    public notNullish(value: unknown): HandlerResult {
        return value !== null && value !== undefined
            ? pass(value)
            : fail(value, 'generic/notNullish');
    }

    /**
     * Validates that a value is null.
     * @param value Value being validated.
     * @returns A passing result when the value is null; otherwise a failing result.
     */
    public null(value: unknown): HandlerResult {
        return value === null ? pass(value) : fail(value, 'generic/null');
    }

    /**
     * Validates that a value is null or undefined.
     * @param value Value being validated.
     * @returns A passing result when the value is nullish; otherwise a failing result.
     */
    public nullish(value: unknown): HandlerResult {
        return value === null || value === undefined
            ? pass(value)
            : fail(value, 'generic/nullish');
    }

    /**
     * Validates primitive type expectations for a value.
     * When type is provided, the value must match that primitive type exactly.
     * When type is omitted, any primitive type is accepted.
     * @param value Value being validated.
     * @param type Optional primitive type to enforce.
     * @returns A passing result when type constraints are met; otherwise a failing result.
     */
    public primitive(value: unknown, type: PrimitiveTypeName | null = null): HandlerResult {
        const actualType = typeof value;
        const primitives: PrimitiveTypeName[] = ['string', 'number', 'boolean', 'undefined', 'symbol', 'bigint'];
        if (type) {
            return actualType === type
                ? pass(value)
                : fail(value, 'generic/primitive', { actualType });
        }
        return (primitives.indexOf(actualType as PrimitiveTypeName) > -1)
            ? pass(value)
            : fail(value, 'generic/primitive', { actualType });
    }

    /**
     * Validates that a value is truthy.
     * @param value Value being validated.
     * @returns A passing result for truthy values; otherwise a failing result.
     */
    public truthy(value: unknown): HandlerResult {
        return value ? pass(value) : fail(value, 'generic/truthy');
    }

    /**
     * Validates that a value is undefined.
     * @param value Value being validated.
     * @returns A passing result when the value is undefined; otherwise a failing result.
     */
    public undefined(value: unknown): HandlerResult {
        return value === undefined ? pass(value) : fail(value, 'generic/undefined');
    }




    // *****************************************
    //                MUTATORS
    // *****************************************

    /**
     * Executes a user-provided handler for custom validation or transformation.
     * If the callback returns a HandlerResult, that result is used directly.
     * Otherwise, the returned value is wrapped in a passing result.
     * @param value Value being processed.
     * @param filterFn Callback that validates and/or transforms the value.
     * @returns The callback result as-is when it is a HandlerResult; otherwise a passing result.
     */
    public custom(value: unknown, filterFn: CustomHandler): HandlerResult {
        const result = filterFn(value);
        if (result instanceof HandlerResult) {
            return result;
        }
        return pass(result);
    }
}

export { AnyHandler };
