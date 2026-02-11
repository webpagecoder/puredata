'use strict';

const ObjectUtils = require('./utils/ObjectUtils.js');
const Path = require('./path/Path.js');
const Utils = require('../_misc/Utils.js');



class Language {

    static register(languageKey, tag, text) {
        let registry = Language.registry || (Language.registry = new Map());
        registry = registry.get(languageKey) || registry.set(languageKey, new Map()).get(languageKey);
        registry.set(tag, text);
    }

    constructor(languageKeyOrParent, tag) {
        this.overrides = new Map();

        if (languageKeyOrParent instanceof Language) {
            this.parent = languageKeyOrParent;
            return;
        }

        const language = Language.registry.get(languageKeyOrParent);
        if (!language) {
            throw new Error(`Language '${language}' is not registered`);
        }
        const text = language.get(tag);
        if (!text) {
            throw new Error(`Language category '${tag}' is not registered`);
        }

        this.languageKey = languageKeyOrParent;
        this.tag = tag;
        this.text = text;
    }

    switchLanguage(language) {
        return new this.constructor(
            language,
            this.tag,
        );
    }

    get(path) {
        if (!(path instanceof Path)) {
            path = Path.create(path).toRelative();
        }
        const override = this.overrides.get(path.string);
        if (override) {
            return override;
        }
        else if (this.parent) {
            return this.parent.get(path);
        }

        let pointer = this.text;
        for (const pathKey of path.keys) {
            pointer = pointer[pathKey];
            if (ObjectUtils.isPlainObject(pointer)) {
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

module.exports = Language;