'use strict';

/** Caches regular expressions by pattern and flags. */
class RegexCache {
    /** Regular expressions indexed by their pattern and flags. */
    private static _store: Map<string, RegExp>;

    /**
     * Returns a cached regular expression or creates and caches one.
     *
     * The same `RegExp` instance is returned for repeated requests with the
     * same pattern and flags.
     *
     * @param regexStr Regular expression pattern.
     * @param flags Regular expression flags; defaults to an empty string.
     * @returns The matching regular expression.
     */
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