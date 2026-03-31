'use strict';

import { Cache } from './Cache.ts';

const SYM_REGEX_CACHE_KEY: symbol = Symbol();
const REGEX_STORE: Map<string, RegExp> = Cache.registerStore(SYM_REGEX_CACHE_KEY) as Map<string, RegExp>;

const RegexCache: (regexStr: string, flags?: string) => RegExp =
    (regexStr: string, flags: string = ''): RegExp => {
        const key = regexStr + flags;
        if (REGEX_STORE.has(key)) {
            return REGEX_STORE.get(key) as RegExp;
        }
        const regex = new RegExp(regexStr, flags);
        REGEX_STORE.set(key, regex);
        return regex;
    };


export { RegexCache };