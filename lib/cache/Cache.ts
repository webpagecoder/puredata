'use strict';

type CacheStore = Map<unknown, unknown>;

const cache: Map<symbol, CacheStore> = new Map();

const Cache = {
    registerStore(sym: symbol): CacheStore {
        const store: CacheStore = new Map();
        cache.set(sym, store);
        return store;
    },
    get(storeSym: symbol): CacheStore | null {
        return cache.get(storeSym) || null;
    }
};

export { Cache };