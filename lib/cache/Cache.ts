// @ts-nocheck
'use strict';

/** @typedef import('./typedefs.ts') */

const Cache = (() => {
    const cache = new Map();
    return {
        registerStore(sym) {
            const store = new Map();
            cache.set(sym, store);
            return store;
        },
        get(storeSym) {
            return cache.get(storeSym);
        }
    };
})();

export { Cache };