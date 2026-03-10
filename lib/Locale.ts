// @ts-nocheck
'use strict';

import { Path } from './Path.ts';
import { Utils } from './utils/Utils.ts';

class Locale {

    static register(languageKey, text = {}) {
        let registry = Locale.registry || (Locale.registry = new Map());
        registry.set(languageKey, text);
    }

    constructor(keyOrParentLocale: string | Locale) {
        this.overrides = new Map();

        if (keyOrParentLocale instanceof Locale) {
            this.parent = keyOrParentLocale;
            return;
        }

        const text = Locale.registry.get(keyOrParentLocale);
        if (!text) {
            throw new Error(`Language '${keyOrParentLocale}' is not registered`);
        }

        this.languageKey = keyOrParentLocale;
        this.text = text;
    }

    switchLanguage(language) {
        return new this.constructor(language);
    }

    getText(path) {
        if (!(path instanceof Path)) {
            path = Path.create(path).toRelative();
        }
        const override = this.overrides.get(path.string);
        if (override) {
            return override;
        }
        else if (this.parent) {
            return this.parent.getText(path);
        }

        let pointer = this.text;
        for (const key of path.keys) {
            pointer = pointer[key];
            if (Utils.isPlainObject(pointer)) {
                continue;
            }
            else if (pointer == null) {
                throw new Error('Nonexistent path in language file: ' + path.string);
            }
            else {
                return pointer;
            }
        }

        // If we got here, it means the path points to an object, check for 'base' key
        if (pointer.base) {
            return pointer.base;
        }
        throw new Error('Nonexistent path in language file: ' + path.string);
    }

    override(overrides) {
        for (const key of Object.keys(overrides)) {
            const path = Path.create(key).toRelative();
            this.overrides.set(path.string, overrides[key]);
        }
    }
}

export { Locale };