'use strict';

import { Presence } from '../../Presence.ts';
import { RegexCache } from '../../RegexCache.ts';
import { Utils } from '../../Utils.ts';
import { ChainHandler } from '../ChainHandler.ts';
import { ChainHandlerResult } from '../ChainHandlerResult.ts';
import { NumberHandler } from '../number/NumberHandler.ts';
import type {
    ComplexOptions,
    ContainsOptions,
    CreditCardOptions,
    CurrencyCodeOptions,
    DataUrlOptions,
    DomainOptions,
    E123Options,
    EmailOptions,
    EndsWithOptions,
    ExcludesCharsOptions,
    GenericMatchOptions,
    GtinOptions,
    HexOptions,
    IgnoreCaseOption,
    ImeiOptions,
    IpOptions,
    LabelOptions,
    MacOptions,
    MeasurementOptions,
    MoneyOptions,
    NumericOptions,
    OnlyCharsOptions,
    PathOptions,
    PhoneOptions,
    RepeatOptions,
    SsnOptions,
    StartsWithOptions,
    StateOptions,
    ToDelimitedOptions,
    UrlOptions,
    UuidOptions,
    ZipOptions
} from './StringHandlerTypes.d.ts';

export type StringHandlerResult = ChainHandlerResult<string>;

// ====================================
// DEFAULT ARGUMENTS FOR STRING METHODS
// ====================================

export const COMPLEX_DEFAULTS = {
    minLength: 8,
    maxLength: 100,
    minLowercase: 1,
    minUppercase: 1,
    minDigits: 1,
    minSpecialChars: 1,
    maxRepeats: 2
} satisfies ComplexOptions;

export const CONTAINS_DEFAULTS = {
    ignoreCase: false
} satisfies ContainsOptions;

export const CREDIT_CARD_DEFAULTS = {
    acceptableDelims: ' -_./',
    normalize: true,
    normalizedDelim: '',
    types: []
} satisfies CreditCardOptions;

export const CURRENCY_CODE_DEFAULTS = {
    ignoreCase: false,
    normalize: true,
} satisfies CurrencyCodeOptions;

export const DATA_URL_DEFAULTS = {
    allowedTypes: ['image', 'video', 'audio', 'text']
} satisfies DataUrlOptions;

export const DOMAIN_DEFAULTS = {
    normalize: true,
    subdomains: 'optional' as Presence,
    wildcards: 'forbidden' as Presence,
} satisfies DomainOptions;

export const E123_DEFAULTS = {
    acceptableDelims: ' -./',
    normalize: true,
    normalizedDelim: ' ',
} satisfies E123Options;

export const E164_DEFAULTS = {
    acceptableDelims: ' -./',
    normalizedDelim: '',
} satisfies Partial<E123Options>;

export const EMAIL_DEFAULTS = {
    normalize: true
} satisfies EmailOptions;

export const ENDS_WITH_DEFAULTS = {
    ignoreCase: false
} satisfies EndsWithOptions;

export const EXCLUDES_CHARS_DEFAULTS = {
    ignoreCase: false
} satisfies ExcludesCharsOptions;

export const GTIN_DEFAULTS = {
    acceptableDelims: ' -_./',
    normalize: true,
    normalizedDelim: '',
    lengths: [8, 12, 13, 14]
} satisfies GtinOptions;

export const HEX_DEFAULTS = {
    normalize: true
} satisfies HexOptions;

export const IMEI_DEFAULTS = {
    acceptableDelims: ' -_./',
    normalize: true,
    normalizedDelim: '',
} satisfies ImeiOptions;

export const IP_DEFAULTS = {
    normalize: true
} satisfies IpOptions;

export const LABEL_DEFAULTS = {
    normalize: true
} satisfies LabelOptions;

export const MAC_DEFAULTS = {
    acceptableDelims: ': -_./',
    normalize: true,
    normalizedDelim: ':',
} satisfies MacOptions;

export const MEASUREMENT_DEFAULTS = {
    units: ['cm']
} satisfies Partial<MeasurementOptions>;

export const MONEY_DEFAULTS = {
    parens: 'forbidden' as Presence,
    leadingSymbols: ['$'],
    trailingSymbols: [],
} satisfies MoneyOptions;

export const NUMERIC_DEFAULTS = {
    plus: 'optional',
    minus: 'optional',
    alignment: 'left',
    min: null,
    max: null,
    decimal: 'optional',
    thousandsDelim: ',',
    decimalDelim: '.',
    minPrecision: null,
    maxPrecision: null,
    leadingZero: 'optional',
    trailingZero: 'optional',
    leadingSymbols: [''],
    trailingSymbols: [''],
    looseSpacing: false,
} satisfies NumericOptions;

export const ONLY_CHARS_DEFAULTS = {
    ignoreCase: false,
} satisfies OnlyCharsOptions;

export const PATH_DEFAULTS = {
    absolute: 'required' as Presence,
    extensions: [],
    normalize: true,
    segmentMaxLen: 100,
    style: 'unix',
} satisfies PathOptions;

export const PHONE_DEFAULTS = {
    acceptableDelims: ' -_./',
    normalize: true,
    normalizedDelim: '-',
} satisfies PhoneOptions;

export const REPEAT_DEFAULTS = {
    ignoreCase: false,
    otherText: true,
} satisfies RepeatOptions;

export const SSN_DEFAULTS = {
    acceptableDelims: ' -_./',
    normalize: true,
    normalizedDelim: '-',
} satisfies SsnOptions;

export const STARTS_WITH_DEFAULTS = {
    ignoreCase: false
} satisfies StartsWithOptions;

export const STATE_DEFAULTS = {
    ignoreCase: false,
    normalize: true,
} satisfies StateOptions;

export const URL_DEFAULTS = {
    allowedProtocols: ['http', 'https'],
    domain: 'optional' as Presence,
    fragment: 'optional' as Presence,
    ip: 'optional' as Presence,
    label: 'forbidden' as Presence,
    normalize: true,
    port: 'forbidden' as Presence,
    protocols: 'optional' as Presence,
    query: 'optional' as Presence,
    rootRelative: false
} satisfies UrlOptions;

export const UUID_DEFAULTS = {
    acceptableDelims: ' -_./',
    normalize: true,
    normalizedDelim: '-',
    version: null
} satisfies UuidOptions;

export const ZIP_DEFAULTS = {
    acceptableDelims: ' -_./',
    normalize: true,
    normalizedDelim: '-',
    zip4: 'optional' as Presence
} satisfies ZipOptions;

export const TO_DELIMITED_DEFAULTS = {
    fromDelims: null,
    toDelim: '',
    transformer1: (x: string): string => x,
    transformer2: (x: string): string => x,
    transformerSwitchIndex: null
} satisfies ToDelimitedOptions;

const { pass, fail } = ChainHandlerResult;

class StringHandler extends ChainHandler {

    protected _matchingDefaults: Partial<GenericMatchOptions & IgnoreCaseOption> | undefined;
    protected _numberHandler: NumberHandler;

    constructor() {
        super();
        this._numberHandler = new NumberHandler();
    }

    public configMatchingDefaults(matchingDefaults: Partial<GenericMatchOptions & IgnoreCaseOption>): void {
        this._matchingDefaults = matchingDefaults;
    }

    // ====================================
    // VALIDATORS
    // ====================================


    /**
     * Validates that the string contains only alphabetic letters.
     * @param str The input string.
     */
    public alpha(str: string): StringHandlerResult {
        return /^[A-Z]+$/i.test(str)
            ? pass(str)
            : fail(str, 'string/alpha');
    }

    /**
     * Validates that the string contains only letters and digits.
     * @param str The input string.
     */
    public alphanumeric(str: string): StringHandlerResult {
        return /^[A-Z0-9]+$/i.test(str)
            ? pass(str)
            : fail(str, 'string/alphanumeric');
    }

    /**
     * Validates that the string contains only ASCII characters.
     * @param str The input string.
     */
    public ascii(str: string): StringHandlerResult {
        return /^[\x00-\x7F]*$/.test(str)
            ? pass(str)
            : fail(str, 'string/ascii');
    }

    /**
     * Validates that opening and closing characters are balanced in the string.
     * @param str The input string.
     * @param openChar The opening character to track.
     * @param closeChar The closing character to track.
     */
    public balanced(str: string, openChar: string = '(', closeChar: string = ')'): StringHandlerResult {
        let openCount = 0;
        for (let index = 0, max = str.length; index < max; ++index) {
            const char = str[index];
            if (char === openChar) {
                openCount++;
            }
            else if (char === closeChar) {
                openCount--;
            }
            if (openCount < 0) {
                return fail(str, 'string/balanced/negative', {
                    openChar,
                    closeChar,
                    openCount
                });
            }
        }
        return openCount === 0
            ? pass(str)
            : fail(str, 'string/balanced/positive', {
                openChar,
                closeChar,
                openCount
            });
    }

    /**
     * Validates that the string is a properly padded Base64 sequence.
     * @param str The input string.
     */
    public base64(str: string): StringHandlerResult {
        return /^[A-Za-z0-9+/]+={0,2}$/.test(str) && str.length % 4 === 0
            ? pass(str)
            : fail(str, 'string/base64');
    }


    /**
     * Validates that the string contains only binary digits.
     * @param str The input string.
     */
    public binary(str: string): StringHandlerResult {
        return /^[01]+$/.test(str)
            ? pass(str)
            : fail(str, 'string/binary');
    }

    /**
     * Validates that all characters are within the Basic Multilingual Plane.
     * @param str The input string.
     */
    public bmp(str: string): StringHandlerResult {
        return /^[\u0000-\uFFFF]*$/u.test(str)
            ? pass(str)
            : fail(str, 'string/bmp');
    }

    /**
     * Validates password-style complexity requirements.
     * @param str The input string.
     * @param options Complexity thresholds and limits. Defaults are provided by {@link COMPLEX_DEFAULTS}.
     */
    public complex(str: string, options: Partial<ComplexOptions> = {}): StringHandlerResult {
        const resolvedOptions: ComplexOptions = Object.assign({}, COMPLEX_DEFAULTS, options);

        const {
            minLength,
            maxLength,
            minLowercase,
            minUppercase,
            minDigits,
            minSpecialChars,
            maxRepeats
        } = resolvedOptions;

        let length = str.length, numLowerCase = 0, numUppercase = 0, numDigits = 0, numSpecials = 0;
        if (length < minLength || length > maxLength) {
            return fail(str, 'string/complex/length', resolvedOptions);
        }

        (str.match(/[A-Z]/g) || []).forEach((_: string): void => { ++numUppercase; }); // count uppercase letters
        if (numUppercase < minUppercase) {
            return fail(str, 'string/complex/uppercase', resolvedOptions);
        }
        (str.match(/[a-z]/g) || []).forEach((_: string): void => { ++numLowerCase; }); // count lowercase letters
        if (numLowerCase < minLowercase) {
            return fail(str, 'string/complex/lowercase', resolvedOptions);
        }
        (str.match(/\d/g) || []).forEach((_: string): void => { ++numDigits; });   // count digits
        if (numDigits < minDigits) {
            return fail(str, 'string/complex/digits', resolvedOptions);
        }
        (str.match(/[^a-z0-9]/ig) || []).forEach((_: string): void => { ++numSpecials; }); // count specials
        if (numSpecials < minSpecialChars) {
            return fail(str, 'string/complex/specialChars', resolvedOptions);
        }
        const failsRepeat = RegexCache.get('(.)\\1{' + maxRepeats + '}', 'g').test(str); // check repeats
        if (failsRepeat) {
            return fail(str, 'string/complex/repeats', resolvedOptions);
        }

        return pass(str);
    }

    /**
     * Validates that the input contains a target substring.
     * @param str The input string.
     * @param substring The substring that must appear.
     * @param options Matching options. Defaults are provided by {@link CONTAINS_DEFAULTS}.
     */
    public contains(str: string, substring: string, options: Partial<ContainsOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            CONTAINS_DEFAULTS,
            this._matchingDefaults,
            options
        );

        if (resolvedOptions.ignoreCase) {
            str = str.toLowerCase();
            substring = substring.toLowerCase();
        }

        return str.indexOf(substring) !== -1
            ? pass(str)
            : fail(str, 'string/contains', Object.assign({ substring }, resolvedOptions));
    }

    /**
     * Validates and normalizes supported credit card numbers.
     * @param str The input string.
     * @param options Card matching and normalization options. Defaults are provided by {@link CREDIT_CARD_DEFAULTS}.
     */
    public creditCard(str: string, options: Partial<CreditCardOptions> = {}): StringHandlerResult {

        const resolvedOptions = Object.assign(
            {},
            CREDIT_CARD_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const allTypes: [string, string[], boolean][] = [
            // visa 4(13 or 16 total)
            [
                'visa',
                ['(4\\d{3})', '(\\d{4})', '(\\d{4})', '(\\d{4}|\\d)'],
                true,
            ],

            // mastercard (2221–2720)(16 total) or (51-55)(16 total)
            [
                'mastercard',
                [
                    '(5[1-5]\\d{2}|2(?:2[2-9]\\d|[3-6]\\d{2}|7[01]\\d|720))',
                    '(\\d{4})',
                    '(\\d{4})',
                    '(\\d{4})',
                ],
                true,
            ],

            // amex (34,37)(15 total) 
            [
                'amex',
                ['(3[47]\\d{2})', '(\\d{6})', '(\\d{5})'],
                true,
            ],

            // discover (6011,644-649,65)(16 total) or (622126–622925)(16-19 total)
            [
                'discover',
                [
                    '(6(?:011|5\\d{2}|4[4-9]\\d|22[1-9]\\d|22[2-9]\\d{2}))',
                    '(\\d{4})',
                    '(\\d{4})',
                    '(\\d{4})',
                    '(\\d{1,3})?'
                ],
                true,
            ],

            // diners classic 14 digits 
            [
                'diners',
                ['(30[0-5]\\d|3[689]\\d{2})', '(\\d{6})', '(\\d{4})'],
                true,
            ],

            // diners 16 digits 
            [
                'diners16',
                ['(5[4-5]\\d{2})', '(\\d{4})', '(\\d{4})', '(\\d{4})'],
                true,
            ],

            // jcb (3528–3589)(16-19 total) or (353,356)(16 total)
            [
                'jcb',
                ['(352[89]|35[3-8]\\d)', '(\\d{4})', '(\\d{4})', '(\\d{4})', '(\\d{0,3})'],
                true,
            ],

        ];

        const {
            normalize,
            normalizedDelim,
            types
        } = resolvedOptions;

        for (const [type, regexParts, checkLuhn] of allTypes) {
            if (types.length > 0 && types.indexOf(type) === -1) {
                continue;
            }
            const [normalized, suggestion] = Utils.regexMatch(str, regexParts, resolvedOptions);
            if (normalized !== null) {
                if (checkLuhn && !this.luhn(normalized.replace(new RegExp(Utils.escapeForRegex(normalizedDelim), 'g'), ''),).pass) {
                    return fail(str, 'string/creditCard', Object.assign({ suggestion }, resolvedOptions));
                }
                return pass(normalize ? normalized : str);
            }
        }

        return fail(str, 'string/creditCard', resolvedOptions);
    }

    /**
     * Validates that the input is a supported ISO currency code.
     * @param str The input string.
        * @param options Case and normalization options. Defaults are provided by {@link CURRENCY_CODE_DEFAULTS}.
     */
    public currencyCode(str: string, options: Partial<CurrencyCodeOptions> = {}): StringHandlerResult {

        const resolvedOptions = Object.assign(
            {},
            CURRENCY_CODE_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const codes = ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT',
            'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD',
            'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'COP', 'COU', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK',
            'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF',
            'GTQ', 'GYD', 'HKD', 'HNL', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD',
            'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD',
            'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN',
            'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP',
            'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'CNY', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK',
            'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT',
            'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'UYI', 'UYU', 'UYW', 'UZS',
            'VED', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR',
            'XOF', 'XPD', 'XPF', 'XPT', 'XSU', 'XTS', 'XUA', 'XXX', 'YER', 'ZAR', 'ZMW', 'ZWL'
        ];

        const uppercase = resolvedOptions.ignoreCase ? str.toUpperCase() : str;
        return codes.indexOf(uppercase) > -1
            ? pass(resolvedOptions.normalize ? str.toUpperCase() : str)
            : fail(str, 'string/currencyCode', resolvedOptions);
    }

    /**
     * Validates that the input is a base64 data URL of an allowed media type.
     * @param str The input string.
        * @param options Allowed data URL media types. Defaults are provided by {@link DATA_URL_DEFAULTS}.
     */
    public dataUrl(str: string, options: Partial<DataUrlOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign({}, DATA_URL_DEFAULTS, options);

        return RegexCache.get([
            '^data:',
            `(${resolvedOptions.allowedTypes.join('|')})/([a-z0-9+.-]+)`,
            ';base64,',
            '([A-Za-z0-9+/=]+)',
            '$'
        ].join(''), 'i').test(str)
            ? pass(str)
            : fail(str, 'string/dataUrl', resolvedOptions);
    }

    /**
     * Validates that the string contains digits only.
     * @param str The input string.
     */
    public digits(str: string): StringHandlerResult {
        return /^\d+$/.test(str)
            ? pass(str)
            : fail(str, 'string/digits');
    }

    /**
     * Validates a domain name with optional wildcard and subdomain rules.
     * @param str The input string.
        * @param options Domain validation options. Defaults are provided by {@link DOMAIN_DEFAULTS}.
     */
    public domain(str: string, options: Partial<DomainOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign({}, DOMAIN_DEFAULTS, options);

        const {
            normalize,
            subdomains,
            wildcards
        } = resolvedOptions;

        const regexResult = RegexCache.get([
            `^`, (
                // Start with *. if allowed/'required'
                wildcards === 'optional' && '(?:\\*\\.)?'
                || wildcards === 'required' && '(?:\\*\\.)' || ''
            ),
            `(?=(`,
            // [a-z0-9-] up to 63 chars, can't start or end w/ dash
            `(?:[a-z\\d](?:[-a-z\\d]{0,61}[a-z\\d])?\\.)`, (
                subdomains === 'optional'
                && '+' || subdomains === 'required'
                && '{2,}' || '' // Subdomains or not
            ),
            `))\\1`,
            `(?!\\d+$)`, // TLD cannot be all digits
            `(?:[a-z\\d][-a-z\\d]{0,22}[a-z\\d])`, // TLD up to 24 chars
            `$`,
        ].join(''), 'i').test(str);

        return regexResult
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/domain', resolvedOptions);
    }


    /**
     * Validates and normalizes an E.123-style international phone number.
     * @param str The input string.
        * @param options Matching and normalization options. Defaults are provided by {@link E123_DEFAULTS}.
     */
    public e123(str: string, options: Partial<E123Options> = {}): StringHandlerResult {

        const resolvedOptions = Object.assign(
            {},
            E123_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const {
            mode,
            normalize,
        } = resolvedOptions;

        let [normalized, suggestion] = Utils.regexMatch(
            str,
            ['(?=\\+(?:\\D*\\d){7,15}$)(\\+\\d{1,3}(?:(?:', ')?\\d{1,14})+)'],
            resolvedOptions,
            false
        );

        if (normalized === null && mode === 'loose') {
            // Try match without + if in loose mode
            [normalized, suggestion] = Utils.regexMatch(
                str,
                ['(?=(?:\\D*\\d){7,15}$)(\\+\\d{1,3}(?:(?:', ')?\\d{1,14})+)'],
                resolvedOptions,
                false
            );
        }

        if (normalized === null) {
            return fail(str, 'string/e123', Object.assign({ suggestion }, resolvedOptions));
        }

        return pass(normalize ? normalized : str);
    }

    /**
     * Validates and normalizes an E.164 phone number.
     * @param str The input string.
        * @param options Matching and normalization options. Defaults are provided by {@link E164_DEFAULTS}.
     */
    public e164(str: string, options: Partial<E123Options> = {}): StringHandlerResult {

        const resolvedOptions = Object.assign(
            {},
            E164_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const {
            mode,
            normalize,
        } = resolvedOptions;

        let [normalized, suggestion] = Utils.regexMatch(
            str,
            ['(\\+\\d{7,15})'],
            resolvedOptions,
            false
        );

        if (normalized === null && mode === 'loose') {
            // Try match without + if in loose mode
            [normalized, suggestion] = Utils.regexMatch(
                str,
                ['(\\d{7,15})'],
                resolvedOptions,
                false
            );
        }

        if (normalized === null) {
            return fail(str, 'string/e164', Object.assign({ suggestion }, resolvedOptions));
        }

        return pass(normalize ? normalized : str);
    }


    // ------------------START NEW TESTS HERE
    /**
     * Validates an email address and optionally normalizes casing.
     * @param str The input string.
        * @param options Email validation options. Defaults are provided by {@link EMAIL_DEFAULTS}.
     */
    public email(str: string, options: Partial<EmailOptions> = {}): StringHandlerResult {

        const resolvedOptions = Object.assign(
            {},
            EMAIL_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const parts = str.split('@');

        // Make sure there are two parts and the domain passes
        if (parts.length !== 2 || this.domain(parts[1]).fail) {
            return fail(str, 'string/email', resolvedOptions);
        }

        const noDot = "[a-zA-Z0-9!#$%&'*+\\-/=?^_`{|}~]";
        const dot = "[a-zA-Z0-9!#$%&'*+\\-/=?^_`{|}~.]";
        const fullRegex = `^(?=(${noDot}+))\\1(?=(${dot}*${noDot}+)?)\\2$`;
        return RegexCache.get(fullRegex).test(parts[0])
            ? pass(resolvedOptions.normalize ? str.toLowerCase() : str)
            : fail(str, 'string/email', resolvedOptions);
    }

    /**
     * Validates that the input string is empty.
     * @param str The input string.
     */
    public empty(str: string): StringHandlerResult {
        return str.length === 0 ? pass(str) : fail(str, 'string/empty');
    }

    /**
     * Validates that the input ends with a suffix.
     * @param str The input string.
     * @param suffix The suffix that must appear at the end.
     * @param options Matching options. Defaults are provided by {@link ENDS_WITH_DEFAULTS}.
     */
    public endsWith(str: string, suffix: string, options: Partial<EndsWithOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            ENDS_WITH_DEFAULTS,
            this._matchingDefaults,
            options
        );

        if (resolvedOptions.ignoreCase) {
            str = str.toLowerCase();
            suffix = suffix.toLowerCase();
        }
        return str.endsWith(suffix)
            ? pass(str)
            : fail(str, 'string/endsWith', Object.assign({ suffix }, resolvedOptions));
    }

    /**
     * Validates that none of the provided characters appear in the input.
     * @param str The input string.
     * @param chars Characters that must be excluded.
     * @param options Matching options. Defaults are provided by {@link EXCLUDES_CHARS_DEFAULTS}.
     */
    public excludesChars(str: string, chars: string, options: Partial<ExcludesCharsOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            EXCLUDES_CHARS_DEFAULTS,
            this._matchingDefaults,
            options
        );

        return str.replace(
            RegexCache.get(
                `[${Utils.escapeForRegex(chars)}]`,
                'g' + (resolvedOptions.ignoreCase ? 'i' : '')
            ),
            ''
        ).length === str.length
            ? pass(str)
            : fail(str, 'string/excludesChars', Object.assign({ chars }, resolvedOptions));
    }


    /**
     * Validates and normalizes GTIN values.
     * @param str The input string.
     * @param options GTIN matching options. Defaults are provided by {@link GTIN_DEFAULTS}.
     */
    public gtin(str: string, options: Partial<GtinOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            GTIN_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const {
            lengths,
            normalize,
            normalizedDelim,
        } = resolvedOptions;

        const patterns = [];
        if (lengths.indexOf(8) > -1) {
            patterns.push(['(\\d{4})', '(\\d{4})']);
        }
        if (lengths.indexOf(12) > -1) {
            patterns.push(['(\\d)', '(\\d{5})', '(\\d{5})', '(\\d)']);
        }
        if (lengths.indexOf(13) > -1) {
            patterns.push(['(\\d)', '(\\d{6})', '(\\d{6})']);
        }
        if (lengths.indexOf(14) > -1) {
            patterns.push(['(\\d)', '(\\d{6})', '(\\d{6})', '(\\d)']);
        }

        for (const regex of patterns) {
            const [normalized, suggestion] = Utils.regexMatch(
                str,
                regex,
                resolvedOptions
            );

            if (normalized !== null) {
                if (!Utils.validateWithCheckDigit(
                    normalized.replace(new RegExp(Utils.escapeForRegex(normalizedDelim), 'g'), ''),
                    {
                        weights: [3, 1],
                        reverse: true
                    }
                )) {
                    return fail(str, 'string/gtin', Object.assign({ lengths, suggestion }, resolvedOptions));
                }
                return pass(
                    normalize ? normalized : str
                );
            }
        }

        return fail(str, 'string/gtin', resolvedOptions);
    }


    public hash(str: string, algorithm: string): StringHandlerResult {
        const algo = (algorithm || 'md5').toLowerCase();
        const hashLengths = {
            md5: 32, sha1: 40, sha256: 64, sha512: 128, ripemd: 32,
            ripemd128: 32, ripemd160: 40, ripemd320: 80, tiger128: 32,
            tiger160: 40, tiger192: 48, whirlpool: 128
        };
        const key = algo as keyof typeof hashLengths;
        return hashLengths[key]
            ? RegexCache.get(`^(?=([a-f\\d]{${hashLengths[key]}}))\\1$`, 'i').test(str)
                ? pass(str)
                : fail(str, 'string/hash', { algorithm })
            : fail(str, 'string/hash', { algorithm });
    }

    /**
     * Validates hexadecimal text.
     * @param str The input string.
     * @param options Normalization options. Defaults are provided by {@link HEX_DEFAULTS}.
     */
    public hex(str: string, options: Partial<HexOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            HEX_DEFAULTS,
            this._matchingDefaults,
            options
        );
        return /^[0-9A-F]+$/i.test(str)
            ? pass(resolvedOptions.normalize ? str.toLowerCase() : str)
            : fail(str, 'string/hex', resolvedOptions);
    }


    /**
     * Validates hex color text (#RGB or #RRGGBB).
     * @param str The input string.
     * @param options Normalization options. Defaults are provided by {@link HEX_DEFAULTS}.
     */
    public hexColor(str: string, options: Partial<HexOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            HEX_DEFAULTS,
            this._matchingDefaults,
            options
        );
        return /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(str)
            ? pass(resolvedOptions.normalize ? str.toLowerCase() : str)
            : fail(str, 'string/hexColor', resolvedOptions);
    }

    /**
     * Validates and normalizes IMEI values.
     * @param str The input string.
     * @param options IMEI matching options. Defaults are provided by {@link IMEI_DEFAULTS}.
     */
    public imei(str: string, options: Partial<ImeiOptions> = {}): StringHandlerResult {

        const resolvedOptions = Object.assign(
            {},
            IMEI_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const [normalized, suggestion] = Utils.regexMatch(
            str,
            ['(\\d{2})', '(\\d{6})', '(\\d{6})', '(\\d)'],
            resolvedOptions
        );

        if (normalized !== null) {
            if (this.luhn(
                normalized.replace(new RegExp(Utils.escapeForRegex(resolvedOptions.normalizedDelim), 'g'), '')
            ).pass) {
                return pass(
                    resolvedOptions.normalize ? normalized : str
                );
            }
        }
        return fail(str, 'string/imei', Object.assign({ suggestion }, resolvedOptions));
    }

    /**
     * Validates IPv4 or IPv6 input.
     * @param str The input string.
     * @param options Normalization options. Defaults are provided by {@link IP_DEFAULTS}.
     */
    public ip(str: string, options: Partial<IpOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            IP_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const ipV4Test = this.ipV4(str);
        if (ipV4Test.pass) {
            return pass(resolvedOptions.normalize ? str.toLowerCase() : str);
        }

        const ipV6Test = this.ipV6(str);
        if (ipV6Test.pass) {
            return pass(resolvedOptions.normalize ? str.toLowerCase() : str);
        }

        return fail(str, 'string/ip', resolvedOptions);
    }

    public ipCidr(str: string): StringHandlerResult {
        return this.ipCidrV4(str).pass || this.ipCidrV6(str).pass
            ? pass(str)
            : fail(str, 'string/ipCidr');
    }

    public ipCidrV4(str: string): StringHandlerResult {
        const parts = str.split('/');
        if (parts.length !== 2) {
            return fail(str, 'string/ipCidrV4');
        }
        const num = Utils.parseNumber(parts[1]);
        return num !== null && this.ipV4(parts[0]).pass && this._numberHandler.between(num, 0, 32).pass
            ? pass(str)
            : fail(str, 'string/ipCidrV4');
    }

    public ipCidrV6(str: string): StringHandlerResult {
        const parts = str.split('/');
        if (parts.length !== 2) {
            return fail(str, 'string/ipCidrV6');
        }
        const num = Utils.parseNumber(parts[1]);
        return num !== null && this.ipV6(parts[0]).pass && this._numberHandler.between(num, 0, 128).pass
            ? pass(str)
            : fail(str, 'string/ipCidrV6');
    }

    /**
     * Validates IPv4 input.
     * @param str The input string.
     * @param options Normalization options. Defaults are provided by {@link IP_DEFAULTS}.
     */
    public ipV4(str: string, options: Partial<IpOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            IP_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const digits = '(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])';
        return RegexCache.get(`^${digits}\\.${digits}\\.${digits}\\.${digits}$`).test(str)
            ? pass(resolvedOptions.normalize ? str.toLowerCase() : str)
            : fail(str, 'string/ipV4', resolvedOptions);
    }

    /**
     * Validates IPv6 input.
     * @param str The input string.
     * @param options Normalization options. Defaults are provided by {@link IP_DEFAULTS}.
     */
    public ipV6(str: string, options: Partial<IpOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            IP_DEFAULTS,
            this._matchingDefaults,
            options
        );
        const digits = '(?:\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])';
        const v4 = `${digits}\\.${digits}\\.${digits}\\.${digits}`;
        const hex = '[0-9a-f]{1,4}';
        const condensed = `(?=.*?::)(?!.*?::.*?::)`;
        const v6 = [
            `^(?:(?:${hex}:){7}${hex})$`, // standard: 1111:2222:3333:4444:5555:6666:7777:8888
            `^(?:::|${condensed}(?:::)?(?:${hex}::?){0,6}${hex}(?:::)?)$`, // condensed: 1111::3333, ::, a:b:c:d::, fe80::1
            `^(?:(?:[a-f0-9]{1,4}:){6}${v4})$`, // dual v4: 1:2:3:4:5:6:127.0.0.1
            `^(?:${condensed}(?:::)?(?:${hex}::?){0,5}${v4})$`, // dual v4 condensed: ::1.2.3.4, a:b::127.0.0.1
        ].join('|');

        return RegexCache.get(v6, 'i').test(str)
            ? pass(resolvedOptions.normalize ? str.toLowerCase() : str)
            : fail(str, 'string/ipV6', resolvedOptions);
    }

    public json(str: string): StringHandlerResult {
        try { JSON.parse(str); } catch (e) { return fail(str, 'string/json'); }
        return pass(str);
    }

    public jwt(str: string): StringHandlerResult {
        return /^(?=((?:[a-z\d_=-]+\.){2}[a-z\d_=-]+))\1$/i.test(str)
            ? pass(str)
            : fail(str, 'string/jwt');
    }

    /**
     * Validates DNS label-like input.
     * @param str The input string.
     * @param options Normalization options. Defaults are provided by {@link LABEL_DEFAULTS}.
     */
    public label(str: string, options: Partial<LabelOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            LABEL_DEFAULTS,
            this._matchingDefaults,
            options
        );

        if (
            !this.lengthBetween(str, 1, 63).pass
            || str.startsWith('-')
            || str.endsWith('-')
        ) {
            return fail(str, 'string/label', resolvedOptions);
        }

        return /^(?=([a-z0-9\-]+))\1$/i.test(str)
            ? pass(resolvedOptions.normalize ? str.toLowerCase() : str)
            : fail(str, 'string/label', resolvedOptions);
    }

    public length(str: string, length: number): StringHandlerResult {
        return str.length === length
            ? pass(str)
            : fail(str, 'string/length', { length });
    }

    public lengthBetween(str: string, min: number, max: number): StringHandlerResult {
        if (str.length >= min && str.length <= max) {
            return pass(str);
        }
        return fail(str, 'string/lengthBetween', { min, max });
    }

    public lowerCase(str: string): StringHandlerResult {
        return str === str.toLowerCase()
            ? pass(str)
            : fail(str, 'string/lowerCase');
    }

    public luhn(str: string): StringHandlerResult {
        return Utils.validateWithCheckDigit(str, {
            weights: [2, 1],
            mod: 10,
            transform: (x: number): number => x > 9 ? x - 9 : x,
            reverse: true
        })
            ? pass(str)
            : fail(str, 'string/luhn');
    }

    /**
     * Validates and normalizes MAC addresses.
     * @param str The input string.
     * @param options Matching options. Defaults are provided by {@link MAC_DEFAULTS}.
     */
    public mac(str: string, options: Partial<MacOptions> = {}): StringHandlerResult {

        const resolvedOptions = Object.assign(
            {},
            MAC_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const {
            normalize,
        } = resolvedOptions;

        let [normalized, suggestion] = Utils.regexMatch(
            str,
            new Array(6).fill('([a-fA-F\\d]{2})'),
            resolvedOptions
        );

        if (normalized === null) {
            return fail(str, 'string/mac', Object.assign({ suggestion }, resolvedOptions));
        }

        return pass(normalize ? normalized.toLowerCase() : str);
    }

    public matches(str: string, regex: RegExp): StringHandlerResult {
        return regex.test(str)
            ? pass(str)
            : fail(str, 'string/matches', { regex: regex.toString() });
    }

    public maxLength(str: string, max: number): StringHandlerResult {
        return str.length <= max
            ? pass(str)
            : fail(str, 'string/maxLength', { max });
    }

    public maxWords(str: string, max: number, delim: string = ' '): StringHandlerResult {
        const count = str.split(delim).length;
        return count <= max
            ? pass(str)
            : fail(str, 'string/maxWords', {
                count,
                max,
                delim
            });
    }

    /**
     * Validates measurement-like numeric strings.
     * @param str The input string.
     * @param options Measurement options. Defaults are provided by {@link MEASUREMENT_DEFAULTS}.
     */
    public measurement(str: string, options: Partial<MeasurementOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            MEASUREMENT_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const {
            units
        } = resolvedOptions;

        const mergedOptions = Object.assign({
            trailingSymbols: units
        }, resolvedOptions);

        const result = this.numeric(str, mergedOptions);
        return result.pass
            ? pass(result.value)
            : fail(str, 'string/measurement', resolvedOptions);

    }

    public minLength(str: string, min: number): StringHandlerResult {
        return str.length >= min
            ? pass(str)
            : fail(str, 'string/minLength', { min });
    }

    public minWords(str: string, min: number, delim: string = ' '): StringHandlerResult {
        const count = str.split(delim).length;
        return count >= min
            ? pass(str)
            : fail(str, 'string/minWords', {
                count,
                min,
                delim
            });
    }

    /**
     * Validates money-formatted strings.
     * @param str The input string.
     * @param options Money format options. Defaults are provided by {@link MONEY_DEFAULTS}.
     */
    public money(str: string, options: Partial<MoneyOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            MONEY_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const {
            parens,
            leadingSymbols,
            trailingSymbols
        } = resolvedOptions;

        if (parens !== 'required') {
            const result = this.numeric(str, resolvedOptions);
            if (result.pass) {
                return pass(result.value);
            }
            else if (parens === 'forbidden') {
                return fail(str, 'string/money', resolvedOptions);
            }
        }

        // We need to append/prepend the parens to each leading/trailing symbol...
        // If they are blank, need to add in a blank string to the list so that we can still match the parens

        const result = this.numeric(str, Object.assign({}, resolvedOptions, {
            leadingSymbols: leadingSymbols.length > 0
                ? leadingSymbols.map(str => '(' + str)
                : ['('],
            trailingSymbols: trailingSymbols.length > 0
                ? trailingSymbols.map(str => str + ')')
                : [')'],
        }));

        return result.pass
            ? pass(result.value)
            : fail(str, 'string/money', resolvedOptions);
    }


    public notEmpty(value: string): StringHandlerResult {
        return value.length > 0 ? pass(value) : fail(value, 'string/notEmpty');
    }


    /**
     * Validates numeric-format strings with configurable rules.
     * @param str The input string.
     * @param options Numeric format options. Defaults are provided by {@link NUMERIC_DEFAULTS}.
     */
    public numeric(str: string, options: Partial<NumericOptions> = {}): StringHandlerResult {
        const resolvedOptions: NumericOptions = Object.assign(
            {},
            NUMERIC_DEFAULTS,
            this._matchingDefaults || {},
            options
        );

        const {
            plus,
            minus,
            alignment,
            min,
            max,
            decimal,
            thousandsDelim,
            decimalDelim,
            minPrecision,
            maxPrecision,
            leadingZero,
            trailingZero,
            leadingSymbols,
            trailingSymbols,
            looseSpacing
        } = resolvedOptions;

        const looseRegex = looseSpacing ? '\\s*' : '';
        const parts = RegexCache.get(
            '^(\\+?)(-?)'
            + looseRegex
            + (leadingSymbols.length > 0
                ? `(${leadingSymbols.map(Utils.escapeForRegex).join('|')})`
                : '')
            + looseRegex
            + '(.+?)'
            + looseRegex
            + (trailingSymbols.length > 0
                ? `(${trailingSymbols.map(Utils.escapeForRegex).join('|')})`
                : '')
            + looseRegex
            + '(\\+?)(-?)$'
        ).exec(str);

        if (!parts) {
            return fail(str, 'string/numeric/base', resolvedOptions);
        }

        const [
            ,
            leftPlus = '',
            leftMinus = '',
            leadingSymbol = '',
            number = '',
            trailingSymbol = '',
            rightPlus = '',
            rightMinus = ''
        ] = parts;
        const [plusStr, minusStr] = alignment === 'left' ? [leftPlus, leftMinus] : [rightPlus, rightMinus];

        // Sign checks
        if (
            (alignment === 'left' && (rightPlus || rightMinus)) ||
            (alignment === 'right' && (leftPlus || leftMinus))
        ) {
            return fail(str, 'string/numeric/missingSign', resolvedOptions);
        }
        if (plus === 'required' && !plusStr) {
            return fail(str, 'string/numeric/missingPlusSign', resolvedOptions);
        }
        if (plus === 'forbidden' && plusStr) {
            return fail(str, 'string/numeric/forbiddenPlusSign', resolvedOptions);
        }
        if (minus === 'required' && !minusStr) {
            return fail(str, 'string/numeric/missingMinusSign', resolvedOptions);
        }
        if (minus === 'forbidden' && minusStr) {
            return fail(str, 'string/numeric/forbiddenMinusSign', resolvedOptions);
        }

        // Split into integral and fractional parts
        const [
            integral = '',
            fractional = ''
        ] = number.split(decimalDelim, 2);

        if (decimal === 'forbidden' && fractional !== '') {
            return fail(str, 'string/numeric/forbiddenDecimal', resolvedOptions);
        }
        if (decimal === 'required' && fractional === '') {
            return fail(str, 'string/numeric/missingDecimal', resolvedOptions);
        }

        // Integral check
        let integralRegex = thousandsDelim
            ? `^(|0|[1-9]\\d{0,2}(?:${Utils.escapeForRegex(thousandsDelim)}\\d{3})*)$`
            : '^(\\d*)$';
        const integralMatch = RegexCache.get(integralRegex).exec(integral);
        if (!integralMatch) {
            return fail(str, 'string/numeric/invalidIntegral', resolvedOptions);
        }

        // Leading 0 check
        if (leadingZero === 'required' && integral === '') {
            return fail(str, 'string/numeric/missingLeadingZero', resolvedOptions);
        }
        if (leadingZero === 'forbidden' && integral === '0') {
            return fail(str, 'string/numeric/forbiddenLeadingZero', resolvedOptions);
        }

        // Fractional check
        const fractionalMatch = RegexCache.get(
            `^(\\d{${minPrecision !== null ? minPrecision : 0},${maxPrecision !== null ? maxPrecision : ''}})$`
        ).exec(fractional);

        if (!fractionalMatch) {
            return fail(str, 'string/numeric/invalidFractional', resolvedOptions);
        }

        // Fractional 0 check
        if (trailingZero === 'required' && fractional === '') {
            return fail(str, 'string/numeric/missingTrailingZero', resolvedOptions);
        }
        if (trailingZero === 'forbidden' && fractional === '0') {
            return fail(str, 'string/numeric/forbiddenTrailingZero', resolvedOptions);
        }

        // Get the full number and check min/max
        const integralNumPlain = integral.replace(new RegExp(Utils.escapeForRegex(thousandsDelim), 'g'), '');
        const fullNumber = Number(
            plusStr + minusStr + (integralNumPlain || '0') + '.' + (fractional || '0')
        );
        if (isNaN(fullNumber)) {
            return fail(str, 'string/numeric/base', resolvedOptions);
        }
        if (min !== null && fullNumber < min) {
            return fail(str, 'string/numeric/min', resolvedOptions);
        }
        if (max !== null && fullNumber > max) {
            return fail(str, 'string/numeric/max', resolvedOptions);
        }

        return pass(leftPlus + leftMinus + leadingSymbol + number + trailingSymbol + rightPlus + rightMinus);
    }

    public octal(str: string): StringHandlerResult {
        return /^[0-7]+$/.test(str)
            ? pass(str)
            : fail(str, 'string/octal');
    }

    /**
     * Validates that all characters are from an allowed set.
     * @param str The input string.
     * @param chars Allowed characters.
     * @param options Matching options. Defaults are provided by {@link ONLY_CHARS_DEFAULTS}.
     */
    public onlyChars(str: string, chars: string, options: Partial<OnlyCharsOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            ONLY_CHARS_DEFAULTS,
            this._matchingDefaults,
            options
        );

        return str.replace(
            RegexCache.get(
                `[${Utils.escapeForRegex(chars)}]`,
                'g' + (resolvedOptions.ignoreCase ? 'i' : '')
            ),
            ''
        ).length === 0
            ? pass(str)
            : fail(str, 'string/onlyChars', Object.assign({ chars }, resolvedOptions));
    }


    /**
     * Validates path-like strings.
     * @param str The input string.
     * @param options Path validation options. Defaults are provided by {@link PATH_DEFAULTS}.
     */
    public path(str: string, options: Partial<PathOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            PATH_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const {
            absolute,
            extensions,
            normalize,
            segmentMaxLen,
            style,
        } = resolvedOptions;

        let startRegex, forbidden, separator;

        if (style === 'unix') {
            forbidden = '/\\x00';
            separator = '\\/';

            if (absolute === 'required') {
                startRegex = separator;
            }
            else if (absolute === 'optional') {
                startRegex = `(?:${separator})?`;
            }
            else {
                startRegex = '';
            }
        }
        else {
            separator = '\\\\';
            forbidden = '\\x00-\\x1F\\\\/:*?"<>|';
            if (style === 'win-unc') {
                startRegex = `\\\\\\\\[a-z0-9 %._~-]{1,63}\\\\[a-z0-9 $%._~-]{1,80}${separator}`;
            }
            else if (style === 'win') {
                startRegex = `[a-z]:${separator}`;
            }

            if (absolute === 'optional') {
                startRegex = `(?:${startRegex})?`;
            }
            else if (absolute === 'forbidden') {
                startRegex = '';
            }
        }

        const fileNameRegex = `[^\\.${forbidden}]{1,${segmentMaxLen}}`;
        const folderRegex = `(?:[^${forbidden}]{1,${segmentMaxLen}}${separator})*`;
        let fileRegex;
        if (extensions.indexOf('.*') !== -1) {
            fileRegex = `${fileNameRegex}\\.[a-z0-9]+`;
        }
        else if (extensions.length > 0) {
            fileRegex = `${fileNameRegex}(?:${extensions.map(ext => Utils.escapeForRegex(ext)).join('|')})`;
        }
        else {
            fileRegex = `(?:${fileNameRegex}\\.[a-z0-9]+)?`;
        }

        const fullRegex =
            '^(' +
            '?=(' +
            startRegex +
            folderRegex +
            fileRegex +
            '))\\1' +
            '$';
        console.log(fullRegex);
        return RegexCache.get(fullRegex, 'i').test(str)
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/path', resolvedOptions)
    }

    /**
     * Validates and normalizes phone numbers.
     * @param str The input string.
     * @param options Matching options. Defaults are provided by {@link PHONE_DEFAULTS}.
     */
    public phone(str: string, options: Partial<PhoneOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            PHONE_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const [normalized, suggestion] = Utils.regexMatch(
            str,
            ['(?:\\+?1)?\\(?(\\d{3})\\)?', '(\\d{3})', '(\\d{4})'],
            resolvedOptions
        );

        if (normalized === null) {
            return fail(str, 'string/phone', Object.assign({ suggestion }, resolvedOptions));
        }

        return pass(resolvedOptions.normalize ? normalized : str);
    }


    /**
     * Validates repeated fragment usage.
     * @param str The input string.
     * @param fragment The fragment to count.
     * @param min Minimum repeats required.
     * @param max Maximum repeats allowed.
     * @param options Repeat options. Defaults are provided by {@link REPEAT_DEFAULTS}.
     */
    public repeats(
        str: string,
        fragment: string,
        min: number = 1,
        max: number | null = null,
        options: Partial<RepeatOptions> = {}
    ): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            REPEAT_DEFAULTS,
            options
        );

        const {
            ignoreCase,
            otherText,
        } = resolvedOptions;

        if (!otherText) {
            const fullRegex = `^(?=((${Utils.escapeForRegex(fragment)}){${min},${max === null ? '' : max}}))\\1$`;
            return RegexCache.get(fullRegex, (ignoreCase ? 'i' : '')).test(str) && str
                ? pass(str)
                : fail(str, 'string/repeats', Object.assign({ fragment, min, max }, resolvedOptions));
        }

        // Use some math to calculate if within repeats min/max
        const minChars = fragment.length * min;
        const maxChars = max !== null ? fragment.length * max : null;
        const difference =
            str.length -
            str.replace(RegexCache.get(Utils.escapeForRegex(fragment), 'g' + (ignoreCase ? 'i' : '')), '').length;

        return difference >= minChars && (maxChars === null || difference <= maxChars)
            ? pass(str)
            : fail(str, 'string/repeats', Object.assign({ fragment, min, max }, resolvedOptions));
    }


    public slug(str: string): StringHandlerResult {
        return /^(?=([a-z\d]+(-[a-z\d]+)*))\1$/.test(str)
            ? pass(str)
            : fail(str, 'string/slug');
    }

    /**
     * Validates and normalizes U.S. SSN values.
     * @param str The input string.
     * @param options Matching options. Defaults are provided by {@link SSN_DEFAULTS}.
     */
    public ssn(str: string, options: Partial<SsnOptions> = {}): StringHandlerResult {

        const resolvedOptions = Object.assign(
            {},
            SSN_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const [normalized, suggestion] = Utils.regexMatch(
            str,
            ['((?!000|666|9\\d{2})\\d{3})', '((?!00)\\d{2})', '((?!0000)\\d{4})'],
            resolvedOptions
        );

        if (normalized === null) {
            return fail(str, 'string/ssn', Object.assign({ suggestion }, resolvedOptions));
        }

        return pass(resolvedOptions.normalize ? normalized : str);
    }


    /**
     * Validates that the input starts with a prefix.
     * @param str The input string.
     * @param prefix The prefix that must appear at the start.
     * @param options Matching options. Defaults are provided by {@link STARTS_WITH_DEFAULTS}.
     */
    public startsWith(str: string, prefix: string, options: Partial<StartsWithOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            STARTS_WITH_DEFAULTS,
            this._matchingDefaults,
            options
        );

        if (resolvedOptions.ignoreCase) {
            str = str.toLowerCase();
            prefix = prefix.toLowerCase();
        }
        return str.startsWith(prefix)
            ? pass(str)
            : fail(str, 'string/startsWith', Object.assign({ prefix }, resolvedOptions));
    }

    /**
     * Validates U.S. state abbreviations.
     * @param str The input string.
     * @param options Matching options. Defaults are provided by {@link STATE_DEFAULTS}.
     */
    public state(str: string, options: Partial<StateOptions> = {}): StringHandlerResult {

        const resolvedOptions = Object.assign(
            {},
            STATE_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
            'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
            'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
            'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
            'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ];

        const search = resolvedOptions.ignoreCase ? str.toUpperCase() : str;
        return states.indexOf(search) > -1
            ? pass(resolvedOptions.normalize ? str.toUpperCase() : str)
            : fail(str, 'string/state', resolvedOptions);
    }

    public upperCase(str: string): StringHandlerResult {
        return str === str.toUpperCase()
            ? pass(str)
            : fail(str, 'string/upperCase');
    }

    /**
     * Validates URLs.
     * @param str The input string.
     * @param options URL validation options. Defaults are provided by {@link URL_DEFAULTS}.
     */
    public url(str: string, options: Partial<UrlOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            URL_DEFAULTS,
            this._matchingDefaults,
            options
        );

        let {
            allowedProtocols,
            domain,
            fragment,
            ip,
            label,
            normalize,
            port,
            protocols,
            query,
            rootRelative
        } = resolvedOptions;

        if (rootRelative) {
            domain = ip = label = protocols = port = 'forbidden'; // force root relative option
        }

        const fullRegex = [
            `^`,
            `(?=(([a-z+.-]{2,20}):\\/\\/)?)\\1`, // 1=protocol
            `(?=(?:`,
            `([^\\[\\]/?#:]+)`, // domain or label or ipv4
            `|`,
            `(?:(?:(\\[)([^\\[\\]/?#]+)(\\])))`, // ipv6
            `)?)`,
            `\\3\\4\\5\\6`, // 3=ip/domain/host, 4=[, 5=ipv6, 6=]
            `(?::([0-9]{1,5}))?`,                                                   // port
            `(?=((?:\\/(?:[a-z0-9._~!$&'()*+,;=:@-]|(?:%[a-f0-9]{2}))+)*\\/?))\\8`, // path 
            `(?=(\\?(?:[a-z0-9._~!$&'()*+,;=:@?/-]|(?:%[a-f0-9]{2}))*)?)\\9`,       // query
            `(?=(#.*)?)\\10`, // fragment
            `$`
        ].join('');
        const matchResult = RegexCache.get(fullRegex, 'i').exec(str);

        if (!matchResult) {
            return fail(str, 'string/url', resolvedOptions);
        }

        // Pull matches from regex
        const [
            , , protocolValue = '', hostValue = '', , ipv6Value = '', , portValue = '', , queryValue = '', fragmentValue = ''
        ] = matchResult;

        const portValueNum = Utils.parseNumber(portValue);

        const
            hasProto = protocolValue.length > 0,
            goodProto = hasProto && allowedProtocols.indexOf(protocolValue) > -1,

            isIp = this.ipV4(hostValue).pass || this.ipV6(ipv6Value).pass,
            isDomain = this.domain(hostValue).pass,
            isLabel = this.label(hostValue).pass,

            hasPort = portValue.length > 0,
            goodPort = hasPort &&
                portValueNum !== null
                && this._numberHandler.integer(portValueNum).pass
                && this._numberHandler.between(portValueNum, 1, 65535).pass,

            hasFrag = fragmentValue.length > 0,
            hasQuery = queryValue.length > 0,

            goodAddress = (isIp || isDomain || isLabel) && (!hasProto || goodProto) && (!hasPort || goodPort);


        return (
            // If there is no address, are we looking for a root relative url?
            ((!goodAddress && rootRelative) || goodAddress) &&

            // Check for ip, domain, label and whether result matches what is needed
            (ip === 'forbidden' && !isIp || ip === 'required' && isIp || ip === 'optional') &&
            (domain === 'forbidden' && !isDomain || domain === 'required' && isDomain || domain === 'optional') &&
            (label === 'forbidden' && !isLabel || label === 'required' && isLabel || label === 'optional') &&

            // Check protocol and port portions
            (protocols === 'forbidden' && !hasProto || protocols === 'required' && goodProto || protocols === 'optional' &&
                (!hasProto || goodProto)) &&
            (port === 'forbidden' && !hasPort || port === 'required' && goodPort || port === 'optional' && (!hasPort || goodPort)) &&

            // Check query and fragment portions
            (query === 'forbidden' && !hasQuery || query === 'required' && hasQuery || query === 'optional') &&
            (fragment === 'forbidden' && !hasFrag || fragment === 'required' && hasFrag || fragment === 'optional')
        )
            ? pass(normalize ? str.toLowerCase() : str)
            : fail(str, 'string/url', resolvedOptions);
    }

    /**
     * Validates and normalizes UUID values.
     * @param str The input string.
     * @param options UUID matching options. Defaults are provided by {@link UUID_DEFAULTS}.
     */
    public uuid(str: string, options: Partial<UuidOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            UUID_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const {
            mode,
            normalize,
            version,
        } = resolvedOptions;

        let workingStr = mode === 'strict'
            ? str
            : str.trim().replace(/^urn:uuid:/i, '').replace(/^\{(.+)\}$/, '$1');

        let [normalized, suggestion] = Utils.regexMatch(
            workingStr,
            [
                '([a-fA-F\\d]{8})',
                '([a-fA-F\\d]{4})',
                `([${!version ? '12345' : version}][a-fA-F\\d]{3})`,
                '([89ab][a-fA-F\\d]{3})',
                '([a-fA-F\\d]{12})'
            ],
            resolvedOptions
        );

        if (normalized === null) {
            return fail(str, 'string/uuid', Object.assign({ suggestion }, resolvedOptions));
        }

        return pass(normalize ? normalized.toLowerCase() : str);

    }

    public wordCount(str: string, min: number = 1, max: number | null = null): StringHandlerResult {
        const count = str.split(/\s+/).filter(Boolean).length;
        return count >= min && (max === null || count <= max)
            ? pass(str)
            : fail(str, 'string/wordCount', {
                count,
                min,
                max
            });
    }

    /**
     * Validates and normalizes ZIP/postal values.
     * @param str The input string.
     * @param options ZIP matching options. Defaults are provided by {@link ZIP_DEFAULTS}.
     */
    public zip(str: string, options: Partial<ZipOptions> = {}): StringHandlerResult {
        const resolvedOptions = Object.assign(
            {},
            ZIP_DEFAULTS,
            this._matchingDefaults,
            options
        );

        const {
            normalize,
            normalizedDelim,
            zip4,
        } = resolvedOptions;

        // 00 through 12, 21 through 32, 61 through 72, or 80
        const [normalized, suggestion] = Utils.regexMatch(
            str,
            ['(?!0{5})(\\d{5})', '(?!0{4})(\\d{4})?'],
            resolvedOptions
        );

        if (normalized === null) {
            return fail(str, 'string/zip/base', Object.assign({ suggestion }, resolvedOptions));
        }

        const len = (normalized.replace(new RegExp(Utils.escapeForRegex(normalizedDelim), 'g'), '')).length;
        if (zip4 === 'required' && len !== 9) {
            return fail(str, 'string/zip/required4', Object.assign({ suggestion }, resolvedOptions));
        }
        if (zip4 === 'forbidden' && len === 9) {
            return fail(str, 'string/zip/forbidden4', Object.assign({ suggestion }, resolvedOptions));
        }

        return pass(normalize ? normalized : str);
    }







    // ====================================
    // MUTATORS
    // ====================================

    /**
       * Decodes a Base64-encoded string into UTF-8 text.
       * @param str The Base64 input string.
       */
    public base64Decode(str: string): StringHandlerResult {
        if (typeof Buffer !== 'undefined') {
            return pass(Buffer.from(str, 'base64').toString('utf8'));
        }
        else if (typeof atob !== 'undefined') {
            const binary = atob(str);
            const percentEncoded = binary.replace(/./g, (char: string): string => {
                const hex = char.charCodeAt(0).toString(16).toUpperCase();
                return '%' + (hex.length === 1 ? '0' + hex : hex);
            });
            return pass(decodeURIComponent(percentEncoded));
        }
        return fail(str, 'string/base64Decode');
    }

    /**
     * Encodes a UTF-8 string as Base64.
     * @param str The input string.
     */
    public base64Encode(str: string): StringHandlerResult {
        if (typeof Buffer !== 'undefined') {
            return pass(Buffer.from(str, 'utf8').toString('base64'));
        }
        else if (typeof btoa !== 'undefined') {
            const utf8Binary = encodeURIComponent(str).replace(
                /%([0-9A-F]{2})/g,
                (_match: string, hex: string): string => String.fromCharCode(parseInt(hex, 16))
            );
            return pass(btoa(utf8Binary));
        }
        return fail(str, 'string/base64Encode');
    }

    /**
     * Collapses repeated occurrences of a character into a single character.
     * When `char` is empty, this collapses repeats of any character.
     * @param str The input string.
     * @param char The character to collapse.
     */
    public collapseRepeats(str: string, char: string): StringHandlerResult {
        return pass(str.replace(RegexCache.get('(' + (char ? Utils.escapeForRegex(char) : '.') + ')\\1+', 'g'), '$1'));
    }

    /**
     * Collapses consecutive whitespace into a single space.
     * @param str The input string.
     */
    public collapseSpacing(str: string): StringHandlerResult {
        return pass(str.replace(/\s+/g, ' '));
    }

    /**
     * Escapes HTML-sensitive characters to their HTML entities.
     * @param str The input string.
     */
    public escapeHtml(str: string): StringHandlerResult {
        return pass(str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;'));
    }

    /**
     * Decodes a hex-encoded string into plain text.
     * Interprets the input as pairs of hexadecimal bytes.
     * @param str The input string.
     */
    public hexDecode(str: string): StringHandlerResult {
        let decoded = '';
        for (let i = 0; i < str.length; i += 2) {
            decoded += String.fromCharCode(parseInt(str.slice(i, i + 2), 16));
        }
        return pass(decoded);
    }

    /**
     * Encodes a string into lowercase hexadecimal byte pairs.
     * @param str The input string.
     */
    public hexEncode(str: string): StringHandlerResult {
        let encoded = '';
        for (const char of [...str]) {
            encoded += Utils.padLeft(char.charCodeAt(0).toString(16), 2, '0');
        }
        return pass(encoded);
    }

    /**
     * Normalizes all line endings in a string to a single line break token.
     * Converts CRLF, CR, and LF into `lineBreak`.
     * @param str The input string.
     * @param lineBreak The target line break string.
     */
    public normalizeLineBreaks(str: string, lineBreak: string = '\n'): StringHandlerResult {
        return pass(str.replace(/\r\n|\r|\n/g, lineBreak));
    }

    /**
     * Applies Unicode normalization to the string.
     * @param str The input string.
     * @param type The normalization form (NFC, NFD, NFKC, NFKD).
     */
    public normalizeUnicode(str: string, type: string = 'NFC'): StringHandlerResult {
        return pass(str.normalize(type));
    }

    /**
     * Left-pads a string to the requested length.
     * @param str The input string.
     * @param length The final minimum length.
     * @param char The pad character.
     */
    public padLeft(str: string, length: number, char: string): StringHandlerResult {
        return pass(Utils.padLeft(str, length, char));
    }

    /**
     * Right-pads a string to the requested length.
     * @param str The input string.
     * @param length The final minimum length.
     * @param char The pad character.
     */
    public padRight(str: string, length: number, char: string): StringHandlerResult {
        return pass(Utils.padRight(str, length, char));
    }

    /**
     * Returns a substring between `startIndex` and `endIndex`.
     * @param str The input string.
     * @param startIndex Inclusive start index.
     * @param endIndex Exclusive end index.
     */
    public slice(str: string, startIndex: number, endIndex: number): StringHandlerResult {
        return pass(str.slice(startIndex, endIndex));
    }

    /**
     * Keeps only the first `count` characters.
     * @param str The input string.
     * @param count Number of characters to keep from the start.
     */
    public sliceFirst(str: string, count: number = 1): StringHandlerResult {
        return pass(str.slice(0, count));
    }

    /**
     * Keeps only the last `count` characters.
     * @param str The input string.
     * @param count Number of characters to keep from the end.
     */
    public sliceLast(str: string, count: number = 1): StringHandlerResult {
        return pass(str.slice(-count));
    }

    public stripChars(str: string, chars: string): StringHandlerResult {
        return pass(str.replace(RegexCache.get('[' + Utils.escapeForRegex(chars) + ']', 'g'), ''));
    }

    /**
     * Removes simple HTML tags from the string.
     * @param str The input string.
     */
    public stripHtml(str: string): StringHandlerResult {
        return pass(str.replace(/<[^>]*>/g, ''));
    }

    public stripWhitespace(str: string): StringHandlerResult {
        return pass(str.replace(/\s/g, ''));
    }

    /**
     * Converts text to camelCase.
     * @param str The input string.
     * @param delims Delimiters used to split input text.
     * @param toDelim Delimiter used to join output segments.
     */
    public toCamelCase(str: string, delims: string = ' '): StringHandlerResult {
        return this.toDelimited(str, {
            fromDelims: delims,
            toDelim: '',
            transformer1: (word: string): string => word.toLowerCase(),
            transformer2: (word: string): string => word[0].toUpperCase() + word.slice(1).toLowerCase(),
            transformerSwitchIndex: 1
        });
    }

    /**
     * Splits a string on delimiters, transforms each segment, and joins it with a new delimiter.
     * `transformer1` is applied before `transformerSwitchIndex` and `transformer2` after.
     * @param str The input string.
        * @param options Delimiter and transformation options. Defaults are provided by {@link TO_DELIMITED_DEFAULTS}.
     */
    public toDelimited(str: string, options: Partial<ToDelimitedOptions> = {}): StringHandlerResult {
        const resolvedOptions: ToDelimitedOptions = Object.assign({}, TO_DELIMITED_DEFAULTS, options);

        const {
            fromDelims,
            toDelim,
            transformer1,
            transformer2,
            transformerSwitchIndex
        } = resolvedOptions;

        return pass(
            (fromDelims == null ? [str] : Utils.splitOnDelims(str, fromDelims))
                .reduce((acc: string[], current: string, index: number): string[] => {
                    acc.push(
                        transformerSwitchIndex == null || index < transformerSwitchIndex
                            ? transformer1(current)
                            : transformer2!(current)
                    );
                    return acc;
                }, [] as string[])
                .join(toDelim)
        );
    }

    /**
     * Converts text to kebab-case.
     * @param str The input string.
     * @param fromDelims Delimiters used to split input text.
     */
    public toKebabCase(str: string, fromDelims: string = ' '): StringHandlerResult {
        return this.toDelimited(str, {
            fromDelims,
            toDelim: '-',
            transformer1: (word: string): string => word.toLowerCase(),
        });
    }

    /**
     * Converts text to lowercase.
     * @param str The input string.
     */
    public toLowerCase(str: string): StringHandlerResult {
        return pass(str.toLowerCase());
    }

    /**
     * Converts text to PascalCase.
     * @param str The input string.
     * @param fromDelims Delimiters used to split input text.
     */
    public toPascalCase(str: string, fromDelims: string = ' '): StringHandlerResult {
        return this.toDelimited(str, {
            fromDelims,
            toDelim: '',
            transformer1: (word: string): string => word[0].toUpperCase() + word.slice(1).toLowerCase(),
            transformer2: (word: string): string => word[0].toUpperCase() + word.slice(1).toLowerCase(),
            transformerSwitchIndex: 1
        });
    }

    /**
     * Converts text to sentence case.
     * @param str The input string.
     * @param fromDelims Delimiters used to split input text.
     */
    public toSentenceCase(str: string, fromDelims: string = ' '): StringHandlerResult {
        return this.toDelimited(str, {
            fromDelims,
            toDelim: ' ',
            transformer1: (word: string): string => word[0].toUpperCase() + word.slice(1).toLowerCase(),
            transformer2: (word: string): string => word.toLowerCase(),
            transformerSwitchIndex: 1
        });
    }

    /**
     * Converts text to snake_case.
     * @param str The input string.
     * @param fromDelims Delimiters used to split input text.
     */
    public toSnakeCase(str: string, fromDelims: string = ' '): StringHandlerResult {
        return this.toDelimited(str, {
            fromDelims,
            toDelim: '_',
            transformer1: (word: string): string => word.toLowerCase()
        });
    }

    /**
     * Converts text to Title Case.
     * @param str The input string.
     * @param fromDelims Delimiters used to split input text.
     */
    public toTitleCase(str: string, fromDelims: string = ' '): StringHandlerResult {
        return this.toDelimited(str, {
            fromDelims,
            toDelim: ' ',
            transformer1: (word: string): string => word[0].toUpperCase() + word.slice(1).toLowerCase(),
        });
    }

    /**
     * Converts text to uppercase.
     * @param str The input string.
     */
    public toUpperCase(str: string): StringHandlerResult {
        return pass(str.toUpperCase());
    }

    /**
     * Trims matching characters from both ends of the string.
     * Note: when `chars` is omitted, this method trims all whitespace
     * characters via `\s` (for example spaces, tabs, and newlines), not only literal spaces.
     * @param str The input string.
     * @param chars Characters to trim.
     */
    public trim(str: string, chars?: string): StringHandlerResult {
        const finalChars = !chars ? '\\s' : Utils.escapeForRegex(chars);
        return pass(str.replace(RegexCache.get(`^[${finalChars}]+|[${finalChars}]+$`, 'g'), ''));
    }

    /**
     * Trims matching characters from the start of the string.
     * Note: when `chars` is omitted, this method trims all whitespace
     * characters via `\s` (for example spaces, tabs, and newlines), not only literal spaces.
     * @param str The input string.
     * @param chars Characters to trim.
     */
    public trimLeft(str: string, chars?: string): StringHandlerResult {
        const finalChars = !chars ? '\\s' : Utils.escapeForRegex(chars);
        return pass(str.replace(RegexCache.get('^[' + finalChars + ']+'), ''));
    }

    /**
     * Trims matching characters from the end of the string.
     * Note: when `chars` is omitted, this method trims all whitespace
     * characters via `\s` (for example spaces, tabs, and newlines), not only literal spaces.
     * @param str The input string.
     * @param chars Characters to trim.
     */
    public trimRight(str: string, chars?: string): StringHandlerResult {
        const finalChars = !chars ? '\\s' : Utils.escapeForRegex(chars);
        return pass(str.replace(RegexCache.get('[' + finalChars + ']+$'), ''));
    }

    /**
     * URL-decodes a percent-encoded string.
     * @param str The encoded input string.
     */
    public urlDecode(str: string): StringHandlerResult {
        return pass(decodeURIComponent(str));
    }

    /**
     * URL-encodes a string using percent-encoding.
     * @param str The input string.
     */
    public urlEncode(str: string): StringHandlerResult {
        return pass(encodeURIComponent(str));
    }

}


export { StringHandler };

