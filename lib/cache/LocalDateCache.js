'use strict';

/** @typedef import('./typedefs.js') */

import Cache  from './Cache.js';

const SYM_DATE_CACHE_KEY = Symbol();
const DATE_CACHE = Cache.registerStore(SYM_DATE_CACHE_KEY);

const LocalDateCache = {
    has(key) {
        return DATE_CACHE.has(key);
    },
    get(key) {
        // Return a clone of the stored LocalDate object
        const { instance, parsed, matchType } = DATE_CACHE.get(key);
        return {
            instance: instance.duplicate(),
            parsed: Object.assign({}, parsed),
            matchType
        }
    },
    set(key, data) {
        return DATE_CACHE.set(key, data);
    }
};

export default  LocalDateCache;