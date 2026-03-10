'use strict';

import { ProcessResult } from '../ProcessResult.ts';
import { GenericHandler } from './GenericHandler.ts';
const { pass, fail } = ProcessResult;

type BoolishPair = [truthy: any, falsy: unknown];

class BooleanHandler extends GenericHandler {

    // ====================================
    // VALIDATORS 
    // ====================================

    /**
     * Passes when the value is `false` or matches one of the provided falsy equivalents.
     *
     * @param bool - Value to validate as falsy.
     * @param falsyValues - Additional values treated as falsy.
     * @returns {ProcessResult} A pass result for valid falsy values, otherwise a fail result.
     */
    static falsy(bool: unknown, falsyValues: unknown[] = []): ProcessResult {
        return bool === false || falsyValues.indexOf(bool) > -1
            ? pass(bool)
            : fail(bool, 'boolean/falsy', { falsyValues });
    }

    /**
     * Passes when the value is `true` or matches one of the provided truthy equivalents.
     *
     * @param bool - Value to validate as truthy.
     * @param truthyValues - Additional values treated as truthy.
     * @returns {ProcessResult} A pass result for valid truthy values, otherwise a fail result.
     */
    static truthy(bool: unknown, truthyValues: unknown[] = []): ProcessResult {
        return bool === true || truthyValues.indexOf(bool) > -1
            ? pass(bool)
            : fail(bool, 'boolean/truthy', { truthyValues });
    }

    // ====================================
    // MUTATORS 
    // ====================================
    
    /**
     * Inverts a boolean-like value using configured truthy/falsy pairs.
     *
     * Adds the default pair `[true, false]` to the provided pair list, then swaps
     * a matching truthy value to its falsy pair (or vice versa).
     *
     * @param bool - Value to invert.
     * @param boolishPairs - Custom truthy/falsy tuple pairs.
     * @returns {ProcessResult} A pass result with the inverted value, otherwise a fail result.
     */
    static invert(bool: unknown, boolishPairs: BoolishPair[] = []): ProcessResult {
        boolishPairs.push([true, false]);

        const truthyMatchIndex = boolishPairs.map(([truthy, _]) => truthy).indexOf(bool);
        if (truthyMatchIndex > -1) {
            return pass(boolishPairs[truthyMatchIndex][1]);
        }
        const falsyMatchIndex = boolishPairs.map(([_, falsy]) => falsy).indexOf(bool);
        if (falsyMatchIndex > -1) {
            return pass(boolishPairs[falsyMatchIndex][0]);
        }

        return fail(bool, 'boolean/invert', { boolishPairs });
    }
}

export { BooleanHandler };

