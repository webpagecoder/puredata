'use strict';

/** @typedef import('./typedefs.js') */

import Cache  from './Cache.js';

const SYM_ENTITY_CACHE_KEY = Symbol();
const ENTITY_CACHE = Cache.registerStore(SYM_ENTITY_CACHE_KEY);

const MetaCache = {
    has(key) {
        return ENTITY_CACHE.has(key);
    },
    get(key) {
        return ENTITY_CACHE.get(key);
    },
    set(key, data) {
        return ENTITY_CACHE.set(key, data);
    }
};

export default  MetaCache;