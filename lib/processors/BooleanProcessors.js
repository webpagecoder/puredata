'use strict';

import GenericProcessors  from './GenericProcessors.js';
import { pass, fail }  from '../Result.js';

class BooleanProcessors extends GenericProcessors {

    // Validators

    static falsy(bool, falsyValues = []) {
        return bool === false || falsyValues.indexOf(bool) > -1
            ? pass(bool)
            : fail(bool, 'boolean/falsy', { falsyValues });
    }

    static truthy(bool, truthyValues = []) {
        return bool === true || truthyValues.indexOf(bool) > -1
            ? pass(bool)
            : fail(bool, 'boolean/truthy', { truthyValues });
    }

    // Transformers

    static invert(bool, boolishPairs = []) {
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

export default  BooleanProcessors;

