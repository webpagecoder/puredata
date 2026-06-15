'use strict';

import { Path } from './path/Path.ts';
import { Utils } from './Utils.ts';

export type TranslationRecord = {
    [key: string]: TranslationRecord | string | string[];
};

class Locale {

    public static registry: Record<string, TranslationRecord> = {};

    protected _languageKey?: string;
    protected _overrides: TranslationRecord = {};
    protected _text: Locale | TranslationRecord = {};

    static register(languageKey: string, text: TranslationRecord = {}): void {
        Locale.registry[languageKey] = text;
    }

    constructor(keyOrParentLocale: string | Locale) {

        if (keyOrParentLocale instanceof Locale) {
            this._text = keyOrParentLocale;
            return;
        }

        const text = Locale.registry[keyOrParentLocale];
        if (!text) {
            throw new Error(`Language '${keyOrParentLocale}' is not registered`);
        }

        this._languageKey = keyOrParentLocale;
        this._text = text;
    }

    static get(language: string): Locale {
        return new Locale(language);
    }

    translate(path: Path, allowMultiple: boolean = false): string | string[] | TranslationRecord {

        // Check in order: overrides, locale text, parent locale text
        let pathPointer = Utils.getRefByPath(this._overrides, path);
        if (pathPointer == null) {
            pathPointer = Utils.getRefByPath(this._text, path);
        }
        if (pathPointer == null && this._text instanceof Locale) {
            return this._text.translate(path);
        }

        if (pathPointer == null) {
            throw new Error('Nonexistent path in language file: ' + path.string);
        }

        const [pointer, key] = pathPointer;
        const value = pointer[key];
        if (typeof value === 'string' || Array.isArray(value) || (allowMultiple && Utils.isPlainObject(value))) {
            return value;
        }
        throw new Error('Invalid path for translation: ' + path.string);
    }

    override(overrides: TranslationRecord): void {
        for (const key of Object.keys(overrides)) {
            const path = Path.create(key).toRelative();
            this._overrides[path._string] = overrides[key] as string;
        }
    }
}

export { Locale };
