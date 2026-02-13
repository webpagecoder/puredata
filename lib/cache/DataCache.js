'use strict';

import Cache from './Cache.js';

const SYM_DATA_CACHE_KEY = Symbol();
const DATA_CACHE = Cache.registerStore(SYM_DATA_CACHE_KEY);

const DataCache = {
    has(key) {
        return DATA_CACHE.has(key);
    },
    get(key) {
        return DATA_CACHE.get(key);
    },
    set(key, data) {
        return DATA_CACHE.set(key, data);
    }
};

export default DataCache;