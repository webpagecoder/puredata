// @ts-nocheck
'use strict';

/** @typedef import('./typedefs.ts') */

import Cache from './Cache.ts';

const SYM_REGEX_CACHE_KEY = Symbol();
const REGEX_CACHE = Cache.registerStore(SYM_REGEX_CACHE_KEY);

const RegexCache = (() => {
    return (regexStr, flags = '') => {
        const key = regexStr + flags;
        if (REGEX_CACHE.has(key)) {
            return REGEX_CACHE.get(key);
        }
        const regex = new RegExp(regexStr, flags);
        REGEX_CACHE.set(key, regex);
        return regex;
    }
})();

export default RegexCache;