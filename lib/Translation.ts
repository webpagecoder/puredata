'use strict';

/** Translation entries indexed by path. */
export type TranslationStringRecord = Record<string, string | string[]>;

/** Resolves translation text with optional fallback to a parent translation. */
class Translation {

    /** Translation entries defined at this level. */
    private _translation: TranslationStringRecord;

    /** Translation to consult when a key is not defined locally. */
    private _fallback: null | Translation;

    /** Creates a translation from an optional set of entries. */
    constructor(translation?: TranslationStringRecord) {
        this._fallback = null;
        this._translation = translation || {};
    }

    /** Creates an empty override that falls back to this translation. */
    public clone() {
        return this.override();
    }

    /**
     * Creates a translation that overrides this one.
     *
     * @param overrides Entries or an existing translation to use as overrides.
     * @returns The override translation with this translation as its fallback.
     */
    public override(overrides?: TranslationStringRecord | Translation): Translation {
        if (overrides instanceof Translation) {
            overrides._fallback = this;
            return overrides;
        }
        const overrideTranslation = new Translation();
        overrideTranslation._fallback = this;
        if (overrides) {
            for (const key of Object.keys(overrides)) {
                overrideTranslation._translation[key] = overrides[key];
            }
        }
        return overrideTranslation;
    }

    /**
     * Gets the text for a key, consulting the fallback if necessary.
     *
     * @param key Translation key.
     * @returns The matching text or text list.
     * @throws {@link Error} If the key is not present in this translation or its fallback.
     */
    public getText(key: string): string | string[] {
        let text = this._translation[key];
        if (text == null && this._fallback) {
            text = this._fallback.getText(key);
        }
        if (text == null) {
            throw new Error('Nonexistent path in language file: ' + key);
        }
        return text;
    }

    /** Adds or replaces translation entries at this level. */
    public setText(textRecord: TranslationStringRecord): void {
        for (const key of Object.keys(textRecord)) {
            this._translation[key] = textRecord[key];
        }
    }
}

export { Translation };
