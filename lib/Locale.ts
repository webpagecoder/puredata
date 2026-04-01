'use strict';

import { Path } from './Path.ts';
import { Utils, TranslationRecord } from './utils/Utils.ts';

export type TranslationRecord = {
    [key: string]: TranslationRecord | string | string[];
};

class Locale {

    static registry: Record<string, TranslationRecord> = {};

    languageKey?: string;
    overrides: TranslationRecord = {};
    text: Locale | TranslationRecord = {};

    static register(languageKey: string, text: TranslationRecord = {}): void {
        Locale.registry[languageKey] = text;
    }

    constructor(keyOrParentLocale: string | Locale) {

        if (keyOrParentLocale instanceof Locale) {
            this.text = keyOrParentLocale;
            return;
        }

        const text = Locale.registry[keyOrParentLocale];
        if (!text) {
            throw new Error(`Language '${keyOrParentLocale}' is not registered`);
        }

        this.languageKey = keyOrParentLocale;
        this.text = text;
    }

    static get(language: string): Locale {
        return new Locale(language);
    }

    translate(path: string | Path, allowMultiple: boolean = false): string | TranslationRecord {
        if (!(path instanceof Path)) {
            path = Path.create(path).toRelative();
        }

        // Check in order: overrides, locale text, parent locale text
        let pathPointer = Utils.getRefByPath(this.overrides, path);
        if (pathPointer == null) {
            pathPointer = Utils.getRefByPath(this.text, path);
        }
        if (pathPointer == null && this.text instanceof Locale) {
            return this.text.translate(path);
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
            this.overrides[path.string] = overrides[key] as string;
        }
    }
}

export { Locale };
