'use strict';

import { Path } from './Path.ts';
import { Utils } from './utils/Utils.ts';

interface LocaleText {
    [key: string]: string | LocaleText;
}

class Locale {

    static registry: Record<string, LocaleText> = {};

    languageKey?: string;
    overrides: LocaleText = {};
    parent?: Locale;
    text: LocaleText = {};

    static register(languageKey: string, text: LocaleText = {}): void {
        Locale.registry[languageKey] = text;
    }

    constructor(keyOrParentLocale: string | Locale) {

        if (keyOrParentLocale instanceof Locale) {
            this.parent = keyOrParentLocale;
            return;
        }

        const text = Locale.registry[keyOrParentLocale];
        if (!text) {
            throw new Error(`Language '${keyOrParentLocale}' is not registered`);
        }

        this.languageKey = keyOrParentLocale;
        this.text = text;
    }

    switchLanguage(language: string): Locale {
        const Constructor = this.constructor as new (keyOrParentLocale: string | Locale) => Locale;
        return new Constructor(language);
    }

    getText(path: string | Path): string | LocaleText {
        if (!(path instanceof Path)) {
            path = Path.create(path).toRelative();
        }
        const override = this.overrides[path.string];
        if (override) {
            return override;
        }
        else if (this.parent) {
            return this.parent.getText(path);
        }

        if (!this.text) {
            throw new Error('Locale text is not configured');
        }

        let pointer: string | LocaleText = this.text;
        for (const key of path.keys) {
            if (!Utils.isPlainObject(pointer)) {
                throw new Error('Nonexistent path in language file: ' + path.string);
            }
            pointer = (pointer as LocaleText)[key];
            if (Utils.isPlainObject(pointer)) {
                continue;
            }
            else if (pointer == null) {
                throw new Error('Nonexistent path in language file: ' + path.string);
            }
            else {
                return String(pointer);
            }
        }

        // If we got here, it means the path points to an object, check for 'base' key
        if (Utils.isPlainObject(pointer) && typeof (pointer as LocaleText).base === 'string') {
            return (pointer as LocaleText).base as string;
        }
        throw new Error('Nonexistent path in language file: ' + path.string);
    }

    override(overrides: LocaleText): void {
        for (const key of Object.keys(overrides)) {
            const path = Path.create(key).toRelative();
            this.overrides[path.string] = overrides[key] as string;
        }
    }
}

export { Locale };
