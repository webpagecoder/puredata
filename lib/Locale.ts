'use strict';

import { Path } from './Path.ts';
import { Utils, NestedStringRecord } from './utils/Utils.ts';


class Locale {

    static registry: Record<string, NestedStringRecord> = {};

    languageKey?: string;
    overrides: NestedStringRecord = {};
    text: Locale | NestedStringRecord = {};

    static register(languageKey: string, text: NestedStringRecord = {}): void {
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

    translate(path: string | Path): string {
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
        if (typeof value !== 'string') {
            throw new Error('Value at path is not a string: ' + path.string);
        }
        return value;
    }

    override(overrides: NestedStringRecord): void {
        for (const key of Object.keys(overrides)) {
            const path = Path.create(key).toRelative();
            this.overrides[path.string] = overrides[key] as string;
        }
    }
}

export { Locale };
