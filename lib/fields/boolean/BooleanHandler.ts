'use strict';

import { Utils } from '../../Utils.ts';
import { HandlerResult } from '../HandlerResult.ts';
import { AnyHandler } from '../any/AnyHandler.ts';
const { pass, fail } = HandlerResult;

type BoolishPair = [truthy: unknown, falsy: unknown];

class BooleanHandler extends AnyHandler {

    // ***************************************
    //               VALIDATORS 
    // ***************************************

    /**
     * Passes when the value is `false` or matches one of the provided falsy equivalents.
     * @param bool - Value to validate as falsy.
     * @param falsyValues - Additional values treated as falsy.
     * @returns A passing result with the original value when it is falsy; otherwise a failing result with `boolean/falsy`.
     */
    public override falsy(bool: unknown, falsyValues: unknown[] = []): HandlerResult {
        if (bool === false) {
            return pass(bool);
        }
        for (const falsy of falsyValues) {
            if (Utils.areEqual(bool, falsy)) {
                return pass(bool);
            }
        }
        return fail(bool, 'boolean/falsy', { falsyValues });
    }

    /**
     * Passes when the value is `true` or matches one of the provided truthy equivalents.
     * @param bool - Value to validate as truthy.
     * @param truthyValues - Additional values treated as truthy.
     * @returns A passing result with the original value when it is truthy; otherwise a failing result with `boolean/truthy`.
     */
    public override truthy(bool: unknown, truthyValues: unknown[] = []): HandlerResult {
        if (bool === true) {
            return pass(bool);
        }
        for (const truthy of truthyValues) {
            if (Utils.areEqual(bool, truthy)) {
                return pass(bool);
            }
        }
        return fail(bool, 'boolean/truthy', { truthyValues });
    }

    

    // *****************************************
    //               MUTATORS
    // *****************************************

    /**
     * Inverts a boolean-like value using configured truthy/falsy pairs.
     * Adds the default pair `[true, false]` to the provided pair list, then swaps
     * a matching truthy value to its falsy pair (or vice versa).
     * @param bool - Value to invert.
     * @param boolishPairs - Custom truthy/falsy tuple pairs.
     * @returns A passing result containing the paired opposite value when a match is found; otherwise a failing result with `boolean/invert`.
     */
    public invert(bool: unknown, boolishPairs: BoolishPair[] = []): HandlerResult {
        boolishPairs.push([true, false]);

        const truthyMatchIndex = boolishPairs.map(([truthy, _]): unknown => truthy).indexOf(bool);
        if (truthyMatchIndex > -1) {
            return pass(boolishPairs[truthyMatchIndex][1]);
        }
        const falsyMatchIndex = boolishPairs.map(([_, falsy]): unknown => falsy).indexOf(bool);
        if (falsyMatchIndex > -1) {
            return pass(boolishPairs[falsyMatchIndex][0]);
        }

        return fail(bool, 'boolean/invert', { boolishPairs });
    }
}

export { BooleanHandler };

