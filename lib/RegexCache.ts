'use strict';

class RegexCache {
    private static _store: Map<string, RegExp>;

    public static get(regexStr: string, flags: string = ''): RegExp {
        if(!RegexCache._store) {
            RegexCache._store = new Map<string, RegExp>();
        }
        const key = regexStr + flags;
        if (RegexCache._store.has(key)) {
            return RegexCache._store.get(key) as RegExp;
        }
        const regex = new RegExp(regexStr, flags);
        RegexCache._store.set(key, regex);
        return regex;
    }
}


export { RegexCache };