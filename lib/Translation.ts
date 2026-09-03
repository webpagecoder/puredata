'use strict';

export type TranslationStringRecord = Record<string, string | string[]>;

class Translation {

    protected _translation: TranslationStringRecord;
    protected _fallback: null | Translation;

    constructor(translation?: TranslationStringRecord) {
        this._fallback = null;
        this._translation = translation || {};
    }

    public clone() {
        return this.override();
    }

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

    public setText(textRecord: TranslationStringRecord): void {
        for (const key of Object.keys(textRecord)) {
            this._translation[key] = textRecord[key];
        }
    }
}

export { Translation };
