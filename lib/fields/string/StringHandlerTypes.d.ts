'use strict';

import { Presence } from "../../Presence.ts";
import { RegexMatchOptions } from "../../Utils.ts";


// ====================================
// BUILDING BLOCKS
// ====================================

export type IgnoreCaseOption = {
    ignoreCase: boolean;
}
export type NormalizeOption = {
    normalize: boolean;
}

/**
 * Shared options for regex-based validators that support normalization and delimiter-aware matching.
 * @property normalize Whether successful values should be normalized before returning.
 * Example: true.
 * @property mode Match mode.
 * Allowed values: "strict", "loose".
 * Example: "loose".
 * @property acceptableDelims Delimiters accepted from user input during matching.
 * Example: " -_./".
 * @property normalizedDelim Delimiter used in normalized output.
 * Example: "-".
 * @property stripDelims Characters removed before loose matching.
 * Example: " ()".
 */
export type GenericMatchOptions = NormalizeOption & RegexMatchOptions;




// ====================================
// SPECIFIC STRING HANDLER OPTION TYPES
// ====================================

/**
 * Complexity constraints for password-like string validation.
 * Defaults are defined in {@link COMPLEX_DEFAULTS}.
 * @property minLength Minimum total length.
 * Example: 8.
 * @property maxLength Maximum total length.
 * Example: 100.
 * @property minLowercase Minimum lowercase letters required.
 * Example: 1.
 * @property minUppercase Minimum uppercase letters required.
 * Example: 1.
 * @property minDigits Minimum digits required.
 * Example: 1.
 * @property minSpecialChars Minimum non-alphanumeric characters required.
 * Example: 1.
 * @property maxRepeats Maximum allowed consecutive repeats of the same character.
 * Example: 2 allows "aa" but rejects "aaa".
 */
export type ComplexOptions = {
    minLength: number;
    maxLength: number;
    minLowercase: number;
    minUppercase: number;
    minDigits: number;
    minSpecialChars: number;
    maxRepeats: number;
};

/**
 * Options for `contains()` matching.
 * @property ignoreCase Whether matching should ignore letter case.
 * Example: true.
 */
export type ContainsOptions = IgnoreCaseOption;

/**
 * Options for `creditCard()` validation and normalization.
 * Inherits `normalize` and regex matching options from `GenericMatchOptions`.
 * Defaults are defined in {@link CREDIT_CARD_DEFAULTS}.
 * @property normalize Whether to return normalized output on success.
 * @property mode Matching mode: 'strict' or 'loose'.
 * @property acceptableDelims Delimiters accepted in input.
 * Example: " -_./".
 * @property normalizedDelim Delimiter used in normalized output.
 * Example: "" (no delimiter) or "-".
 * @property stripDelims Extra delimiters to strip during loose matching.
 * @property types Card brands to allow, or null to allow all supported brands.
 * Allowed values: "visa", "mastercard", "amex", "discover", "diners", "diners16", "jcb".
 * Example: ["visa", "mastercard"].
 */
export type CreditCardOptions = GenericMatchOptions & {
    types: string[] | null;
};

export type CurrencyCodeOptions = NormalizeOption & IgnoreCaseOption;

/**
 * Options for `dataUrl()` validation.
 * @property allowedTypes Top-level MIME types allowed before `/subtype`.
 * Allowed values: "image", "video", "audio", "text".
 * Example: ["image", "text"].
 */
export type DataUrlOptions = {
    allowedTypes: ('image' | 'video' | 'audio' | 'text')[];
}

export type DomainOptions = NormalizeOption & {
    wildcards: Presence;
    subdomains: Presence;
}

export type E123Options = GenericMatchOptions

export type EmailOptions = NormalizeOption;

export type EndsWithOptions = IgnoreCaseOption;

export type ExcludesCharsOptions = IgnoreCaseOption;

/**
 * Options for GTIN validation.
 * Inherits `normalize` and regex matching options from `GenericMatchOptions`.
 * @property lengths Allowed GTIN lengths.
 * Supported values: 8, 12, 13, 14.
 * Example: [12, 13] to accept UPC-A and EAN-13 only.
 */
export type GtinOptions = GenericMatchOptions & {
    lengths: number[];
};

export type HexOptions = NormalizeOption;

export type ImeiOptions = GenericMatchOptions;

export type IpOptions = NormalizeOption;

export type LabelOptions = NormalizeOption;

export type MacOptions = GenericMatchOptions;

/**
 * Options for validating measurement-like strings by extending numeric parsing rules.
 * Inherits all numeric controls from `NumericOptions`.
 * @property units Unit suffixes allowed as trailing symbols.
 * Example: ["cm", "mm", "in"].
 */
export type MeasurementOptions = NumericOptions & {
    units: string[];
}

/**
 * Options for money-format validation.
 * @property parens Whether negative-by-parentheses formatting is allowed.
 * Allowed values: {@link Presence}.
 * Example: "optional".
 * @property leadingSymbols Allowed symbols before the number.
 * Example: ["$", "USD"].
 * @property trailingSymbols Allowed symbols after the number.
 * Example: ["USD"].
 */
export type MoneyOptions = {
    parens: Presence;
    leadingSymbols: string[];
    trailingSymbols: string[];
};

/**
 * Core numeric-format matching options.
 * @property plus Whether plus sign usage is allowed.
 * Allowed values: {@link Presence}.
 * @property minus Whether minus sign usage is allowed.
 * Allowed values: {@link Presence}.
 * @property alignment Side where sign markers must appear.
 * Allowed values: "left", "right".
 * @property min Minimum numeric value allowed, or null for no minimum.
 * Example: 0.
 * @property max Maximum numeric value allowed, or null for no maximum.
 * Example: 1000.
 * @property decimal Whether decimal/fractional part is allowed.
 * Allowed values: {@link Presence}.
 * @property thousandsDelim Thousands separator for integral digits.
 * Example: ",".
 * @property decimalDelim Decimal separator.
 * Example: ".".
 * @property minPrecision Minimum fractional digits, or null for no minimum.
 * Example: 2.
 * @property maxPrecision Maximum fractional digits, or null for no limit.
 * Example: 4.
 * @property leadingZero Whether a leading zero before the decimal point is required.
 * Allowed values: {@link Presence}.
 * @property trailingZero Whether a zero-only fractional part is allowed.
 * Allowed values: {@link Presence}.
 * @property leadingSymbols Allowed symbols before sign/number portion.
 * Example: ["$", "USD"].
 * @property trailingSymbols Allowed symbols after number portion.
 * Example: ["kg", "%"].
 * @property looseSpacing Whether flexible whitespace around components is allowed.
 * Example: true.
 */
export type NumericOptions = {
    plus: Presence;
    minus: Presence;
    alignment: 'left' | 'right';
    min: number | null,
    max: number | null,
    decimal: Presence;
    thousandsDelim: string;
    decimalDelim: string;
    minPrecision: number | null;
    maxPrecision: number | null;
    leadingZero: Presence;
    trailingZero: Presence;
    leadingSymbols: string[];
    trailingSymbols: string[];
    looseSpacing: boolean;
};

export type OnlyCharsOptions = IgnoreCaseOption;

/**
 * Options for path-like string validation.
 * Inherits normalize behavior from `NormalizeOption`.
 * @property absolute Whether absolute-path prefix is required.
 * Allowed values: {@link Presence}.
 * @property extensions Allowed file extension suffixes.
 * Example: [".ts", ".js"] or [".*"] for any extension.
 * @property segmentMaxLen Maximum length of each path segment.
 * Example: 100.
 * @property style Path syntax style.
 * Allowed values: "unix", "win", "win-unc".
 */
export type PathOptions = NormalizeOption & {
    absolute: Presence;
    extensions: string[];
    segmentMaxLen: number;
    style: 'unix' | 'win' | 'win-unc';
};

export type PhoneOptions = GenericMatchOptions;

/**
 * Options for repeated-fragment checks in `repeats()`.
 * @property ignoreCase Whether fragment matching ignores case.
 * Example: true.
 * @property otherText Whether non-fragment text is allowed between/around matches.
 * Example: false requires the entire input to be repetitions only.
 */
export type RepeatOptions = IgnoreCaseOption & {
    otherText: boolean;
}

export type StartsWithOptions = IgnoreCaseOption;

export type SsnOptions = GenericMatchOptions

export type StateOptions = NormalizeOption & IgnoreCaseOption;

/**
 * Configuration for delimiter-based text conversion.
 * See {@link ToDelimitedOptions}.
 * @property fromDelims Delimiter characters used to split the input. Use null to skip splitting.
 * Example: " -_" splits on spaces, hyphens, and underscores.
 * @property toDelim Delimiter used when joining transformed parts.
 * Example: "-" for kebab-case or "_" for snake_case.
 * @property transformer1 Transformer used before the switch index.
 * Example: `(word) => word.toLowerCase()`.
 * @property transformer2 Transformer used at/after the switch index.
 * Example: `(word) => word[0].toUpperCase() + word.slice(1).toLowerCase()`.
 * @property transformerSwitchIndex Index where the transform switches from `transformer1` to `transformer2`.
 * Example: 1 keeps the first token in `transformer1` style and the rest in `transformer2` style.
 */
export type ToDelimitedOptions = {
    fromDelims: string | null;
    toDelim: string;
    transformer1: (x: string) => string;
    transformer2?: (x: string) => string;
    transformerSwitchIndex?: number | null;
};

/**
 * Options for UUID validation and normalization.
 * Inherits `GenericMatchOptions` for delimiter and mode handling.
 * @property version UUID version to enforce, or null to allow any supported version.
 * Allowed values: 1, 2, 3, 4, 5, "1", "2", "3", "4", "5", null.
 * Example: 4.
 */
export type UuidOptions = GenericMatchOptions & {
    version: string | number | null;
};

/**
 * Options for URL validation.
 * Inherits normalize behavior from `NormalizeOption`.
 * @property rootRelative Whether root-relative URLs (like `/path`) are allowed without host/protocol.
 * Example: true.
 * @property allowedProtocols Protocols accepted when a protocol is present.
 * Example: ["http", "https"].
 * @property protocols Whether protocol segment is required.
 * Allowed values: {@link Presence}.
 * @property domain Whether domain hosts are allowed.
 * Allowed values: {@link Presence}.
 * @property ip Whether IP hosts are allowed.
 * Allowed values: {@link Presence}.
 * @property label Whether single-label hosts are allowed.
 * Allowed values: {@link Presence}.
 * @property port Whether port segment is required.
 * Allowed values: {@link Presence}.
 * @property query Whether query segment is required.
 * Allowed values: {@link Presence}.
 * @property fragment Whether fragment segment is required.
 * Allowed values: {@link Presence}.
 */
export type UrlOptions = NormalizeOption & {
    rootRelative: boolean;
    allowedProtocols: string[];
    protocols: Presence;
    domain: Presence;
    ip: Presence;
    label: Presence;
    port: Presence;
    query: Presence;
    fragment: Presence;
};

/**
 * Options for ZIP/postal validation.
 * Inherits `GenericMatchOptions` for delimiter and normalization behavior.
 * @property zip4 Whether ZIP+4 extension is required.
 * Allowed values: {@link Presence}.
 * Example: "required" enforces 9-digit ZIP+4.
 */
export type ZipOptions = GenericMatchOptions & {
    zip4: Presence;
}
